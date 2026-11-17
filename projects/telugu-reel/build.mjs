// The Digital Moments — Telugu storytelling reel for the wedding website (1080×1920 design, rendered ×2 → 2160×3840, 30 fps).
// Plan + assets: projects/telugu-reel/ (gen.py = Veo/Gemini assets, key.py = graphics alpha, lines.json = Telugu script).
// Talking clips: Veo 3.1 (Telugu speech, lip-synced) → ElevenLabs voice changer (Sravya = Deepti, Divya = Mouni).
// Narration: ElevenLabs eleven_v3 TTS (Mouni) over the WhatsApp + website recordings. BGM: Kalyanam Vybhogam from 0:06.
//   node projects/telugu-reel/build.mjs --stills 1,10 [--sheet x.jpg]      node projects/telugu-reel/build.mjs [--output …] [--overwrite]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const W = path.join(WORK, 'telugu-reel');
const STAGE = path.join(PUBLIC_DIR, 'tel');
const output = abs(args.output ?? 'output/telugu-wedding-website-reel-4k.mp4');
if (!args.stills && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}
fs.mkdirSync(path.join(STAGE, 'v'), {recursive: true});
fs.mkdirSync(path.join(STAGE, 'a'), {recursive: true});
const dur = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const R = abs('telugu reel');
fs.copyFileSync(path.join(R, 'Record_2026-11-16-23-46-20_6012fa4d4ddec268fc5c7112cbb265e7.mp4'), path.join(STAGE, 'v', 'wa.mp4'));
fs.copyFileSync(path.join(R, 'Record_2026-11-16-23-47-16_40deb401b9ffe8e1df2f1cc5ba480b12.mp4'), path.join(STAGE, 'v', 'site.mp4'));
fs.copyFileSync(abs('work/public/temple/tdm-logo.png'), path.join(STAGE, 'tdm-logo.png'));
// BGM from 0:06 (the first 6 s of the file are a stray voice)
run('ffmpeg', ['-v', 'error', '-y', '-ss', '6', '-i', path.join(R, 'Kalyanam Vybhogam Lyrical _ Srinivasa Kalyanam Songs _ Nithiin, Raashi Khanna - (320 Kbps) (1).mp3'), '-vn', '-t', '120', '-ac', '2', '-ar', '48000', path.join(STAGE, 'a', 'bgm.wav')]);
// talking clips (v2: conversation angles — Sravya looks right, Divya looks left; CTA to camera):
// Veo video (muted) + voice-changed speech, cut from the first word to ~0.3 s after the last ([file, in, out])
const TALK = {l1: ['l1b', 0.12, 6.85], l2: ['l2b', 0.0, 5.55], l3: ['l3b', 0.0, 5.6], l4: ['l4c', 0.25, 7.5], cta1: ['cta1b', 0.15, 4.95], cta2: ['cta2b', 0.0, 6.6]};
for (const [id, [src, a, b]] of Object.entries(TALK)) {
	fs.copyFileSync(path.join(W, 'gen', `${src}.mp4`), path.join(STAGE, 'v', `${src}.mp4`));
	run('ffmpeg', ['-v', 'error', '-y', '-ss', String(a), '-t', String(+(b - a).toFixed(3)), '-i', path.join(W, 'sts', `${src}.mp3`), '-af', 'afade=t=out:st=' + Math.max(0, b - a - 0.12).toFixed(3) + ':d=0.12,highpass=f=80,acompressor=threshold=-20dB:ratio=2:attack=10:release=150,loudnorm=I=-16:TP=-2', '-ar', '48000', path.join(STAGE, 'a', `${id}.wav`)]);
}
// narration: trim edge silence, shrink long pauses, a touch faster
const N = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'];
const nd = {};
for (const id of N) {
	const f = path.join(STAGE, 'a', `${id}.wav`);
	run('ffmpeg', ['-v', 'error', '-y', '-i', path.join(W, 'vo', `${id}.mp3`), '-af', ['silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05', 'areverse', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12', 'areverse', 'silenceremove=stop_periods=-1:stop_duration=0.3:stop_threshold=-45dB:stop_silence=0.22', 'atempo=1.07', 'highpass=f=80', 'acompressor=threshold=-20dB:ratio=2:attack=10:release=150', 'loudnorm=I=-16:TP=-2'].join(','), '-ar', '48000', f]);
	nd[id] = +dur(f).toFixed(3);
}
// timeline
const seq = [];
let t = 0;
const push = (id, kind, d, gap = 0) => {
	t += gap;
	seq.push({id, kind, start: +t.toFixed(3), dur: +d.toFixed(3), ...(TALK[id] ? {src: TALK[id][0], in: TALK[id][1]} : {})});
	t += d;
};
push('l1', 'talk', TALK.l1[2] - TALK.l1[1], 0.1);
push('l2', 'talk', TALK.l2[2] - TALK.l2[1], 0.05);
push('l3', 'talk', TALK.l3[2] - TALK.l3[1], 0.05);
push('l4', 'talk', TALK.l4[2] - TALK.l4[1], 0.05);
for (const id of N) push(id, 'narr', nd[id], id === 'n1' ? 0.35 : 0.22);
push('cta1', 'talk', TALK.cta1[2] - TALK.cta1[1], 0.4);
push('cta2', 'talk', TALK.cta2[2] - TALK.cta2[1], 0.05);
const END = 3.6;
const duration = +(t + END).toFixed(2);
const props = {seq, duration, end: +t.toFixed(3)};
fs.writeFileSync(path.join(W, 'props.json'), JSON.stringify(props));
console.log(`[telugu] ${duration}s`);
for (const s of seq) console.log(`  ${s.id.padEnd(5)} ${s.start.toFixed(2)}–${(s.start + s.dur).toFixed(2)}`);

const REMOTION = path.join(ROOT, 'node_modules/.bin/remotion');
if (args.stills) {
	run('node', ['scripts/analyze/stills.mjs', '--comp', 'TeluguReel', '--props', path.join(W, 'props.json'), '--times', String(args.stills), '--scale', String(args.scale ?? 0.5), ...(args.sheet ? ['--sheet', args.sheet, '--cols', String(args.cols ?? 4)] : [])]);
} else {
	const raw = path.join(W, 'render-raw.mp4');
	run(REMOTION, ['render', 'src/index.ts', 'TeluguReel', raw, `--props=${path.join(W, 'props.json')}`, '--scale=2', '--codec=h264', '--crf=16', '--jpeg-quality=95', '--audio-codec=aac', '--audio-bitrate=320k']);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	console.log(`✔ rendered ${rel(output)}`);
}
