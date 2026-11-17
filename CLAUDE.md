# Video editor — instructions for Claude

This folder is a local video-editing pipeline: FFmpeg (system), faster-whisper (`.venv`), Remotion (`node_modules`). README.md covers the user-facing details.

## How to handle an edit request

1. **Express edits as data first.** Most requests are changes to an edit file in `edits/` (schema: `src/utils/types.ts`). Write code only when the schema can't express the request; when you do, extend the schema and add a component rather than writing one-off code.
2. **All times in edit files are source-video seconds.** Never pre-shift times for earlier cuts; `src/utils/timeline.ts` remaps cuts, zooms and captions.
3. **Use the transcript** (`captions/transcripts/<input-name>.json`, which has word-level `start`/`end`) to find moments: "when I mention X", best 30 s, clip boundaries, mistakes. Cut on word boundaries with ~0.1 s padding.
4. **Separate outputs get separate edit files**: `edits/reel.json`, `edits/youtube-16x9.json`, `edits/clip-1.json`… each with its own `output`.
5. **Verify before rendering:** run `npm run still -- --edit edits/x.json --time N` and look at the PNG in `work/stills/`. Then render with `npm run render -- --edit edits/x.json`.
6. **Report results:** after a render, report the output path, resolution, fps, duration and size (the pipeline prints these).

## Tool choice

- FFmpeg: analysis (`npm run silence`, `npm run probe`), source normalization, audio extraction, and fast lossless trims or concatenations that need no graphics.
- Remotion: anything visual: captions, overlays, zooms, titles, transitions, reframing, music mixing.
- Whisper: `npm run transcribe` (`--keep-fillers` before filler-word removal).

## Safety rules (from the user)

- Never modify or delete files in `input/`. Never delete the user's assets or outputs.
- Ask before overwriting an existing file in `output/`; only pass `--overwrite` after the user agrees, or pick a new output name.
- `work/` and `.cache/` are generated and safe to clear.
- Don't install system-wide software without asking; project deps go in `node_modules/` or `.venv/`.
- No paid APIs.

## Checks

`npm run typecheck` after changing `src/`. `npm run smoke-test` exercises the full pipeline without touching user folders.
