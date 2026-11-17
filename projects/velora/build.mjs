// Builds the Velora motion-graphics explainer (16:9, 1920×1080, ~75 s) from projects/velora/brief.pdf.
//   node projects/velora/build.mjs --still 3,12,30           (PNG frames → work/stills/, 30 fps preview)
//   node projects/velora/build.mjs [--fps 60] [--output output/x.mp4] [--overwrite]
// VO: ElevenLabs "Venkatesh prof" (eleven_v4), one take of script.txt: work/velora/vo/narration.mp3 +
// words.json (Whisper), re-spaced with scene gaps (GAPS) into work/public/velora/narration.wav.
// Music: Mixkit "Piano Reflections" — its bass/rhythm entrance (32.0 s) lands on "What if…" (scene 4).
// SFX: ElevenLabs Sound Effects, loudness-normalised to −20 LUFS (assets/music/velora/LICENSE-NOTES.md).
// Look: user's style reference (projects/velora/style-reference: light Stripe-like UI, Inter, indigo + orange→violet).
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const W = path.join(WORK, 'velora');
const STAGE = path.join(PUBLIC_DIR, 'velora');
const fps = Number(args.fps ?? 30);
const output = abs(args.output ?? 'output/velora-explainer.mp4');
if (!args.still && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}

fs.mkdirSync(path.join(STAGE, 'sfx'), {recursive: true});
fs.copyFileSync(abs('assets/music/velora/piano-reflections.mp3'), path.join(STAGE, 'music.mp3'));
for (const f of fs.readdirSync(abs('assets/music/velora/sfx'))) if (f.endsWith('.mp3')) fs.copyFileSync(abs(`assets/music/velora/sfx/${f}`), path.join(STAGE, 'sfx', f));

const vo = JSON.parse(fs.readFileSync(path.join(W, 'vo', 'words.json'), 'utf8'));
const LEAD = 0.6; // city ambience + first frame settle before the first word
const END_HOLD = 2.2; // brief: hold the end card ≥ 2 s; keeps the film at 75 s

// Extra silence (s) before these words (index into words.json, checked by text): scene changes + the reveal.
const GAPS = [
	[22, 'He', 0.3], // S2 the financial shock
	[51, 'Arjun', 0.3], // S3 the hidden problem
	[77, 'What', 0.8], // S4 clutter clears → "What if…"
	[93, 'Introducing', 0.4], // pause before the brand
	[103, 'Through', 0.5], // S5 how financing works
	[136, 'And', 0.4], // S6 more than financing
	[157, 'Now,', 0.4], // S7 resolution
	[177, 'Velora,', 0.5], // S8 end card
];
const cuts = GAPS.map(([i, text, gap]) => {
	if (vo.words[i].w !== text) throw new Error(`GAPS: word ${i} is "${vo.words[i].w}", expected "${text}"`);
	return {i, at: (vo.words[i - 1].e + vo.words[i].s) / 2, gap};
});
const shiftAt = (t) => cuts.filter((c) => c.at <= t).reduce((s, c) => s + c.gap, 0);
const words = vo.words.map((w) => ({w: w.w, s: +(LEAD + w.s + shiftAt(w.s)).toFixed(3), e: +(LEAD + w.e + shiftAt(w.s)).toFixed(3)}));
const voDuration = vo.duration + cuts.reduce((s, c) => s + c.gap, 0);
const bounds = [0, ...cuts.map((c) => c.at), vo.duration];
const segments = bounds.slice(0, -1).map((a, j) => ({s: +(LEAD + a + shiftAt(a + 1e-6)).toFixed(3), e: +(LEAD + bounds[j + 1] + shiftAt(a + 1e-6)).toFixed(3)}));
{
	const parts = bounds.slice(0, -1).map((a, j) => `[0]aformat=sample_rates=44100:channel_layouts=stereo,atrim=${a}:${bounds[j + 1]},asetpts=N/SR/TB,afade=t=in:d=0.01,afade=t=out:st=${(bounds[j + 1] - a - 0.012).toFixed(3)}:d=0.012[s${j}]`);
	const sil = cuts.map((c, j) => `aevalsrc=0:c=stereo:s=44100:d=${c.gap}[g${j}]`);
	const order = bounds.slice(0, -1).map((_, j) => (j ? `[g${j - 1}][s${j}]` : '[s0]')).join('');
	run('ffmpeg', ['-v', 'error', '-y', '-i', path.join(W, 'vo', 'narration.mp3'), '-filter_complex', [...parts, ...sil, `${order}concat=n=${bounds.length - 1 + cuts.length}:v=0:a=1[out]`].join(';'), '-map', '[out]', path.join(STAGE, 'narration.wav')], {quiet: true});
}
const duration = +(LEAD + voDuration + END_HOLD).toFixed(2);
const MUSIC_LIFT = 32.0; // "Piano Reflections": bass + rhythm enter
const musicOffset = +(MUSIC_LIFT - words[77].s).toFixed(3); // track time at reel time 0

const props = {words, lead: LEAD, duration, segments, musicOffset, voEnd: +(LEAD + voDuration).toFixed(3)};
const propsFile = path.join(W, 'props.json');
fs.writeFileSync(propsFile, JSON.stringify(props));
console.log(`[velora] ${duration}s @ ${fps} fps, music offset ${musicOffset}s`);

const REMOTION = path.join(ROOT, 'node_modules/.bin/remotion');
const fpsProp = (file) => {
	fs.writeFileSync(file, JSON.stringify({...props, fps}));
	return file;
};
if (args.still) {
	fs.mkdirSync(path.join(WORK, 'stills'), {recursive: true});
	const pf = fpsProp(propsFile);
	for (const sec of String(args.still).split(',').map(Number)) {
		const out = path.join(WORK, 'stills', `velora-${sec.toFixed(2)}.png`);
		run(REMOTION, ['still', 'src/index.ts', 'Velora', out, `--props=${pf}`, `--frame=${Math.round(sec * fps)}`, ...(args.scale ? [`--scale=${args.scale}`] : [])], {quiet: true});
		console.log(`✔ ${rel(out)}`);
	}
} else {
	const raw = path.join(W, 'render-raw.mp4');
	run(REMOTION, ['render', 'src/index.ts', 'Velora', raw, `--props=${fpsProp(propsFile)}`, '--codec=h264', '--crf=16', '--jpeg-quality=100', '--audio-codec=aac', '--audio-bitrate=256k', ...(args.concurrency ? [`--concurrency=${args.concurrency}`] : [])]);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	console.log(`✔ rendered ${rel(output)}`);
}
