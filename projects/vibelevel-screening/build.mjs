// Builds the VibeLevel Screening demo video.
//   node projects/vibelevel-screening/build.mjs --still 4.8,25,90      (PNG frames → work/stills/)
//   node projects/vibelevel-screening/build.mjs --review                (960×540 review cut)
//   node projects/vibelevel-screening/build.mjs [--output output/x.mp4] [--overwrite] [--gain-db 4.64]   (final 1080p; --gain-db skips loudness re-measuring)
// Steps: stage assets → subtitle cues aligned to the spoken words → props + SRT → Remotion → loudnorm.
// Voiceover/timing come from narration.json (kokoro_tts.py), vo_words.py and build_timing.py.
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const HERE = 'projects/vibelevel-screening';
const VO = path.join(WORK, 'vibelevel-screening/vo');
const STAGE = path.join(PUBLIC_DIR, 'screening');
const DERIVED = path.join(WORK, 'vibelevel-screening/derived');
const output = abs(args.output ?? (args.review ? 'output/vibelevel-screening-review-540p.mp4' : 'output/vibelevel-screening-demo.mp4'));

if (!args.still && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}

// ─── Images: short name → source capture ──────────────────────────────────────
const R = 'assets/images/vibelevel-screening/research';
fs.mkdirSync(DERIVED, {recursive: true});
const landingTasks = path.join(DERIVED, 'landing-tasks.png');
// Text column only (from 49% across), padded left in the page colour: the left half of
// this section shows a competitor positioning map.
run('ffmpeg', ['-v', 'error', '-y', '-i', abs(`${R}/website/landing-06-full-agentic-workspace-production-grade.png`), '-vf', 'crop=iw*0.51:ih:iw*0.49:0,pad=iw+120:ih:120:0:color=0xF8F9F9', landingTasks]);
// Logo split into star mark and wordmark (transparent gap at x≈816–1005) so the end card can animate them.
const LOGO = abs('assets/logos/Frame 2147205620.png');
const logoStar = path.join(DERIVED, 'logo-star.png');
const logoWord = path.join(DERIVED, 'logo-word.png');
run('ffmpeg', ['-v', 'error', '-y', '-i', LOGO, '-vf', 'crop=850:740:60:140', logoStar]);
run('ffmpeg', ['-v', 'error', '-y', '-i', LOGO, '-vf', 'crop=3420:740:910:140', logoWord]);
// The workspace screenshot is only 1920 px wide: pre-scale it 2× with Lanczos and a light
// unsharp mask so camera push-ins stay crisp instead of relying on the browser's bilinear upscale.
const workspace = path.join(DERIVED, 'workspace-2x.png');
run('ffmpeg', ['-v', 'error', '-y', '-i', abs('assets/images/Claude code screen.png'), '-vf', 'scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:0.6:5:5:0', workspace]);
// Assessments list cropped to the area around the Create menu (no need for the whole table).
const createCrop = path.join(DERIVED, 'app-create-crop.png');
run('ffmpeg', ['-v', 'error', '-y', '-i', abs(`${R}/app/app-create-menu.png`), '-vf', 'crop=2140:1204:1700:0', createCrop]);
const SOURCES = {
	'app-create-crop': createCrop,
	recruiter: 'assets/images/Cinematic Urban Portrait in Monochrome.png',
	'logo-star': logoStar,
	'logo-word': logoWord,
	office: 'assets/images/vibelevel-screening/generated/s8-background-21.png',
	logo: 'assets/logos/Frame 2147205620.png',
	'landing-hero': `${R}/website/landing-01-hire-engineers-who-can-ship-reliable-sof.png`,
	'landing-tasks': landingTasks,
	'app-create-menu': `${R}/app/app-create-menu.png`,
	'app-role-picker': `${R}/app/app-role-picker.png`,
	'app-refine-role-selected': `${R}/app/app-refine-role-selected.png`,
	'app-ai-builder': `${R}/app/app-ai-builder.png`,
	'app-ats-integrations': `${R}/app/app-ats-integrations.png`,
	'site-ai-builder': `${R}/website/hiring-08-chat-your-assessment-into-existence.png`,
	'site-ats': `${R}/website/hiring-09-fits-your-workflow-zero-friction.png`,
	workspace,
	// Report crops: identifiers pixelated, and detail blurred (capture-report-redacted.mjs) so only headings read.
	'r-core-skills': `${R}/report-scenes-blur/scene-06-core-skills.png`,
	'r-wwai': `${R}/report-scenes-blur/scene-06-working-with-ai.png`,
	'r-four-aspects': `${R}/report-scenes-blur/scene-07-four-aspects-definition.png`,
	'r-hc': `${R}/report-scenes-blur/scene-07-human-contribution.png`,
	'r-overview': `${R}/report-scenes-blur/scene-07-report-overview.png`,
	'r-scores': `${R}/report-scenes-blur/scene-07-skill-scores.png`,
	'r-code-review': `${R}/report-scenes-blur/scene-07-code-review.png`,
	'r-video-qa': `${R}/report-scenes-blur/scene-07-video-qa.png`,
	'r-interview': `${R}/report-scenes-blur/scene-07-interview-guide.png`,
	'r-probes': `${R}/report-scenes-blur/scene-07-interview-guide-probes.png`,
};
for (const d of ['img', 'vo', 'sfx']) fs.mkdirSync(path.join(STAGE, d), {recursive: true});
const images = {};
for (const [name, src] of Object.entries(SOURCES)) {
	const ext = path.extname(src);
	const dest = path.join(STAGE, 'img', name + ext);
	fs.copyFileSync(abs(src), dest);
	const [w, h] = run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', dest], {quiet: true}).trim().split(',').map(Number);
	images[name] = {src: `screening/img/${name}${ext}`, w, h};
}

