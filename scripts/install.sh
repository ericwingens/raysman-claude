#!/usr/bin/env bash
#
# install.sh — bootstrap this repo for AI-assisted development.
#
# A fresh clone already contains the vendored skills (.agents/skills/*) and
# their tool symlinks committed to git, but it is missing the one external
# dependency that CLAUDE.md hard-requires (and a PreToolUse hook enforces):
# a global gstack install. This script installs that and wires skills for
# the chosen tool, reproducing the committed known-good state. It does not
# upgrade skills to newer upstream unless you pass --sync-skills.
#
# Usage:
#   ./scripts/install.sh [--tool <name>] [--sync-skills] [--skip-gstack] [-h]
#
# Options:
#   --tool <name>   Target AI coding tool. Supported: claude-code (default).
#   --sync-skills   Refresh vendored skills from skills-lock.json via
#                   `npx skills` (pulls upstream; mutates .agents/skills/).
#   --skip-gstack   Don't touch the global gstack install.
#   -h, --help      Show this help.

set -euo pipefail

GSTACK_REPO="https://github.com/garrytan/gstack.git"
GSTACK_DIR="$HOME/.claude/skills/gstack"

TOOL="claude-code"
SKIP_GSTACK=0
SYNC_SKILLS=0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

log()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mwarning:\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31merror:\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
  sed -n '3,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

while [ $# -gt 0 ]; do
  case "$1" in
    --tool)        TOOL="${2:-}"; [ -n "$TOOL" ] || die "--tool requires a value"; shift 2 ;;
    --tool=*)      TOOL="${1#*=}"; shift ;;
    --sync-skills) SYNC_SKILLS=1; shift ;;
    --skip-gstack) SKIP_GSTACK=1; shift ;;
    -h|--help)     usage; exit 0 ;;
    *)             die "unknown argument: $1 (try --help)" ;;
  esac
done

case "$TOOL" in
  claude-code) ;;
  *) die "unsupported --tool '$TOOL' (supported: claude-code)" ;;
esac

install_gstack() {
  if [ "$SKIP_GSTACK" -eq 1 ]; then
    log "Skipping gstack (--skip-gstack)"
    return 0
  fi
  if [ -d "$GSTACK_DIR/bin" ]; then
    log "gstack already installed ($GSTACK_DIR)"
    return 0
  fi
  log "Installing gstack -> $GSTACK_DIR"
  git clone --depth 1 "$GSTACK_REPO" "$GSTACK_DIR"
  # ./setup may exit non-zero when optional components (e.g. the Playwright
  # Chromium download) are blocked by a restricted network. The gate that
  # CLAUDE.md / the hook check for is only the presence of bin/, so a failed
  # setup is a warning, not a hard error — as long as bin/ ends up present.
  if ! ( cd "$GSTACK_DIR" && ./setup --team ); then
    warn "gstack setup exited non-zero (optional components may be unavailable)"
  fi
  [ -d "$GSTACK_DIR/bin" ] || die "gstack install failed: $GSTACK_DIR/bin missing"
  log "gstack installed"
}

skill_names() {
  local lock="$REPO_ROOT/skills-lock.json"
  [ -f "$lock" ] || return 0
  node -e '
    const fs = require("fs");
    const l = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    for (const k of Object.keys(l.skills || {})) console.log(k);
  ' "$lock"
}

wire_skills_claude_code() {
  local lock="$REPO_ROOT/skills-lock.json"
  if [ ! -f "$lock" ]; then
    warn "no skills-lock.json; nothing to wire"
    return 0
  fi

  # Opt-in: pull the latest upstream for each locked skill. This mutates the
  # vendored .agents/skills/ tree, so it is off by default — a bootstrap
  # should reproduce the committed state, not silently upgrade dependencies.
  if [ "$SYNC_SKILLS" -eq 1 ]; then
    if command -v npx >/dev/null 2>&1; then
      log "Refreshing skills from skills-lock.json (--sync-skills)"
      if ! ( cd "$REPO_ROOT" && npx -y skills experimental_install ); then
        warn "skill refresh failed; keeping vendored skills in .agents/skills"
      fi
    else
      warn "npx not found; cannot --sync-skills, keeping vendored skills"
    fi
  fi

  mkdir -p "$REPO_ROOT/.claude/skills"
  local name src link
  while IFS= read -r name; do
    [ -n "$name" ] || continue
    src="$REPO_ROOT/.agents/skills/$name"
    link="$REPO_ROOT/.claude/skills/$name"
    if [ ! -d "$src" ]; then
      warn "skill '$name' has no .agents/skills/$name directory; skipping"
      continue
    fi
    if [ -L "$link" ]; then
      continue
    elif [ -e "$link" ]; then
      warn "$link exists and is not a symlink; leaving it untouched"
      continue
    fi
    ln -s "../../.agents/skills/$name" "$link"
    log "linked .claude/skills/$name -> ../../.agents/skills/$name"
  done < <(skill_names)
}

verify() {
  log "Verifying setup"
  if [ -d "$GSTACK_DIR/bin" ]; then
    log "  gstack: OK ($GSTACK_DIR)"
  elif [ "$SKIP_GSTACK" -eq 1 ]; then
    warn "  gstack: skipped — AI-assisted work in this repo will be blocked"
  else
    die "  gstack: MISSING"
  fi

  local name link n=0
  while IFS= read -r name; do
    [ -n "$name" ] || continue
    link="$REPO_ROOT/.claude/skills/$name"
    if [ -e "$link" ]; then
      n=$((n + 1))
    else
      warn "  skill '$name' is not wired for $TOOL"
    fi
  done < <(skill_names)
  log "  skills ($TOOL): $n wired"
}

log "Bootstrapping for tool: $TOOL"
install_gstack
wire_skills_claude_code
verify
log "Done."
