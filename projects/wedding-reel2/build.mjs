// Builds wedding reel 2 (1080×1920, ~31 s): invitation card → iPhone (blurred site) → reveal → second site → CTA.
//   node projects/wedding-reel2/build.mjs --still 1.5,5,12      (PNG frames → work/stills/)
//   node projects/wedding-reel2/build.mjs [--output output/x.mp4] [--overwrite]
// VO: ElevenLabs "Venkatesh prof" (eleven_v4), one take: work/wedding-reel2/vo/narration.mp3 + words.json (Whisper),
// re-spaced with scene gaps (GAPS) into work/public/wedding2/narration.wav.
// Soft transition SFX: ElevenLabs Sound Effects (assets/music/wedding-reel2/LICENSE-NOTES.md).
// Proxies + Chrome bars: work/wedding-reel/proxy (projects/wedding-reel/clean_chrome.py). Music: assets/music/geetha.mp3 (user-supplied).
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const W = path.join(WORK, 'wedding-reel2');
const STAGE = path.join(PUBLIC_DIR, 'wedding2');
const output = abs(args.output ?? 'output/wedding-website-reel-2.mp4');
if (!args.still && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}

fs.mkdirSync(path.join(STAGE, 'sfx'), {recursive: true});
const PROXY = path.join(WORK, 'wedding-reel', 'proxy');
for (const s of ['A', 'B']) {
	fs.copyFileSync(path.join(PROXY, `site-${s}-clean.mp4`), path.join(STAGE, `site-${s}-clean.mp4`));
	for (const b of ['top', 'bot']) fs.copyFileSync(path.join(PROXY, `chrome-${b}-${s}.png`), path.join(STAGE, `chrome-${b}-${s}.png`));
}
fs.copyFileSync(abs('assets/music/geetha.mp3'), path.join(STAGE, 'music.mp3'));
for (const f of ['sweep', 'soft-swoosh', 'card-slide', 'soft-chime', 'air-whoosh', 'harp-reveal', 'silk-swish']) fs.copyFileSync(abs(`assets/music/wedding-reel2/sfx/${f}.mp3`), path.join(STAGE, 'sfx', `${f}.mp3`));
for (const f of ['light-sweep']) fs.copyFileSync(abs(`assets/music/wedding-reel/sfx/${f}.mp3`), path.join(STAGE, 'sfx', `${f}.mp3`));
fs.copyFileSync(abs('assets/music/vibelevel-screening/sfx/ui-click.mp3'), path.join(STAGE, 'sfx', 'ui-click.mp3'));

const vo = JSON.parse(fs.readFileSync(path.join(W, 'vo', 'words.json'), 'utf8'));
const LEAD = 0.25; // card lands before the first word
const END_HOLD = 3.0;

// Breathing room between scenes: extra silence (s) inserted before these words of the one-take VO
// (cut in the natural pause, midway between the previous word's end and this word's start).
const GAPS = [
	['And', 0, 0.35], // … into a website. | And here's what I built (beat of suspense)
	['A', 1, 0.8], // built. | A beautiful wedding website (let the reveal land)
	['with', 0, 0.25], // … lasts forever, | with a grand welcome (features begin)
	['every', 0, 0.3],
	['a', 2, 0.35], // a countdown (the 3rd lowercase "a"; the 4th is "a different couple")
	['And', 1, 0.8], // And here's another wedding website
	['Different', 0, 0.45],
	['different', 1, 0.2],
	['each', 0, 0.4],
	['Want', 0, 0.7],
	['DM', 0, 0.15],
];
const clean = (w) => w.replace(/[^A-Za-z']/g, '');
const cuts = GAPS.map(([word, k, gap]) => {
	const i = vo.words.map((w, j) => [w, j]).filter(([w]) => clean(w.w) === word)[k][1];
	return {i, at: (vo.words[i - 1].e + vo.words[i].s) / 2, gap};
}).sort((a, b) => a.at - b.at);
const shiftAt = (t) => cuts.filter((c) => c.at <= t).reduce((s, c) => s + c.gap, 0);
const words = vo.words.map((w) => ({w: w.w, s: Math.round((w.s + shiftAt(w.s)) * 1000) / 1000, e: Math.round((w.e + shiftAt(w.s)) * 1000) / 1000}));
const voDuration = vo.duration + cuts.reduce((s, c) => s + c.gap, 0);
// speech spans (reel time) for ducking the music; it breathes up in the scene gaps
const bounds = [0, ...cuts.map((c) => c.at), vo.duration];
const segments = bounds.slice(0, -1).map((a, j) => ({s: LEAD + a + shiftAt(a + 1e-6) + (j ? 0.05 : 0), e: LEAD + bounds[j + 1] + shiftAt(a + 1e-6) - 0.05}));
{
	const parts = bounds.slice(0, -1).map((a, j) => `[0]atrim=${a}:${bounds[j + 1]},asetpts=N/SR/TB,afade=t=in:d=0.01,afade=t=out:st=${(bounds[j + 1] - a - 0.012).toFixed(3)}:d=0.012[s${j}]`);
	const sil = cuts.map((c, j) => `aevalsrc=0:c=stereo:s=44100:d=${c.gap}[g${j}]`);
	const order = bounds.slice(0, -1).map((_, j) => (j ? `[g${j - 1}][s${j}]` : '[s0]')).join('');
	const n = bounds.length - 1 + cuts.length;
	run('ffmpeg', ['-v', 'error', '-y', '-i', path.join(W, 'vo', 'narration.mp3'), '-filter_complex', [...parts.map((p) => p.replace('[0]', '[0]aformat=sample_rates=44100:channel_layouts=stereo,')), ...sil, `${order}concat=n=${n}:v=0:a=1[out]`].join(';'), '-map', '[out]', path.join(STAGE, 'narration.wav')], {quiet: true});
}
const duration = Math.round((LEAD + voDuration + END_HOLD) * 100) / 100;
// Music: assets/music/geetha.mp3 from its top (its intro kicks in at 2.0 s, on "wedding invitation").
const musicOffset = 0;
const built = LEAD + words.find((w) => w.w.toLowerCase().startsWith('built')).s;

const props = {words, voDuration, lead: LEAD, duration, musicOffset, segments};
const propsFile = path.join(W, 'props.json');
fs.writeFileSync(propsFile, JSON.stringify(props));
console.log(`[reel2] ${duration}s, reveal ("built") at ${built.toFixed(2)}s, music offset ${musicOffset}s`);

const REMOTION = path.join(ROOT, 'node_modules/.bin/remotion');
if (args.still) {
	fs.mkdirSync(path.join(WORK, 'stills'), {recursive: true});
	for (const sec of String(args.still).split(',').map(Number)) {
		const out = path.join(WORK, 'stills', `wedding2-${sec.toFixed(2)}.png`);
		run(REMOTION, ['still', 'src/index.ts', 'WeddingReel2', out, `--props=${propsFile}`, `--frame=${Math.round(sec * 30)}`, ...(args.scale ? [`--scale=${args.scale}`] : [])], {quiet: true});
		console.log(`✔ ${rel(out)}`);
	}
} else {
	const raw = path.join(W, 'render-raw.mp4');
	run(REMOTION, ['render', 'src/index.ts', 'WeddingReel2', raw, `--props=${propsFile}`, '--codec=h264', '--crf=16', '--jpeg-quality=100', '--audio-codec=aac', '--audio-bitrate=256k']);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	console.log(`✔ rendered ${rel(output)}`);
}
