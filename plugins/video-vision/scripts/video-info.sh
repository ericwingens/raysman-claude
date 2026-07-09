#!/usr/bin/env bash
# video-info.sh — print key metadata for a video via ffprobe.
#
# Shipped as part of the video-vision plugin. Use this before extracting
# frames to decide how many to sample (duration) and how to scale them
# (resolution). Fully offline; only requires ffprobe (ships with ffmpeg).
#
# Usage: video-info.sh <video>

set -euo pipefail

die() { echo "video-vision: $*" >&2; exit 1; }

VIDEO="${1:-}"
[[ -n "$VIDEO" ]] || die "usage: video-info.sh <video>"
[[ -f "$VIDEO" ]] || die "video not found: $VIDEO"
command -v ffprobe >/dev/null 2>&1 || die "ffprobe not found. It ships with ffmpeg — install ffmpeg and retry."

# Query each field on its own: ffprobe emits fields in a fixed internal order,
# not the order requested, so a single multi-field call can't be parsed safely.
get_stream() {
  ffprobe -v error -select_streams v:0 -show_entries "stream=$1" \
    -of default=nk=1:nw=1 "$VIDEO" 2>/dev/null | head -1
}
WIDTH=$(get_stream width)
HEIGHT=$(get_stream height)
RFR=$(get_stream r_frame_rate)
VCODEC=$(get_stream codec_name)
DURATION=$(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$VIDEO" 2>/dev/null || echo "")
CONTAINER=$(ffprobe -v error -show_entries format=format_name -of default=nk=1:nw=1 "$VIDEO" 2>/dev/null || echo "")

# r_frame_rate is a rational like "30000/1001" — reduce it to a decimal.
FPS=""
if [[ -n "${RFR:-}" && "$RFR" == */* ]]; then
  FPS=$(awk "BEGIN{split(\"$RFR\",a,\"/\"); if(a[2]+0>0) printf \"%.3f\", a[1]/a[2]}")
fi

printf "source:     %s\n" "$VIDEO"
printf "container:  %s\n" "${CONTAINER:-unknown}"
printf "video:      %s\n" "${VCODEC:-unknown}"
printf "resolution: %sx%s\n" "${WIDTH:-?}" "${HEIGHT:-?}"
printf "fps:        %s\n" "${FPS:-unknown}"
if [[ -n "${DURATION:-}" ]]; then
  awk "BEGIN{d=$DURATION; printf \"duration:   %.2fs (%d:%02d)\n\", d, int(d/60), int(d)%60}"
else
  echo "duration:   unknown"
fi
