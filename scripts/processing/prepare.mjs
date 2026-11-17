// FFmpeg step: turns the raw input into a Remotion-friendly source in work/public/.
// Stream-copies when the file is already suitable (no quality loss); otherwise
// normalizes to constant-frame-rate H.264 at near-lossless quality.
import fs from 'node:fs';
import path from 'node:path';
import {abs, probe, PUBLIC_DIR, rel, run} from '../lib/common.mjs';

const STANDARD_RATES = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];
const nearestRate = (fps) => STANDARD_RATES.reduce((a, b) => (Math.abs(b - fps) < Math.abs(a - fps) ? b : a));

export const prepareSource = (edit, {force = false} = {}) => {
	const info = probe(edit.input);
	if (!info.video) throw new Error(`${edit.input} has no video stream`);
	const v = info.video;

	const vfr = Math.abs(v.fps - v.avgFps) > 0.05;
	const hdr = ['arib-std-b67', 'smpte2084'].includes(v.colorTransfer);
	const reasons = [
		!['h264', 'hevc'].includes(v.codec) && `codec ${v.codec}`,
		!['yuv420p', 'yuvj420p'].includes(v.pixFmt) && `pixel format ${v.pixFmt}`,
		v.rotation !== 0 && `rotation ${v.rotation}°`,
		vfr && `variable frame rate (${v.avgFps} avg vs ${v.fps})`,
		v.fps > 60 && `high frame rate ${v.fps}`,
	].filter(Boolean);
	const normalizeAudio = Boolean(edit.audio?.normalize) && Boolean(info.audio);
	const fps = vfr || v.fps > 60 ? nearestRate(Math.min(v.avgFps, 60)) : v.fps;

	fs.mkdirSync(PUBLIC_DIR, {recursive: true});
	const out = path.join(PUBLIC_DIR, 'source.mp4');
	const stampFile = path.join(PUBLIC_DIR, 'source.stamp.json');
	const stat = fs.statSync(abs(edit.input));
	const stamp = JSON.stringify({input: abs(edit.input), size: stat.size, mtime: stat.mtimeMs, normalizeAudio, fps});
	if (!force && fs.existsSync(out) && fs.existsSync(stampFile) && fs.readFileSync(stampFile, 'utf8') === stamp) {
		console.log(`[prepare] source unchanged, reusing ${rel(out)}`);
	} else {
		if (hdr) console.warn('[prepare] ⚠ HDR source detected; converting to SDR 8-bit. Colours may look flatter.');
		const audioArgs = !info.audio
			? ['-an']
			: normalizeAudio
				? ['-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000']
				: ['-c:a', 'aac', '-b:a', '320k', '-ar', '48000'];
		let videoArgs;
		if (reasons.length) {
			console.log(`[prepare] normalizing video (${reasons.join(', ')}) → CFR ${fps} fps H.264`);
			videoArgs = [
				'-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p',
				'-fps_mode', 'cfr', '-r', String(fps), '-g', String(Math.round(fps)),
			];
		} else {
			console.log('[prepare] video already compatible — stream copy (no re-encode)');
			videoArgs = ['-c:v', 'copy'];
			// Stream copy keeps the original audio too unless loudness normalization is on.
			if (info.audio && !normalizeAudio) audioArgs.splice(0, audioArgs.length, '-c:a', 'copy');
		}
		run('ffmpeg', [
			'-hide_banner', '-loglevel', 'error', '-stats', '-y', '-i', abs(edit.input),
			'-map', '0:v:0', ...(info.audio ? ['-map', '0:a:0'] : []),
			...videoArgs, ...audioArgs, '-movflags', '+faststart', out,
		]);
		fs.writeFileSync(stampFile, stamp);
	}

	const prepared = probe(out);
	return {
		src: 'source.mp4',
		duration: prepared.duration,
		fps: prepared.video.fps,
		width: prepared.video.width,
		height: prepared.video.height,
		hasAudio: Boolean(prepared.audio),
	};
};

/** Copies assets referenced by the edit (logo, music) into the public dir and rewrites their paths. */
export const stageAssets = (edit) => {
	const staged = structuredClone(edit);
	for (const key of ['logo', 'music']) {
		const item = staged[key];
		if (!item?.src) continue;
		const src = abs(item.src);
		if (!fs.existsSync(src)) throw new Error(`${key}.src not found: ${item.src}`);
		const dest = path.join(PUBLIC_DIR, 'assets', path.basename(src));
		fs.mkdirSync(path.dirname(dest), {recursive: true});
		fs.copyFileSync(src, dest);
		item.src = `assets/${path.basename(src)}`;
	}
	return staged;
};
