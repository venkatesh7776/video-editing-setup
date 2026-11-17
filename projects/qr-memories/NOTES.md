# Digital Wedding Memories — QR feature reel (2026-11-04)

- Output: `output/digital-wedding-memories.mp4` (1080×1920, 30 fps, ~43 s, −14 LUFS). Build: `projects/qr-memories/build.mjs`;
  composition `QrMemories` in `src/compositions/qr/Memories.tsx`.
- VO: ElevenLabs "Venkatesh prof" (tTOItPrSr0E55YV4Jskp), eleven_v4, stability 0.5, similarity 1.0, one part per script line
  (`vo-parts.json`, chained with previous/next text), Whisper-checked; `work/qr/vo/`.
- Music: `assets/music/geetha.mp3` from 0 s (the track of `wedding-website-reel-2-v4.mp4`, verified by cross-correlation),
  ducked under the voice like reel 2. SFX: wedding-reel2 set (silk-swish on arch reveals, paper-slide, soft-chime, harp).
- Design system: Royal Indian Heritage × Modern Luxury (user's prompt). Ornaments ported from the QR app
  (`~/Desktop/qr feature/src/features/memories/components/art/Ornaments.tsx`); artwork reused from the Murali & Varshitha site
  (`temple-arch-portrait`, `closing-mandap-mobile`, `ganesha`, `memories/guest-*`), copied to `work/public/qr/img`.
- Footage (`QR assets/`): two AI hook clips (QR standee scan, guests sharing photos) → full-bleed with captions;
  ScreenRecording 22 (album) and 23 (upload flow) → phone mockup (island redrawn to hide the recording dot);
  IMG_1900 (laptop, site → memories → lightbox) → full-bleed, brightened. The upload recording's photo-library picker
  (8–15 s, personal photos) is never shown.
- Scenes: hook (scan → share) · "all your moments, in one place" (polaroids gather into the phone album) ·
  "But it's not just photos." · note / voice / reactions (chips on the real upload flow) · "And the best part?" ·
  years roll 2026→2046 · the site years later (laptop) · Digital Wedding Memories title on the temple arch · CTA (DM "MEMORIES").
  Temple-arch reveal on every scene change.

## v2 (2026-11-05) — `output/digital-wedding-memories-v2.mp4`
- Voice: same "Venkatesh prof" clone on **eleven_multilingual_v2** (stability 0.5, similarity 1.0) — the user picked it
  from `work/qr/voice-samples/` for its Indian accent (eleven_v4 flattened it). v4 takes kept in `work/qr/vo-v4/`.
- Gemini sparkle removed from both hook clips (`unwatermark.py`, reverse alpha blend + edge inpaint).
- Phone: iPhone 15 (Black) mockup to Apple proportions, standard Dynamic Island (recording's expanded island painted over).
- "In one place": only the album's own six photos fly in and land on their exact tiles (album-grid.png = r22 @ 16.5 s).
- Upload form frozen at r23 19.2 s (upload-form.png): a note is typed into the field, the voice note records
  (timer + waveform), ❤️ and 😍 get selected, "Share your photos" presses on "uploading".
- CTA mandala watermark 0.1 → 0.035.

## v3 (2026-11-05) — `output/digital-wedding-memories-v3.mp4`
- User preferred the original voice: back to the eleven_v4 takes (`work/qr/vo` ← `vo-v4`); multilingual_v2 takes kept in
  `work/qr/vo-multilingual/`. All v2 visual fixes kept.

## v4 (2026-11-05) — `output/digital-wedding-memories-v4.mp4`
- Ganesha removed from the "Digital Wedding Memories" title (title block re-centred in the arch).
