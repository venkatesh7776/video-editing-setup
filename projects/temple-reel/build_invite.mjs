// The Digital Moments — digital video invitation reel (2160×3840, 9:16, 30 fps, ~42 s). Composition `InviteReel`
// (src/compositions/temple/InviteReel.tsx): temple-reel countdown intro with an iPhone 15 mockup → the invitation
// grows to full screen and plays 35 s (muted) → CTA card. Soundtrack: Raw footage for wedding reel/ReelAudio-18190.mp3.
//   node projects/temple-reel/build_invite.mjs [--output output/…] [--overwrite] [--stills 1,4,20]
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const W = path.join(WORK, 'invite-reel');
const STAGE = path.join(PUBLIC_DIR, 'invite');
const output = abs(args.output ?? 'output/digital-video-invitation-reel-4k.mp4');
if (!args.stills && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}
fs.mkdirSync(W, {recursive: true});
fs.mkdirSync(STAGE, {recursive: true});
fs.copyFileSync(abs('Raw footage for wedding reel/goldy-ritu-wedding-invitation-whatsapp copy.mp4'), path.join(STAGE, 'invite.mp4'));
fs.copyFileSync(abs('Raw footage for wedding reel/ReelAudio-18190.mp3'), path.join(STAGE, 'audio.mp3'));
run('ffmpeg', ['-v', 'error', '-y', '-i', path.join(STAGE, 'invite.mp4'), '-frames:v', '1', path.join(STAGE, 'poster.png')]);
if (args.stills) {
	run('node', ['scripts/analyze/stills.mjs', '--comp', 'InviteReel', '--times', String(args.stills), '--scale', String(args.scale ?? 0.5), ...(args.sheet ? ['--sheet', args.sheet, '--cols', String(args.cols ?? 4)] : [])]);
} else {
	const raw = path.join(W, 'render-raw.mp4');
	run(path.join(ROOT, 'node_modules/.bin/remotion'), ['render', 'src/index.ts', 'InviteReel', raw, '--scale=2', '--codec=h264', '--crf=15', '--jpeg-quality=95', '--audio-codec=aac', '--audio-bitrate=320k']);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	console.log(`✔ rendered ${rel(output)}`);
}
