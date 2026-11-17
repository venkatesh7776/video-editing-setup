# VibeLevel Screening demo v4 (master prompt, 2026-11-02)

- Script: the approved 9-scene voiceover (`vo-parts.json`), unchanged. Voice + speed identical to demo v3:
  ElevenLabs "Jessica Anne Bogart", eleven_v4, stability 0.5, tempo 1.08.
- Music: V8's "Deep Urban" (`assets/music/vibelevel-screening/deep-urban.mp3`) from V8's start point (4.5 s),
  trimmed to sit at v3's level under the voice.
- Captures: Review Session + report of preview session 54d2a454… captured with
  `projects/vibelevel-screening/capture-v4.mjs` (signs in via VL_EMAIL / VL_PASSWORD env vars; credentials are never
  stored), blurred with `blur_v4.py` (candidate name, assessment/session IDs, score values; Review Session header
  name + score). Code Review / Video Q&A / Interview Guide use the existing redacted V8 report crops (this session's
  report has no such tabs).
- Scenes: 1 hook 1,000→500→100→20→5 (illustrative) · 2 evidence gap (Final result vs Evidence behind the work) ·
  3 v3 intro · 4 report (real captures, feature rail) · 5 v3 workspace · 6 Review Session (chat → code changes →
  files & outputs → done well → fell short → evidence pointer, green highlights) · 7 four-dimension tiles ·
  8 v3 interview · 9 closing + end card. Pixel wipes into scenes 2, 6, 9; cross-dissolves elsewhere.
- Code: `src/compositions/vl4/Demo4.tsx` (reuses `vl3/Demo3.tsx` + `vl2/kit.tsx`).

## Revision 2026-11-02 (evening)
- Order: hook · gap · intro · report · **Review Session** · workspace · four dimensions · interview · closing.
- Scene 7 VO now opens "VibeLevel evaluates candidates across four dimensions…" (only that line regenerated).
- Hook: 30 cards + "970+ more applicants" → 12 → 5 (staggered eased moves); final five are large, legible cards.
- Report: layered stack (v3 style) of the five real, blurred sections, shown in full (contained), each layer named.
- Subtitles on product screens only (report, Review Session, workspace, interview) under short titles that never
  repeat the spoken line; text-only screens keep the spoken headline without subtitles.
- Pixel transition on every scene change; end card is logo + Book a Demo only.
