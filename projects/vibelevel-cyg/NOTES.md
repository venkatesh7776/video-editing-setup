# Production notes — v1 (2026-11-12)

- Output: `output/vibelevel-can-you-get-away-with-it.mp4` — 3840×2160 (designed 1920×1080, `--scale=2`), 30 fps, ≈2:42, −14 LUFS.
- Build: `node projects/vibelevel-cyg/build.mjs [--draft] [--stills …]`; composition `VibeLevelCYG` (`src/compositions/cyg/Film.tsx`, `ui.tsx`).
- VO: presenter = v4 voice (Jessica Anne Bogart, eleven_v4, stability 0.5, tempo 1.08), approved script verbatim (`vo-parts.json`).
  Interviewer = "Amith – Calm" (ndiQJTsR5uNFyUIZYkT8); candidate answers = "Sid – Friendly" (0muxiGNHAVvmM1qWRtyV) (`int-q.json`, `int-a.json`).
- Omni: CHAR-01 (gemini-3-pro-image) → keyframes k2–k7 conditioned on it → gemini-omni-1.2-flash image-to-video 1080p (`omni_gen.py`, log `ASSETS.md`).
  k1 opening · k2 over-shoulder (fly-in) · k3 shortcut hands · k4 surprise · k5 lean-back · k6 hesitant answer · k7 confident answer. Omni audio muted.
- Music: Deep Urban (v4/V8 bed) from 4.5 s, ducked; SFX: ElevenLabs sound-generation set (`work/public/cyg/sfx`).
- Logos: VibeLevel star cleaned (`vl-star.png`); Screening icon rebuilt as vector dial + star (source PNG had damaged interior) — ask for SVG.
- External tool shown as fictional "Nova" (unbranded). Fictional candidate "Arjun M."; report numbers are illustrative.

## v2 (2026-11-12, user review) — `output/vibelevel-can-you-get-away-with-it-v2.mp4` (≈1:56)
- Tight script approved (vo-parts.json; v1 lines in vo-parts-v1.json, v1 takes in work/cyg/vo-v1). One interview question; interviewer +4.6 dB (GAIN).
- Opening: VibeLevel logo reveal (pixel sparkle, letter reveal) that docks top-left; kinetic text + Screening icon on "VibeLevel Screening".
- Light theme: brand gradient #DCEFE2→#F6F0D6 (from the site), white/mint pixels, soft white pixel wipes; chapter cards on the
  Dreamy Mint Pixel Mountain art (50% + white wash); Clash Display headlines (Fontshare, work/public/cyg/fonts).
- Corner: VibeLevel logo only, hidden on the 4 chapter cards and the end lockup.
- Omni v2 (work/cyg/omni2): realistic front-angle MacBook hero (gemini-3-pro-image, 2K) → k2–k6 i2v; pills re-placed for the new framing.
- Attempt 01 = screenshot (⌘⇧4 + region + flash + thumbnail into Nova); browser now rises in (no slide-from-right); tab switches cross-blur.
- IDE right panel = Claude Code; signals per attempt only; music −3–4 dB, SFX impacts/risers/denied softened; subtitle removed.

## v3 (2026-11-12, review 2) — `output/vibelevel-can-you-get-away-with-it-v3.mp4` (≈1:55)
- American candidate "Ryan": hero still (gemini-3-pro-image, documentary prompt) → keyframes → **Veo 3.1** i2v (veo_gen.py,
  shots_v3.sh; Omni faces read as artificial). Interview answer = the Veo clip's own lip-synced American voice (a1_from_video.py).
- Interviewer re-voiced in American English: ElevenLabs "Eric" (cjVigY5qzO86Huf0OWal), multilingual_v2.
- Cue matching prefers exact words (fixed "to" firing on "Today" → text now lands on the VO).
- Text: no blur smears (mask + opacity only); invite → shortcuts no overlap; no keycaps; "Let's see how far he gets." then the title.
- Pixel wipe = one soft single pass, only at three scene changes (none between attempts); smooth (sine) pixel twinkle, clearer end horizon.
- Green-only boxes; bigger corner logo; S7 evidence assembles in a 4×2 grid (no tunnel); SFX ~40% lower, no risers/impacts.

## v4 (2026-11-13, review 3) — `output/vibelevel-can-you-get-away-with-it-v4.mp4` (≈1:53)
- Removed the "CAN YOU GET AWAY WITH IT?" title; "Let's see / how far he gets." on two big lines.
- Font: Satoshi (Fontshare) for all headline/overlay text; product UI stays Inter.
- Pixel field twinkles visibly; transitions fully cover the frame then dissolve (S1→S2, S2→Attempt 01 card, →S7, →S8)
  with a soft "pixels" sfx; numerals build with gathering pixel sparkles + soft build/whoosh sfx.
- Interview answer: new Veo take (k6a) — one clean pass, single consistent voice (pitch-checked), lip-synced.
- S7: cards rise from the bottom into a deck (18 px reveal each), then spread to the sides; a concise report fills the middle.

- v4 update (2026-11-13): k2 = output/ryan-at-laptop-5s-omni-a.mp4 (candidate intro), k5 = output/ryan-leaning-back-5s-veo-b.mp4 (Attempt 03); previous plates kept as omni3/k2-veo-old.mp4, k5-veo-old.mp4.
- v4 update (2026-11-13): all headline/overlay text in Inter (700 headlines −0.04em, 400 supporting lines, 800 score, 600/500 labels); Satoshi/Clash loaders removed.

## v5 (2026-11-15, review 4) — `output/vibelevel-can-you-get-away-with-it-v5.mp4`
- New composition `VibeLevelCYG5` (`src/compositions/cyg/Film5.tsx`), build `projects/vibelevel-cyg/build5.mjs` (work dir `work/cyg5`;
  v4 `Film.tsx`/`build.mjs` untouched). Theme from `output/vibelevel-screening-demo-v4.mp4`: dark #0E0F12 + green pixel field
  (vl2 `Pixels`) for story scenes, light #ECEDEF for product UI + report ("dark story, light product" — user choice);
  demo-v4 logo (`vl2/img/logo.png`), dark pixel-tile wipes (c0, s7, s8); chapter cards keep their animations, dark theme.
- No live footage: pixel "masked cheater" character (Ryan) + "friend" (cap + shades) — `Char` sprite, `CharPop` reaction panel.
- VO (approved 2026-11-15, same presenter voice): s1 split s1a/s1b/s1c (new cheats wheel: tab switching, outside AI tools, proxy
  test-taker, second device, browser agents, prompt extensions — items light on the VO), s5 = proxy test-taker (live camera
  snapshots → report flag), s6 "what was built", new s6b (second device / browser agents / prompt extensions one-liners),
  s7 updated list, s8 "Cheating keeps evolving. Not past our detection." + wheel under the star beam. s2–s4, q1/a1 reused.
- Opening text centred, no Screening icon; tray signal chips enlarged (36/26 px); report cards fly straight to their slots.
