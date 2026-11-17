// Two-pass EBU R128 loudness normalization; video is stream-copied (no quality loss).
//   node scripts/processing/loudnorm.mjs in.mp4 out.mp4 [--target -16]
import {spawnSync} from 'node:child_process';
import {parseArgs} from '../lib/common.mjs';

const args = parseArgs();
const [input, output] = args._;
const I = Number(args.target ?? -16);
const base = `loudnorm=I=${I}:TP=-1.5:LRA=11`;
const pass1 = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', input, '-vn', '-af', `${base}:print_format=json`, '-f', 'null', '-'], {encoding: 'utf8'});
const m = JSON.parse(pass1.stderr.match(/\{[^{}]*"input_i"[^{}]*\}/)[0]);
const filter = `${base}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
const pass2 = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', input, '-c:v', 'copy', '-af', filter, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', output], {stdio: 'inherit'});
if (pass2.status !== 0) process.exit(1);
console.log(`[loudnorm] ${input}: ${m.input_i} LUFS → ${I} LUFS → ${output}`);
