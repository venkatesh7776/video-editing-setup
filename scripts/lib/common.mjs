// Shared helpers for the pipeline scripts.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const WORK = path.join(ROOT, 'work');
export const PUBLIC_DIR = path.join(WORK, 'public');
export const PYTHON = path.join(ROOT, '.venv/bin/python');
// Overridable so test runs don't write into your captions/ folder.
export const CAPTIONS_DIR = process.env.VE_CAPTIONS_DIR ? path.resolve(process.env.VE_CAPTIONS_DIR) : path.join(ROOT, 'captions');
export const DEFAULT_EDIT = 'edits/default.json';

export const abs = (p) => (path.isAbsolute(p) ? p : path.join(ROOT, p));
export const rel = (p) => path.relative(ROOT, p) || '.';
export const baseName = (p) => path.basename(p, path.extname(p));

/** Minimal --flag value / --flag parser. */
export const parseArgs = (argv = process.argv.slice(2)) => {
	const args = {_: []};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (!a.startsWith('--')) {
			args._.push(a);
			continue;
		}
		const [key, inline] = a.slice(2).split('=', 2);
		if (inline !== undefined) args[key] = inline;
		else if (argv[i + 1] && !argv[i + 1].startsWith('--')) args[key] = argv[++i];
		else args[key] = true;
	}
	return args;
};

export const run = (cmd, args, {quiet = false} = {}) => {
	const res = spawnSync(cmd, args, {cwd: ROOT, stdio: quiet ? 'pipe' : 'inherit', encoding: 'utf8'});
	if (res.error) throw new Error(`Could not run ${cmd}: ${res.error.message}`);
	if (res.status !== 0) {
		throw new Error(`${cmd} exited with code ${res.status}${quiet ? `\n${res.stderr}` : ''}`);
	}
	return res.stdout;
};

export const loadEdit = (file = DEFAULT_EDIT) => {
	const p = abs(file);
	if (!fs.existsSync(p)) throw new Error(`Edit file not found: ${rel(p)}`);
	return JSON.parse(fs.readFileSync(p, 'utf8'));
};

export const requireFile = (p, hint) => {
	if (!fs.existsSync(abs(p))) {
		throw new Error(`Missing ${rel(abs(p))}${hint ? `\n  → ${hint}` : ''}`);
	}
};

const parseRate = (r) => {
	const [n, d] = String(r).split('/').map(Number);
	return d ? n / d : n;
};

/** ffprobe summary of a media file. */
export const probe = (file) => {
	const out = run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', abs(file)], {
		quiet: true,
	});
	const data = JSON.parse(out);
	const v = data.streams.find((s) => s.codec_type === 'video' && s.disposition?.attached_pic !== 1);
	const a = data.streams.find((s) => s.codec_type === 'audio');
	const rotation = Number(
		v?.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? v?.tags?.rotate ?? 0,
	);
	const rotated = Math.abs(rotation) % 180 === 90;
	return {
		file: rel(abs(file)),
		duration: Number(data.format.duration),
		sizeMB: Math.round(Number(data.format.size) / 1e5) / 10,
		video: v && {
			codec: v.codec_name,
			profile: v.profile,
			pixFmt: v.pix_fmt,
			// Display size (after rotation metadata is applied).
			width: rotated ? v.height : v.width,
			height: rotated ? v.width : v.height,
			rotation,
			fps: Math.round(parseRate(v.r_frame_rate) * 1000) / 1000,
			avgFps: Math.round(parseRate(v.avg_frame_rate) * 1000) / 1000,
			colorTransfer: v.color_transfer,
			bitrateKbps: v.bit_rate ? Math.round(v.bit_rate / 1000) : undefined,
		},
		audio: a && {codec: a.codec_name, sampleRate: Number(a.sample_rate), channels: a.channels},
	};
};
