#!/bin/bash
# Gate skill usage on a usable global gstack install.
#
# Two tiers, deliberately:
#   deny — gstack is absent or the checkout is broken; skills cannot run.
#   warn — gstack runs, but the install never finished setup, is not in team
#          mode, or is stale.
#
# Why "setup never finished" only warns: gstack's own `setup` runs under
# `set -e` and exits while installing Playwright's Chromium, long before it
# writes ~/.gstack/.last-setup-version. Sandboxed environments with a network
# allowlist land there legitimately, and non-browser skills still work. Making
# that a hard block would lock those environments out of every skill.

set -u

GSTACK_DIR="$HOME/.claude/skills/gstack"
STATE_DIR="$HOME/.gstack"
VERSION_FILE="$GSTACK_DIR/VERSION"
SETUP_MARKER="$STATE_DIR/.last-setup-version"
CONFIG_FILE="$STATE_DIR/config.yaml"

SETUP_CMD='cd ~/.claude/skills/gstack && ./setup --team'

# Emit a deny decision. $1 = full explanation for stderr, $2 = one-line reason.
deny() {
  printf '%s\n' "$1" >&2
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s See stderr for install instructions."}}\n' "$2"
  exit 0
}

# ---------------------------------------------------------------------------
# Tier 1 — hard failures: gstack cannot work at all.
# ---------------------------------------------------------------------------

if [ ! -d "$GSTACK_DIR/bin" ]; then
  deny "BLOCKED: gstack is not installed globally.

gstack is required for AI-assisted work in this repo.

Install it:
  git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
  $SETUP_CMD

Then restart your AI coding tool." "gstack is required but not installed."
fi

# A clone that lost its metadata or helper scripts is worse than no clone: the
# old existence-only check passed, then skills failed deep inside a workflow.
missing=""
for required in VERSION SKILL.md bin/gstack-config bin/gstack-paths; do
  [ -e "$GSTACK_DIR/$required" ] || missing="$missing $required"
done

if [ -n "$missing" ]; then
  deny "BLOCKED: the gstack install at ~/.claude/skills/gstack is incomplete.

Missing:$missing

Reinstall it:
  rm -rf ~/.claude/skills/gstack
  git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
  $SETUP_CMD" "gstack install is incomplete or corrupt."
fi

if [ ! -x "$GSTACK_DIR/bin/gstack-config" ]; then
  deny "BLOCKED: gstack scripts under ~/.claude/skills/gstack/bin are not executable.

Fix it:
  chmod +x ~/.claude/skills/gstack/bin/*" "gstack scripts are not executable."
fi

# ---------------------------------------------------------------------------
# Tier 2 — warnings: gstack runs, but the install is not what CLAUDE.md asks
# for. These never block.
# ---------------------------------------------------------------------------

warnings=""
add_warning() { warnings="${warnings}${warnings:+ | }$1"; }

if [ ! -f "$SETUP_MARKER" ]; then
  add_warning "setup has never completed, so browser-backed skills (/browse, /qa) will not work — re-run: $SETUP_CMD"
elif [ -r "$VERSION_FILE" ]; then
  setup_version=$(tr -d '[:space:]' <"$SETUP_MARKER" 2>/dev/null || true)
  checkout_version=$(tr -d '[:space:]' <"$VERSION_FILE" 2>/dev/null || true)
  if [ -n "$setup_version" ] && [ -n "$checkout_version" ] &&
    [ "$setup_version" != "$checkout_version" ]; then
    add_warning "setup is stale (ran for $setup_version, checkout is $checkout_version) — re-run: $SETUP_CMD"
  fi
fi

# CLAUDE.md mandates the --team install, which sets team_mode and registers the
# SessionStart auto-update hook.
if ! grep -qE '^team_mode:[[:space:]]*true[[:space:]]*$' "$CONFIG_FILE" 2>/dev/null; then
  add_warning "team mode is off, but CLAUDE.md requires the --team install — re-run: $SETUP_CMD"
fi

if [ -n "$warnings" ]; then
  printf 'gstack warning: %s\n' "$warnings" >&2
  # Escape for JSON embedding; the text is ASCII apart from these two.
  escaped=$(printf '%s' "$warnings" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf '{"systemMessage":"gstack warning: %s"}\n' "$escaped"
  exit 0
fi

echo '{}'
