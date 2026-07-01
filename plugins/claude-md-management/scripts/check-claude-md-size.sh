#!/bin/bash
# Warn (non-blocking) when an edited CLAUDE.md grows past a line threshold.
# Shipped as part of the claude-md-management plugin; runs on PostToolUse for
# Edit/Write/MultiEdit. Reads the hook payload as JSON on stdin.

set -u

MAX_LINES="${CLAUDE_MD_MAX_LINES:-250}"

payload="$(cat)"

# Extract the edited file path from the hook payload, preferring jq, then
# python3, then a grep fallback so the hook works without extra dependencies.
extract_path() {
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null && return
  fi
  if command -v python3 >/dev/null 2>&1; then
    printf '%s' "$payload" | python3 -c 'import json,sys
try:
    print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))
except Exception:
    pass' 2>/dev/null && return
  fi
  printf '%s' "$payload" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//; s/"$//'
}

file_path="$(extract_path)"

# Only care about CLAUDE.md / CLAUDE.local.md files that exist on disk.
base="$(basename "${file_path:-}")"
if { [ "$base" != "CLAUDE.md" ] && [ "$base" != "CLAUDE.local.md" ]; } || [ ! -f "$file_path" ]; then
  echo '{}'
  exit 0
fi

lines="$(wc -l < "$file_path" | tr -d '[:space:]')"

if [ "${lines:-0}" -gt "$MAX_LINES" ]; then
  msg="CLAUDE.md size warning: $file_path is $lines lines (threshold $MAX_LINES). Consider trimming with /claude-md-management:optimize to keep session context lean."
  echo "$msg" >&2
  # Also surface it to Claude via additionalContext (non-blocking).
  printf '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":%s}}\n' \
    "$(printf '%s' "$msg" | (jq -Rs . 2>/dev/null || printf '"%s"' "$msg"))"
  exit 0
fi

echo '{}'
