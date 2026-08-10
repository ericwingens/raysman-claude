#!/usr/bin/env bash
#
# install-gstack-global.sh
#
# Install gstack into a global Claude config directory (default: ~/.claude),
# so /qa, /ship, /review, /investigate, /browse and the rest of the gstack
# suite are available in every session — including fresh Claude Code on the
# web containers, where ~/.claude does not survive between sessions.
#
# Point your *environment setup script* at this file so every container
# installs gstack on startup. See README.md.
#
# Idempotent: re-running updates an existing clone in place.
#
# Usage:
#   scripts/install-gstack-global.sh [TARGET_CLAUDE_DIR]
#
#   TARGET_CLAUDE_DIR   Destination Claude config dir (default: $HOME/.claude,
#                       or $GSTACK_CLAUDE_DIR if set)
#
# Environment:
#   GSTACK_CLAUDE_DIR   Same as the positional argument.
#   GSTACK_REPO_URL     Clone source (default: gstack upstream on GitHub).
#
# Examples:
#   scripts/install-gstack-global.sh                 # -> ~/.claude
#   scripts/install-gstack-global.sh /root/.claude   # explicit target
#
# Why the Playwright step below exists
# ------------------------------------
# gstack's setup refuses to finish unless Playwright's Chromium launches — the
# skill registration step runs *after* that check, so a failed browser probe
# means no gstack skills at all, not merely a broken /browse.
#
# Sandboxed environments often ship a pinned Chromium under
# $PLAYWRIGHT_BROWSERS_PATH while blocking cdn.playwright.dev, and gstack's
# Playwright usually wants a *different* build number than the one present. We
# do not route around the egress policy: we reuse the browser that is already
# on disk, exposing it under the build number Playwright asks for. If no local
# browser exists, gstack's own download runs untouched.

set -euo pipefail

REPO_URL="${GSTACK_REPO_URL:-https://github.com/garrytan/gstack.git}"
TARGET="${1:-${GSTACK_CLAUDE_DIR:-${HOME}/.claude}}"
GSTACK_DIR="${TARGET}/skills/gstack"
BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-${HOME}/.cache/ms-playwright}"

echo "Installing gstack (global)..."
echo "  Source: ${REPO_URL}"
echo "  Target: ${GSTACK_DIR}"

if ! command -v bun >/dev/null 2>&1; then
  echo "Error: bun is required by gstack's setup but was not found on PATH." >&2
  echo "       Install bun (https://bun.sh) in the image or setup script, then re-run." >&2
  exit 1
fi

# --- 1. Clone or update -----------------------------------------------------
# Network calls get a bounded retry with exponential backoff; a fresh container
# often races its own network bring-up.
retry() {
  local attempt=1 delay=2
  until "$@"; do
    if (( attempt >= 4 )); then
      echo "Error: command failed after ${attempt} attempts: $*" >&2
      return 1
    fi
    echo "  ...retry ${attempt} in ${delay}s"
    sleep "${delay}"
    attempt=$(( attempt + 1 ))
    delay=$(( delay * 2 ))
  done
}

if [[ -d "${GSTACK_DIR}/.git" ]]; then
  echo "  Existing clone found — updating."
  retry git -C "${GSTACK_DIR}" fetch --depth 1 origin HEAD
  git -C "${GSTACK_DIR}" reset --hard FETCH_HEAD --quiet
else
  rm -rf "${GSTACK_DIR}"
  mkdir -p "$(dirname "${GSTACK_DIR}")"
  retry git clone --depth 1 "${REPO_URL}" "${GSTACK_DIR}"
fi

# --- 2. Satisfy Playwright from the browser already on disk -----------------
# Install dependencies first. Without node_modules, bun would auto-install the
# *latest* Playwright, which pins a different Chromium build than gstack's
# lockfile — and we would bridge a build number nothing ends up asking for.
echo "Installing gstack dependencies..."
(cd "${GSTACK_DIR}" && { bun install --frozen-lockfile >/dev/null 2>&1 || bun install >/dev/null 2>&1; })

# Ask Playwright to launch; it names the exact path it wants in the failure
# message. Build that path from a local build of the same browser, then ask
# again. Two rounds covers chromium and its headless shell.

playwright_launch_probe() {
  (cd "${GSTACK_DIR}" && timeout 120 bun --eval \
    'import { chromium } from "playwright"; const b = await chromium.launch(); await b.close();' 2>&1) || true
}

# Largest executable under a directory — the browser binary, whatever it is
# called in this build.
donor_binary() {
  find "$1" -type f -executable -size +50M -printf '%s\t%p\n' 2>/dev/null \
    | sort -rn | head -1 | cut -f2
}

bridge_browser() {
  local missing="$1"
  # /path/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell
  local rel="${missing#"${BROWSERS_PATH}/"}"
  [[ "${rel}" != "${missing}" ]] || return 1
  local pkg="${rel%%/*}"                 # chromium_headless_shell-1208
  local base="${pkg%-*}"                 # chromium_headless_shell
  [[ "${base}" != "${pkg}" ]] || return 1

  local donor="" d
  for d in "${BROWSERS_PATH}/${base}-"*; do
    [[ -d "${d}" && "${d}" != "${BROWSERS_PATH}/${pkg}" ]] || continue
    donor="${d}"
  done
  [[ -n "${donor}" ]] || return 1

  local donor_bin donor_dir
  donor_bin="$(donor_binary "${donor}")"
  [[ -n "${donor_bin}" ]] || return 1
  donor_dir="$(dirname "${donor_bin}")"

  echo "  Bridging ${base}: reusing $(basename "${donor}") as ${pkg}"
  local want_dir f
  want_dir="$(dirname "${missing}")"
  rm -rf "${BROWSERS_PATH:?}/${pkg}"
  mkdir -p "${want_dir}"
  for f in "${donor_dir}"/*; do
    ln -sfn "${f}" "${want_dir}/$(basename "${f}")"
  done
  ln -sfn "${donor_bin}" "${missing}"
  touch "${BROWSERS_PATH}/${pkg}/INSTALLATION_COMPLETE" \
        "${BROWSERS_PATH}/${pkg}/DEPENDENCIES_VALIDATED"
}

MARKER="Executable doesn't exist at "

if [[ -d "${BROWSERS_PATH}" ]]; then
  for _ in 1 2 3; do
    probe="$(playwright_launch_probe)"
    [[ "${probe}" == *"${MARKER}"* ]] || break
    missing="${probe#*"${MARKER}"}"
    missing="${missing%%$'\n'*}"
    missing="${missing%"${missing##*[![:space:]]}"}"
    bridge_browser "${missing}" || {
      echo "  No local browser available to satisfy ${missing}"
      echo "  Falling back to gstack's own Chromium download."
      break
    }
  done
fi

# --- 3. Run gstack's setup --------------------------------------------------
echo "Running gstack setup (--team)..."
if ! (cd "${GSTACK_DIR}" && ./setup --team); then
  echo >&2
  echo "Error: gstack setup failed — gstack skills are NOT registered." >&2
  echo "       If the log shows a cdn.playwright.dev download blocked by policy," >&2
  echo "       either allow that host in the environment's network policy, or" >&2
  echo "       ensure a Chromium build exists under ${BROWSERS_PATH}." >&2
  exit 1
fi

echo
echo "Done."
echo "  gstack installed at ${GSTACK_DIR}"
echo "  Restart your CLI client(s); /qa, /ship, /review, /investigate and /browse are available."
