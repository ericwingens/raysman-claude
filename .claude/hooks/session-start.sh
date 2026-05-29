#!/bin/bash
# SessionStart hook: ensure gstack is installed globally.
#
# gstack lives in $HOME/.claude/skills (outside the repo), so in the ephemeral
# Claude Code on the web environment it must be reinstalled at the start of every
# session. Local installs persist across sessions, so this only runs on the web.
set -uo pipefail

# Only needed in the remote (web) environment.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

GSTACK_DIR="$HOME/.claude/skills/gstack"

# Idempotent: nothing to do if gstack is already installed.
if [ -d "$GSTACK_DIR/bin" ]; then
  echo "gstack already installed at $GSTACK_DIR" >&2
  exit 0
fi

echo "Installing gstack into $GSTACK_DIR ..." >&2
if ! git clone --single-branch --depth 1 \
    https://github.com/garrytan/gstack.git "$GSTACK_DIR"; then
  echo "WARNING: gstack clone failed; skill usage will be blocked until installed." >&2
  exit 0
fi

# ./setup can exit non-zero on a non-fatal token-ceiling warning, so don't let
# that fail the hook; verify success by checking for the bin directory instead.
( cd "$GSTACK_DIR" && ./setup --team ) || true

if [ -d "$GSTACK_DIR/bin" ]; then
  echo "gstack installed successfully." >&2
else
  echo "WARNING: gstack setup did not produce $GSTACK_DIR/bin." >&2
fi

exit 0
