#!/usr/bin/env bash
# Setup script for Claude Code cloud sessions (environment settings -> Setup script).
# Installs gstack (team mode), the gl-reconciler plugin, and points gstack's
# browser at the preinstalled Chromium. Each step is idempotent and non-fatal,
# so one failing step does not block the session.

set -u

log() { echo "[cloud-setup] $*"; }

# 1. gstack (global install, team mode). --no-browser skips the Chromium
#    download, which the egress proxy blocks; step 3 wires up the local one.
GSTACK_DIR="$HOME/.claude/skills/gstack"
if [ ! -d "$GSTACK_DIR/bin" ]; then
  log "cloning gstack"
  git clone --depth 1 https://github.com/garrytan/gstack.git "$GSTACK_DIR" || log "gstack clone failed"
fi
if [ -x "$GSTACK_DIR/setup" ]; then
  log "running gstack setup"
  ( cd "$GSTACK_DIR" && ./setup --team --no-browser -q ) || log "gstack setup failed"
fi

# 2. Financial services marketplace + gl-reconciler (the other plugins are
#    synced from the claude.ai organisation already).
if command -v claude >/dev/null 2>&1; then
  claude plugin marketplace add anthropics/financial-services >/dev/null 2>&1 || true
  claude plugin install gl-reconciler@claude-for-financial-services || log "gl-reconciler install failed"
fi

# 3. Use the preinstalled Playwright Chromium for gstack's /browse, /qa etc.
CHROMIUM=/opt/pw-browsers/chromium
SETTINGS="$HOME/.claude/settings.json"
if [ -x "$CHROMIUM" ] && command -v jq >/dev/null 2>&1; then
  mkdir -p "$(dirname "$SETTINGS")"
  [ -f "$SETTINGS" ] || echo '{}' > "$SETTINGS"
  jq --arg p "$CHROMIUM" '.env = ((.env // {}) + {GSTACK_CHROMIUM_PATH: $p})' "$SETTINGS" > "$SETTINGS.tmp" \
    && mv "$SETTINGS.tmp" "$SETTINGS" \
    || log "could not set GSTACK_CHROMIUM_PATH"
fi

log "done"
exit 0
