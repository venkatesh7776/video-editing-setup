// Builds the complete Velora product film (16:9, ~10 min): the core film (projects/velora) re-voiced, followed by
// the four pillars from master-script.md — Velora Flex, Pay, Hub, Protect — the ecosystem and the brand finale.
//   node projects/velora-film/build.mjs --stills 3,60,120 [--sheet out.jpg]      (contact sheet, 30 fps preview)
//   node projects/velora-film/build.mjs [--fps 60] [--output output/x.mp4] [--overwrite]
// VO: ElevenLabs voice FYPbXgM2j6oAvIrQjsQz ("Vikram S"), one file per part (tts.py → work/velora-full/vo/<id>.mp3 +
// Whisper <id>.json). Parts are laid out with the GAP before each and concatenated into one narration track.
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const W = path.join(WORK, 'velora-full');
const STAGE = path.join(PUBLIC_DIR, 'velora-film');
const fps = Number(args.fps ?? 30);
const output = abs(args.output ?? 'output/velora-complete-film.mp4');
if (!args.stills && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}

const parts = JSON.parse(fs.readFileSync(abs('projects/velora-film/vo-parts.json'), 'utf8'));
// Silence before each part (s): short within a scene, longer at scene and chapter changes (room for transitions).
const GAP = {
	c1: 0.6, c2: 0.6, c3: 0.6, c4: 1.0, c5: 0.8, c6: 0.6, c7: 0.6, c8: 0.8,
	s1: 2.6,
	flexa: 1.8, flexb: 1.0, flexc: 0.9, flexd: 0.9,
	paya: 2.2, payb: 1.0, payc: 0.9, payd: 1.0, paye: 0.9, payf: 0.8,
	huba: 2.2, hubb: 1.0, hubc: 0.9, hubd: 0.9, hube: 0.9, hubf: 0.9,
	protecta: 2.2, protectb: 1.0, protectc: 0.9, protectd: 0.9, protecte: 0.9,
	eco: 2.2, final: 1.6,
};
const END_HOLD = 3.2;

let t = 0;
const timeline = parts.map((p) => {
	const vo = JSON.parse(fs.readFileSync(path.join(W, 'vo', `${p.id}.json`), 'utf8'));
	t += GAP[p.id];
	const start = +t.toFixed(3);
	t += vo.duration;
	return {id: p.id, start, end: +t.toFixed(3), words: vo.words.map((w) => ({w: w.w, s: +(start + w.s).toFixed(3), e: +(start + w.e).toFixed(3)}))};
});
const duration = +(t + END_HOLD).toFixed(2);

// One narration track: silence + part + silence + part …
fs.mkdirSync(path.join(STAGE, 'sfx'), {recursive: true});
{
	const inputs = parts.flatMap((p) => ['-i', path.join(W, 'vo', `${p.id}.mp3`)]);
	const chains = [];
	const order = [];
	parts.forEach((p, i) => {
		chains.push(`aevalsrc=0:c=stereo:s=44100:d=${GAP[p.id]}[g${i}]`, `[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo[a${i}]`);
		order.push(`[g${i}][a${i}]`);
	});
	run('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', `${chains.join(';')};${order.join('')}concat=n=${parts.length * 2}:v=0:a=1[out]`, '-map', '[out]', path.join(STAGE, 'narration.wav')], {quiet: true});
}

