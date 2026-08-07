#!/usr/bin/env bash
#
# setup-claude-code.sh
#
# Bootstrap a fresh Claude Code environment for this repo:
#
#   1. gstack   — clone into ~/.claude/skills/gstack and run ./setup --team
#                 (CLAUDE.md requires it before any AI-assisted work)
#   2. council  — install the vendored Council of High Intelligence globally
#   3. verify   — report on project-scoped plugins and run the gstack guard
#
# Project-level config (.claude/, .mcp.json) is restored automatically in each
# fresh container; the things above live in $HOME and are not, which is what
# this script exists to fix.
#
# Designed for "Claude Code on the web": point your *environment setup script*
# here so every fresh container is bootstrapped on startup. Also fine to run
# once on a local machine. Idempotent — re-running refreshes in place.
#
# Exit status is 0 when the environment is usable. A partial gstack setup is a
# warning, not a failure: gstack's own setup runs under `set -e` and aborts on
# the Playwright Chromium download, which is routinely blocked by a sandbox
# network allowlist. Non-browser skills still work in that state.
#
# Usage:
#   scripts/setup-claude-code.sh [options]
#
# Options:
#   --skip-gstack    Do not touch ~/.claude/skills/gstack
#   --skip-council   Do not install the council globally
#   -h, --help       Show this help
#
# Examples:
#   scripts/setup-claude-code.sh
#   scripts/setup-claude-code.sh --skip-council

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

GSTACK_REPO="https://github.com/garrytan/gstack.git"
GSTACK_DIR="${HOME}/.claude/skills/gstack"

SKIP_GSTACK=0
SKIP_COUNCIL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-gstack) SKIP_GSTACK=1; shift ;;
    --skip-council) SKIP_COUNCIL=1; shift ;;
    -h | --help)
      sed -n '2,36p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Error: unknown option '$1' (try --help)" >&2
      exit 2
      ;;
  esac
done

WARNINGS=()

log() { printf '%s\n' "$*"; }
step() { printf '\n==> %s\n' "$*"; }
warn() {
  printf 'warning: %s\n' "$*" >&2
  WARNINGS+=("$*")
}

# ---------------------------------------------------------------------------
# 0. Toolchain report — informational, never fatal.
# ---------------------------------------------------------------------------

step "Toolchain"
if command -v node >/dev/null 2>&1; then
  node_version="$(node --version)"
  log "  node    ${node_version}"
  # claude-mem (project-scoped plugin) needs Node 20+.
  node_major="$(printf '%s' "${node_version}" | sed 's/^v\([0-9]*\).*/\1/')"
  if [[ "${node_major}" =~ ^[0-9]+$ ]] && ((node_major < 20)); then
    warn "node ${node_version} is below the v20 required by the claude-mem plugin"
  fi
else
  warn "node not found — the claude-mem plugin requires Node.js 20+"
fi

command -v bun >/dev/null 2>&1 && log "  bun     $(bun --version)" || log "  bun     (not installed; gstack setup installs it)"
command -v claude >/dev/null 2>&1 && log "  claude  $(claude --version)" || warn "claude CLI not found on PATH"

# ---------------------------------------------------------------------------
# 1. gstack — required by CLAUDE.md.
# ---------------------------------------------------------------------------

if ((SKIP_GSTACK)); then
  step "gstack (skipped)"
else
  step "gstack"
  if [[ -d "${GSTACK_DIR}/.git" ]]; then
    log "  Present at ${GSTACK_DIR}; refreshing..."
    git -C "${GSTACK_DIR}" pull --ff-only --quiet ||
      warn "could not refresh the gstack checkout (continuing with the existing copy)"
  elif [[ -e "${GSTACK_DIR}" ]]; then
    warn "${GSTACK_DIR} exists but is not a git checkout — leaving it untouched"
  else
    log "  Cloning ${GSTACK_REPO}..."
    if ! git clone --depth 1 "${GSTACK_REPO}" "${GSTACK_DIR}" --quiet; then
      warn "gstack clone failed — skills will be BLOCKED until it succeeds"
    fi
  fi

  if [[ -x "${GSTACK_DIR}/setup" ]]; then
    log "  Running ./setup --team ..."
    # Never let a partial setup abort the bootstrap; see the header note.
    if (cd "${GSTACK_DIR}" && ./setup --team); then
      log "  gstack setup completed."
    else
      warn "gstack './setup --team' did not complete — non-browser skills still work, but /browse and /qa will not. Re-run: cd ~/.claude/skills/gstack && ./setup --team"
    fi
  elif [[ -d "${GSTACK_DIR}" ]]; then
    warn "${GSTACK_DIR}/setup is missing or not executable"
  fi
fi

# ---------------------------------------------------------------------------
# 2. Council of High Intelligence — vendored, offline install.
# ---------------------------------------------------------------------------

if ((SKIP_COUNCIL)); then
  step "Council of High Intelligence (skipped)"
else
  step "Council of High Intelligence"
  council_installer="${SCRIPT_DIR}/install-council-global.sh"
  if [[ -x "${council_installer}" ]]; then
    "${council_installer}" || warn "the council installer failed"
  else
    warn "${council_installer} not found or not executable"
  fi
fi

# ---------------------------------------------------------------------------
# 3. Verify — project-scoped plugins and the gstack guard.
# ---------------------------------------------------------------------------

step "Verification"

if command -v claude >/dev/null 2>&1; then
  log "  Project-scoped plugins:"
  claude plugin list 2>/dev/null | sed 's/^/    /' ||
    warn "could not list plugins"
else
  log "  Skipping plugin check (no claude CLI)."
fi

guard="${REPO_ROOT}/.claude/hooks/check-gstack.sh"
if [[ -x "${guard}" ]]; then
  log "  gstack guard:"
  # Run once: the decision is on stdout, the human-readable detail on stderr.
  guard_err="$(mktemp)"
  guard_json="$("${guard}" 2>"${guard_err}" || true)"
  guard_detail="$(cat "${guard_err}")"
  rm -f "${guard_err}"

  if printf '%s' "${guard_json}" | grep -q '"permissionDecision":"deny"'; then
    printf '%s\n' "${guard_detail}" | sed 's/^/    /' >&2
    warn "the gstack guard is BLOCKING — skills will be denied until this is fixed"
  elif [[ -n "${guard_detail}" ]]; then
    printf '%s\n' "${guard_detail}" | sed 's/^/    /'
    warn "the gstack guard reported warnings (see the gstack guard section above)"
  else
    log "    clean — gstack is fully set up."
  fi
else
  warn "${guard} not found; cannot verify the gstack gate"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

step "Summary"
if ((${#WARNINGS[@]} == 0)); then
  log "  Environment bootstrapped cleanly."
else
  log "  Bootstrapped with ${#WARNINGS[@]} warning(s):"
  for w in "${WARNINGS[@]}"; do
    log "    - ${w}"
  done
fi
log ""
log "Restart your CLI client so hooks, skills, and plugins reload."
