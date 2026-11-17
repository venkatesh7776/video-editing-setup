// SaaS landing-page redesign reel (1080×1920, 9:16, 30 fps) — style of `refernce videos/savefromins…DM us!…mp4`.
// VO: polished audios v2 (real voice, warm/de-essed master) (01–05), captions = the user's script (vo.json).
// Talking heads: Raw footage for 1st reel/1–4.MOV, graded by grade.py (work/redesign/graded), lip-synced via sync.json.
//   node projects/redesign-reel/build.mjs --stills 2,10,20 [--sheet x.jpg --cols 4]
//   node projects/redesign-reel/build.mjs [--output output/…] [--overwrite]
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const W = path.join(WORK, 'redesign');
const STAGE = path.join(PUBLIC_DIR, 'rd');
const output = abs(args.output ?? 'output/saas-redesign-reel.mp4');
if (!args.stills && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}
const vo = JSON.parse(fs.readFileSync(abs('projects/redesign-reel/vo3.json'), 'utf8')); // build_audio.py: voice-changed (user prefers this over the TTS of v4)
const sync = JSON.parse(fs.readFileSync(abs('projects/redesign-reel/sync.json'), 'utf8'));
for (const n of ['1', '2', '3', '4']) fs.copyFileSync(path.join(W, 'graded', `${n}.mp4`), path.join(STAGE, `talk${n}.mp4`));

const GAP = {'01': 0, '02': 0.45, '03': 0.03, '04': 0.06, '05': 0.06}; // VO at frame 0; hook held ≥0.5 s after "experience"; problems right after "Here's how"
const END_HOLD = 0.55;
let t = 0;
const parts = vo.map((p) => {
	t += GAP[p.id];
	const start = t;
	t += p.duration;
	const s = sync[p.id];
	return {id: p.id, start: +start.toFixed(3), end: +t.toFixed(3), duration: p.duration, clip: s ? s.clip.replace('.MOV', '') : null, offset: p.id === '02' ? 7.88 : s ? s.offset : 0, segs: p.id === '02' ? [] : s ? s.segs : [], chunks: p.chunks ?? [], words: p.words.map((w) => ({w: w.w, s: +(start + w.s).toFixed(3), e: +(start + w.e).toFixed(3)}))};
});
const duration = +(t + END_HOLD).toFixed(2);
const props = {parts, duration};
const propsFile = path.join(W, 'props.json');
fs.writeFileSync(propsFile, JSON.stringify(props));
console.log(`[redesign] ${duration}s`);
for (const p of parts) console.log(`  ${p.id} ${p.start.toFixed(2)}–${p.end.toFixed(2)}  ${p.clip ?? '—'}`);

const REMOTION = path.join(ROOT, 'node_modules/.bin/remotion');
if (args.stills) {
	run('node', ['scripts/analyze/stills.mjs', '--comp', 'RedesignReel', '--props', propsFile, '--times', String(args.stills), '--scale', String(args.scale ?? 0.5), ...(args.sheet ? ['--sheet', args.sheet, '--cols', String(args.cols ?? 4)] : [])]);
} else {
	const raw = path.join(W, 'render-raw.mp4');
	run(REMOTION, ['render', 'src/index.ts', 'RedesignReel', raw, `--props=${propsFile}`, '--codec=h264', '--crf=15', '--jpeg-quality=95', '--audio-codec=aac', '--audio-bitrate=320k']);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-16']); // softer than −14 (user: voice too loud)
	console.log(`✔ rendered ${rel(output)}`);
}
