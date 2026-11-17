// The Digital Moments — Temple-theme wedding website reel (2160×3840, 9:16, 60 fps, ~30 s).
// Style from the reference reel (Refernces/Video-95545.mp4): intro line + 3 → 2 → 1 countdown, then one continuous
// phone-scroll shot with a fixed headline; its audio from the start. Brand mark from first frame to last.
//   node projects/temple-reel/build.mjs [--output output/…] [--overwrite]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const W = path.join(WORK, 'temple');
const STAGE = path.join(PUBLIC_DIR, 'temple');
const output = abs(args.output ?? 'output/temple-wedding-website-reel-4k.mp4');
if (fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}
fs.mkdirSync(W, {recursive: true});
fs.mkdirSync(STAGE, {recursive: true});
const RAW = abs('wedding website assets/hindu website raw.MOV');
const REF = abs('Refernces/Video-95545.mp4');
fs.copyFileSync(path.join(PUBLIC_DIR, 'qrh', 'site.mp4'), path.join(STAGE, 'site.mp4')); // the Temple-theme site recording
fs.copyFileSync(path.join(PUBLIC_DIR, 'qrh', 'img', 'tdm-logo.png'), path.join(STAGE, 'tdm-logo.png'));

const INTRO = 4.2; // countdown ends ~3.7 s, then a 0.5 s dissolve into the shot
const XF = 0.5;
const rawDur = Number(JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', RAW]).toString()).format.duration);
const OUTRO = 4.0; // CTA card
const mainEnd = INTRO - XF + rawDur;
const total = +(mainEnd - XF + OUTRO).toFixed(3);

const REMOTION = path.join(ROOT, 'node_modules/.bin/remotion');
const intro = path.join(W, 'intro.mov');
const overlay = path.join(W, 'overlay.png');
run(REMOTION, ['still', 'src/index.ts', 'TempleOverlay', overlay, '--image-format=png']);
const dmLine = path.join(W, 'dm-line.png');
run(REMOTION, ['still', 'src/index.ts', 'TempleDmLine', dmLine, '--image-format=png']);
const DM_AFTER = 5; // the DM line arrives 5 s after the headline (headline shows from the start of the main shot)
run(REMOTION, ['render', 'src/index.ts', 'TempleIntro', intro, '--codec=prores', '--prores-profile=hq']);
const outro = path.join(W, 'outro.mov');
run(REMOTION, ['render', 'src/index.ts', 'TempleOutro', outro, '--codec=prores', '--prores-profile=hq']);

// main shot: 1.35× punch-in centred on the phone, gentle grade, 60 fps, headline + brand overlay; intro dissolves in.
const raw = path.join(W, 'render-raw.mp4');
run('ffmpeg', ['-v', 'error', '-stats', '-y', '-i', intro, '-i', RAW, '-i', overlay, '-i', REF, '-i', outro, '-loop', '1', '-framerate', '60', '-t', String(rawDur.toFixed(3)), '-i', dmLine,
	'-filter_complex', [
		`[0:v]fps=60,format=yuv420p,settb=AVTB[i]`,
		`[1:v]crop=1878:3339:201:501,scale=2160:3840:flags=lanczos,eq=contrast=1.05:saturation=1.06,fps=60[m0]`,
		`[5:v]format=rgba,fade=t=in:st=${DM_AFTER}:d=0.6:alpha=1[dm]`,
		`[m0][2:v]overlay=0:0[m1]`,
		`[m1][dm]overlay=0:0:eof_action=pass,format=yuv420p,settb=AVTB[m]`,
		`[i][m]xfade=transition=fade:duration=${XF}:offset=${INTRO - XF}[im]`,
		`[4:v]fps=60,format=yuv420p,settb=AVTB[o]`,
		`[im][o]xfade=transition=fade:duration=${XF}:offset=${(mainEnd - XF).toFixed(3)}[v]`,
		`[3:a]atrim=0:${total},asetpts=N/SR/TB,afade=t=out:st=${(total - 2).toFixed(2)}:d=2[a]`,
	].join(';'),
	'-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-profile:v', 'high', '-level', '5.2', '-pix_fmt', 'yuv420p',
	'-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', '-t', String(total), raw]);
run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
console.log(`✔ rendered ${rel(output)} (${total}s)`);
