# Temple-theme wedding website reel (2026-11-12)

- Output: `output/temple-wedding-website-reel-4k-v2.mp4` (2160×3840, 60 fps, 30 s, −14 LUFS). v1 = same with the countdown "1"
  in Cormorant (read like "I").
- Style from `Refernces/Video-95545.mp4`: intro line + countdown, then one continuous scroll shot with a fixed headline; its
  audio from 0 s (song; Instagram may treat it as copyrighted music).
- Intro (Remotion `TempleIntro`, 4K ProRes): the Temple-theme site recording (`work/public/qrh/site.mp4`) scrolling under
  frosted blur; "Experience a beautiful digital wedding website" on two arcs; 3 → 2 → 1 (Playfair Display).
- Main shot (FFmpeg from the 4K original `wedding website assets/hindu website raw.MOV`): crop 1600×2844 @ (340,800) →
  2160×3840 lanczos (1.35× on the phone), contrast 1.05 / saturation 1.06, 60 fps; overlay `TempleOverlay` still
  (headline "The wedding website every 2026–27 couple needs." + brand mark). 0.5 s dissolve from the intro.
- Brand mark (logo + "The Digital Moments") bottom centre, first frame to last.

## v3 — `output/temple-wedding-website-reel-4k-v3.mp4`
- Intro: static site hero (hero-gopuram-mobile) + groom (left) / bride (right) arch portraits; "…wedding website in"; text higher.
- Main shot zoomed out to 1.15× (crop 1878×3339 @ 201,501) for headline room; headline in the reference yellow #F4D30B,
  Playfair Display 700, thin #2A2205 outline.

## v4 — `output/temple-wedding-website-reel-4k-v4.mp4`
- Manrope (sans) for all text; headline 118 px, top 470; intro text lower.
- Groom/bride cut out of their maroon backgrounds (`cutout.py`: colour key + GrabCut) and placed in the bottom-left /
  bottom-right corners, clear of the brand mark.

## v5 — `output/temple-wedding-website-reel-4k-v5.mp4`
- Bold countdown; "DM me to get yours for your wedding 💌" under the headline; CTA end card `TempleOutro`
  ("Want this website for your wedding?" + yellow "DM me" + @thedigitalmoments), 0.5 s dissolve in.