// Core film scenes are keyed by word index into the original one-take script (projects/velora: work/velora/vo/words.json).
// Align those indices to the new voice so the core scene code stays unchanged.
const norm = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const oldWords = JSON.parse(fs.readFileSync(path.join(WORK, 'velora/vo/words.json'), 'utf8')).words;
const coreNew = timeline.filter((p) => p.id.startsWith('c')).flatMap((p) => p.words);
const coreT = [];
{
	// greedy alignment on normalised tokens with a small look-ahead; unmatched indices are interpolated
	let j = 0;
	for (let i = 0; i < oldWords.length; i++) {
		const k = norm(oldWords[i].w);
		let hit = -1;
		for (let d = 0; d < 6 && j + d < coreNew.length; d++) if (norm(coreNew[j + d].w) === k || (k && norm(coreNew[j + d].w).startsWith(k))) { hit = j + d; break; }
		if (hit >= 0) { coreT[i] = coreNew[hit].s; j = hit + 1; } else coreT[i] = null;
	}
	for (let i = 0; i < coreT.length; i++) if (coreT[i] === null) {
		let a = i - 1; while (a >= 0 && coreT[a] === null) a--;
		let b = i + 1; while (b < coreT.length && coreT[b] === null) b++;
		const ta = a >= 0 ? coreT[a] : 0;
		const tb = b < coreT.length ? coreT[b] : ta + 0.3;
		coreT[i] = +(ta + ((tb - ta) * (i - a)) / (b - a)).toFixed(3);
	}
	const missed = oldWords.filter((_, i) => coreNew.every((w) => w.s !== coreT[i])).length;
	console.log(`[core] aligned ${oldWords.length - missed}/${oldWords.length} words (rest interpolated)`);
}

// Music: one track per chapter, crossfaded in the chapter gaps (Mixkit, see assets/music/velora-film/LICENSE-NOTES.md).
const P = Object.fromEntries(timeline.map((p) => [p.id, p]));
const coreLift = coreT[77]; // "What if…" — Piano Reflections' bass entrance (32.0 s)
const music = [
	{file: 'piano-reflections', from: 0, to: P.flexa.start - 0.6, offset: 32.0 - coreLift},
	{file: 'skyline', from: P.flexa.start - 1.6, to: P.paya.start - 0.6, offset: 2},
	{file: 'discover', from: P.paya.start - 1.6, to: P.huba.start - 0.6, offset: 24},
	{file: 'drawing-the-sky', from: P.huba.start - 1.6, to: P.protecta.start - 0.6, offset: 6},
	{file: 'river-flow', from: P.protecta.start - 1.6, to: P.final.start - 0.4, offset: 4},
	{file: 'piano-reflections', from: P.final.start - 1.4, to: duration, offset: 31.0 - 1.4 - 0.2},
].map((m) => ({...m, from: +m.from.toFixed(3), to: +m.to.toFixed(3), offset: +m.offset.toFixed(3)}));
for (const [file, id] of [['piano-reflections', 22], ['skyline', 601], ['discover', 587], ['drawing-the-sky', 606], ['river-flow', 594]]) {
	fs.copyFileSync(path.join(WORK, 'velora/music', `${id}.mp3`), path.join(STAGE, `${file}.mp3`));
}
for (const f of fs.readdirSync(abs('assets/music/velora/sfx'))) if (f.endsWith('.mp3')) fs.copyFileSync(abs(`assets/music/velora/sfx/${f}`), path.join(STAGE, 'sfx', f));

const segments = timeline.map((p) => ({s: p.start, e: p.end}));
const props = {parts: timeline, coreT, duration, segments, music, fps};
const propsFile = path.join(W, 'props.json');
fs.writeFileSync(propsFile, JSON.stringify(props));
const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
console.log(`[film] ${fmt(duration)} (${duration}s) @ ${fps} fps`);
for (const id of ['c1', 's1', 'flexa', 'paya', 'huba', 'protecta', 'eco', 'final']) console.log(`  ${id.padEnd(9)} ${fmt(P[id].start)}`);

if (args.stills) {
	const sheet = args.sheet ? ['--sheet', args.sheet, '--cols', String(args.cols ?? 4)] : [];
	run('node', ['scripts/analyze/stills.mjs', '--comp', 'VeloraFilm', '--props', propsFile, '--times', String(args.stills), '--scale', String(args.scale ?? 0.5), ...sheet]);
} else {
	const REMOTION = path.join(ROOT, 'node_modules/.bin/remotion');
	const raw = path.join(W, 'render-raw.mp4');
	run(REMOTION, ['render', 'src/index.ts', 'VeloraFilm', raw, `--props=${propsFile}`, '--codec=h264', '--crf=16', '--jpeg-quality=100', '--audio-codec=aac', '--audio-bitrate=256k', ...(args.concurrency ? [`--concurrency=${args.concurrency}`] : [])]);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	console.log(`✔ rendered ${rel(output)}`);
}
