// Digital Wedding Memories — QR feature reel (1080×1920, 9:16, ~43 s).
// Design system: Royal Indian Heritage × Modern Luxury (maroon / burgundy / ivory / antique gold,
// Cormorant Garamond + Inter, lotus divider, kolam, mandala, zari band, temple arch) — see NOTES.md.
//   node projects/qr-memories/build.mjs --stills 2,10,20 [--sheet x.jpg] [--cols 4]
//   node projects/qr-memories/build.mjs [--output output/…] [--overwrite]
// VO:   VO_VOICE=tTOItPrSr0E55YV4Jskp VO_CHAIN=1 VO_PARTS=projects/qr-memories/vo-parts.json VO_OUT=work/qr/vo \
//       .venv/bin/python -I projects/velora-film/tts.py            ("Venkatesh prof", eleven_v4, stability 0.5, similarity 1.0)
// Footage proxies + artwork live in work/public/qr (see NOTES.md for how they were made).
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const W = path.join(WORK, 'qr');
const STAGE = path.join(PUBLIC_DIR, 'qr');
const output = abs(args.output ?? 'output/digital-wedding-memories.mp4');
if (!args.stills && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}
const LEAD = 0.45;
// silence before each line (s): room for the scene changes
const GAP = {q1: LEAD, q2: 0.3, q3: 0.4, q4: 0.5, q5: 0.5, q6: 0.5, q7: 0.45};
const END_HOLD = 3.0;

const parts = JSON.parse(fs.readFileSync(abs('projects/qr-memories/vo-parts.json'), 'utf8'));
fs.copyFileSync(abs('assets/music/geetha.mp3'), path.join(STAGE, 'music.mp3')); // wedding-website-reel-2-v4's track, from 0 s

// Whisper spellings → the script's words (the audio says "too? DM me")
const FIX = {q7: {to: 'too?', DME: 'DM me'}};
let t = 0;
const timeline = parts.map((p) => {
	const vo = JSON.parse(fs.readFileSync(path.join(W, 'vo', `${p.id}.json`), 'utf8'));
	t += GAP[p.id];
	const start = t;
	t += vo.duration;
	return {id: p.id, start: +start.toFixed(3), end: +t.toFixed(3), words: vo.words.map((w) => ({w: FIX[p.id]?.[w.w] ?? w.w, s: +(start + w.s).toFixed(3), e: +(start + w.e).toFixed(3)}))};
});
const duration = +(t + END_HOLD).toFixed(2);
{
	const inputs = parts.flatMap((p) => ['-i', path.join(W, 'vo', `${p.id}.mp3`)]);
	const chains = parts.flatMap((p, i) => [`aevalsrc=0:c=stereo:s=44100:d=${GAP[p.id]}[g${i}]`, `[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo[a${i}]`]);
	const order = parts.map((_, i) => `[g${i}][a${i}]`).join('');
	run('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', `${chains.join(';')};${order}concat=n=${parts.length * 2}:v=0:a=1[out]`, '-map', '[out]', path.join(STAGE, 'narration.wav')], {quiet: true});
}
const props = {parts: timeline, duration, segments: timeline.map((p) => ({s: p.start, e: p.end})), musicOffset: 0};
const propsFile = path.join(W, 'props.json');
fs.writeFileSync(propsFile, JSON.stringify(props));
console.log(`[qr] ${duration}s`);
for (const p of timeline) console.log(`  ${p.id} ${p.start.toFixed(2)}–${p.end.toFixed(2)}`);

if (args.stills) {
	run('node', ['scripts/analyze/stills.mjs', '--comp', 'QrMemories', '--props', propsFile, '--times', String(args.stills), '--scale', String(args.scale ?? 0.5), ...(args.sheet ? ['--sheet', args.sheet, '--cols', String(args.cols ?? 4)] : [])]);
} else {
	const raw = path.join(W, 'render-raw.mp4');
	run(path.join(ROOT, 'node_modules/.bin/remotion'), ['render', 'src/index.ts', 'QrMemories', raw, `--props=${propsFile}`, '--codec=h264', '--crf=16', '--jpeg-quality=100', '--audio-codec=aac', '--audio-bitrate=256k']);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	console.log(`✔ rendered ${rel(output)}`);
}
