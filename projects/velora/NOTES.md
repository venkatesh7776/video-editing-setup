# Velora — motion-graphics explainer (16:9)

- Brief: `brief.pdf` (8 scenes, 60–75 s, 1920×1080). Script = the brief's voiceover, with money read as words
  ("twenty-five thousand rupees", "one lakh rupee"). `script.txt`.
- Look: **user's style reference** (`style-reference`: light Stripe-like UI), not the brief's navy/gold and nothing
  from VibeLevel. Canvas #F6F9FC, white cards with deep soft shadows, navy #0A2540 type in Inter, indigo #635BFF
  accent, orange → pink → violet gradient ribbon. Tokens + parts in `src/compositions/velora/kit.tsx`.
- VO: ElevenLabs "Venkatesh prof" (eleven_v4, stability 0.55, similarity 1.0), take 2 of 2 (`work/velora/vo/`),
  Whisper-exact. Scene gaps inserted in `build.mjs` (GAPS, by word index).
- Music: Mixkit "Piano Reflections" (piano-only story; bass/rhythm enters at 32.0 s, aligned to "What if…").
- SFX: ElevenLabs Sound Effects, normalised to −20 LUFS (`assets/music/velora/sfx`). Prompts: city morning
  ambience, rolling suitcase, soft notification, two soft low thumps (tension), digital counter, calendar pages,
  soft UI tap, two-note confirmation, shimmering logo reveal, three-note marimba/bell sonic logo, line swish,
  soft airy whoosh.
- Compliance (brief §8): footnotes for illustrative figures, lender-decides credit, insurer terms; no EMI amounts,
  no approval/guarantee claims. End-card URL: pass `url` in props when known (not shown otherwise).
- Code: `src/compositions/velora/` — `Velora.tsx` (scene windows + mix), `ScenesStory.tsx` (S1–S4),
  `ScenesProduct.tsx` (S5–S8), `Arjun.tsx` (character), `kit.tsx`.
- Preview many frames fast: `node scripts/analyze/stills.mjs --comp Velora --props work/velora/props.json --times … --sheet out.jpg`.
