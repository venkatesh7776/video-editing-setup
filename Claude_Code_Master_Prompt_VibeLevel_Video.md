# MASTER PROMPT — VibeLevel Screening Product Demo Video

You are acting as a **senior product video director, motion designer, UI capture specialist, and video editor**. Your job is to create a polished, engaging product demo video for VibeLevel Screening using the approved script and the existing project assets.

Do not jump straight into editing. Follow the phases in order. **Your first job is to audit existing assets and explore the two supplied websites, then capture only the screenshots/assets needed for the script.**

## Project references

- Product website to explore: https://preview.vibelevel.ai/
- Shared score report to explore: https://www.vibelevel.ai/share/report/5kOev08_?theme=light
- Script and visual direction: `VibeLevel_Screening_Visual_Script.md` (find this file in the current project/workspace; if it is not present, ask me to place it in the project rather than inventing the script)
- Candidate workspace image, if already available: `Claude Code screen`

### Website login

Use the credentials I supplied separately in this conversation to sign in to the preview website if login is required. Do not print credentials into logs, source files, screenshots, the video, or the final report. Do not commit credentials to Git. If a login fails, stop and report the issue rather than repeatedly guessing credentials.

The report link may be accessible without login. Open it and inspect the actual report before deciding which areas to capture.

## Core requirements

### Video and storytelling
- Follow the approved script and scene-by-scene directions in `VibeLevel_Screening_Visual_Script.md`.
- Keep the product’s evaluation approach and evidence at the centre of the story. Do not overemphasize candidate invitation/sharing mechanics.
- Use real VibeLevel UI for product demonstrations. Never fabricate screens, scores, metrics, report sections, or capabilities.
- Make each visual change correspond to the voiceover line being spoken.
- Target a polished, concise product-demo film. First create a timed animatic/rough cut, then refine it after review.
- Use 16:9 landscape unless the existing project instructions specify otherwise.

### Typography
- Use a modern, bold, contemporary **sans-serif** typeface.
- Audit the website and project assets for brand typography first. If the brand font is suitable and available, use it. Otherwise choose a modern sans-serif such as Inter, Geist, or Manrope, prioritizing availability, readability, and consistent rendering.
- Use bold display typography for scene hooks and key statements. Keep body copy and subtitles highly legible.
- Maintain consistent sizing, spacing, margins, and text safe areas.

### Voiceover
- Use a natural, confident **American English accent**.
- Delivery should sound clear, credible, energetic, and conversational—not robotic, exaggerated, or overly salesy.
- Preserve the approved voiceover wording exactly unless I explicitly approve a script change.
- If voice generation is available through the installed tools, first identify the available voice options and choose a suitable American voice. Do not silently substitute a different accent.
- If voice generation is not available locally, do not pretend it is. Report the limitation and propose a practical next step.
- Time the visuals to the actual voiceover, not to guessed durations.

### Characters, images, and footage
- Any people shown in generated or stock visuals should appear American, with natural, contemporary professional styling. Avoid India-specific clothing, locations, visual cues, or stock footage.
- Prefer the brand’s actual product UI over people footage wherever the scene is demonstrating a product feature.
- Scene 1 needs a memorable recruiter character positioned on the **right**, with oversized kinetic text on the **left**.
- Use licensed/approved assets or generate original visuals when appropriate. Do not download copyrighted stock footage from unauthorized sources.
- Do not make assumptions about a real person’s nationality from appearance. For fictional characters or commissioned/generative visuals, use the requested American setting and styling.

### Music and sound design
- Do **not** use calm, ambient, sleepy, or generic corporate background music.
- Choose energetic, modern, premium music that creates momentum and curiosity and keeps the audience engaged. Think confident technology/product-launch energy, with a clear rhythm and controlled build—not chaotic, distracting, or overly aggressive.
- Music must sit beneath the voiceover. Automatically or manually duck the music under narration so every word remains clear.
- Add restrained sound design for purposeful text reveals, UI zooms, transitions, and the logo/CTA reveal. Avoid excessive whooshes, impacts, or game-like effects.
- Use only audio assets that are licensed, approved, or generated for this project.

### Subtitles
- Add subtitles throughout the video, synchronized to the actual American-accent voiceover.
- **Exception:** when the same spoken words are already being presented as the large primary kinetic headline, do not add duplicate subtitles over that headline.
- For all other narration, use subtitles. Break lines naturally, keep them readable, and avoid covering important UI or faces.
- Use consistent subtitle typography and placement. Maintain contrast and safe margins.
- Do not let subtitles duplicate on-screen UI labels unnecessarily.

