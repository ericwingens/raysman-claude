#!/bin/bash
# SessionStart hook for Claude Code on the web.
# Installs gstack (required by CLAUDE.md) and project npm dependencies so
# tooling is ready before the session begins. Safe to run repeatedly.
set -euo pipefail

# Local environments manage their own setup; only run in Claude Code on the web.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

GSTACK_DIR="$HOME/.claude/skills/gstack"

# Install gstack globally if it is not already present.
if [ ! -d "$GSTACK_DIR/bin" ]; then
  echo "[session-start] Installing gstack..."
  rm -rf "$GSTACK_DIR"
  git clone --depth 1 https://github.com/garrytan/gstack.git "$GSTACK_DIR"
  # `setup` may exit non-zero when the optional Playwright browser download is
  # blocked by the network policy; that does not affect skill registration.
  ( cd "$GSTACK_DIR" && ./setup --team ) || true
  if [ -d "$GSTACK_DIR/bin" ]; then
    echo "[session-start] gstack installed."
  else
    echo "[session-start] WARNING: gstack install incomplete; /-skills may be blocked." >&2
  fi
else
  echo "[session-start] gstack already installed."
fi

# Install project npm dependencies.
if [ -f "$CLAUDE_PROJECT_DIR/package.json" ]; then
  echo "[session-start] Running npm install..."
  ( cd "$CLAUDE_PROJECT_DIR" && npm install )
fi

echo "[session-start] Done."
