#!/usr/bin/env bash
# extract-frames.sh — sample frames from a video for vision analysis.
#
# Shipped as part of the video-vision plugin. Extracts evenly-spaced (or
# fps/interval-based) frames as JPEGs so Claude can Read them as images and
# reason about the video's contents. Fully offline; only requires ffmpeg.
#
# Usage:
#   extract-frames.sh <video> [output_dir] [options]
#
# Options:
#   --count <n>      Extract ~n frames evenly across the whole video (default 16)
#   --fps <n>        Extract n frames per second (n may be a decimal, e.g. 0.5)
#   --interval <s>   Extract one frame every <s> seconds
#   --max <n>        Hard cap on total frames (default 60)
#   --width <px>     Scale frames to this width, aspect preserved (default 768)
#   --quality <n>    JPEG quality, 2 (best) .. 31 (worst) (default 3)
#   -h, --help       Show this help
#
# --count, --fps, and --interval are mutually exclusive; the last one wins.
# Whatever mode is chosen, the total never exceeds --max.
#
# Output: JPEGs named frame-0001.jpg, frame-0002.jpg, ... in output_dir
# (a fresh temp dir if omitted). A manifest with approximate timestamps is
# printed to stdout and written to <output_dir>/frames.txt.

set -euo pipefail

MAX=60
WIDTH=768
QUALITY=3
COUNT_DEFAULT=16
MODE=""        # count | fps | interval
MODE_VAL=""
VIDEO=""
OUTDIR=""

usage() {
  # Print the leading comment header (everything after the shebang up to the
  # first non-comment line), with the leading "# " stripped.
  awk 'NR==1{next} /^#/{sub(/^# ?/,""); print; next} {exit}' "$0"
}

die() { echo "video-vision: $*" >&2; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --count)    MODE=count;    MODE_VAL="${2:-}"; shift 2;;
    --fps)      MODE=fps;      MODE_VAL="${2:-}"; shift 2;;
    --interval) MODE=interval; MODE_VAL="${2:-}"; shift 2;;
    --max)      MAX="${2:-}";     shift 2;;
    --width)    WIDTH="${2:-}";   shift 2;;
    --quality)  QUALITY="${2:-}"; shift 2;;
    -h|--help)  usage; exit 0;;
    --) shift; break;;
    -*) die "unknown option: $1 (try --help)";;
    *)
      if [[ -z "$VIDEO" ]]; then VIDEO="$1"
      elif [[ -z "$OUTDIR" ]]; then OUTDIR="$1"
      else die "unexpected argument: $1"; fi
      shift;;
  esac
done

[[ -n "$VIDEO" ]] || { usage; exit 2; }
[[ -f "$VIDEO" ]] || die "video not found: $VIDEO"

command -v ffmpeg  >/dev/null 2>&1 || die "ffmpeg not found. Install it (e.g. 'brew install ffmpeg' or 'apt-get install ffmpeg') and retry."
command -v ffprobe >/dev/null 2>&1 || die "ffprobe not found. It ships with ffmpeg — install ffmpeg and retry."

# Validate numeric-ish inputs early with clear messages.
is_num() { [[ "$1" =~ ^[0-9]+([.][0-9]+)?$ ]]; }
if [[ -n "$MODE" ]]; then is_num "$MODE_VAL" || die "--$MODE needs a positive number, got: '${MODE_VAL:-}'"; fi
is_num "$MAX"     || die "--max needs a number, got: '$MAX'"
is_num "$WIDTH"   || die "--width needs a number, got: '$WIDTH'"
is_num "$QUALITY" || die "--quality needs a number, got: '$QUALITY'"

DURATION=$(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$VIDEO" 2>/dev/null || true)
is_num "${DURATION:-}" || die "could not read a valid duration from '$VIDEO' — is it a video file?"
awk "BEGIN{exit !($DURATION>0)}" || die "video has non-positive duration ($DURATION s)"

# Resolve target frame count for the chosen mode, then clamp to [1, MAX].
case "$MODE" in
  count)    N_TARGET=$(awk "BEGIN{printf \"%d\", $MODE_VAL + 0.5}");;
  interval) N_TARGET=$(awk "BEGIN{printf \"%d\", $DURATION/$MODE_VAL + 0.5}");;
  fps)      N_TARGET=$(awk "BEGIN{printf \"%d\", $DURATION*$MODE_VAL + 0.5}");;
  *)        N_TARGET=$COUNT_DEFAULT;;
esac
[[ "$N_TARGET" -lt 1 ]] && N_TARGET=1
CLAMPED="no"
if [[ "$N_TARGET" -gt "$MAX" ]]; then N_TARGET=$MAX; CLAMPED="yes"; fi

# Even sampling across the timeline: fps = frames / duration.
EFF_FPS=$(awk "BEGIN{printf \"%.6f\", $N_TARGET/$DURATION}")

if [[ -z "$OUTDIR" ]]; then
  OUTDIR=$(mktemp -d "${TMPDIR:-/tmp}/video-frames.XXXXXX")
else
  mkdir -p "$OUTDIR"
fi

# scale=-2 keeps aspect ratio while forcing an even height (required by JPEG).
ffmpeg -hide_banner -loglevel error -y \
  -i "$VIDEO" \
  -vf "fps=${EFF_FPS},scale=${WIDTH}:-2:flags=bicubic" \
  -q:v "$QUALITY" \
  "$OUTDIR/frame-%04d.jpg"

shopt -s nullglob
FRAMES=("$OUTDIR"/frame-*.jpg)
shopt -u nullglob
[[ ${#FRAMES[@]} -gt 0 ]] || die "ffmpeg produced no frames — the video may be unreadable"

MANIFEST="$OUTDIR/frames.txt"
{
  echo "# video-vision frames"
  echo "# source:   $VIDEO"
  printf "# duration: %.2fs   frames: %d   ~fps: %s   width: %spx\n" "$DURATION" "${#FRAMES[@]}" "$EFF_FPS" "$WIDTH"
  [[ "$CLAMPED" == "yes" ]] && echo "# note: frame count capped at --max=$MAX"
  echo "#"
  i=0
  for f in "${FRAMES[@]}"; do
    # Approx timestamp of the frame's sample point, in seconds.
    ts=$(awk "BEGIN{printf \"%.2f\", ($i + 0.5)/$EFF_FPS}")
    printf "%s\t%ss\n" "$f" "$ts"
    i=$((i + 1))
  done
} | tee "$MANIFEST"

echo >&2 "video-vision: wrote ${#FRAMES[@]} frame(s) to $OUTDIR"