### Branding
- Inspect the website to identify the real logo, brand colours, and typography.
- When “VibeLevel Screening” is introduced in Scene 3, use the VibeLevel logo on a solid brand-green or approved brand-colour background.
- Keep the logo background clean: **no decorative lines or patterns behind it**.
- Keep the final CTA simple and consistent with the brand.

---

# PHASE 1 — Audit the current project and assets (do this first)

Before opening or capturing new screenshots:

1. Inspect the current workspace, project files, media folders, existing renders, screenshots, logos, fonts, voiceover files, music, sound effects, and any video-editing code.
2. Identify the current video stack and installed tools. Check only what is relevant, such as Node.js/npm, FFmpeg, Python, and the existing framework or editing libraries. Do not install packages or system tools without asking me first.
3. Locate and read `VibeLevel_Screening_Visual_Script.md` completely.
4. Find the asset named `Claude Code screen` and inspect it if present.
5. Create an asset inventory file at `project/asset-audit.md` (adapt the path to the existing project structure) listing:
   - Asset/path
   - Type and resolution/duration, if available
   - What it contains
   - Which scene(s) it can support
   - Whether it is suitable, needs cropping/cleanup, or should be recaptured
6. Reuse existing assets that are accurate, high-resolution, and visually suitable. Do not recapture an asset just because you can.

**Phase 1 deliverable:** an asset audit and a list of missing assets. Do not start rendering the final video yet.

# PHASE 2 — Explore both websites and capture genuine product UI

Use the browser automation tools already installed in this project, if available. If no browser automation is installed, report the options and ask before installing anything. Do not assume a tool exists.

## A. Explore the preview website

1. Open https://preview.vibelevel.ai/.
2. Sign in using the credentials supplied by me if necessary. Keep credentials private.
3. Explore the product systematically. Follow navigation and inspect relevant pages, dropdowns, tabs, dialogs, and report-related areas.
4. Capture high-resolution screenshots or clean screen recordings for the actual UI relevant to each scene.
5. Use full-page screenshots only when they help; for animated UI zooms, prefer high-resolution viewport captures with the relevant interface visible.
6. Capture screenshots at a consistent browser viewport and scale where possible. Avoid browser chrome, unrelated tabs, cursor overlays, tooltips, loading states, and obstructive popups.
7. Do not alter, submit, publish, invite candidates, or trigger any irreversible action while exploring. Keep exploration read-only unless a harmless interaction is required to reveal a screen.

## B. Explore the shared score report

1. Open https://www.vibelevel.ai/share/report/5kOev08_?theme=light.
2. Inspect the full report and identify the real sections corresponding to the script:
   - Skill scores / competency summary
   - AI collaboration insights, if shown
   - Code Review, if shown
   - Video Q&A, if shown
   - Interview Guide, if shown
   - Any genuine evidence that helps explain the candidate evaluation
3. Capture clean, high-resolution screenshots of the most useful report sections.
4. Keep the report’s actual content and scores unchanged. Do not expose private data in the rendered video. If any information is sensitive or personally identifying, flag it and use a safe crop or request an approved redacted version.
5. If the report is inaccessible or a section is absent, record that clearly. Do not invent it.

## C. Organize captured assets

Store screenshots and screen recordings in a clear folder structure that fits the existing project, for example:

- `public/assets/research/website/`
- `public/assets/research/report/`
- `public/assets/research/candidate-workspace/`

Use descriptive filenames, for example:
- `scene-03-landing-page.png`
- `scene-04-assessment-templates.png`
- `scene-04-ai-assessment-creation.png`
- `scene-05-claude-code-workspace.png`
- `scene-06-core-skills.png`
- `scene-06-working-with-ai.png`
- `scene-07-ownership.png`
- `scene-07-human-contribution.png`
- `scene-07-report-scores.png`
- `scene-07-code-review.png`
- `scene-07-video-qa.png`
- `scene-07-interview-guide.png`

These are naming examples, not assumptions that every screen exists. Use names that match the real captured content.

Create `project/screenshot-map.md` (adapt to the existing project structure) with:
- Scene number and voiceover phrase
- Screenshot/asset filename
- What the screenshot proves
- Suggested crop/focal point
- Intended camera movement (push-in, pull-out, pan, or static)
- Any privacy, resolution, or legibility issue

