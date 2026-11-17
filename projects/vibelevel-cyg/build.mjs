// VibeLevel Screening — "Can You Get Away With It?" (16:9, designed at 1920×1080, rendered ×2 = 3840×2160, 30 fps).
// Plan: projects/vibelevel-cyg/PLAN.md · Omni assets: omni_gen.py → work/cyg/omni · VO: work/cyg/vo (presenter), work/cyg/vo-int (interview).
//   node projects/vibelevel-cyg/build.mjs --stills 2,20,40 [--scale 0.5] [--sheet x.jpg --cols 4]
//   node projects/vibelevel-cyg/build.mjs [--output output/…] [--overwrite] [--draft]   (--draft = 1080p)
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const W = path.join(WORK, 'cyg');
const STAGE = path.join(PUBLIC_DIR, 'cyg');
const output = abs(args.output ?? 'output/vibelevel-can-you-get-away-with-it.mp4');
if (!args.stills && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}
const TEMPO = 1.08; // the v4 presenter pace
const CARD = 2.3; // full-screen chapter cards
const TAIL = 0.35;
const FADE = 0.18;
const END_HOLD = 3.6;
// [id, silence before]; CARDn = a full-screen chapter card (VO pauses)
const ORDER = [
	['s1', 2.0], ['s2', 1.0],
	['CARD1', 0.5], ['s3', 0.25],
	['CARD2', 1.9], ['s4', 0.25],
	['CARD3', 1.2], ['s5', 1.3],
	['CARD4', 0.6], ['s6', 0.25], ['q1', 0.9], ['a1', 0.35],
	['s7', 2.0], ['s8', 2.8], // s8 gap: the report holds after the VO
];
const GAIN = {q1: 1.5, a1: 1.0}; // interviewer a little louder
const isInt = (id) => /^[qa]\d$/.test(id);
const voOf = (id) => JSON.parse(fs.readFileSync(path.join(W, isInt(id) ? 'vo-int' : 'vo', `${id}.json`), 'utf8'));
const mp3Of = (id) => path.join(W, isInt(id) ? 'vo-int' : 'vo', `${id}.mp3`);

fs.mkdirSync(path.join(STAGE, 'omni'), {recursive: true});
const OMNI = path.join(W, 'omni3'); // v3: American candidate, Veo 3.1 plates // v2: realistic front-angle MacBook set (omni_gen.py with OMNI_OUT=work/cyg/omni2)
for (const f of fs.readdirSync(OMNI)) if (/^k\d\.mp4$/.test(f)) fs.copyFileSync(path.join(OMNI, f), path.join(STAGE, 'omni', f));
if (fs.existsSync(path.join(OMNI, 'k6.mp4'))) run('ffmpeg', ['-v', 'error', '-y', '-i', path.join(OMNI, 'k6.mp4'), '-frames:v', '1', path.join(STAGE, 'omni', 'k6-first.png')], {quiet: true});
if (fs.existsSync(path.join(OMNI, 'k6.mp4'))) run('ffmpeg', ['-v', 'error', '-y', '-sseof', '-0.15', '-i', path.join(OMNI, 'k6.mp4'), '-frames:v', '1', '-update', '1', path.join(STAGE, 'omni', 'k6-last.png')], {quiet: true});

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
	run('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', `${chains.join(';')};${mix}`, '-map', '[out]', '-t', String(duration), path.join(STAGE, 'narration.wav')], {quiet: true});
}
const props = {parts, cards, card: CARD, duration, segments: parts.map((p) => ({s: p.start, e: p.end, int: isInt(p.id)})), musicOffset: 4.5};
const propsFile = path.join(W, 'props.json');
fs.writeFileSync(propsFile, JSON.stringify(props));
const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
console.log(`[cyg] ${fmt(duration)}  cards at ${cards.map(fmt).join(', ')}`);
for (const p of parts) console.log(`  ${p.id}  ${fmt(p.start)}–${fmt(p.end)}`);

const REMOTION = path.join(ROOT, 'node_modules/.bin/remotion');
if (args.stills) {
	run('node', ['scripts/analyze/stills.mjs', '--comp', 'VibeLevelCYG', '--props', propsFile, '--times', String(args.stills), '--scale', String(args.scale ?? 0.5), ...(args.sheet ? ['--sheet', args.sheet, '--cols', String(args.cols ?? 4)] : [])]);
} else {
	const raw = path.join(W, 'render-raw.mp4');
	run(REMOTION, ['render', 'src/index.ts', 'VibeLevelCYG', raw, `--props=${propsFile}`, `--scale=${args.draft ? 1 : 2}`, '--codec=h264', '--crf=16', '--jpeg-quality=95', '--audio-codec=aac', '--audio-bitrate=320k', ...(args.concurrency ? [`--concurrency=${args.concurrency}`] : [])]);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	console.log(`✔ rendered ${rel(output)}`);
}
