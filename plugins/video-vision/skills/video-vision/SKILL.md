---
name: video-vision
description: Analyze, summarize, or answer questions about a video file by sampling frames with ffmpeg and reading them as images. Use when the user points at a local video (.mp4, .mov, .webm, .mkv, .gif, etc.) and asks what happens in it, to describe/summarize it, to find a moment or object, to read on-screen text, or to check it frame by frame.
---

# Video vision

Claude can read images but not video directly. This skill bridges the gap:
sample representative frames from a video with `ffmpeg`, then `Read` those
frames as images and reason about them. Everything runs locally — no upload,
no external service.

The plugin ships two scripts under `${CLAUDE_PLUGIN_ROOT}/scripts`:

- `video-info.sh <video>` — duration, resolution, fps, codec, container.
- `extract-frames.sh <video> [out_dir] [options]` — sample frames to JPEGs.

## Workflow

### 1. Check ffmpeg is available

```bash
command -v ffmpeg >/dev/null && command -v ffprobe >/dev/null \
  && echo "ffmpeg OK" || echo "ffmpeg MISSING"
```

If missing, tell the user to install it (`brew install ffmpeg` on macOS,
`sudo apt-get install ffmpeg` on Debian/Ubuntu) and stop — the scripts can't
run without it.

### 2. Inspect the video

```bash
"${CLAUDE_PLUGIN_ROOT}"/scripts/video-info.sh path/to/video.mp4
```

Use the duration to choose how densely to sample (see the budget note below).

### 3. Extract frames

```bash
# Default: ~16 frames spread evenly across the whole video.
"${CLAUDE_PLUGIN_ROOT}"/scripts/extract-frames.sh path/to/video.mp4 ./frames
```

Sampling options (choose based on the task):

- `--count <n>` — n frames spread evenly across the video (good for "summarize
  the whole thing"). This is the default mode, n=16.
- `--interval <s>` — one frame every s seconds (good for steady walkthroughs).
- `--fps <n>` — n frames per second; use fractional values like `0.5` for
  sparse sampling or `2` for catching fast action.
- `--max <n>` — hard cap on total frames (default 60); the chosen mode is
  always trimmed to fit under it.
- `--width <px>` — scale frames (default 768; enough for most detail).

The script prints a manifest (also written to `<out_dir>/frames.txt`) listing
each frame's path and its approximate timestamp in the video.

### 4. Read and analyze

`Read` the frame files in order and answer the user's question. Cite the
approximate timestamp from the manifest when referring to a moment (e.g.
"around 7.2s the scene cuts to…"). Read frames in batches rather than all at
once for long videos.

## Choosing a frame budget

Each frame is an image the model must process, so more frames = more tokens and
more cost. Match density to the question:

- **"What is this video / summarize it"** → default `--count 16` (or up to
  `--count 30` for longer videos).
- **"Find the moment when X happens" / "read the text on screen"** → sample
  denser with `--fps 1` or `--interval 1`, and raise `--max` if needed; consider
  a first coarse pass to locate the region, then a dense pass over just that
  span (trim the clip first with `ffmpeg -ss <start> -to <end>`).
- **Fast action / sports / UI interactions** → `--fps 2` or higher on the
  relevant span.

Start coarse, then zoom in. A 16-frame overview usually answers "what is this"
and tells you where to look closer.

## Notes

- Supported inputs are whatever ffmpeg decodes: `.mp4`, `.mov`, `.mkv`,
  `.webm`, `.avi`, animated `.gif`, and more.
- Frames land in the output dir you pass, or a fresh temp dir if you omit it
  (the path is printed). Clean up when done if you wrote into the project tree.
- Audio is not analyzed — this is frame-based vision only. For speech, transcribe
  the audio track separately.