// ─── Audio ───────────────────────────────────────────────────────────────────
const timeline = JSON.parse(fs.readFileSync(path.join(VO, 'timeline.json'), 'utf8'));
for (const id of timeline.order) fs.copyFileSync(path.join(VO, `${id}.wav`), path.join(STAGE, 'vo', `${id}.wav`));
fs.copyFileSync(abs('assets/music/vibelevel-screening/deep-urban.mp3'), path.join(STAGE, 'music.mp3'));
const SFX = abs('assets/music/vibelevel-screening/sfx');
for (const f of fs.readdirSync(SFX).filter((f) => f.endsWith('.mp3'))) fs.copyFileSync(path.join(SFX, f), path.join(STAGE, 'sfx', f));

// ─── Subtitles: written words timed by the Whisper words of the real voiceover ─
const timing = JSON.parse(fs.readFileSync(abs(`${HERE}/timing.json`), 'utf8'));
const words = JSON.parse(fs.readFileSync(path.join(VO, 'words.json'), 'utf8'));
const narration = JSON.parse(fs.readFileSync(abs(`${HERE}/narration.json`), 'utf8'));
const letters = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Spreads each Whisper word's time over its letters, then reads written words off that stream. */
const timeWritten = (text, spoken) => {
	const stream = [];
	for (const w of spoken) {
		const l = letters(w.w);
		for (let i = 0; i < l.length; i++) stream.push(w.s + ((w.e - w.s) * i) / l.length);
	}
	const end = spoken.at(-1).e;
	let k = 0;
	const out = text.split(/\s+/).map((w) => {
		const n = letters(w).length;
		const s = stream[Math.min(k, stream.length - 1)];
		const e = k + n < stream.length ? stream[k + n] : end;
		k += n;
		return {w, s, e};
	});
	if (k !== stream.length) console.warn(`  ⚠ subtitle letter count differs (${k} vs ${stream.length}): "${text.slice(0, 40)}…"`);
	return out;
};

const MAX_CHARS = 52; // one line at 38 px Manrope inside the 1240 px pill

const textOf = (ws) => ws.map((x) => x.w).join(' ');

// Natural places to break a line: before these words.
const BREAK_BEFORE = new Set(['to', 'by', 'with', 'and', 'or', 'into', 'in', 'beyond', 'against', 'across', 'as', 'that', 'how', 'what', 'whether']);

/** Splits words into two halves near the middle, preferring a break before a connecting word. */
const halve = (ws) => {
	const total = textOf(ws).length;
	let best = 1;
	let bestDiff = Infinity;
	for (let i = 1; i < ws.length; i++) {
		const natural = BREAK_BEFORE.has(letters(ws[i].w));
		const diff = Math.abs(textOf(ws.slice(0, i)).length - total / 2) - (natural ? 9 : 0);
		if (diff < bestDiff) [best, bestDiff] = [i, diff];
	}
	return [ws.slice(0, best), ws.slice(best)];
};

const fit = (ws) => (textOf(ws).length <= MAX_CHARS || ws.length < 2 ? [ws] : halve(ws).flatMap(fit));

/** Sentences → comma clauses → (merge short neighbours) → balanced halves when still too long. */
const chunk = (ws) => {
	const sentences = [];
	let cur = [];
	for (const w of ws) {
		cur.push(w);
		if (/[.?!:]$/.test(w.w)) [sentences[sentences.length], cur] = [cur, []];
	}
	if (cur.length) sentences.push(cur);
	return sentences.flatMap((sent) => {
		const clauses = [];
		let c = [];
		for (const w of sent) {
			c.push(w);
			if (/[,;]$/.test(w.w)) [clauses[clauses.length], c] = [c, []];
		}
		if (c.length) clauses.push(c);
		const merged = [];
		for (const cl of clauses) {
			const prev = merged.at(-1);
			if (prev && textOf([...prev, ...cl]).length <= MAX_CHARS && (textOf(prev).length < 26 || textOf(cl).length < 26)) merged[merged.length - 1] = [...prev, ...cl];
			else merged.push(cl);
		}
		return merged.flatMap(fit);
	});
};

