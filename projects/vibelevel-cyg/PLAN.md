# VibeLevel Screening — "Can You Get Away With It?" · Phase 1–3 plan (for review)

Status: PLANNING ONLY — no assets generated, no video code written. Awaiting approval of direction + open decisions.

---

## PHASE 1 — Inspection

### Project & tools
| Item | Status |
|---|---|
| Remotion 4 project (`src/Root.tsx`, compositions in `src/compositions/*`) | ✅ working; VibeLevel v2/v3/v4 kits reusable (`vl2/kit.tsx`: Pixels transitions, Line kinetic text, Captions, Screen, Chip) |
| Node / FFmpeg | ✅ Node 24.13, FFmpeg 8.0.1 |
| ElevenLabs (VO + interviewer voice + music + SFX) | ✅ API key works (MCP server currently disconnected; direct API used before) |
| Fonts | Inter, Manrope, Sora, DM Serif, Cormorant, Playfair via `@remotion/google-fonts` |
| **GCP Omni 2.1** | ❌ **Not available here** — no `gcloud` CLI, no `~/.config/gcloud`, no Omni/Vertex env vars or docs in the project. I will not guess the API. → I prepare every Omni prompt (below); you generate them (or give me the integration docs + credentials setup) and I drop the clips into `assets/vibelevel-cyg/omni/`. |
| 4K render | ✅ 3840×2160 30 fps feasible (v4 rendered 60 fps 1080p in ~25 min; 4K/30 ≈ 2× that) |

### Product assets supplied (`refernce videos/download*.png`)
| File | Shows | Use |
|---|---|---|
| `download.png` | Invite: "Password Generator · JavaScript · Beginner · FrontEnd · 60 min · AI Assistant Included · **Sign In to Start**" | Rebuilt as motion UI (Scene 2) |
| `download (1).png` | Problem tab: Problem / Rules / Evaluation Criteria, Scenario, 10 Requirements, **Start Coding** | Rebuilt (Scene 2, Attempt 01 copy) |
| `download (2).png` | Workspace with the yellow banner: *"You moved away from the assessment tab. Please stay focused — repeated tab switches may disqualify your submission."* | Exact wording/placement for Attempt 01 |
| `download (3).png` | Workspace with red toast **"External paste not allowed"**, AI Agent panel ("Use the AI Agent to complete this assessment!"), Run Tests / Run App / Submit, timer 58:46 | Exact wording for Attempt 02; AI Agent panel for Attempt 03 |
| Earlier v4 captures (`work/public/vl4/img`, blurred) | Review Session, report (Working with AI, Code review, Video Q&A, Interview guide) | Reference for Scene 7 report recreation |

As requested, these screens are **not shown as screenshots** — every product surface is re-built as high-fidelity motion UI using the **exact real labels, layout and messages** (no invented features).

### Reference analysis
| Reference | What it does | What makes it strong | What we take (adapted) | Where |
|---|---|---|---|---|
| **Pinterest brand film** (`grabfy-Dfm4fiBIwED`) | White canvas; kinetic word swaps ("Find something that sparks…"); a real person cut out with UI cards orbiting in depth; colour-block wipes; search bar typing → results grid assembling; logo burst | Huge negative space, one idea per beat, real human + floating UI = "real but magical" | Light canvas, kinetic type that swaps words in place, **cut-out candidate with UI cards orbiting him**, search-bar typing → results assembling | S1 opening, S2 candidate intro, Attempt 01 external search |
| **Heyclicky demo** (`grabfy-DfcIoZvtYDD`) | UI demo composited **onto a filmed laptop** in a moody room; cursor-led interactions; screen content animates live | Product feels used in a real space; camera slowly drifts | "**Screen-in-world**" shots: Omni laptop/over-shoulder plates with our Remotion UI tracked onto the screen, then a push-in that flies *into* the screen to full-frame UI | S1, Attempt 01 tab-switch, Attempt 03 |
| **Apple Intelligence / "Opus" edit** (`grabfy-Dfm4SmOxJ2F`) | Camera flies through a **3D tunnel of app screens**; frosted glass; large counter (45% → 93% → 100%); slow luxurious easing | Depth + perspective + restraint; one word on screen | **3D tunnel of the recorded signals** flying past the camera, glass panels, a counting score | S7 recruiter report reveal, closing |
| **HackerRank Chakra** (`linkedin-video`) | Presenter to camera; escalating "Level 1…5" carousel with progress pips; AI interviewer with waveform; subtitles | Clear escalation structure; tension → reveal | **Only the escalation principle.** Our attempt cards are a different design (pixel-built numerals, green progress built from pixels, light theme) — no dark carousel, no pips copy, no presenter-in-office look | Attempt title cards |

