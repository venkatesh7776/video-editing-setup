# Rent — six campaign videos

- Source: `scripts.md` (ONERENT six-video ad scripts). User: replace "ONERENT" with **"Rent"** everywhere (VO, logo).
- Outputs: `output/video1.mp4` (16:9 master explainer), `video2`–`video6` (9:16: deposit problem, moving
  experience, financial flexibility, founder intro, UGC scenario). Each rendered separately.
- Design system, voice, music and SFX reused from the Velora film (`src/compositions/velora/*`): Inter, navy type,
  indigo accent, orange→pink→violet gradient; blue→purple gradient for the product reveal (script direction);
  ElevenLabs "Vikram S" (videos 5–6 with stability 0.35 for a conversational read); Mixkit tracks per video.
- Rent mark: same gradient tile as the Velora mark, with a forward "R" (`src/compositions/rent/adkit.tsx`).
- Videos 5–6: animated founder / creator characters (user's choice) with voice-driven lip movement, captions,
  PiP over supporting visuals. Video 6 carries a "Dramatised scenario" label (no fake testimonial).
- Guardrails: financing "being explored" with regulated lending partners; waitlist ≠ loan application/approval
  (end-card disclaimer); no rates/EMIs/approvals; example amounts labelled illustrative; conceptual UI labelled.
- Build: `node projects/rent-ads/build.mjs --video all` (or `--video 3 --stills 1,5,9 --sheet x.jpg`).
  VO: `VO_PARTS=projects/rent-ads/vo-parts.json VO_OUT=work/rent-ads/vo .venv/bin/python -I projects/velora-film/tts.py`.
