// Builds the VibeLevel Aura user-guide video.
//   node projects/vibelevel-guide/build.mjs [--tts] [--avatar] [--still 1234] [--output output/x.mp4] [--overwrite]
// --avatar regenerates the lip-synced presenter clips.
// 1. Kokoro voiceover (only if missing, or --tts)  2. music bed  3. stage assets
// 4. write props + SRT  5. render with Remotion
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, PYTHON, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const HERE = 'projects/vibelevel-guide';
const VO = path.join(WORK, 'vibelevel-guide/vo');
const STAGE = path.join(PUBLIC_DIR, 'vibelevel-guide');
const output = abs(args.output ?? 'output/vibelevel-aura-user-guide.mp4');

if (!args.still && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}

if (args.tts || !fs.existsSync(path.join(VO, 'timeline.json'))) {
	run(PYTHON, ['scripts/tts/kokoro_tts.py', `${HERE}/narration.json`, '--out', VO]);
}
const music = abs('assets/music/vibelevel-ambient.wav');
if (!fs.existsSync(music)) run(PYTHON, ['scripts/audio/ambient_music.py', '--seconds', '140', '--out', music]);

// Stage everything Remotion needs into its public dir.
for (const d of ['img', 'vo']) fs.mkdirSync(path.join(STAGE, d), {recursive: true});
for (const f of fs.readdirSync(abs('assets/images/vibelevel'))) fs.copyFileSync(abs(`assets/images/vibelevel/${f}`), path.join(STAGE, 'img', f));
for (const f of fs.readdirSync(VO).filter((f) => f.endsWith('.wav') && f !== 'all.wav')) fs.copyFileSync(path.join(VO, f), path.join(STAGE, 'vo', f));
fs.copyFileSync(music, path.join(STAGE, 'music.wav'));

const timeline = JSON.parse(fs.readFileSync(path.join(VO, 'timeline.json'), 'utf8'));

// Lip-synced presenter clips for the scenes where the avatar appears.
// Avatar removed at the user's request; list scene ids here to bring it back.
const AVATAR_SCENES = [];
const AVATAR_FACE = 'assets/images/avatar/presenter.png';
const AVATAR_DIR = path.join(WORK, 'vibelevel-guide/avatar');
const missing = AVATAR_SCENES.filter((id) => args['avatar'] || !fs.existsSync(path.join(AVATAR_DIR, `${id}.mp4`)));
if (missing.length && fs.existsSync(abs(AVATAR_FACE))) {
	run('node', ['scripts/avatar/lipsync.mjs', '--face', AVATAR_FACE, '--vo', VO, '--out', AVATAR_DIR, '--scenes', missing.join(',')]);
}
fs.mkdirSync(path.join(STAGE, 'avatar'), {recursive: true});
const avatarScenes = AVATAR_SCENES.filter((id) => fs.existsSync(path.join(AVATAR_DIR, `${id}.mp4`)));
for (const id of avatarScenes) fs.copyFileSync(path.join(AVATAR_DIR, `${id}.mp4`), path.join(STAGE, 'avatar', `${id}.mp4`));
const propsFile = path.join(WORK, 'vibelevel-guide/props.json');
fs.writeFileSync(propsFile, JSON.stringify({timeline, avatarScenes}));

// Subtitle file (same timings as the burned-in subtitles), for YouTube/LinkedIn uploads.
const FPS = 30, TRANSITION = 12, LEAD = 0.4, TAIL = 0.6, EXTRA_LEAD = {intro: 0.9}, EXTRA_TAIL = {outro: 2.2}; // mirror src/compositions/vibelevel/timing.ts
const ts = (sec) => new Date(Math.max(0, sec) * 1000).toISOString().slice(11, 23).replace('.', ',');
let from = 0;
const cues = [];
timeline.order.forEach((id, i) => {
	const s = timeline.scenes[id];
	const last = i === timeline.order.length - 1;
	const lead = LEAD + (EXTRA_LEAD[id] ?? 0);
	const frames = Math.ceil((lead + s.duration + TAIL + (EXTRA_TAIL[id] ?? 0)) * FPS) + (last ? 0 : TRANSITION);
	const voStart = (from + Math.round(lead * FPS)) / FPS;
	for (const c of s.chunks) cues.push({text: c.text, start: voStart + c.start, end: voStart + c.end});
	from += frames - (last ? 0 : TRANSITION);
});
const srt = cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join('\n');
const srtPath = abs('captions/subtitles/vibelevel-aura-user-guide.srt');
fs.writeFileSync(srtPath, srt);
console.log(`[subtitles] ${cues.length} cues → ${rel(srtPath)}`);

const REMOTION = path.join(ROOT, 'node_modules/.bin/remotion');
if (args.still) {
	const out = path.join(WORK, 'stills', `guide-${args.still}.png`);
	run(REMOTION, ['still', 'src/index.ts', 'VibeLevelGuide', out, `--props=${propsFile}`, `--frame=${args.still}`], {quiet: true});
	console.log(`✔ ${rel(out)}`);
} else {
	const raw = path.join(WORK, 'vibelevel-guide/render-raw.mp4');
	run(REMOTION, ['render', 'src/index.ts', 'VibeLevelGuide', raw, `--props=${propsFile}`, '--codec=h264', '--crf=18', '--audio-codec=aac', '--audio-bitrate=192k']);
	// Bring the mix to -16 LUFS for YouTube/social playback (video stream copied).
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-16']);
	console.log(`✔ rendered ${rel(output)}`);
}
