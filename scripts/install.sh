#!/usr/bin/env bash
#
# install.sh -- Install The Agency agents into Claude Code.
#
# Copies the agent markdown files from this repo's division directories into
# your Claude Code agents directory (~/.claude/agents/ by default). Each agent
# ships with YAML frontmatter, so Claude Code picks them up automatically.
#
# Agents are ported from https://github.com/msitarzewski/agency-agents (MIT).
# See LICENSE.agency-agents and the "Agents" section of README.md.
#
# Usage:
#   ./scripts/install.sh [--tool claude-code] [selection] [behavior]
#
# Tool:
#   --tool claude-code     Install into Claude Code (the only supported tool;
#                          this is the default).
#
# Selection (compose freely; empty selection installs every agent):
#   --division a,b,c       Only these divisions (comma-separated)
#   --agent slug,slug      Only these agents (match on file name, no extension)
#
# Behavior:
#   --path DIR             Override the install directory
#   --link                 Symlink instead of copy (updates propagate)
#   --dry-run              Print the plan and exit without writing anything
#   --list [divisions|agents]   List and exit
#   --help                 Show this help
#
# Env:
#   CLAUDE_CONFIG_DIR      Overrides ~/.claude as the Claude config root.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DIVISIONS=(
  academic design engineering finance game-development gis marketing
  paid-media product project-management sales security spatial-computing
  specialized support testing
)

# --- args -------------------------------------------------------------------
TOOL="claude-code"
SEL_DIVISIONS=""
SEL_AGENTS=""
INSTALL_PATH=""
LINK=0
DRY_RUN=0
LIST=""

usage() { sed -n '2,/^set -euo/p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//; /^set -euo/d'; }

while [ $# -gt 0 ]; do
  case "$1" in
    --tool)      TOOL="${2:-}"; shift 2 ;;
    --division)  SEL_DIVISIONS="${2:-}"; shift 2 ;;
    --agent)     SEL_AGENTS="${2:-}"; shift 2 ;;
    --path)      INSTALL_PATH="${2:-}"; shift 2 ;;
    --link)      LINK=1; shift ;;
    --dry-run)   DRY_RUN=1; shift ;;
    --list)      LIST="${2:-divisions}"; case "$LIST" in divisions|agents) shift 2 ;; *) LIST="divisions"; shift ;; esac ;;
    --help|-h)   usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; echo "Try --help." >&2; exit 2 ;;
  esac
done

if [ "$TOOL" != "claude-code" ]; then
  echo "Only --tool claude-code is supported by this installer (got: $TOOL)." >&2
  exit 2
fi

# --- helpers ----------------------------------------------------------------
selected_division() {
  [ -z "$SEL_DIVISIONS" ] && return 0
  case ",$SEL_DIVISIONS," in *",$1,"*) return 0 ;; *) return 1 ;; esac
}

selected_agent() {
  [ -z "$SEL_AGENTS" ] && return 0
  case ",$SEL_AGENTS," in *",$1,"*) return 0 ;; *) return 1 ;; esac
}

# Collect selected agent files into the AGENT_FILES array.
AGENT_FILES=()
collect() {
  local div f slug
  for div in "${DIVISIONS[@]}"; do
    selected_division "$div" || continue
    [ -d "$REPO_ROOT/$div" ] || continue
    while IFS= read -r f; do
      slug="$(basename "$f" .md)"
      selected_agent "$slug" || continue
      AGENT_FILES+=("$f")
    done < <(find "$REPO_ROOT/$div" -type f -name '*.md' | sort)
  done
}

# --- list mode --------------------------------------------------------------
if [ -n "$LIST" ]; then
  if [ "$LIST" = "divisions" ]; then
    for div in "${DIVISIONS[@]}"; do
      [ -d "$REPO_ROOT/$div" ] || continue
      count="$(find "$REPO_ROOT/$div" -type f -name '*.md' | wc -l | tr -d ' ')"
      printf '%-20s %s agents\n' "$div" "$count"
    done
  else
    collect
    for f in "${AGENT_FILES[@]}"; do basename "$f" .md; done
  fi
  exit 0
fi

# --- resolve destination ----------------------------------------------------
if [ -n "$INSTALL_PATH" ]; then
  DEST="$INSTALL_PATH"
else
  DEST="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents"
fi

collect
if [ "${#AGENT_FILES[@]}" -eq 0 ]; then
  echo "No agents matched your selection." >&2
  exit 1
fi

echo "Installing ${#AGENT_FILES[@]} agent(s) into: $DEST"
[ "$LINK" -eq 1 ] && echo "Mode: symlink" || echo "Mode: copy"
[ "$DRY_RUN" -eq 1 ] && echo "(dry run -- no files will be written)"

[ "$DRY_RUN" -eq 0 ] && mkdir -p "$DEST"

for f in "${AGENT_FILES[@]}"; do
  target="$DEST/$(basename "$f")"
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "  would install $(basename "$f")"
    continue
  fi
  if [ "$LINK" -eq 1 ]; then
    ln -sf "$f" "$target"
  else
    cp "$f" "$target"
  fi
done

if [ "$DRY_RUN" -eq 0 ]; then
  echo "Done. Restart Claude Code (or start a new session) to pick up the agents."
fi
