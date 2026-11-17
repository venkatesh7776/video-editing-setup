// VibeLevel Screening — product demo v4 (16:9, ~1:30): the master-prompt structure (projects/vibelevel-v4/NOTES.md),
// the v3 voice and speed (ElevenLabs "Jessica Anne Bogart", eleven_v4, tempo 1.08) and V8's background music
// (Deep Urban from its V8 start point, 4.5 s). Review Session + report captures are blurred for confidentiality.
//   node projects/vibelevel-v4/build.mjs --stills 2,20,40 [--sheet x.jpg]      (30 fps preview)
//   node projects/vibelevel-v4/build.mjs [--fps 60] [--output output/…] [--overwrite]
// VO:   VO_VOICE=r1jZeb3rhKGAEf7YUiWg VO_CHAIN=1 VO_PARTS=projects/vibelevel-v4/vo-parts.json VO_OUT=work/vl4/vo \
//       .venv/bin/python -I projects/velora-film/tts.py
// Caps: CHROME_PATH=… VL_EMAIL=… VL_PASSWORD=… node projects/vibelevel-screening/capture-v4.mjs <session id>
//       then .venv-ai/bin/python -I projects/vibelevel-screening/blur_v4.py
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const W = path.join(WORK, 'vl4');
const STAGE = path.join(PUBLIC_DIR, 'vl2');
const fps = Number(args.fps ?? 30);
const output = abs(args.output ?? 'output/vibelevel-screening-demo-v4.mp4');
if (!args.stills && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}
const TEMPO = 1.08; // same calm read as v2: eleven_v4 at its natural pace + the same gentle 1.08 tempo
const GAP = {s1: 0.3, s2: 0.6, s3: 0.6, s4: 0.55, s5: 0.55, s6: 0.6, s7: 0.6, s8: 0.5, s9: 0.6};
const END_HOLD = 2.6; // end card (starts under the closing line)

const parts = JSON.parse(fs.readFileSync(abs('projects/vibelevel-v4/vo-parts.json'), 'utf8'));
fs.mkdirSync(path.join(STAGE, 'img'), {recursive: true});
fs.mkdirSync(path.join(STAGE, 'sfx'), {recursive: true});
fs.copyFileSync(abs('assets/music/vibelevel-screening/deep-urban.mp3'), path.join(STAGE, 'music-v4.mp3')); // V8's track
for (const f of fs.readdirSync(abs('assets/music/vibelevel-v2/sfx'))) if (f.endsWith('.mp3')) fs.copyFileSync(abs(`assets/music/vibelevel-v2/sfx/${f}`), path.join(STAGE, 'sfx', f));
// real product imagery (report crops are redacted; see projects/vibelevel-screening/screenshot-map.md)
const R = 'assets/images/vibelevel-screening/research';
const IMAGES = {
	'workspace.png': 'assets/images/Claude code screen.png',
	'ide-dark.png': `${R}/website/site-asset-claude-code-ide.png`,
	'logo.png': 'assets/logos/Frame 2147205620.png',
	'report-overview.png': `${R}/report-scenes/scene-07-report-overview.png`,
	'skill-scores.png': `${R}/report-scenes/scene-07-skill-scores.png`,
	'core-skills.png': `${R}/report-scenes/scene-06-core-skills.png`,
	'working-with-ai.png': `${R}/report-scenes/scene-06-working-with-ai.png`,
	'four-aspects.png': `${R}/report-scenes/scene-07-four-aspects-definition.png`,
	'human-contribution.png': `${R}/report-scenes/scene-07-human-contribution.png`,
	'code-review.png': `${R}/report-scenes/scene-07-code-review.png`,
	'video-qa.png': `${R}/report-scenes/scene-07-video-qa.png`,
	'interview-guide.png': `${R}/report-scenes/scene-07-interview-guide.png`,
	'interview-probes.png': `${R}/report-scenes/scene-07-interview-guide-probes.png`,
};
for (const [dst, src] of Object.entries(IMAGES)) fs.copyFileSync(abs(src), path.join(STAGE, 'img', dst));

let t = 0;
const timeline = parts.map((p) => {
	const vo = JSON.parse(fs.readFileSync(path.join(W, 'vo', `${p.id}.json`), 'utf8'));
	t += GAP[p.id];
	const start = t;
	t += vo.duration / TEMPO;
	return {id: p.id, start: +start.toFixed(3), end: +t.toFixed(3), words: vo.words.map((w) => ({w: w.w, s: +(start + w.s / TEMPO).toFixed(3), e: +(start + w.e / TEMPO).toFixed(3)}))};
});
const duration = +(t + END_HOLD).toFixed(2);
{
	const inputs = parts.flatMap((p) => ['-i', path.join(W, 'vo', `${p.id}.mp3`)]);
	const chains = parts.flatMap((p, i) => [`aevalsrc=0:c=stereo:s=44100:d=${GAP[p.id]}[g${i}]`, `[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo,atempo=${TEMPO}[a${i}]`]);
	const order = parts.map((_, i) => `[g${i}][a${i}]`).join('');
	run('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', `${chains.join(';')};${order}concat=n=${parts.length * 2}:v=0:a=1[out]`, '-map', '[out]', path.join(STAGE, 'narration-v4.wav')], {quiet: true});
}
// blurred Review Session / report captures (work/public/vl4/img, from blur_v4.py)
for (const f of fs.readdirSync(path.join(PUBLIC_DIR, 'vl4', 'img'))) fs.copyFileSync(path.join(PUBLIC_DIR, 'vl4', 'img', f), path.join(STAGE, 'img', `v4-${f}`));
// crisp pre-downscaled logo for the small top-left mark
fs.copyFileSync(abs('assets/logos/vibelevel-logo-240.png'), path.join(STAGE, 'img', 'logo-240.png'));
const props = {parts: timeline, duration, segments: timeline.map((p) => ({s: p.start, e: p.end})), fps, musicOffset: 4.5}; // V8 started Deep Urban at 4.5 s
const propsFile = path.join(W, 'props.json');
fs.writeFileSync(propsFile, JSON.stringify(props));
const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
console.log(`[vl4] ${fmt(duration)} @ ${fps} fps`);
for (const p of timeline) console.log(`  ${p.id.padEnd(4)} ${fmt(p.start)}–${fmt(p.end)}`);

if (args.stills) {
	run('node', ['scripts/analyze/stills.mjs', '--comp', 'VibeLevelV4', '--props', propsFile, '--times', String(args.stills), '--scale', String(args.scale ?? 0.5), ...(args.sheet ? ['--sheet', args.sheet, '--cols', String(args.cols ?? 4)] : [])]);
} else {
	const raw = path.join(W, 'render-raw.mp4');
	run(path.join(ROOT, 'node_modules/.bin/remotion'), ['render', 'src/index.ts', 'VibeLevelV4', raw, `--props=${propsFile}`, '--codec=h264', '--crf=16', '--jpeg-quality=100', '--audio-codec=aac', '--audio-bitrate=256k', ...(args.concurrency ? [`--concurrency=${args.concurrency}`] : [])]);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	console.log(`✔ rendered ${rel(output)}`);
}