**Do not continue to final scene production until the website exploration and screenshot map are complete.** If a required page is missing, tell me exactly what is missing and ask for the needed access or asset.

# PHASE 3 — Create a visual plan and timed animatic

Read the script and screenshot map, then make a scene-by-scene timing plan.

For each scene, define:
- Estimated duration based on the real voiceover timing
- Visual source (real UI, motion graphics, character, or background image)
- On-screen headline(s)
- Subtitle behaviour
- Animation/camera movement
- Transition into the next scene
- Music/sound-design cue
- Assets still needed

Create `project/animatic-plan.md` before detailed animation. If voiceover has not yet been generated or recorded, estimate timing only as a temporary placeholder and mark it as unconfirmed.

## Scene-specific creative direction

### Scene 1 — Hook
Voiceover:
“When AI can write the code, build the solution, and do the work, what are you really hiring for?”

- Recruiter character on the right; oversized kinetic typography on the left.
- Animate phrases with a deliberate zoom-out/zoom-in rhythm:
  “When AI can” → “write the code” → “build the solution” → “do the work” → “What are you really hiring for?”
- Make the question the strongest typographic moment.
- Since the large typography carries the spoken words, do not overlay duplicate subtitles during those headline beats.

### Scene 2 — The Challenge
Voiceover:
“Writing prompts is one thing. Knowing what to build, how to guide AI, and whether the result actually works requires real technical skills, judgment, and ownership.”

- Use motion design: simple prompt → structured solution → AI-guided iteration → validation.
- Keep the graphics minimal, clear, and conceptually accurate.
- Use subtitles except where a large headline already displays the exact spoken words.

### Scene 3 — Introducing VibeLevel Screening
Voiceover:
“That’s where VibeLevel Screening comes in. Through realistic, role-specific tasks, it evaluates candidates across four dimensions: Core Skills, Working with AI, Ownership, and Human Contribution.”

- On “VibeLevel Screening,” show the logo on a solid approved brand-colour background, with no decorative lines.
- Transition to the real landing page and use centre-focused UI zooms as relevant words are spoken.
- On “four dimensions,” reveal a 2×2 quadrant one pillar at a time:
  1. Core Skills
  2. Working with AI
  3. Ownership
  4. Human Contribution
- Keep the four pillars consistent in style and easy to read.

### Scene 4 — Assessment Creation & ATS Integration
Voiceover:
“Start by creating an assessment using a ready-made template, customized to your role requirements. Or use AI to build one by simply describing what you need. You can also integrate with Lever or Ashby to connect assessments to your existing hiring workflow.”

- Use actual assessment-creation screenshots or screen recordings.
- Zoom to the template selection, role configuration, and AI creation areas only if those areas exist in the real UI.
- Show Lever/Ashby using actual integration UI or approved logos. Do not imply a successful integration status unless the UI confirms it.
- Keep this scene concise; assessment creation is supporting context, not the main USP.

### Scene 5 — The Candidate Experience
Voiceover:
“Candidates work on realistic, role-specific tasks in a dedicated workspace with Claude Code built in. As they work with AI to solve problems, VibeLevel looks beyond the final result to understand how they approach the task.”

- Use the existing `Claude Code screen` asset if it is good quality; recapture only if necessary and permitted.
- Push in to the task brief, then pan to the Claude Code area, then pull back to reveal the wider workspace.
- Do not fabricate code or AI messages.

### Scene 6 — Core Skills & Working with AI
Voiceover:
“Core Skills reveals how candidates perform against role-specific competencies. Working with AI evaluates how they guide AI, make decisions, and verify its output.”

- Inspect available UI/report assets first.
- Prefer genuine competency or skill-score UI when it clearly proves the point.
- For Working with AI, use real report evidence if available. Otherwise, use tasteful explanatory motion graphics: instruction → AI suggestion → human review → verification.
- Do not invent scores, percentages, AI-detection claims, or unverified capabilities.

### Scene 7 — Ownership, Human Contribution & Report
Voiceover:
“Ownership and Human Contribution reveal the responsibility candidates take and the value they bring beyond AI-generated output. The assessment report brings together skill scores, AI collaboration insights, Code Review, and Video Q&A. The Interview Guide turns strengths and gaps into focused follow-up questions.”

- For Ownership and Human Contribution, use genuine product evidence if available, or restrained conceptual motion graphics.
- Use actual screenshots from the shared report link for score summaries and available sections.
- Zoom into skill scores, AI collaboration insights, Code Review, Video Q&A, and Interview Guide only when those sections genuinely exist.
- Never fabricate missing sections or candidate results.
- Keep report content legible and preserve enough surrounding context to explain what viewers are seeing.

