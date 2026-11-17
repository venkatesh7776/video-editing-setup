// npm run smoke-test — end-to-end check with a synthetic clip (macOS `say` voice
// over an FFmpeg test pattern). Everything is written to work/smoke/, so your
// input/, output/, captions/ and edits/ folders are untouched.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {probe, rel, ROOT, run, WORK} from './lib/common.mjs';

const dir = path.join(WORK, 'smoke');
fs.mkdirSync(dir, {recursive: true});
const speech = path.join(dir, 'speech.aiff');
const clip = path.join(dir, 'smoke-test.mp4');

console.log('[smoke] generating a 16:9 test clip with speech');
run('say', ['-o', speech, 'Hello and welcome. This is a quick test of the local video editing pipeline. Whisper writes the captions, and Remotion renders the final video.']);
const length = (probe(speech).duration + 1).toFixed(2);
run('ffmpeg', [
	'-hide_banner', '-loglevel', 'error', '-y',
	'-f', 'lavfi', '-i', 'testsrc2=size=1920x1080:rate=30',
	'-i', speech,
	'-filter_complex', '[1:a]apad[a]', '-map', '0:v', '-map', '[a]',
	'-t', length, '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '48000', clip,
]);

// Exercise the main edit features: a cut, a zoom, title, logo and background music.
const logo = path.join(dir, 'logo.png');
const music = path.join(dir, 'music.m4a');
run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0xFF4D4D:s=400x160,drawbox=x=20:y=20:w=360:h=120:color=white:t=8', '-frames:v', '1', logo]);
run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=220:duration=20', '-c:a', 'aac', music]);
const edit = {
	input: rel(clip),
	output: rel(path.join(dir, 'smoke-test-9x16.mp4')),
	format: '9:16',
	fit: 'auto',
	cuts: [{start: 4.3, end: 4.8, reason: 'test cut'}],
	zooms: [{start: 5, end: 7.5, scale: 1.3}],
	captions: {enabled: true, keywords: ['Remotion', 'Whisper']},
	logo: {src: rel(logo), position: 'top-right'},
	title: {text: 'Pipeline Test', subtitle: 'FFmpeg · Whisper · Remotion', duration: 2},
	music: {src: rel(music), volume: 0.05},
};
const editFile = path.join(dir, 'edit.json');
fs.writeFileSync(editFile, JSON.stringify(edit, null, 2));

const res = spawnSync(
	'node',
	['scripts/pipeline.mjs', '--edit', rel(editFile), '--overwrite', ...process.argv.slice(2)],
	{cwd: ROOT, stdio: 'inherit', env: {...process.env, VE_CAPTIONS_DIR: path.join(dir, 'captions')}},
);
process.exit(res.status ?? 1);
