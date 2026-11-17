# VibeLevel Screening — Asset Audit (Phase 1)

Audited 2026-10-14. Paths are relative to the project root.

## Video stack and installed tools

| Tool | Version / status | Use in this project |
|---|---|---|
| Node.js / npm | v24.13.0 / 11.6.2 | Remotion + capture scripts |
| Remotion | 4.0.532 (+ `@remotion/google-fonts`, `@remotion/transitions`) | All visual scenes, 16:9 composition |
| FFmpeg / FFprobe | 8.0.1 | Analysis, crops, redaction, audio mixing/ducking |
| Playwright | 1.63.0, Chromium in `.cache/ms-playwright` | Website/report capture (used; nothing installed) |
| faster-whisper | 1.2.1, `small.en` model (`.venv`) | Word-timed subtitles from the final voiceover |
| Kokoro TTS | `kokoro-onnx` 0.6.1 (`.venv`), model + voices in `.cache/kokoro` | Local voiceover. American voices available: `af_*` (heart, bella, nicole, sarah, nova, sky, river, jessica, kore, aoede, alloy) and `am_*` (michael, adam, eric, liam, echo, onyx, puck, fenrir) |
| SDXL image model | RealVisXL V5.0 Lightning via diffusers (`.venv-ai`, `.cache/huggingface`) | Local generation of the Scene 1 recruiter and Scene 8 background (licence to confirm, see below) |
| Wav2Lip | `.cache/lipsync` | Not needed for this script |
| Music generation | **None installed** | Music must be supplied/approved |

Existing code: `src/` (generic edit pipeline: captions, overlays, video layer) and `src/compositions/vibelevel/` (previous Aura guide: `ScreenShot.tsx` zoom/pan framing, `Avatar.tsx`, `brand.tsx`, `graphics.tsx`, `timing.ts`). The screenshot-zoom and brand components are reusable starting points for Phase 5.

## Brand system (from the live site, not guessed)

| Item | Value | Source |
|---|---|---|
| Display / heading font | **Space Grotesk** 700 (h1 58 px, −1.16 px tracking; h2 38 px) | computed style on preview.vibelevel.ai |
| Body font | **Manrope** 500 | site paragraphs |
| UI / report font | **DM Sans** 600 (buttons, whole share report) | site + report |
| Primary / brand-strong green | `hsl(146 85% 26%)` ≈ **#0A7B3B** (logo var `#0a7d3c`) | `:root` CSS vars |
| Brand bright green | `hsl(152 80% 42%)` ≈ #15C273; favicon accent **#00E676** | CSS vars / `icon.svg` |
| Brand surface | `hsl(144 45% 94%)` ≈ #E9F7EE | CSS vars |
| Ink / foreground | **#131B17** | CSS vars |
| Secondary accent | Iris purple `hsl(262 83% 58%)` ≈ #7C3AED (eyebrows, “Hire engineers”) | CSS vars |
| Dark brand background | **#08111F** (favicon tile) | `icon.svg` |

All three fonts are Google Fonts and load through the installed `@remotion/google-fonts`. Space Grotesk 700 is a modern, bold sans-serif that fits the brief, so no substitute is needed.

## Asset inventory

| Asset / path | Type, resolution | Contains | Scene(s) | Verdict |
|---|---|---|---|---|
| `VibeLevel_Screening_Visual_Script.md` | Script | Approved VO + visual direction, 9 scenes | All | Source of truth; read in full |
| `assets/logos/Frame 2147205620.png` | PNG RGBA 4528×1076, transparent | Full VibeLevel logo (star mark + wordmark, bright green) | 3, 9 | **Suitable, high-res.** Bright-green wordmark has low contrast on brand green #0A7B3B. Needs a white/mono variant or a dark (#08111F / #131B17) card, see Missing assets |
| `assets/logos/vibelevel-screening/vibelevel-mark-nav.svg` | SVG (from site nav) | Star mark only, `#0a7d3c` | 3, 9, small brand bugs | Suitable (vector) |
| `assets/logos/vibelevel-screening/vibelevel-favicon.svg` | SVG (site `icon.svg`) | Star mark on #08111F tile, #00E676 | 9 | Suitable (vector) |
| `assets/images/Claude code screen.png` | PNG 1920×991 | Real candidate workspace: file tree, README (RAG API Service), Claude Code agent terminal, toolbar (Problem, timer 56:38, Setup Env, Run Tests, Submit) | 5 | **Suitable, primary Scene 5 asset.** Full width only; push-ins above ~1.3× soften text. Task-brief panel is **not** visible (brief opens via the “Problem” button). Title reads “RAG API Service (Copy) (Copy)”; crop or soften it. Terminal shows session path IDs; avoid zooming on them |
| `assets/images/Dashboard.png` | PNG 1547×741 | Logged-in hiring dashboard: KPIs (199 assessments, 208 submissions, avg 1.7/10), candidate flow, member table | 4 (opening context) | **Needs cleanup.** Shows real team-member names and real org metrics (avg score 1.7/10). Blur the member table; ask whether these metrics may be shown. Below 1920 wide: recapture at 2× after login |
| `assets/images/My org templates.png` | PNG 1543×737 | Assessments list filtered “My Org Templates”: task names, roles, levels, skills, Ashby badges | 4 (“ready-made template”) | Suitable for a short beat. Owner column shows a real name; blur it. Low-res: recapture at 2× after login |
| `assets/images/Craete cta with two options.png` | PNG 1544×726 | Assessments list with the **Create** menu open: “From Template — Pre-built, tested assessments” / “From AI — Describe the role, AI drafts it” | 4 (template → AI) | **Suitable, key Scene 4 asset.** Real UI showing both creation paths. Low-res: recapture at 2× after login |
| `Refernces/*.png` (11) | 1920×1080 frames | TestGorilla ad frames | Style reference only | **Not usable in the video** (competitor brand). See `reference-style-notes.md` |