### Limitations
1. Omni 2.1 not accessible (above).
2. **Script/task mismatch:** the screenshots are the *Password Generator* assessment, but the Video Q&A line asks about *"onboarding analytics to decide your redesign priorities"* (a product/design task). The interview must be assessment-specific → see Decision 1.
3. Real interviewer UI for Video Q&A isn't in the supplied screenshots — I'll rebuild it from the v4 report's Video Q&A section (question, answer, relevance, understanding level), nothing more.

---

## PHASE 2 — Creative direction

**Concept: "The Experiment."** A clean, bright lab. The presenter runs a live experiment; each attempt is a "trial". The candidate acts; VibeLevel's signals light up in **green pixels** — every action literally *leaves a pixel trail*, and in the finale those trails assemble into the recruiter report. Tagline made visual: **Every action leaves a signal.**

**Look:** light theme (like v4's light scenes), lots of white space, real depth.
- Canvas `#F6F7F5` → white panels, soft shadows, 1px `#E3E6E2` hairlines
- Brand green `#0B7A3E` (sampled from the real "Sign In to Start"/"Start Coding" buttons; ≈ #07813F) for identity + active states; `#00D76B` only for small glowing signal pixels
- Ink `#111417`, body `#4A5057`, muted `#8E939D`
- Red `#D93025` *only* for blocked/warning moments; amber `#F5C542` for the real tab-switch banner
- Restrained blue `#2F6BFF` for data/tech charts in the report

**Pixel motif (from v4, now light):** green pixel grids that (a) wipe between scenes, (b) "gather" into signal chips, (c) build the attempt numerals, (d) form the activity timeline. Never full-screen neon; always purposeful.

**Typography:** Inter Display / Inter — 800 for titles, tight tracking; attempt numerals huge (360 px @1080) built from pixels; tabular numerals for timers/scores.

**Character:** one fictional candidate — "Arjun", ~25, Indian, short black hair, light-grey crew-neck, dark-navy overshirt, silver watch; bright Scandinavian home-office, late-afternoon window light, matte black laptop. Shown only in Omni plates (over-shoulder, hands, profile, interview webcam) and as cut-outs. He never speaks to camera; the presenter is VO only.

**Motion principles:** (1) camera-first — every shot has a slow drift/push; (2) UI moves in 3D (perspective 2400, ±8–14° tilt) and settles flat to read; (3) one hero action per beat, synced to a sound; (4) eases: expo-out for arrivals, cubic in-out for camera, spring for alerts; (5) nothing animates while the VO explains it — motion lands *on* the word.

**Transition language:** pixel dissolve (brand), screen fly-through (push into a laptop screen → full-frame UI), tab-whip (horizontal browser-tab swipe with motion blur), mask reveal through UI rectangles.

**Sound:** presenter — confident, curious (ElevenLabs); AI interviewer — calm, neutral, slightly synthetic (different voice, light EQ); tension bed that builds per attempt and resolves at the report; SFX: soft clicks, keyboard bursts, tab whoosh, clipboard "snap", a low "denied" thud for paste-block, amber chime for the warning, AI-generation shimmer, a resolving swell for the report.

---

## PHASE 3 — Storyboard (16:9 · 3840×2160 · 30 fps · ≈2:20 incl. four 2.6 s chapter cards; final timing locked to the generated VO)

Legend: **O** = Omni plate · **R** = Remotion motion design · ★ = hero moment

### Scene 1 · The Challenge (0:00–0:12)
| Shot | Time | VO | Visual & motion | Method | SFX |
|---|---|---|---|---|---|
| 1.1 | 0:00–0:03 | "Today, we're going to put VibeLevel Screening to the test." | White canvas; a green pixel field breathes; kinetic line "Today we put it to the **test**." swaps word-by-word on the VO | R | low pulse |
| 1.2 | 0:03–0:06 | "Imagine a candidate receives an assessment link…" | Phone/laptop notification card drops in 3D: "VibeLevel · You've been invited: Password Generator"; cursor clicks → link expands into a browser | R (+O: hands on laptop optional) | notification tick, click |
| 1.3 | 0:06–0:09 | "…and decides to take a few shortcuts." | Fast, controlled glimpse-cuts (0.4 s each) flying past in a shallow 3D stack: a browser tab bar, a search bar, a code editor, an interviewer waveform — each a "?" teaser | R | whoosh ticks |
| 1.4 ★ | 0:09–0:12 | "Let's see how far they can get." | Pixels gather into the title **CAN YOU GET AWAY WITH IT?** (big, centred, green "IT?"); subtle camera push | R | hit + reverb |

### Scene 2 · The Assessment Begins (0:12–0:22)
| 2.1 | 0:12–0:15 | "Our candidate has received a 60-minute assessment." | Candidate intro: **O** over-shoulder plate of Arjun at his desk; Remotion floating cards orbit him (Pinterest style): "60 min", "AI Assistant Included", "Password Generator" | O+R | soft whoosh |
| 2.2 | 0:15–0:18 | "He's entered the workspace, reviewed the problem statement…" | Fly into his screen → rebuilt invite card → **Sign In to Start** press → Problem tab with Scenario + Requirements scrolling in 3D | R | click, page slide |
| 2.3 | 0:18–0:22 | "…and is ready to begin. But first, let's see what shortcuts he has in mind." | **Start Coding** pressed → workspace assembles piece by piece (file tree, editor, AI Agent panel, timer 60:00 starts) | R | click, UI assemble |

### Chapter cards — the system (applies to all four attempts)

**Structure reference (user, 2026-11-12):** HackerRank "Level 1 · The old school" frame (user screenshot; also in
`refernce videos/linkedin-video-396kbps.mp4` ≈0:31–0:36). Use its **structure only**, not its theme:
- a small progress row of squares at the top (current one filled)
- the attempt label + number centred and bold, the descriptive line directly under it in a contrasting style
- the next chapter's label peeking in, blurred, at the side (carousel hint that the experiments continue)
- an atmospheric element anchoring the bottom of the frame (theirs: blue particle horizon)
- generous empty space, centred composition, one card = one idea

**Do NOT use** its dark charcoal background, blue/cyan horizon, white serif italic or its exact layout/wording. **Ours:** light canvas,
VibeLevel green, Inter, green-pixel elements — the bottom anchor becomes a soft **green pixel horizon**, the progress row is
4 pixel squares (green = current), "ATTEMPT 01" in ink above the heading, the subheading in muted grey, and "ATTEMPT 02" peeking
blurred on the right. The per-card builds/exits below still apply.
Four **full-screen** chapter introductions, each ~2.6 s, between the scenes (not labels inside a scene). The presenter VO pauses during each card (the approved lines are unchanged; they simply start after the card), so the film reads as **four experiments inside one challenge**.

Shared layout (16:9, light canvas `#F6F7F5`, soft green pixel field in depth):
- top: small eyebrow `EXPERIMENT · ATTEMPT` + a 4-cell progress row (pixel squares; done = ink, current = green, upcoming = outline)
- centre-left: the giant numeral **01–04** (≈46 % of frame height) **built from green pixels**, with real depth (3–4 parallax layers, soft shadow)
- right of the numeral: **heading** (Inter 800, ink, the hero message) and **subheading** (Inter 500, muted) on two lines
- one light sweep crosses the numeral as the heading lands; card holds ~1.2 s for reading
- sound: pixel-build riser → impact on the numeral → soft tick on the subheading

Each card shares the system but has its **own build + exit**, which hands off into the scene it introduces:

| Card | Heading / subheading | Numeral build | Exit into the scene |
|---|---|---|---|
| **01** | THE EXTERNAL AI SHORTCUT · *"Can an external AI tool do the work for him?"* | Pixels stream in from the right edge like a fast tab-swipe and lock into "01" | Camera dollies right; the numeral's pixels stretch into a **browser tab bar** — the first frame of the workspace with the Problem tab |
| **02** | THE COPY-PASTE TRICK · *"Can he bring an external solution into the assessment?"* | Pixels drop from above like a pasted block, overshoot, snap into "02" | Pixels condense into a **clipboard card** that becomes the copied code sheet in the external tab |
| **03** | LET AI DO THE HEAVY LIFTING · *"What happens when AI is already part of the workspace?"* | "03" is *generated* line by line, scan-line style, like code streaming | Pixels flow sideways into the **AI Agent panel**, which lands with the green "AI Assistant Included · allowed" badge |
| **04** | THE FINAL BLUFF · *"Can he explain the work he just submitted?"* | Pixels oscillate as an audio **waveform** that settles into "04" | The waveform persists and becomes the **AI interviewer's voice waveform** in the Video Q&A screen |

### Scene 3 · Attempt 01 — The External AI Shortcut (≈0:22–0:46)
| Shot | Time | VO | Visual & motion | Method | SFX |
|---|---|---|---|---|---|
| 3.0 ★ | 0:22–0:24.6 | — (VO pause) | **Full-screen chapter card 01** (above) → tab-bar exit | R | riser, impact, tick |
| 3.1 | 0:24.6–0:28.6 | "First, our candidate decides to copy the entire problem statement…" | Problem text gets a sweeping selection highlight → ⌘C keycap pops → text lifts off as a "clipboard card" | R (+O hands insert) | key click, lift |
| 3.2 ★ | 0:28.6–0:34.6 | "…and send it to an external AI tool. He gets the solution generated there…" | **Tab-whip:** a new tab opens a fictional, unbranded search/AI page; the prompt bar types "password generator javascript with strength indicator — full code"; the answer streams in line by line | R | tab whoosh, typing, generation shimmer |
| 3.3 | 0:34.6–0:37.6 | "…and plans to bring it back into the assessment." | Code block glows; cursor heads back toward the VibeLevel tab | R | — |
| 3.4 ★ | 0:37.6–0:46 | "But the moment he switches away from the assessment tab, VibeLevel catches it and displays a warning." | Snap back; camera punch-in; the **real amber banner** slides down: *"You moved away from the assessment tab. Please stay focused — repeated tab switches may disqualify your submission."*; a green signal chip **Tab switch · logged** drops into the tray | R (+O reaction insert) | amber chime, camera hit |

### Scene 4 · Attempt 02 — The Copy-Paste Trick (≈0:46–1:05)
| 4.0 ★ | 0:46–0:48.6 | — (VO pause) | **Full-screen chapter card 02** → clipboard-card exit | R | riser, impact, tick |
| 4.1 | 0:48.6–0:53.6 | "Now, our candidate has the solution ready. All that's left is to copy the generated answer…" | In the external tab: code selected → ⌘C → the clipboard sheet travels across the tab bar | R | copy snap, whoosh |
| 4.2 ★ | 0:53.6–0:58.6 | "…and paste it directly into the assessment workspace." | ⌘V; the sheet hits the editor and **shatters into red pixels** at the surface — editor stays empty | R | denied thud |
| 4.3 ★ | 0:58.6–1:05 | "But VibeLevel blocks the external paste immediately." | Red toast **"External paste not allowed"** (real style) springs in; slow-motion replay of the bounce; chip **External paste · blocked** drops into the tray | R | toast pop |

### Scene 5 · Attempt 03 — Let AI Do the Heavy Lifting (≈1:05–1:29)
| 5.0 ★ | 1:05–1:07.6 | — (VO pause) | **Full-screen chapter card 03** → AI-Agent-panel exit | R | riser, impact, tick |
| 5.1 | 1:07.6–1:12.6 | "Fine. There's already an AI assistant inside the assessment. So why do all the work himself?" | AI Agent panel with **"AI Assistant Included" — allowed** badge in green | R | soft chime |
| 5.2 ★ | 1:12.6–1:18.6 | "Our candidate simply asks the integrated AI assistant to build the entire solution. It generates the files, writes the code…" | Broad prompt typed; files materialise in the tree (generator.js, index.html, style.css); code streams in | R | typing, generation shimmer |
| 5.3 | 1:18.6–1:24 | "…and helps complete the task. He makes a few edits, runs the tests and submits." | Manual edits (diff highlight); **Run Tests** → tests tick green; **Submit** | R | clicks, ticks |
| 5.4 ★ | under 5.2–5.3 | — | **Activity timeline** builds along the bottom as a green pixel rail: Prompt · File edit · Test run · In-app copy/paste · Session events | R | tiny ticks |

### Scene 6 · Attempt 04 — The Final Bluff (≈1:29–1:55)
| 6.0 ★ | 1:29–1:31.6 | — (VO pause) | **Full-screen chapter card 04** → waveform exit | R | riser, impact, tick |
| 6.1 | 1:31.6–1:37.6 | "Now comes the interesting part. The assessment is submitted, but there's still one thing left: the interview." | Video Q&A assembles: candidate webcam tile (**O** plate), AI interviewer orb + the waveform from the card, question area | O+R | interview transition |
| 6.2 | 1:37.6–1:43.6 | "Our candidate hopes to get through it without really understanding everything the AI has built." | Interviewer (separate calm voice) asks: *"Can you explain how your strength indicator decides between weak, medium, strong and very strong?"* | R + interviewer VO | — |
| 6.3 ★ | 1:43.6–1:49 | "Let's see how he handles the questions." | Vague answer as transcript, linked by a line to his actual `generator.js`; evaluation resolves to **Low understanding** | O+R | eval tick |
| 6.4 | 1:49–1:55 | — | Second question → stronger, relevant answer → **higher understanding**; both results connect back to the assessment | O+R | eval tick |

### Scene 7 · What Recruiters Actually See (≈1:55–2:14)
| 7.1 ★ | 1:43–1:50 | "Every attempt leaves behind evidence. Recruiters can review tab-switch warnings, blocked external paste attempts, recorded prompts, file edits, test runs…" | All signal chips from the tray lift off and fly into a **3D tunnel** (Apple-style) — each lights as the VO names it | R | swell |
| 7.2 | 1:50–1:57 | "…external assistance indicators, responsible AI checks and Video Q&A insights —" | Tunnel resolves into the **session timeline**, then panels: External Assistance Indicators, Responsible AI Use, Video Q&A understanding levels | R | ticks |
| 7.3 ★ | 1:57–2:02 | "…all contributing to a clearer picture of the candidate's assessment." | Everything converges into the **candidate report** (rebuilt from the real report layout); score counts up | R | resolve |

### Scene 8 · Closing (≈2:14–2:22)
| 8.1 | 2:02–2:07 | "With VibeLevel Screening, it's not just about what candidates submit. It's about how they get there." | Report pulls back to a single pixel; kinetic swap "what they **submit**" → "how they **get there**" | R | — |
| 8.2 ★ | 2:07–2:10 | — | Pixels assemble the VibeLevel logo; "VibeLevel Screening · Powered by VibeLevel · **Every action leaves a signal.**" | R | logo hit |

---

## PHASE 4 — Omni 2.1 prompt pack (to run once access is available)
Character sheet first (image, 16:9, reference for all later shots):
> **CHAR-01** "Photoreal character reference sheet of one Indian man, 25, short neat black hair, clean-shaven, warm brown skin, light-grey crew-neck tee under an unbuttoned dark-navy overshirt, slim silver watch. Front, 3/4, profile. Neutral light-grey seamless background, soft daylight. No text."

| ID | Scene/Shot | Prompt (all: 16:9, 4K if supported, no on-screen text/UI, same character ref) | Dur |
|---|---|---|---|
| O-ENV-01 | S1/S2 plate | "Bright minimal home office, white desk by a large window, late-afternoon soft light, matte-black laptop open with a plain light-grey screen, small plant, shallow depth of field, slow dolly-in." | 5 s |
| O-CAN-01 | 2.1 | "Over-the-shoulder shot of CHAR-01 sitting at the desk, looking at the laptop with a slightly mischievous smile, screen plain light grey, slow push-in." | 5 s |
| O-CAN-02 | 3.1/4.1 | "Close-up of CHAR-01's hands on the laptop keyboard pressing a shortcut quickly, soft daylight, shallow focus." | 3 s |
| O-CAN-03 | 3.4 | "Profile medium shot of CHAR-01 glancing back at the screen, eyebrows raised in surprise, plain bright screen glow on face." | 3 s |
| O-CAN-04 | 5.x | "CHAR-01 leaning back, relaxed, arms crossed, watching the laptop work, satisfied, slow lateral camera slide." | 4 s |
| O-INT-01 | 6.x | "Webcam-framed medium shot of CHAR-01 facing camera, speaking hesitantly, small nervous smile, home office background softly blurred, natural light." | 6 s |
| O-INT-02 | 6.4 | "Same framing, CHAR-01 answering more confidently with small hand gestures." | 5 s |
| O-TR-01 | transitions | "Abstract macro of tiny green light points drifting over a white matte surface, soft bokeh, clean, minimal." | 4 s |

Every asset logged in `projects/vibelevel-cyg/ASSETS.md` (name, scene/shot, prompt, ratio, duration, result, path).

## PHASE 5 — Prototype (after approval, ~25 s, 4K)
Attempt-01 title card → tab-whip to external search (typing + streaming answer) → return + amber warning banner → Attempt-02 clipboard flight + paste shatter + red toast → activity-timeline reveal.

---

## Decisions (2026-11-12)
1. Task: **Password Generator**; interviewer question → *"Can you explain how your strength indicator decides between weak, medium, strong and very strong?"* (approved VO unchanged).
2. Presenter voice: the **v4 voice** — ElevenLabs "Jessica Anne Bogart" (r1jZeb3rhKGAEf7YUiWg), eleven_v4, stability 0.5, tempo 1.08. AI interviewer: a separate calm neutral voice (to be picked and sampled).
3. External tool: **fictional, unbranded** search/AI page (no Google/ChatGPT marks — avoids implying an endorsement and keeps it legally clean), styled realistically (tab bar, URL bar, search field, streamed answer).
4. Omni 2.1: user will supply API access; I generate the prompt pack above (character sheet first).
5. Music: default **Deep Urban** (V8/v4 bed). Alternative proposed: a custom **ElevenLabs-composed score** (~2:20) built to this edit — light, curious pulse in the opening, a tension layer that steps up one notch per attempt card (a sting on each numeral impact), a drop-out on the paste-block, and a warm resolve at the report reveal. Can be generated as a 30 s sample for comparison once production starts.

## Brand & logos (user, 2026-11-12)
**Hierarchy:** *VibeLevel Screening* is a **product of VibeLevel**. Always present it as "VibeLevel Screening · Powered by VibeLevel"
(product name leads; VibeLevel is the parent/endorsing brand).

| Asset | File (`assets/logos/`) | Use |
|---|---|---|
| **VibeLevel Screening icon** | `4824b131-fe62-4737-a3ef-300bd0a880b7.png` (1254², RGBA) — faceted green star inside a ringed dial with a small orbit dot | Product mark: opening title, chapter-card corner mark, closing "VibeLevel Screening" lockup |
| **VibeLevel logo** (current lockup) | `Frame 2147205620.png` (4528×1076) — star + "VibeLevel" wordmark in bright green | Reference for the parent lockup |
| **VibeLevel icon (updated)** | `Faceted Green Teal Star Icon.png` (1316×1195, RGBA) — faceted green→teal star | **Use this** as the VibeLevel icon (replaces the older star in the lockup) |
| **Wordmark style** | `Screenshot 2026-11-12 at 7.16.33 PM.png` (copy: `vibelevel-wordmark-style-ref.png`) — "VibeLevel" in a bold, rounded geometric sans, **dark forest-green ink #0F2B1F** | The text set **beside the icon** for VibeLevel: icon + "VibeLevel" in this style (dark ink on our light canvas) |

Lockups to build:
- **VibeLevel:** updated faceted star icon + "VibeLevel" (bold rounded geometric sans, #0F2B1F). Font to match side-by-side before use
  (candidates: Outfit / Urbanist / Lexend — pick the closest; no outlines, tight tracking).
- **VibeLevel Screening:** Screening icon + "VibeLevel Screening" (same wordmark style), with "Powered by VibeLevel" + small VibeLevel icon beneath.
- Corner mark during the film: Screening icon (small) + "VibeLevel Screening" — hidden on full-screen logo moments, as in v4.

Prep needed (both icon PNGs): their transparency has a **speckled green halo** (≈700k low-alpha fringe pixels around the shapes —
same issue as the Digital Moments logo). Clean before use: keep solid shapes (alpha > ~150), drop the fringe, re-feather 1 px.
For the Screening icon, check the ringed dial's inner texture survives the cleanup; if not, ask for a clean export (SVG ideal).

## Remotion scene structure (updated)
```
src/compositions/vlx/            (new, reuses vl2/kit + v4 helpers)
  Film.tsx                       – timeline from VO word timings; scene order below
  scenes/S01Challenge.tsx
  scenes/S02Assessment.tsx
  chapters/ChapterCard.tsx       – shared full-screen card system (numeral, heading, sub, progress row)
  chapters/builds.ts             – per-card pixel builds: tabStream (01), pasteDrop (02), codeScan (03), waveform (04)
  scenes/S03Attempt01.tsx  scenes/S04Attempt02.tsx  scenes/S05Attempt03.tsx  scenes/S06Attempt04.tsx
  scenes/S07Report.tsx     scenes/S08Closing.tsx
  ui/ BrowserWindow, TabBar, Workspace (file tree, editor, AI Agent panel, timer), Banner, Toast,
      Clipboard, SearchPage, ActivityTimeline, SignalTray, InterviewUI, Report, Cursor, Keycap
Order: S01 → S02 → Card01 → S03 → Card02 → S04 → Card03 → S05 → Card04 → S06 → S07 → S08
```
Card durations are configurable (`CARD = 2.6 s`); VO segments are placed after each card, so changing a card's length shifts everything after it automatically.

## Still to do before production
- Omni access → generate CHAR-01 first, then the plates.
- Pick + sample the interviewer voice; optional music sample.
- Then Phase 5 prototype (Card 01 → Attempt 01 → Card 02 → Attempt 02 → timeline reveal).

## Omni access — working (2026-11-12)
- gcloud SDK 593 at `~/google-cloud-sdk`; account venkateshyarramsetti7@gmail.com; project **plasma-ivy-458810-u9** ("My Project 36862");
  Vertex AI enabled; ADC login (`gcloud auth application-default login`) — no keys in project files.
- "Omni 2.1" doesn't exist in this project; available: **gemini-omni-1.2-flash** (GA), gemini-omni-1.1-flash-preview, gemini-omni-flash-preview
  (+ Veo 3.1, Gemini 3 Pro Image). Use **gemini-omni-1.2-flash**.
- Call: POST `https://aiplatform.googleapis.com/v1beta1/projects/plasma-ivy-458810-u9/locations/global/interactions`
  body `{model, store:true, background:true, input:[{type:"text",text}], response_format:[{type:"video", aspect_ratio:"16:9",
  resolution:"360p|720p|1080p|4k", duration:"3s–15s"}], generation_config:{video_config:{task:"text_to_video"|"image_to_video"}}}`;
  image-to-video adds `{type:"image", uri|data, mime_type}` to input. Poll GET …/interactions/{id} until `completed`;
  video = steps[].content[] {type:"video", data:<base64>, mime_type:"video/mp4"}. Not callable via generateContent.
- Tests: `output/omni-test-office-plate.mp4` (O-ENV-01 prompt, 720p 5 s, ≈29k video tokens, ~40 s) ✔; Ganesha test 1080p 8 s ✔.
- Next: CHAR-01 reference image → approval → image-to-video for every candidate shot (consistency).
