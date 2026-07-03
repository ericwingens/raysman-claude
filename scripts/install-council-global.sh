#!/usr/bin/env bash
#
# install-council-global.sh
#
# Install the Council of High Intelligence into a global Claude config
# directory (default: ~/.claude), sourced entirely from the copy vendored
# in this repo under .claude/. Fully offline — no network, no external repo.
#
# Use this to make /council and the council-* agents available across ALL
# sessions/projects on a machine, not just this repo. Idempotent: re-running
# simply refreshes the installed files.
#
# Usage:
#   scripts/install-council-global.sh [TARGET_CLAUDE_DIR]
#
#   TARGET_CLAUDE_DIR   Destination Claude config dir (default: $HOME/.claude,
#                       or $COUNCIL_CLAUDE_DIR if set)
#
# Examples:
#   scripts/install-council-global.sh                 # -> ~/.claude
#   scripts/install-council-global.sh /root/.claude   # explicit target
#   COUNCIL_CLAUDE_DIR=~/.claude scripts/install-council-global.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SRC_DIR="${REPO_ROOT}/.claude"

TARGET="${1:-${COUNCIL_CLAUDE_DIR:-${HOME}/.claude}}"

AGENTS_SRC="${SRC_DIR}/agents"
SKILL_SRC="${SRC_DIR}/skills/council"

if [[ ! -d "${AGENTS_SRC}" ]] || [[ ! -f "${SKILL_SRC}/SKILL.md" ]]; then
  echo "Error: vendored council files not found under ${SRC_DIR}." >&2
  echo "       Expected ${AGENTS_SRC}/council-*.md and ${SKILL_SRC}/SKILL.md" >&2
  exit 1
fi

shopt -s nullglob
agent_files=("${AGENTS_SRC}"/council-*.md)
shopt -u nullglob

if [[ ${#agent_files[@]} -eq 0 ]]; then
  echo "Error: no council agent files found under ${AGENTS_SRC}" >&2
  exit 1
fi

AGENTS_DEST="${TARGET}/agents"
SKILL_DEST_DIR="${TARGET}/skills/council"
SCRIPTS_DEST_DIR="${SKILL_DEST_DIR}/scripts"

echo "Installing Council of High Intelligence (global)..."
echo "  Source: ${SRC_DIR}"
echo "  Target: ${TARGET}"

mkdir -p "${AGENTS_DEST}" "${SCRIPTS_DEST_DIR}"

installed=0
for agent_file in "${agent_files[@]}"; do
  install -m 0644 "${agent_file}" "${AGENTS_DEST}/"
  ((installed += 1))
done

install -m 0644 "${SKILL_SRC}/SKILL.md" "${SKILL_DEST_DIR}/SKILL.md"

scripts_installed=0
shopt -s nullglob
script_files=("${SKILL_SRC}"/scripts/detect-*.sh)
shopt -u nullglob
for script_file in "${script_files[@]}"; do
  install -m 0755 "${script_file}" "${SCRIPTS_DEST_DIR}/"
  ((scripts_installed += 1))
done

echo
echo "Done."
echo "  Installed ${installed} council agents to ${AGENTS_DEST}"
echo "  Installed skill to ${SKILL_DEST_DIR}/SKILL.md"
echo "  Installed ${scripts_installed} scripts to ${SCRIPTS_DEST_DIR}"
echo "Restart your CLI client(s) and use /council to convene the council."
