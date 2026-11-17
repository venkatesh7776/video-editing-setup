# Progress log: VibeLevel Screening demo video

## 2026-10-14: Phase 1 (audit) and Phase 2 (research and capture): done, pending access

- Read `Claude_Code_Master_Prompt_VibeLevel_Video.md` and `VibeLevel_Screening_Visual_Script.md` in full.
- Audited tools and assets; nothing installed. Result: `asset-audit.md`.
- Explored https://preview.vibelevel.ai/ (public pages: landing, /products/hiring) with the project's Playwright. Read-only, with no sign-in, submissions or form use; the only clicks were closing a promo banner.
- Explored the shared report (all 8 tabs) read-only. Note: each page load counts as a view on the report's public view counter (it rose from 13 to roughly 20 during capture).
- Captured @2× (3840 px wide): 11 landing sections, 15 hiring sections, 2 full pages, 8 report tabs (viewport + full).
- Created 10 redacted scene crops in `report-scenes/` (candidate name, assessment/session IDs and Video Q&A webcam pixelated) via `make-report-crops.sh`.
- Extracted the brand system (Space Grotesk / Manrope / DM Sans; greens #0A7B3B, #00E676; ink #131B17; dark #08111F) and saved the logo SVGs.
- Result: `screenshot-map.md`. Competitor reference analysis: `reference-style-notes.md`.

Scripts (all read-only against the sites): `explore.mjs`, `dump.mjs`, `capture-pages.mjs`, `capture-report.mjs`, `report-boxes.mjs`, `make-report-crops.sh`.

### Blocked / waiting on user
See "Missing assets and access" in `asset-audit.md`: login access, logo variant for green, recruiter/background imagery approach, music + SFX, voice choice, candidate-data approval.

### Next (Phase 3, not started)
`animatic-plan.md` with placeholder timings → generate VO → real timings. No rendering yet.

## 2026-10-14 (later): access granted; Phase 2 completed, Phase 3/4 prep

- User supplied login (used only via env vars; not stored), chose "whatever fits" for the logo, approved local generation or web footage, trending music, a **female voice**, and showing the report.
- Signed in (`login.mjs` saves the session to `.cache/vibelevel-screening-auth.json`, which is gitignored and safe to delete). Captured 11 app screens @2× (`capture-app.mjs`): create menu, role picker, refine (level + skills), template results, AI builder, ATS integrations (+ Ashby/Lever). Nothing created, sent or published.
- Voiceover: Kokoro `af_heart`, 9 clips, 104.0 s. Whisper check: all correct after two fixes ("Writing" → spoken "Write-ing"; "Lever" → "Leever"). Shared TTS script change: lead-in padding 0.02 → 0.08 s (`scripts/tts/kokoro_tts.py`).
- Timing: `timing.json` via `build_timing.py` (total 115.46 s). Plan: `animatic-plan.md`.
- Music: Mixkit "Deep Urban" (+2 alternates), 8 Mixkit SFX; licences in `assets/music/vibelevel-screening/LICENSE-NOTES.md`. Pixabay blocks automated access (403).
- Images: local SDXL (13 generated). First batch was centred (prompt over the 77-token CLIP limit); a short composition-first prompt fixed it. **Picks:** Scene 1 `generated/s1-recruiter-right-34.png` (subject right third, street left); Scene 8 `generated/s8-background-21.png` (SF office at golden hour, to be blurred/dimmed). Others kept as alternates.
- Review audio: `work/vibelevel-screening/review/vo-music-preview.m4a` (VO at final scene times over ducked Deep Urban). Whisper WER over the mix 2.7%. The Deep Urban intro is quiet (−36 dB); lift it for the hook in the final mix.

### Next
Phase 5 build in Remotion (new composition under `src/compositions/screening/`), low-res review cut first.

## 2026-10-14: Phase 5 build (user approved voice, music; "any recruiter is fine")

- Remotion composition `Screening` in `src/compositions/screening/`: `Screening.tsx` (scene layering, subtitles, audio: VO + ducked music + SFX cues on beats), `BrandScenes.tsx` (hook, challenge, logo reveal, 4-pillar grid, outcome, end card), `ProductScenes.tsx` (UI scenes 3–7, card wall), `Shot.tsx` (rounded-card capture with keyframed camera + highlight boxes; fits: cover/contain/width), `motion.ts`, `context.ts`, `types.ts`. All timing is data-driven from `timing.json` beats.
- `build.mjs`: stages assets into `work/public/screening/`, aligns the written script to the Whisper word times for subtitles (clause-based line breaks; suppressed where the words are the headline: hook, final triad of scene 2, logo, pillar grid, outcome, end card), writes `captions/subtitles/vibelevel-screening.srt` (full narration), renders, loudnorm −16 LUFS.
- Still-frame review passes fixed: recruiter framing (right third), hook type size, landing crop (competitor map excluded, highlight on the role-specific bullet), report shots fit to width (no clipped margins), Working-with-AI highlights mapped to the report's own rows, Scene 5 push keeps the "(Copy) (Copy)" title out of frame.

## 2026-10-14: revision 1 (user feedback on review cut) → final 1080p

- Clarity: final renders at full 1080p (crf 16, JPEG frames q100) instead of the 540p review scale. Captures are shown at or below native size. The 1920-px workspace screenshot is pre-scaled 2× (Lanczos + light unsharp) and its zoom is capped at 1.24. The outcome background blur is reduced 9 → 3 px.
- Logo SFX: "Movie whoosh impact" replaced with Mixkit "Sweeping sparkle presentation intro" (id 2633), timed so its swell peaks on the logo.
- Scene 2: the fast card swaps are replaced with a cumulative 4-step flow (Prompting → Problem-solving → Guiding AI → Validating). Steps stay on screen and the row re-centres as each joins.
- Animated logo (scene 3 + end card): star spring-spins in, wordmark wipes on, sheen masked to the logo, "Screening" letters rise. Logo split into star/wordmark in build.mjs. "Book a demo" pill gets a sheen.
- Subtitles: 44 px Manrope 700 on a 92%-opaque pill.
- Hook: user-supplied `assets/images/Cinematic Urban Portrait in Monochrome.png` (1672×941), used as composed.
- Output: `output/vibelevel-screening-demo.mp4`, 1920×1080, 30 fps, 115.5 s, 46.2 MB, −16 LUFS.

## 2026-10-14: revision 2 → `output/vibelevel-screening-demo-v2.mp4`

- Scene 6 and Scene 7 (Ownership + Human Contribution part) now use brand-built panels (`ReportUI.tsx`) instead of report screenshots, which clipped at video size. All labels, scores, levels, weights, question topics, ladder bands and evidence counts are copied from the real shared report; descriptions use VibeLevel's own wording. The report screenshots remain from "The assessment report brings together…" onward.
- Headline font switched from Space Grotesk to **Inter Tight 800** (user request: bolder sans-serif). Subtitles unchanged (Manrope 700).
- New beats `responsibility` / `value beyond AI output` added in `build_timing.py`.

## 2026-10-14: revision 3 (music too loud) → `output/vibelevel-screening-demo-v3.mp4`

- Measured with QA renders (`muteVoice` / `muteSfx` props; voice = full − music-only): in v2 the music was only ~10 dB under the voice. Now music is 17.9 dB under the narration while speaking (bed 0.029, ~8 dB lower than v2), 0.11 between scenes, and SFX are trimmed ~5 dB (19.7 dB under the voice). Final −16 LUFS, peak −1.4 dBFS.
- `mix_check.py` is a rough pause-based check; the mute-render method above is the accurate one.

## 2026-10-14: revision 4 → `output/vibelevel-screening-demo-v4.mp4` (2:05)

- Logo is now "vibelevel.ai" everywhere: `.ai` is set on the wordmark baseline in the logo green #00D76A (`Logo.tsx`). There is a small logo top-left on the hook and top-right on every other scene; it hides during the full-size logo animations. The old bottom-left logo was removed and the card moved down (y 100, h 846).
- Script changes (user-requested): s4 "…integrate with ATS platforms such as Lever and Ashby…" ("etc." left out: the site lists other ATS as coming soon); s5 "…with AI coding tools such as Claude Code, Codex, and GitHub Copilot built in…" (Codex is not yet listed on the website); s9 closing line adds "…across developer and non-developer roles."; new s10 "VibeLevel Screening. Book a demo." with the animated logo. "ATS" is spoken "A-T-S".
- Design: lighter weights on the pillar titles, competency/WwAI titles, numbers and the Ownership/HC headings; the background and border removed from skill tags, level tags and evidence chips; the assessments shot is cropped to the Create-menu area; Scene 5 gets an "AI coding tools, built in" callout.

## 2026-10-14: revision 5 → `output/vibelevel-screening-demo-v5.mp4`

- Corner logo moved top-left and made smaller (h 30); the hook logo matches. "Screening" under the animated logo is nudged 4 px right for optical centring. The Working with AI pillar icon is now an "AI" chip.
- ATS: only the website integrations shot (Ashby + Lever cards) remains; the in-app integrations screenshot was removed.
- VO s5: "…Claude Code, Codex, GitHub Copilot, and more built in." (the website also says "& more"); the callout shows "& more".
- Report screenshots: recaptured with `capture-report-redacted.mjs`. Summary keeps the first 2 rows per column and blurs the rest; other tabs keep headings, scores, levels and "HIGH · file · category" lines, blur explanatory text, and remove the "(…)" sub-labels. Crops are in `report-scenes-blur/` (via `SRC/OUT` on make-report-crops.sh).
- build_timing.py matches beats by letters across words (Whisper sometimes joins "ClaudeCode").

## 2026-10-14: revision 6 → `output/vibelevel-screening-demo-v6.mp4`

- Interview Guide: the "<> src/…:line …" code-reference lines are left unblurred (rule in capture-report-redacted.mjs).
- Corner logo back to top-right, larger (h 38); the hook logo stays top-left, larger (h 40).
- (update) Hook logo moved to top-right (right 110, h 40); v6 re-rendered in place at the user's request.

## 2026-10-15: v7 → `output/vibelevel-screening-demo-v7.mp4` (2:06)

- Final scene replaced (user copy): "WE'RE EXHIBITING / BOOTH SU80 / HR Tech / October 20–22, 2026 · Las Vegas", laid out after the HR Tech exhibitor card in navy + green. "BOOTH SU80" is the largest element (Inter Tight 900, neon, with a sheen). The HR Tech™ logo is redrawn as a vector (`Exhibit.tsx`). The corner vibelevel.ai logo stays visible.
- The final VO line ("VibeLevel Screening. Book a demo.") is retired; the scene is a silent 6.5 s (music + logo-sweep). Silent scenes are defined in `build_timing.py` (`SILENT`). Everything else is unchanged from v6.
- v7.1: HR Tech mark redrawn from the official icon (squared bottom-left circle, petal bottom-right) → output/vibelevel-screening-demo-v7.1.mp4

## 2026-10-16: V7 (new illustrated opening) → `output/vibelevel-screening-demo-V7-new-opening.mp4` (1:58)

- Context: v6's LinkedIn average watch time was 8 s, so the hook was replaced. `output/vibelevel-screening-demo-v7.mp4` is a byte-for-byte copy of v6 (requested duplicate); the new cut is a separate file so nothing was overwritten. `Exhibition.mp4` (HR Tech ending) is untouched.
- Old s1-hook (photo portrait) and s2-challenge are replaced by `s1-problem` (`ProblemScene.tsx`): vector resume → interview cards (speech bubbles, audio wave) → task card (editor, AI assist, tests), headlines "WHAT THEY'VE DONE" / "HOW THEY PRESENT" / "CAN THEY ACTUALLY DO THE WORK?" (climax at ~8.4 s). New VO line generated with af_heart; Whisper transcript matches the script exactly.
- Scene 2 opens with a match-cut: the task card at the same rect turns into the real candidate-workspace screenshot while the vibelevel.ai logo animates in; then the existing landing-page shots and four-dimension grid continue unchanged.
- Ending restored to v6's "VibeLevel Screening. Book a demo." (s10-cta). The HR Tech exhibit ending is still available: `ENDING=exhibit python3 -I projects/vibelevel-screening/build_timing.py`.
- Music starts 4.5 s into Deep Urban so it has energy from frame 1. Scene-1 SFX: soft pops and slides, plus an accent on the climax.

## 2026-10-16: V8 → output/vibelevel-screening-demo-V8.mp4
- Navy (#08111F family) replaced everywhere with a green-black brand base (#050C08, cards #0B1A12, glow #0B3A26); light-scene blue tints are now mint (#E2F3EA). Scene-1 opening restyled: glass cards in 3D perspective with a gentle float, an emerald light that follows the focus, a perspective floor grid, a 3D flip from resume to interview, masked line-reveal headlines with a mint gradient, and a rotating light border plus a gradient sweep on the climax. The IDE handoff into scene 2 is unchanged.
- (update) Voice +4 dB vs music/SFX (VO volume 1.58) and final loudness −14 LUFS (was −16); V8 re-rendered in place at the user's request.
- (update) Scene 1: on-screen text is now the voiceover itself (phrase-by-phrase reveal, last phrase in green; climax "WHEN THE WORK GETS REAL."), and there are no subtitles in scene 1. V8 re-rendered in place.

## 2026-10-16: V8 rework from Scene 4 (user's revised script) → output/vibelevel-screening-demo-V8.mp4 (2:10.8)

- Scenes 1–3 locked (0–24.7 s, problem → intro → four-dimensions grid). The final file is a splice: frames 0–740 and audio 0–24.7 s come straight from the previous V8 (backup: work/vibelevel-screening/baseline/V8-before-scene4-rework.mp4); a 40 ms audio crossfade at the join. Verified: SSIM 0.9994 mean / 0.9985 worst over 741 frames, audio level −0.015 dB, zero lag.
- New order and VO (revised script, verbatim): n4-candidate → n5-skills → n6-ownership (new OwnershipScene: the spoken line as a headline, then the Ownership/HC panels) → n7-create → n8-report (report only) → n9-outcome (on-screen text = VO). Scene 10 (s9-close + s10-cta) unchanged. Working-with-AI tags are now Guide / Evaluate / Verify.
- build_timing.py: beats may take an offset (visual-only beats). build.mjs: optional --gain-db (not used for the final: V8's loudnorm was dynamic, so splicing was the only exact way to lock scenes 1–3).
- Full-video Whisper check: WER 2.4% (7/290). Final −14 LUFS, peak −1.2 dBFS.
- (update) n4: "…with AI coding tools such as Claude Code, Codex, GitHub Copilot, and more built in…"; n7 2nd sentence: "And these assessments can integrate with ATS platforms such as Lever and Ashby, fitting directly into their existing hiring workflow." (ATS shot now starts on that sentence). Re-spliced onto the locked 0–24.7 s (SSIM 0.9994, audio −0.015 dB). V8 is now 2:17.2, −14 LUFS.
