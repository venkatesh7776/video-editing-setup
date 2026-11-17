// v5 build (demo-v4 theme, proxy attempt, cheats wheel) — VibeLevel Screening — "Can You Get Away With It?" (16:9, designed at 1920×1080, rendered ×2 = 3840×2160, 30 fps).
// Plan: projects/vibelevel-cyg/PLAN.md · Omni assets: omni_gen.py → work/cyg/omni · VO: work/cyg/vo (presenter), work/cyg/vo-int (interview).
//   node projects/vibelevel-cyg/build.mjs --stills 2,20,40 [--scale 0.5] [--sheet x.jpg --cols 4]
//   node projects/vibelevel-cyg/build.mjs [--output output/…] [--overwrite] [--draft]   (--draft = 1080p)
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const W = path.join(WORK, 'cyg5');
const WI = path.join(WORK, 'cyg'); // interview takes (q1, a1) are reused from v4
const STAGE = path.join(PUBLIC_DIR, 'cyg');
const output = abs(args.output ?? 'output/vibelevel-can-you-get-away-with-it-v5.mp4');
if (!args.stills && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}
const TEMPO = 1.08; // the v4 presenter pace
const CARD = 2.3; // full-screen chapter cards
const TAIL = 0.35;
const FADE = 0.18;
const END_HOLD = 3.4;
// [id, silence before]; CARDn = a full-screen chapter card (VO pauses)
const ORDER = [
	['o1', 0.5], ['o2', 0.45], ['o3', 0.45], // new opening (context)
	['s1a', 2.6], ['s1b', 0.35], ['s1c', 1.6], ['s2', 1.0],
	['CARD1', 0.5], ['s3', 0.25],
	['CARD2', 1.9], ['s4', 0.25],
	['CARD3', 1.6], ['s5', 0.3],
	['CARD4', 1.0], ['s6', 0.25], ['q1', 0.9], ['a1', 0.35],
	['s6b', 1.6], ['s7', 1.2], ['s8', 2.6], // s8 gap: the report holds after the VO
	['c1', 1.6], ['c2', 0.5], ['c3', 0.5], ['c4', 0.6], // new closing (pitch)
];
const GAIN = {q1: 1.5, a1: 1.0}; // interviewer a little louder
const isInt = (id) => /^[qa]\d$/.test(id);
const voOf = (id) => JSON.parse(fs.readFileSync(isInt(id) ? path.join(WI, 'vo-int', `${id}.json`) : path.join(W, 'vo', `${id}.json`), 'utf8'));
const mp3Of = (id) => (isInt(id) ? path.join(WI, 'vo-int', `${id}.mp3`) : path.join(W, 'vo', `${id}.mp3`));

fs.mkdirSync(W, {recursive: true});

let t = 0;
const parts = [];
const cards = [];
const audio = []; // [file, start, clipLen, tempo, gain]
for (const [id, gap] of ORDER) {
	t += gap;
	if (id.startsWith('CARD')) {
		cards.push(+t.toFixed(3));
		t += CARD;
		continue;
	}
	const vo = voOf(id);
	const tempo = isInt(id) ? 1 : TEMPO;
	const clip = Math.min(vo.duration, vo.words[vo.words.length - 1].e + TAIL);
	const start = t;
	parts.push({id, start: +start.toFixed(3), end: +(start + clip / tempo).toFixed(3), words: vo.words.map((w) => ({w: w.w, s: +(start + w.s / tempo).toFixed(3), e: +(start + w.e / tempo).toFixed(3)}))});
	audio.push([mp3Of(id), start, clip, tempo, GAIN[id] ?? 1]);
	t += clip / tempo;
}
const duration = +(t + END_HOLD).toFixed(2);
{
	const inputs = audio.flatMap(([f]) => ['-i', f]);
	const chains = audio.map(([, s, clip, tempo, gain], i) => `[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:${clip.toFixed(3)},asetpts=N/SR/TB,afade=t=out:st=${(clip - FADE).toFixed(3)}:d=${FADE}${tempo !== 1 ? `,atempo=${tempo}` : ''},volume=${gain},adelay=${Math.round(s * 1000)}:all=1[a${i}]`);
	const mix = `${audio.map((_, i) => `[a${i}]`).join('')}amix=inputs=${audio.length}:normalize=0:duration=longest,apad=whole_dur=${duration}[out]`;
	run('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', `${chains.join(';')};${mix}`, '-map', '[out]', '-t', String(duration), path.join(STAGE, 'narration5.wav')], {quiet: true});
}
const props = {parts, cards, card: CARD, duration, segments: parts.map((p) => ({s: p.start, e: p.end, int: isInt(p.id)})), musicOffset: 4.5};
const propsFile = path.join(W, 'props.json');
fs.writeFileSync(propsFile, JSON.stringify(props));
const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
console.log(`[cyg] ${fmt(duration)}  cards at ${cards.map(fmt).join(', ')}`);
for (const p of parts) console.log(`  ${p.id}  ${fmt(p.start)}–${fmt(p.end)}`);

const REMOTION = path.join(ROOT, 'node_modules/.bin/remotion');
if (args.stills) {
	run('node', ['scripts/analyze/stills.mjs', '--comp', 'VibeLevelCYG5', '--props', propsFile, '--times', String(args.stills), '--scale', String(args.scale ?? 0.5), ...(args.sheet ? ['--sheet', args.sheet, '--cols', String(args.cols ?? 4)] : [])]);
} else {
	const raw = path.join(W, 'render-raw.mp4');
	run(REMOTION, ['render', 'src/index.ts', 'VibeLevelCYG5', raw, `--props=${propsFile}`, `--scale=${args.draft ? 1 : 2}`, '--codec=h264', '--crf=16', '--jpeg-quality=95', '--audio-codec=aac', '--audio-bitrate=320k', ...(args.concurrency ? [`--concurrency=${args.concurrency}`] : [])]);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	console.log(`✔ rendered ${rel(output)}`);
}
