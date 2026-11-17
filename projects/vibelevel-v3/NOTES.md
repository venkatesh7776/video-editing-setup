# VibeLevel Screening demo v3 (90 s)

- Script: user's 90-second script (2026-11-01), `vo-parts.json`. US voice: ElevenLabs "Jessica Anne Bogart"
  (r1jZeb3rhKGAEf7YUiWg), `eleven_multilingual_v2` with `speed: 1.12` (native faster read; v4 ignores speed).
- Code: `src/compositions/vl3/Demo3.tsx` (reuses `vl2/kit.tsx` + v2 pieces). Build: `projects/vibelevel-v3/build.mjs`.
- User corrections applied:
  - Captions never duplicate an on-screen heading: shown only in scene 3 (workspace) and scene 6 (report).
  - Bigger headings (text-only 92 px; with visuals ~66 px); text-only screens get motion graphics
    (floating work glyphs, role marquees, think / work-with-AI / contribute cards, "part of the picture" tiles,
    output card sliding off the pixel person).
  - VibeLevel logo top-left throughout, except the logo reveal (scene 2) and the finale/end card.
  - Scene 1: the three work cards leave before the pixel person appears.
  - Logo reveal: no pixels behind the logo; "Screening" closer to it and nudged right (under the wordmark).
  - Four dimensions: flat framed crops of whole rows/columns (no cut text), green highlight on the key element,
    no 3D tilt and no ambient pixels behind (the shimmering edge).
  - Report "layers" stack kept, every layer named (Performance scores, Working with AI insights, Code Review,
    Video Q&A, Interview Guide), then the Interview Guide with Strengths / Gaps.
