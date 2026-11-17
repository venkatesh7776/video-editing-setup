# Local AI Video Editor

Edit videos by describing what you want to Claude Code. Everything runs locally: **FFmpeg** handles media processing, **Whisper** (faster-whisper) handles transcription, and **Remotion** handles captions, motion graphics and the final render. It uses no paid APIs.

## Quick start

```bash
cd "~/Desktop/Video Editing setup"
# 1. Put your video here:
cp ~/Downloads/my-clip.mp4 input/raw-video.mp4
# 2. Run the whole pipeline (transcribe → captions → render):
npm run edit
# → output/test-video.mp4
```

Then open Claude Code in this folder and describe your edits, for example: *"Remove the silences and add my logo top-right."*

## What's installed, and where

| Tool | Version | Where | Scope |
|---|---|---|---|
| Homebrew | already installed | `/opt/homebrew` | system |
| FFmpeg / FFprobe | 8.0.1 (already installed) | `/opt/homebrew/bin` | system |
| Node.js / npm | 24.13 / 11.6 (already installed) | `/usr/local/bin` | system |
| Python | 3.13 (Homebrew, already installed) | `/opt/homebrew/bin/python3.13` | system |
| Python venv + faster-whisper 1.2.1 | | `.venv/` | **project** |
| Whisper model weights (`small.en`) | ~460 MB | `.cache/whisper-models/` | **project** |
| Remotion 4.0.532, React 19, TypeScript | | `node_modules/` | **project** |
| Chrome Headless Shell (Remotion's renderer) | | `node_modules/.remotion/` | **project** |

Only the project-local items were added. Nothing system-wide was installed or changed. To remove everything, delete the folder.

## How the tools fit together

```
input/raw-video.mp4
   │  FFprobe: read resolution, fps, rotation, codecs
   ▼
FFmpeg prepare ─► work/public/source.mp4   (stream-copied if already compatible; otherwise
   │                                         normalized to constant-frame-rate H.264, CRF 14)
   ├─► FFmpeg extracts 16 kHz audio ─► Whisper ─► captions/transcripts/raw-video.json (word timings) + .txt
   │                                              captions/subtitles/raw-video.srt + .vtt
   ▼
edits/default.json + transcript ─► work/props.json
   ▼
Remotion (src/compositions/Main.tsx): cuts, crop/fit, zooms, captions, logo, title, music
   ▼
output/test-video.mp4   (H.264 CRF 18, AAC 192k, BT.709, yuv420p)
```

**The key idea:** every edit is data in an **edit file** (`edits/*.json`), not code. All times in an edit file are in seconds of the *original* video. Cuts, zooms and captions are remapped onto the edited timeline automatically, so you can stack edits without recalculating anything.

## Project layout

```
input/              raw videos (never modified)
output/             final renders
assets/             logos/, music/, images/, fonts/
captions/           transcripts/ (JSON + TXT), subtitles/ (SRT + VTT)
edits/              edit files — one per output (default.json, reel.json, youtube.json…)
src/
  compositions/     Main.tsx — the reusable edit composition
  components/       VideoLayer, Captions, Overlays (Logo, TitleCard, BackgroundMusic)
  utils/            types (edit-file schema), formats, timeline (cuts), captions (paging)
scripts/
  pipeline.mjs      probe → prepare → transcribe → props → render
  transcribe/       Whisper (Python) + Node wrapper
  analyze/          probe, silence detection, filler-word detection
  processing/       FFmpeg source preparation
work/               generated/temporary files (safe to delete)
.cache/             Whisper models
```

## Commands

| Command | What it does |
|---|---|
| `npm run edit` | Full pipeline: transcribe (if needed), then render `edits/default.json` |
| `npm run render` | Re-render without running Whisper (fast, after changing an edit file) |
| `npm run preview` | Open Remotion Studio in the browser for a live preview |
| `npm run still -- --time 12` | Render one frame to `work/stills/` for a quick look |
| `npm run transcribe` | Transcribe only (`--force` to redo, `--model medium.en`, `--keep-fillers`) |
| `npm run silence` | List silent sections (`--apply` adds them as cuts; tune with `--noise -35 --min 0.7 --pad 0.15`) |
| `npm run fillers` | List um/uh fillers (`--apply` adds them as cuts; `--soft` also catches "like", "you know") |
| `npm run probe -- file.mp4` | Show resolution, fps, duration and codecs |
| `npm run check` | Verify the whole toolchain |
| `npm run smoke-test` | End-to-end test with a generated clip (writes only to `work/smoke/`) |

Every command accepts `--edit edits/other.json`. The pipeline also accepts `--input`, `--output`, `--format 16:9` and `--overwrite`. Note the `--` before flags: `npm run edit -- --edit edits/reel.json`.

**Existing outputs are never overwritten** unless you pass `--overwrite`.

## The edit file

`edits/default.json`. Every field is optional except `input`, `output` and `format`:

```jsonc
{
  "input": "input/raw-video.mp4",
  "output": "output/test-video.mp4",
  "format": "9:16",              // "9:16" 1080×1920 | "16:9" 1920×1080 | "1:1" 1080×1080 | "4:5" | {"width":…, "height":…}
  "fps": null,                   // null = keep the source frame rate
  "fit": "auto",                 // auto | cover (crop to fill) | contain (letterbox) | blur (letterbox over blurred fill)
  "focus": {"x": 0.5, "y": 0.5}, // crop centre for "cover" (e.g. x: 0.3 keeps the left side)
  "trim": {"start": 0, "end": null},
  "cuts": [{"start": 12.4, "end": 15.0, "reason": "mistake"}],
  "zooms": [{"start": 20, "end": 24, "scale": 1.3, "x": 0.5, "y": 0.4}],
  "captions": {"enabled": true, "position": "bottom", "maxWordsPerPage": 4,
               "highlightActiveWord": true, "keywords": ["ProductName"], "uppercase": false},
  "logo":  {"src": "assets/logos/logo.png", "position": "top-right", "widthScale": 0.14},
  "title": {"text": "My Title", "subtitle": "optional", "duration": 2.5},
  "music": {"src": "assets/music/track.mp3", "volume": 0.1, "fadeIn": 1, "fadeOut": 2},
  "audio": {"normalize": false, "volume": 1},     // normalize = EBU R128 loudness to -16 LUFS
  "whisper": {"model": "small.en", "language": "en", "keepFillers": false},
  "render": {"codec": "h264", "crf": 18, "audioBitrate": "192k"}
}
```

## Working with Claude Code

1. Copy your video to `input/raw-video.mp4`, or any name under `input/` and tell Claude the name.
2. Open Claude Code in this folder and describe the edit in plain language:
   - "Remove the first 5 seconds." → `trim.start: 5`
   - "Remove silent sections." / "Remove filler words." → `npm run silence --apply` / `npm run fillers --apply`
   - "Make a 30-second Instagram Reel." → Claude reads the transcript, picks the best 30 s, and writes `edits/reel.json`
   - "Cut this into 5 short clips." → five edit files, one per clip
   - "Zoom in whenever I mention the product." → Claude finds the word timings in the transcript and adds `zooms`
   - "Add my logo top-right." / "Add background music at low volume." / "Add a title animation."
   - "Make a 16:9 YouTube version." → a copy of the edit file with `"format": "16:9"`
   - "Highlight keywords in the captions." → `captions.keywords`
3. Claude edits the edit file, checks a still frame, then renders. You can also run `npm run preview` to scrub through the result in your browser.
4. Final videos land in `output/`.

## Quality defaults

- The source is **stream-copied** when it's already H.264/HEVC, 8-bit 4:2:0, constant frame rate and unrotated. Otherwise it is normalized once at CRF 14, which is visually lossless.
- The output frame rate equals the source frame rate unless you set `fps`. Variable-frame-rate phone footage is converted to the nearest standard rate.
- Aspect ratio is never stretched: `cover` crops, `contain` and `blur` letterbox. `auto` picks `cover` for similar shapes and `blur` otherwise.
- Phone rotation metadata is applied before rendering.
- Output is H.264 High, CRF 18, yuv420p, BT.709, with AAC 192 kbps. This plays everywhere and is a good size-to-quality balance. Use a lower `crf` for higher quality and bigger files.

## Troubleshooting

| Problem | Fix |
|---|---|
| `Missing input/raw-video.mp4` | Put the video there, or pass `--input path` |
| `… already exists` | Add `--overwrite`, or pass `--output output/new-name.mp4` |
| Captions are from an old video | Transcripts refresh automatically when the input changes. To force it: `npm run transcribe -- --force` |
| Transcription is inaccurate | `"whisper": {"model": "medium.en"}` (slower, more accurate) or `"large-v3-turbo"`, then `npm run transcribe -- --force` |
| Fillers aren't detected | Whisper drops "um" by default. Run `npm run transcribe -- --force --keep-fillers` |
| Colours look flat (iPhone HDR footage) | HDR is converted to SDR. Export from Photos as "Most Compatible", or turn off HDR video when recording |
| Render is slow | Use `npm run still` for checks. `blur` fit decodes the video twice, so use `cover`/`contain` if you don't need it |
| Fonts missing or render fails offline | Captions use Inter from Google Fonts, which needs internet during render. For offline or custom fonts, put the file in `assets/fonts/` and ask Claude to switch to it |
| `remotion` / `ffmpeg` not found | Run `npm run check`, which prints the exact fix command for anything missing |
| Python errors | `rm -rf .venv && /opt/homebrew/bin/python3.13 -m venv .venv && .venv/bin/pip install -r requirements.txt` |
| Node errors | `rm -rf node_modules && npm install` |
| Disk space | `work/` is generated scratch space; delete it whenever you like |

## Licensing note

Remotion is free for individuals and for companies with up to 3 employees. Larger companies need a [Remotion company license](https://www.remotion.dev/license). faster-whisper, Whisper models and FFmpeg are open source.