### Scene 8 — The Outcome
Voiceover:
“See beyond a candidate’s final output. Understand their strengths, identify gaps, and build a shortlist backed by evidence.”

- Use a strong, cinematic background image or abstract visual that fits a modern American professional context.
- Animate large text phrases in sync with the voiceover.
- Avoid generic handshake imagery. Keep the typography readable and the background secondary.

### Scene 9 — End CTA
Voiceover:
“When AI can do the work, know what makes a candidate stand out. VibeLevel Screening. Book a demo.”

- Clean branded end card with logo and approved brand colour.
- Show the closing line, product name, and “Book a demo.”
- No decorative lines behind the logo. Do not add an unapproved URL.

# PHASE 4 — Voiceover, subtitles, music, and sound design

1. Generate or record the final American-accent voiceover only after the script is confirmed.
2. Listen to the entire voiceover and correct pronunciation of “VibeLevel Screening,” “Claude Code,” “Lever,” and “Ashby.”
3. Build subtitles from the final audio/transcript and time them accurately.
4. Do not show duplicate subtitles during moments where the exact spoken phrase is already the main large kinetic headline. All other narration should have subtitles.
5. Select energetic, modern, premium technology music. Avoid calm ambient music and generic corporate background tracks.
6. Balance the mix: voiceover must remain clearly intelligible; lower/duck music under speech and let it rise slightly during transitions or pauses.
7. Use restrained, purposeful UI and typography sound effects.
8. Confirm licensing/usage rights for music and any external visual assets.

# PHASE 5 — Build and render

Before editing, inspect the existing project structure and follow its current framework and conventions. If it is a Remotion project, use Remotion; if it uses another established stack, work within that stack. Do not rebuild the project from scratch without a clear reason.

1. Build reusable components for:
   - Scene wrapper and transitions
   - Kinetic text
   - Subtitle display
   - Screenshot framing and zoom/pan
   - Logo reveal
   - Four-pillar quadrant grid
   - End card
2. Keep timings data-driven where practical, so scene timing can be adjusted without rewriting all animations.
3. Use consistent easing and avoid jarring movement.
4. Ensure screenshots are cropped correctly and remain sharp during zooms.
5. Render a low-resolution review cut first.
6. Inspect the rendered video scene by scene for timing, cropping, subtitle collisions, legibility, and visual consistency.
7. Fix problems, then render the final high-quality version.
8. Use FFmpeg or the project’s existing renderer where appropriate. Do not install tools or packages without asking first.
9. Verify the final file exists and can be played. Report the exact output path and the render settings used.

# PHASE 6 — Quality assurance

Check all of the following before marking the video complete:

- [ ] The approved voiceover script is preserved exactly.
- [ ] Voiceover has a natural American English accent.
- [ ] People/characters and lifestyle visuals fit the requested American context.
- [ ] Modern bold sans-serif typography is used consistently.
- [ ] Subtitles are synchronized throughout, except where the exact spoken words are already presented as large primary kinetic text.
- [ ] Music is energetic and engaging, not calm or sleepy.
- [ ] Voiceover remains clearly audible over music.
- [ ] Real product UI is used for product claims.
- [ ] Website/report screenshots are genuine and mapped to the correct scene.
- [ ] No credentials appear in logs, screenshots, source code, or the video.
- [ ] No private candidate information is exposed.
- [ ] No fabricated scores, metrics, report sections, or product capabilities appear.
- [ ] Logo reveals have a clean background with no decorative lines.
- [ ] Scene transitions and zooms feel deliberate and consistent.
- [ ] Final CTA is readable and held long enough.
- [ ] Final render has been checked for visual and audio issues.

# Working protocol

- Work in phases and keep a short progress log in `project/progress.md` (adapt the path to the existing project).
- At the end of each phase, summarize what you found, which files were created, and what is still missing.
- **Do not install tools, purchase assets, upload data to third-party services, submit/publish assessments, invite candidates, or perform destructive actions without asking me first.**
- Do not expose the website password in any generated files or logs.
- If a decision depends on a missing screenshot, report link, or asset, ask a specific question rather than guessing.
- Your immediate next action is **Phase 1: audit the current assets and project, then Phase 2: explore both websites and capture the required screenshots**. Do not render the final video yet.