### Captured this session (Playwright, 1920-wide viewport @2× = 3840 px, read-only)

Website, `assets/images/vibelevel-screening/research/website/`:

| File | Contains | Scene(s) | Verdict |
|---|---|---|---|
| `landing-full.png` (3840×13816), `hiring-full.png` (3840×20404) | Full public landing page and Hiring product page | Reference | Source for any crop |
| `landing-01-hire-engineers-…png` | Hero: “Hire engineers who can ship reliable software with AI.”, checklist incl. “Ready-to-use templates…”, “Custom assessment builder using AI”, evaluation-report card | 3 | Suitable |
| `landing-06-full-agentic-workspace-…png` | “Production-grade assessments built from your job description, stack & skills”, role-specific tasks | 3 | Suitable for headline text. Its workspace image shows a **competitor positioning map**; crop to the text column only |
| `landing-07-advanced-signals-…png` | “What VibeLevel measures” checklist (Human Contribution, Video Q&A, Interview Probe Areas…) | 3, 7 | Suitable |
| `landing-08-four-questions-…png` / `hiring-05-four-questions-…png` | Scoring engine: Core skills demonstrated, Working with AI, Human Contribution Score, four questions | 3, 6 | **Suitable.** Strong grounding for the four-pillar grid |
| `hiring-08-chat-your-assessment-into-existence.png` | Website rendering of the AI Assessment Builder (prompt → drafted assessment, build log) | 4 (“use AI to build one”) | Suitable as marketing UI. In-app builder still needs a login capture to show the real screen |
| `hiring-09-fits-your-workflow-zero-friction.png` | ATS integrations: **Ashby** and **Lever** cards, both “NATIVE” | 4 (“Lever or Ashby”) | **Suitable.** Real integration UI with no connection-status claim |
| `landing-05-ai-fluency-…png`, `hiring-04-real-tasks-…png`, `site-asset-claude-code-ide.png` (1405×985) | Site’s own Claude Code workspace graphics | 5 (backup) | Backup only. The hiring-04 non-coding card also shows the competitor map |
| other `landing-*` / `hiring-*` sections | Problem framing, proctoring, identity, FAQ | Not needed (script de-emphasises these) | Archive |

Report, `assets/images/vibelevel-screening/research/report/` (raw) and `report-scenes/` (scene crops, **redacted**):

| File | Contains | Scene(s) | Verdict |
|---|---|---|---|
| `report-<tab>-viewport.png` / `-full.png` (8 tabs) | Summary, Core Skills, Working with AI, Human Contribution, Video Q&A, Code Review, Interview Guide, Appendix | 6, 7 | **Raw: contains the candidate’s name, IDs and webcam video. Do not use in the video**; use `report-scenes/` |
| `report-scenes/scene-07-report-overview.png` 2240×1800 | Title, 4.9/10 Developing, level bar, tabs, Summary score grid, synthesis | 7 | Suitable. Name and IDs pixelated |
| `report-scenes/scene-07-skill-scores.png` 2240×730 | Summary: Craft / Working with AI / Deliverables / Human Contribution score bars | 7 (“skill scores”) | Suitable |
| `report-scenes/scene-06-core-skills.png` 2240×1410 | Skills evidenced + per-competency cards with weights, levels, evidence | 6 | Suitable |
| `report-scenes/scene-06-working-with-ai.png` 2240×1150 | Plan & Decompose, Define Goals & Spec, Build & Steer, Verify & Iterate | 6, 7 (“AI collaboration insights”) | Suitable |
| `report-scenes/scene-07-human-contribution.png` 2240×570 | Contribution ladder (Passive Delegator → AI Steerer, 7.1) + rationale | 7 | Suitable |
| `report-scenes/scene-07-video-qa.png` 2240×1090 | Understanding check, Q1, answer transcript, rating | 7 | Suitable. Webcam pixelated. Transcript is the candidate’s own words; keep it small/unreadable or get approval |
| `report-scenes/scene-07-code-review.png` 2240×1570 | 6.0/10 gauge, 5 quality dimensions, findings | 7 | Suitable |
| `report-scenes/scene-07-interview-guide.png` 2240×1410 / `…-probes.png` 2240×720 | Strengths, areas for improvement, suggested areas to probe | 7 | Suitable |
| `report-scenes/scene-07-four-aspects-definition.png` 2240×1050 | Appendix: official definitions of Core Skills, Working with AI, **Ownership**, Human Contribution | 3, 7 | Suitable. Proves the four pillars are real |

