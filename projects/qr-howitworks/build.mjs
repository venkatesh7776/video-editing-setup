// The Digital Moments — "How Moments QR works" (1920×1080, 16:9, ~1:30) for YouTube.
// Brand: The Digital Moments (landing page the-digital-moments.vercel.app): blush ivory, warm near-black, gold gradient,
// Manrope; gold "Dm" logo. Founder intro (Venkatesh Yarramsetti). See NOTES.md.
//   node projects/qr-howitworks/build.mjs --stills 2,10,20 [--sheet x.jpg] [--cols 4]
//   node projects/qr-howitworks/build.mjs [--output output/…] [--overwrite]
// VO:   VO_VOICE=XWBnHn9U9jH8OYZ1nfdO VO_CHAIN=1 VO_PARTS=projects/qr-howitworks/vo-parts.json VO_OUT=work/qrh/vo \
//       .venv/bin/python -I projects/velora-film/tts.py      ("Prashant Nair – Warm Indian Narrator", eleven_multilingual_v2, stability 0.55)
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const W = path.join(WORK, 'qrh');
const STAGE = path.join(PUBLIC_DIR, 'qrh');
const output = abs(args.output ?? 'output/moments-qr-how-it-works.mp4');
if (!args.stills && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}
const GAP = {h0: 2.6, h1: 1.4, h2: 0.7, h3: 0.7, h4: 1.9, h5: 0.7}; // h0: the logo plays first; h4: room for Share → Sent
const END_HOLD = 4.5;

const parts = JSON.parse(fs.readFileSync(abs('projects/qr-howitworks/vo-parts.json'), 'utf8'));
// geetha.mp3 is only 41.5 s: loop it with a 3 s crossfade so it runs under the whole film
run('ffmpeg', ['-v', 'error', '-y', '-i', abs('assets/music/geetha.mp3'), '-i', abs('assets/music/geetha.mp3'), '-i', abs('assets/music/geetha.mp3'), '-filter_complex', '[0][1]acrossfade=d=3:c1=tri:c2=tri[a];[a][2]acrossfade=d=3:c1=tri:c2=tri', path.join(STAGE, 'music.wav')], {quiet: true});

// Each ElevenLabs take ends with a click/breath right after the last word: keep 0.4 s past the last word, fade out softly.
const TAIL = 0.4;
const FADE = 0.22;
const clip = (vo) => +Math.min(vo.duration, vo.words[vo.words.length - 1].e + TAIL).toFixed(3);
const voOf = (p) => JSON.parse(fs.readFileSync(path.join(W, 'vo', `${p.id}.json`), 'utf8'));
let t = 0;
const timeline = parts.map((p) => {
	const vo = JSON.parse(fs.readFileSync(path.join(W, 'vo', `${p.id}.json`), 'utf8'));
	t += GAP[p.id];
	const start = t;
	t += clip(vo);
	return {id: p.id, start: +start.toFixed(3), end: +t.toFixed(3), words: vo.words.map((w) => ({w: w.w, s: +(start + w.s).toFixed(3), e: +(start + w.e).toFixed(3)}))};
});
const duration = +(t + END_HOLD).toFixed(2);
{
	const inputs = parts.flatMap((p) => ['-i', path.join(W, 'vo', `${p.id}.mp3`)]);
	const chains = parts.flatMap((p, i) => [`aevalsrc=0:c=stereo:s=44100:d=${GAP[p.id]}[g${i}]`, `[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:${clip(voOf(p))},asetpts=N/SR/TB,afade=t=out:st=${(clip(voOf(p)) - FADE).toFixed(3)}:d=${FADE}[a${i}]`]);
	const order = parts.map((_, i) => `[g${i}][a${i}]`).join('');
	run('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', `${chains.join(';')};${order}concat=n=${parts.length * 2}:v=0:a=1[out]`, '-map', '[out]', path.join(STAGE, 'narration.wav')], {quiet: true});
}
const props = {parts: timeline, duration, segments: timeline.map((p) => ({s: p.start, e: p.end})), musicOffset: 0};
const propsFile = path.join(W, 'props.json');
fs.writeFileSync(propsFile, JSON.stringify(props));
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
console.log(`[qrh] ${duration}s`);
for (const p of timeline) console.log(`  ${p.id} ${fmt(Math.max(0, p.start - 0.5))}  ${p.words.slice(0, 4).map((w) => w.w).join(' ')}…`);

if (args.stills) {
	run('node', ['scripts/analyze/stills.mjs', '--comp', 'MomentsQrHowItWorks', '--props', propsFile, '--times', String(args.stills), '--scale', String(args.scale ?? 0.5), ...(args.sheet ? ['--sheet', args.sheet, '--cols', String(args.cols ?? 4)] : [])]);
} else {
	const raw = path.join(W, 'render-raw.mp4');
	run(path.join(ROOT, 'node_modules/.bin/remotion'), ['render', 'src/index.ts', 'MomentsQrHowItWorks', raw, `--props=${propsFile}`, '--codec=h264', '--crf=16', '--jpeg-quality=100', '--audio-codec=aac', '--audio-bitrate=256k']);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	console.log(`✔ rendered ${rel(output)}`);
}
