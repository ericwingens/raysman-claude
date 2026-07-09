# video-vision

A Claude Code plugin that gives Claude the ability to **analyze videos**.
Claude can read images but not video, so this plugin samples frames from a
video with `ffmpeg` and lets Claude `Read` them as images to reason about the
contents — summaries, finding a moment, reading on-screen text, frame-by-frame
inspection. Everything runs locally; nothing is uploaded.

## Components

- **Skill** (`skills/video-vision`): the workflow Claude follows — inspect the
  video, pick a sampling density, extract frames, read and analyze them.
  Invoke with `/video-vision:video-vision`, or just point Claude at a video
  file and ask about it.
- **Scripts** (`scripts/`):
  - `video-info.sh <video>` — duration, resolution, fps, codec, container.
  - `extract-frames.sh <video> [out_dir] [options]` — sample frames to JPEGs
    with a manifest of per-frame timestamps.

## Requirements

[`ffmpeg`](https://ffmpeg.org/) (which includes `ffprobe`) must be on `PATH`:

```bash
brew install ffmpeg          # macOS
sudo apt-get install ffmpeg  # Debian / Ubuntu
```

The scripts fail with a clear message if ffmpeg is missing.

## Usage

```bash
# Metadata
scripts/video-info.sh clip.mp4

# ~16 frames spread evenly across the video
scripts/extract-frames.sh clip.mp4 ./frames

# One frame per second, capped at 40 frames
scripts/extract-frames.sh clip.mp4 ./frames --fps 1 --max 40

# One frame every 5 seconds
scripts/extract-frames.sh clip.mp4 ./frames --interval 5
```

`extract-frames.sh --help` lists every option (`--count`, `--fps`,
`--interval`, `--max`, `--width`, `--quality`).

## Install

From the `raysman-claude` marketplace:

```shell
/plugin marketplace add ericwingens/raysman-claude
/plugin install video-vision@raysman-claude
```

## Validate locally

```bash
claude plugin validate ./plugins/video-vision
```