### Captured after sign-in (2026-10-14, @2× 3840×2160, read-only), `assets/images/vibelevel-screening/research/app/`

| File | Contains | Scene | Verdict |
|---|---|---|---|
| `app-create-menu.png` | Assessments list with Create → From Template / From AI | 4 | **Suitable** (replaces the low-res `Craete cta…png`). Owner column shows "Yours" only |
| `app-role-picker.png` | "Who are you screening?": 20 role cards with template counts / "Build with AI" | 4 ("ready-made template") | Suitable |
| `app-refine-role.png` / `app-refine-role-selected.png` | "Refine your Generative AI assessment": Level (Mid selected) + skills (AI agents, LLM integration, Testing) | 4 ("customized to your role requirements") | **Suitable, key shot**. Selections are UI state only, nothing saved |
| `app-template-results.png` | Template browser filtered to Mid + 3 skills; "Build an AI Agent" detail with "Use this template" | 4 | Use the top half only. Lower half shows **Hidden criteria (not shown to candidates)**; keep out of frame |
| `app-ai-builder.png` | Assessment Builder setup: Coding / Non-Coding, tech stack, role, level, Start Building | 4 ("use AI to build one") | Suitable. The chat stage needs a draft, so `hiring-08` (website) covers "describing what you need" |
| `app-ats-integrations.png` | ATS integrations: **Lever "Not connected"**, **Ashby "Connected"** | 4 | Suitable. Never imply Lever is connected |
| `app-ats-ashby.png`, `app-ats-lever.png` | Integration detail pages | 4 (backup) | Backup |
| `app-dashboard.png`, `app-assessments-list.png` | Dashboard, list | 4 (optional) | Dashboard shows team names/metrics; not planned |

### Generated / sourced (2026-10-14)

| Asset | Source | Licence | Use |
|---|---|---|---|
| `work/vibelevel-screening/vo/*.wav` + `timeline.json`, `words.json` | Kokoro `af_heart` (American female), local | Kokoro: Apache-2.0 | Voiceover, 104.0 s of speech. Whisper check: all words correct ("Writing" spoken as "Write-ing", "Lever" as "Leever"; subtitles keep the real spelling) |
| `assets/images/vibelevel-screening/generated/` | RealVisXL V5.0 Lightning (SDXL), local; fictional people | Model card: `openrail++` (CreativeML Open RAIL++-M); permits commercial use of outputs within its use restrictions | Scene 1 recruiter, Scene 8 background |
| `assets/music/vibelevel-screening/deep-urban.mp3` (+2 alternates) | Mixkit | Mixkit Stock Music Free License (web/social/ads/YouTube OK; no TV/radio broadcast) | Music bed, see `LICENSE-NOTES.md` |
| `assets/music/vibelevel-screening/sfx/*.mp3` (8) | Mixkit | Mixkit Sound Effects Free License | UI clicks, zooms, whooshes, text pop, logo impact |

## Missing assets and access (original list; status updated 2026-10-14)

1. ✅ **Resolved: signed in and captured (above).** Preview-site login. No credentials were supplied in this conversation, so I captured only public pages. In-app captures still needed: template picker after “From Template”, role-configuration fields, the in-app AI builder, the in-app ATS integrations page, and 2× recaptures of the three low-res dashboard shots.
2. ✅ **Decided: #08111F dark brand tile (from the favicon).** Logo for the green background. Need an approved white/mono logo, or approval to place the existing logo on the dark brand colour (#08111F) instead of green.
3. ✅ **Generating locally.** Scene 1 recruiter character. None exists. Options: generate one locally with RealVisXL (licence to confirm), or supply licensed stock.
4. ✅ **Generating locally.** Scene 8 background image. None exists. Same options as above.
5. ✅ **Mixkit "Deep Urban" chosen.** Music. Nothing approved, and no local music generator is installed. Need an energetic, licensed track (or approval to source one from a royalty-free library).
6. ✅ **Mixkit SFX set downloaded.** Sound effects. None. Need a small licensed SFX set (UI ticks, soft whooshes, logo hit).
7. **Ashby / Lever logos.** None separately. The website’s integration card (`hiring-09`) covers this without third-party logo files.
8. ✅ **Generated: female American `af_heart`.** Voiceover. Not yet generated. Kokoro American voices are available locally; a voice must be chosen and approved (Phase 4).
9. ✅ **User approved showing the report** (identifiers stay pixelated). Candidate consent / data. The report shows a real candidate (name, webcam, answers). Confirm the report may appear in a public video, even redacted.