const sceneById = Object.fromEntries(timing.scenes.map((s) => [s.id, s]));
const allCues = [];
for (const sc of narration.scenes) {
	const s = sceneById[sc.id];
	if (!s) continue; // narration line not used by this cut (e.g. the CTA line when ENDING=exhibit)
	const timed = timeWritten(sc.text, words[sc.id]).map((w) => ({...w, s: w.s + s.voStart, e: w.e + s.voStart}));
	for (const c of chunk(timed)) allCues.push({scene: sc.id, text: c.map((x) => x.w).join(' '), start: c[0].s, end: c.at(-1).e + 0.15});
}
allCues.forEach((c, i) => {
	const next = allCues[i + 1];
	if (next && c.end > next.start) c.end = next.start;
	c.start = Math.round(c.start * 100) / 100;
	c.end = Math.round(c.end * 100) / 100;
});

// No burned-in subtitles where the same words are the main kinetic headline.
const beat = (id, label) => sceneById[id].beats.find((b) => b.label === label).t;
const spokenAt = (id, word) => sceneById[id].voStart + words[id].find((w) => letters(w.w) === word).s;
const SUPPRESS = [
	[sceneById['s1-problem'].start, sceneById['s1-problem'].end], // opening: the voiceover is shown as on-screen text
	[sceneById['s3-intro'].start, beat('s3-intro', 'realistic, role-specific tasks') - 0.3], // logo + "Screening"
	[beat('s3-intro', 'Core Skills') - 0.3, sceneById['s3-intro'].end], // the four pillar cards
	[sceneById['n6-ownership'].start, beat('n6-ownership', 'Ownership') - 0.3], // "But technical ability is only part of the picture." shown as the headline
	[sceneById['n9-outcome'].start, timing.scenes.at(-1).end], // outcome text (= voiceover), closing line, end card
];
const burned = allCues.filter((c) => {
	const mid = (c.start + c.end) / 2;
	return !SUPPRESS.some(([a, b]) => mid >= a && mid <= b);
});

const ts = (sec) => new Date(Math.max(0, sec) * 1000).toISOString().slice(11, 23).replace('.', ',');
const srtPath = abs('captions/subtitles/vibelevel-screening.srt');
fs.writeFileSync(srtPath, allCues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join('\n'));
console.log(`[subtitles] ${burned.length} burned-in cues (of ${allCues.length}); full SRT → ${rel(srtPath)}`);

const propsFile = path.join(WORK, 'vibelevel-screening/props.json');
fs.writeFileSync(propsFile, JSON.stringify({timing, images, cues: burned.map(({text, start, end}) => ({text, start, end})), musicOffset: 4.5}));

// ─── Render ──────────────────────────────────────────────────────────────────
const REMOTION = path.join(ROOT, 'node_modules/.bin/remotion');
if (args.still) {
	fs.mkdirSync(path.join(WORK, 'stills'), {recursive: true});
	for (const sec of String(args.still).split(',').map(Number)) {
		const out = path.join(WORK, 'stills', `screening-${sec.toFixed(2)}.png`);
		run(REMOTION, ['still', 'src/index.ts', 'Screening', out, `--props=${propsFile}`, `--frame=${Math.round(sec * timing.fps)}`, ...(args.scale ? [`--scale=${args.scale}`] : [])], {quiet: true});
		console.log(`✔ ${rel(out)}`);
	}
} else {
	const raw = path.join(WORK, 'vibelevel-screening/render-raw.mp4');
	const quality = args.review ? ['--scale=0.5', '--crf=24'] : ['--crf=16', '--jpeg-quality=100'];
	run(REMOTION, ['render', 'src/index.ts', 'Screening', raw, `--props=${propsFile}`, '--codec=h264', ...quality, '--audio-codec=aac', '--audio-bitrate=192k']);
	if (args['gain-db'] !== undefined) {
		// Fixed gain instead of re-measuring, so unchanged sections keep exactly the level of an earlier render.
		run('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-c:v', 'copy', '-af', `volume=${args['gain-db']}dB`, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', output]);
		console.log(`[gain] ${args['gain-db']} dB → ${rel(output)}`);
	} else {
		run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	}
	console.log(`✔ rendered ${rel(output)}`);
}
