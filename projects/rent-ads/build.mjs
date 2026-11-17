// Builds the six Rent campaign videos (scripts.md; ONERENT → "Rent"): video1 16:9 (master explainer), video2–6 9:16.
// Same design system, voice (ElevenLabs "Vikram S"), music library and SFX as the Velora film.
//   node projects/rent-ads/build.mjs --video 1 --stills 1,8,20 [--sheet out.jpg]
//   node projects/rent-ads/build.mjs --video all [--fps 30] [--overwrite]          → output/video1.mp4 … video6.mp4
// VO: VO_PARTS=projects/rent-ads/vo-parts.json VO_OUT=work/rent-ads/vo .venv/bin/python -I projects/velora-film/tts.py
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const W = path.join(WORK, 'rent-ads');
const STAGE = path.join(PUBLIC_DIR, 'rent-ads');
const fps = Number(args.fps ?? 30);
const parts = JSON.parse(fs.readFileSync(abs('projects/rent-ads/vo-parts.json'), 'utf8'));

// silence before each line (s) — quick in the problem beats, a breath before the brand and the CTA
const GAP = {
	v1: [0.3, 0.35, 0.4, 0.7, 0.5, 0.6],
	v2: [0.2, 0.3, 0.3, 0.5, 0.4],
	v3: [0.3, 0.4, 0.4, 0.5, 0.5],
	v4: [0.3, 0.3, 0.5, 0.4, 0.5],
	v5: [0.5, 0.5, 0.6, 0.6, 0.5],
	v6: [0.25, 0.35, 0.35, 0.4, 0.35, 0.45],
};
const END_HOLD = 3.4; // end card from the CTA line, held ≥ 3 s after the last word
// music: same tracks as the Velora film; `lift` = track time to land on a given part's start (video 1: the reveal)
const MUSIC = {
	v1: {file: 'piano-reflections', lift: 32.0, at: 'v1d'},
	v2: {file: 'discover', offset: 24},
	v3: {file: 'drawing-the-sky', offset: 8},
	v4: {file: 'skyline', offset: 2},
	v5: {file: 'river-flow', offset: 4},
	v6: {file: 'piano-reflections', offset: 3},
};
const SRC = {'piano-reflections': 22, skyline: 601, discover: 587, 'drawing-the-sky': 606, 'river-flow': 594};

fs.mkdirSync(path.join(STAGE, 'sfx'), {recursive: true});
for (const [f, id] of Object.entries(SRC)) fs.copyFileSync(path.join(WORK, 'velora/music', `${id}.mp3`), path.join(STAGE, `${f}.mp3`));
for (const f of fs.readdirSync(abs('assets/music/velora/sfx'))) if (f.endsWith('.mp3')) fs.copyFileSync(abs(`assets/music/velora/sfx/${f}`), path.join(STAGE, 'sfx', f));

const build = (n) => {
	const v = `v${n}`;
	const mine = parts.filter((p) => p.id.startsWith(v));
	let t = 0;
	const timeline = mine.map((p, i) => {
		const vo = JSON.parse(fs.readFileSync(path.join(W, 'vo', `${p.id}.json`), 'utf8'));
		t += GAP[v][i];
		const start = +t.toFixed(3);
		t += vo.duration;
		return {id: p.id, start, end: +t.toFixed(3), words: vo.words.map((w) => ({w: w.w, s: +(start + w.s).toFixed(3), e: +(start + w.e).toFixed(3)}))};
	});
	const duration = +(t + END_HOLD).toFixed(2);
	{
		const inputs = mine.flatMap((p) => ['-i', path.join(W, 'vo', `${p.id}.mp3`)]);
		const chains = [];
		const order = [];
		mine.forEach((p, i) => {
			chains.push(`aevalsrc=0:c=stereo:s=44100:d=${GAP[v][i]}[g${i}]`, `[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo[a${i}]`);
			order.push(`[g${i}][a${i}]`);
		});
		run('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', `${chains.join(';')};${order.join('')}concat=n=${mine.length * 2}:v=0:a=1[out]`, '-map', '[out]', path.join(STAGE, `${v}-narration.wav`)], {quiet: true});
	}
	const m = MUSIC[v];
	const offset = m.lift !== undefined ? +(m.lift - timeline.find((p) => p.id === m.at).start).toFixed(3) : m.offset;
	const props = {video: n, vertical: n !== 1, parts: timeline, duration, segments: timeline.map((p) => ({s: p.start, e: p.end})), music: {file: m.file, offset}, fps};
	const propsFile = path.join(W, `props-v${n}.json`);
	fs.writeFileSync(propsFile, JSON.stringify(props));
	console.log(`[video${n}] ${duration}s ${n === 1 ? '1920×1080' : '1080×1920'} @ ${fps} fps · music ${m.file} from ${offset}s`);
	return propsFile;
};

const list = args.video === 'all' || !args.video ? [1, 2, 3, 4, 5, 6] : String(args.video).split(',').map(Number);
for (const n of list) {
	const propsFile = build(n);
	if (args.stills) {
		const sheet = args.sheet ? ['--sheet', list.length > 1 ? String(args.sheet).replace(/(\.\w+)$/, `-v${n}$1`) : args.sheet, '--cols', String(args.cols ?? (n === 1 ? 4 : 6))] : [];
		run('node', ['scripts/analyze/stills.mjs', '--comp', `RentVideo${n}`, '--props', propsFile, '--times', String(args.stills), '--scale', String(args.scale ?? 0.5), ...sheet]);
		continue;
	}
	const output = abs(`output/video${n}.mp4`);
	if (fs.existsSync(output) && !args.overwrite) {
		console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite.`);
		continue;
	}
	const raw = path.join(W, `render-v${n}.mp4`);
	run(path.join(ROOT, 'node_modules/.bin/remotion'), ['render', 'src/index.ts', `RentVideo${n}`, raw, `--props=${propsFile}`, '--codec=h264', '--crf=16', '--jpeg-quality=100', '--audio-codec=aac', '--audio-bitrate=256k', ...(args.concurrency ? [`--concurrency=${args.concurrency}`] : [])]);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	console.log(`✔ rendered ${rel(output)}`);
}
