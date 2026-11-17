// Lip-syncs a portrait to voiceover clips with Wav2Lip (open-source, runs locally).
//   node scripts/avatar/lipsync.mjs --face assets/images/avatar/presenter.png \
//        --vo work/vibelevel-guide/vo --out work/vibelevel-guide/avatar --scenes intro,settings
// Wav2Lip shells out to ffmpeg with unquoted paths, so inputs are staged inside its
// folder and passed as relative paths (the project path contains spaces).
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, rel, ROOT, run} from '../lib/common.mjs';

const args = parseArgs();
const W2L = path.join(ROOT, '.cache/lipsync/Wav2Lip');
const PY = path.join(ROOT, '.venv-ai/bin/python');
const out = abs(args.out);
fs.mkdirSync(out, {recursive: true});
fs.mkdirSync(path.join(W2L, 'work'), {recursive: true});
fs.mkdirSync(path.join(W2L, 'temp'), {recursive: true});

// 512px face: plenty for a ~220px circle and much faster than full size.
run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', abs(args.face), '-vf', 'scale=512:512', path.join(W2L, 'work/face.png')]);

for (const id of String(args.scenes).split(',')) {
	fs.copyFileSync(path.join(abs(args.vo), `${id}.wav`), path.join(W2L, 'work/voice.wav'));
	console.log(`[lipsync] ${id}…`);
	const res = spawnSync(
		PY,
		['inference.py', '--checkpoint_path', 'checkpoints/wav2lip_gan.pth', '--face', 'work/face.png', '--audio', 'work/voice.wav',
			'--outfile', 'work/result.mp4', '--fps', '30', '--pads', '0', '20', '0', '0', '--resize_factor', '1'],
		{cwd: W2L, encoding: 'utf8', env: {...process.env, PYTORCH_ENABLE_MPS_FALLBACK: '1'}},
	);
	if (res.status !== 0 || !fs.existsSync(path.join(W2L, 'work/result.mp4'))) {
		console.error(res.stdout?.slice(-2000), res.stderr?.slice(-3000));
		process.exit(1);
	}
	// Re-encode to a clean H.264 clip (video only; the voice plays from the VO track).
	const dest = path.join(out, `${id}.mp4`);
	run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', path.join(W2L, 'work/result.mp4'), '-an', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '30', dest]);
	fs.rmSync(path.join(W2L, 'work/result.mp4'));
	console.log(`[lipsync] ✔ ${rel(dest)}`);
}
