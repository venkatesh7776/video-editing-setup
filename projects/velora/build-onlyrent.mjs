// OnlyRent edition of the core explainer: same scenes/animation as build.mjs, rebranded (Velora → OnlyRent in visuals
// and VO), re-voiced with ElevenLabs "Vikram S", and a final CTA "Join the Waitlist Now".
//   node projects/velora/build-onlyrent.mjs [--stills 34,40,72 --sheet x.jpg] [--fps 60] [--output …] [--overwrite]
// VO: VO_PARTS=projects/velora/vo-onlyrent-parts.json VO_OUT=work/velora/vo-onlyrent .venv/bin/python -I projects/velora-film/tts.py
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const STAGE = path.join(PUBLIC_DIR, 'velora');
const VO = path.join(WORK, 'velora/vo-onlyrent');
const fps = Number(args.fps ?? 60);
const output = abs(args.output ?? 'output/velora-explainer-onlyrent.mp4');
if (!args.stills && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}
fs.mkdirSync(path.join(STAGE, 'sfx'), {recursive: true});
fs.copyFileSync(abs('assets/music/velora/piano-reflections.mp3'), path.join(STAGE, 'music.mp3'));
for (const f of fs.readdirSync(abs('assets/music/velora/sfx'))) if (f.endsWith('.mp3')) fs.copyFileSync(abs(`assets/music/velora/sfx/${f}`), path.join(STAGE, 'sfx', f));

const parts = JSON.parse(fs.readFileSync(abs('projects/velora/vo-onlyrent-parts.json'), 'utf8'));
const GAP = [0.6, 0.6, 0.6, 1.0, 0.8, 0.6, 0.6, 0.8]; // same breathing as the original cut, before each scene line
const END_HOLD = 4.2; // end card + "Join the Waitlist Now" CTA

let t = 0;
const timeline = parts.map((p, i) => {
	const vo = JSON.parse(fs.readFileSync(path.join(VO, `${p.id}.json`), 'utf8'));
	t += GAP[i];
	const start = t;
	t += vo.duration;
	return {start, end: t, words: vo.words.map((w) => ({w: w.w, s: start + w.s}))};
});
const voEnd = +t.toFixed(3);
const duration = +(t + END_HOLD).toFixed(2);
{
	const inputs = parts.flatMap((p) => ['-i', path.join(VO, `${p.id}.mp3`)]);
	const chains = parts.flatMap((p, i) => [`aevalsrc=0:c=stereo:s=44100:d=${GAP[i]}[g${i}]`, `[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo[a${i}]`]);
	const order = parts.map((_, i) => `[g${i}][a${i}]`).join('');
	run('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', `${chains.join(';')};${order}concat=n=${parts.length * 2}:v=0:a=1[out]`, '-map', '[out]', path.join(STAGE, 'narration-onlyrent.wav')], {quiet: true});
}

// The scenes are keyed by word index into the original take (work/velora/vo/words.json); map each index onto the new
// voice (greedy match on normalised words, unmatched ones such as "Velora" → "OnlyRent" interpolated).
const norm = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const old = JSON.parse(fs.readFileSync(path.join(WORK, 'velora/vo/words.json'), 'utf8')).words;
const fresh = timeline.flatMap((p) => p.words);
const T = [];
let j = 0;
for (let i = 0; i < old.length; i++) {
	const k = norm(old[i].w);
	let hit = -1;
	for (let d = 0; d < 6 && j + d < fresh.length; d++) if (k && (norm(fresh[j + d].w) === k || norm(fresh[j + d].w).startsWith(k))) { hit = j + d; break; }
	if (hit >= 0) { T[i] = fresh[hit].s; j = hit + 1; } else T[i] = null;
}
for (let i = 0; i < T.length; i++) if (T[i] === null) {
	let a = i - 1; while (a >= 0 && T[a] === null) a--;
	let b = i + 1; while (b < T.length && T[b] === null) b++;
	const ta = a >= 0 ? T[a] : 0;
	const tb = b < T.length ? T[b] : ta + 0.3;
	T[i] = ta + ((tb - ta) * (i - a)) / (b - a);
}
const words = old.map((w, i) => ({w: w.w, s: +T[i].toFixed(3), e: +(T[i] + 0.3).toFixed(3)}));
const props = {
	words, lead: 0, duration, voEnd, fps,
	segments: timeline.map((p) => ({s: +p.start.toFixed(3), e: +p.end.toFixed(3)})),
	musicOffset: +(32.0 - T[77]).toFixed(3), // Piano Reflections' bass entrance on "What if…"
	brand: {name: 'OnlyRent', mark: 'o'},
	cta: 'Join the Waitlist Now',
	narration: 'velora/narration-onlyrent.wav',
	musicGain: 1.9, // this voice is ~6 dB louder than the original take: keep music and SFX in the same balance
	sfxGain: 1.6,
};
const propsFile = path.join(WORK, 'velora/props-onlyrent.json');
fs.writeFileSync(propsFile, JSON.stringify(props));
console.log(`[onlyrent] ${duration}s @ ${fps} fps; "Introducing" at ${T[93].toFixed(2)}s, end card at ${T[177].toFixed(2)}s`);

if (args.stills) {
	run('node', ['scripts/analyze/stills.mjs', '--comp', 'Velora', '--props', propsFile, '--times', String(args.stills), '--scale', String(args.scale ?? 0.5), ...(args.sheet ? ['--sheet', args.sheet, '--cols', String(args.cols ?? 4)] : [])]);
} else {
	const raw = path.join(WORK, 'velora/render-onlyrent.mp4');
	run(path.join(ROOT, 'node_modules/.bin/remotion'), ['render', 'src/index.ts', 'Velora', raw, `--props=${propsFile}`, '--codec=h264', '--crf=16', '--jpeg-quality=100', '--audio-codec=aac', '--audio-bitrate=256k', ...(args.concurrency ? [`--concurrency=${args.concurrency}`] : [])]);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	console.log(`✔ rendered ${rel(output)}`);
}
