#!/usr/bin/env bash
#
# session-start-bootstrap.sh
#
# SessionStart hook: make sure the $HOME-side setup this repo depends on is in
# place. Project config (.claude/, .mcp.json) is restored automatically in a
# fresh container; gstack and the global council are not.
#
# Runs on every session start, so it is built to do nothing and say nothing
# when the environment is already good. Work is split by cost:
#
#   sync   — the vendored council (offline file copy) and the gstack clone.
#            The clone is what unblocks the PreToolUse gate, so it is worth
#            waiting a few seconds for; without it every skill is denied.
#   async  — gstack's own `./setup --team`, which installs Bun and downloads
#            Playwright's Chromium. Too slow to block a session on, and skills
#            other than /browse and /qa work without it.
#
# The async step is attempted once per container: gstack writes
# ~/.gstack/.last-setup-version only on success, so a sandbox that blocks the
# Chromium download would otherwise retry it on every single session start.
#
# Never exits non-zero and never runs under `set -e` — a hook must not be able
# to break session start.
#
# Stdout is added to Claude's context, so it stays to a few short lines.

set -uo pipefail

GSTACK_REPO="https://github.com/garrytan/gstack.git"
GSTACK_DIR="${HOME}/.claude/skills/gstack"
STATE_DIR="${HOME}/.gstack"
SETUP_MARKER="${STATE_DIR}/.last-setup-version"
ATTEMPT_STAMP="${STATE_DIR}/.hook-setup-attempted"
LOG="${TMPDIR:-/tmp}/gstack-bootstrap.log"

if [[ -n "${CLAUDE_PROJECT_DIR:-}" ]]; then
  REPO_ROOT="${CLAUDE_PROJECT_DIR}"
else
  REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

notes=()

# ---------------------------------------------------------------------------
# 1. Council — vendored, offline, fast. Refresh only when it differs.
# ---------------------------------------------------------------------------

council_src="${REPO_ROOT}/.claude/skills/council/SKILL.md"
council_dst="${HOME}/.claude/skills/council/SKILL.md"
council_installer="${REPO_ROOT}/scripts/install-council-global.sh"

if [[ -f "${council_src}" ]] && [[ -x "${council_installer}" ]] &&
  ! cmp -s "${council_src}" "${council_dst}"; then
  if "${council_installer}" >>"${LOG}" 2>&1; then
    notes+=("installed the global council")
  else
    notes+=("council install failed (see ${LOG})")
  fi
fi

# ---------------------------------------------------------------------------
# 2. gstack clone — synchronous; this is what the PreToolUse gate checks.
# ---------------------------------------------------------------------------

if [[ ! -d "${GSTACK_DIR}/bin" ]] && [[ ! -e "${GSTACK_DIR}" ]]; then
  if git clone --depth 1 "${GSTACK_REPO}" "${GSTACK_DIR}" --quiet >>"${LOG}" 2>&1; then
    notes+=("cloned gstack into ~/.claude/skills/gstack")
  else
    notes+=("gstack clone FAILED — skills are blocked; run scripts/setup-claude-code.sh (log: ${LOG})")
  fi
fi

# ---------------------------------------------------------------------------
# 3. gstack setup — asynchronous, once per container.
# ---------------------------------------------------------------------------

if [[ -x "${GSTACK_DIR}/setup" ]] && [[ ! -f "${SETUP_MARKER}" ]] && [[ ! -f "${ATTEMPT_STAMP}" ]]; then
  mkdir -p "${STATE_DIR}"
  touch "${ATTEMPT_STAMP}"
  nohup bash -c "cd '${GSTACK_DIR}' && ./setup --team" >>"${LOG}" 2>&1 &
  disown 2>/dev/null || true
  notes+=("gstack './setup --team' started in the background (log: ${LOG}); /browse and /qa stay unavailable until it finishes")
fi

# ---------------------------------------------------------------------------
# Report — silent when there was nothing to do.
# ---------------------------------------------------------------------------

if ((${#notes[@]} > 0)); then
  echo "Session bootstrap:"
  for note in "${notes[@]}"; do
    echo "  - ${note}"
  done
fi

exit 0
