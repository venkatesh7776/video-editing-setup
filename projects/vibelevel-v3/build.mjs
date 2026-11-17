// VibeLevel Screening — product demo v3 (16:9, ~1:30): the user's 90-second script, US voice (ElevenLabs
// "Jessica Anne Bogart", r1jZeb3rhKGAEf7YUiWg) with v2's calm read (eleven_v4, tempo 1.08), v2's look
// with the user's corrections (projects/vibelevel-v3/NOTES.md).
//   node projects/vibelevel-v3/build.mjs --stills 2,20,40 [--sheet x.jpg]      (30 fps preview)
//   node projects/vibelevel-v3/build.mjs [--fps 60] [--output output/…] [--overwrite]
// VO: VO_VOICE=r1jZeb3rhKGAEf7YUiWg VO_CHAIN=1 VO_PARTS=projects/vibelevel-v3/vo-parts.json VO_OUT=work/vl3/vo \
//     .venv/bin/python -I projects/velora-film/tts.py
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const W = path.join(WORK, 'vl3');
const STAGE = path.join(PUBLIC_DIR, 'vl2');
const fps = Number(args.fps ?? 30);
const output = abs(args.output ?? 'output/vibelevel-screening-demo-v3.mp4');
if (!args.stills && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}
const TEMPO = 1.08; // same calm read as v2: eleven_v4 at its natural pace + the same gentle 1.08 tempo
const GAP = {s1: 0.4, s2: 0.8, s3: 0.7, s4a: 0.7, s4b: 0.5, s4c: 0.4, s4d: 0.4, s4e: 0.4, s5: 0.7, s6: 0.7, s7a: 0.7, s7b: 0.5};
const END_HOLD = 3.0; // end card: logo + Book a Demo

const parts = JSON.parse(fs.readFileSync(abs('projects/vibelevel-v3/vo-parts.json'), 'utf8'));
fs.mkdirSync(path.join(STAGE, 'img'), {recursive: true});
fs.mkdirSync(path.join(STAGE, 'sfx'), {recursive: true});
fs.copyFileSync(abs('assets/music/vibelevel-v2/digital-clouds.mp3'), path.join(STAGE, 'music.mp3'));
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
	run('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', `${chains.join(';')};${order}concat=n=${parts.length * 2}:v=0:a=1[out]`, '-map', '[out]', path.join(STAGE, 'narration-v3.wav')], {quiet: true});
}
// crisp pre-downscaled logo for the small top-left mark
fs.copyFileSync(abs('assets/logos/vibelevel-logo-240.png'), path.join(STAGE, 'img', 'logo-240.png'));
const props = {parts: timeline, duration, segments: timeline.map((p) => ({s: p.start, e: p.end})), fps, musicOffset: 0};
const propsFile = path.join(W, 'props.json');
fs.writeFileSync(propsFile, JSON.stringify(props));
const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
console.log(`[vl3] ${fmt(duration)} @ ${fps} fps`);
for (const p of timeline) console.log(`  ${p.id.padEnd(4)} ${fmt(p.start)}–${fmt(p.end)}`);

if (args.stills) {
	run('node', ['scripts/analyze/stills.mjs', '--comp', 'VibeLevelV3', '--props', propsFile, '--times', String(args.stills), '--scale', String(args.scale ?? 0.5), ...(args.sheet ? ['--sheet', args.sheet, '--cols', String(args.cols ?? 4)] : [])]);
} else {
	const raw = path.join(W, 'render-raw.mp4');
	run(path.join(ROOT, 'node_modules/.bin/remotion'), ['render', 'src/index.ts', 'VibeLevelV3', raw, `--props=${propsFile}`, '--codec=h264', '--crf=16', '--jpeg-quality=100', '--audio-codec=aac', '--audio-bitrate=256k', ...(args.concurrency ? [`--concurrency=${args.concurrency}`] : [])]);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	console.log(`✔ rendered ${rel(output)}`);
}
