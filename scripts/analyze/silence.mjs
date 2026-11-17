// npm run silence [-- --noise -35 --min 0.7 --pad 0.15] [--apply] [--edit edits/x.json]
// Finds silent stretches with FFmpeg's silencedetect and proposes them as cuts.
// --apply adds them to the edit file's "cuts" (replacing earlier silence cuts).
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {abs, DEFAULT_EDIT, loadEdit, parseArgs, probe} from '../lib/common.mjs';

try {
	const args = parseArgs();
	const editFile = args.edit ?? DEFAULT_EDIT;
	const edit = loadEdit(editFile);
	const input = args.input ?? edit.input;
	const noise = Number(args.noise ?? -35);
	const min = Number(args.min ?? 0.7);
	const pad = Number(args.pad ?? 0.15); // breathing room kept on each side of speech

	const res = spawnSync(
		'ffmpeg',
		['-hide_banner', '-nostats', '-i', abs(input), '-vn', '-af', `silencedetect=noise=${noise}dB:d=${min}`, '-f', 'null', '-'],
		{encoding: 'utf8'},
	);
	if (res.status !== 0) throw new Error(res.stderr);

	const duration = probe(input).duration;
	const cuts = [];
	let start = null;
	for (const line of res.stderr.split('\n')) {
		const s = line.match(/silence_start: ([\d.]+)/);
		const e = line.match(/silence_end: ([\d.]+)/);
		if (s) start = Number(s[1]);
		if (e && start !== null) {
			cuts.push({start, end: Number(e[1])});
			start = null;
		}
	}
	if (start !== null) cuts.push({start, end: duration});

	const padded = cuts
		.map((c) => ({
			start: +(c.start <= 0.01 ? 0 : c.start + pad).toFixed(3),
			end: +(c.end >= duration - 0.01 ? duration : c.end - pad).toFixed(3),
			reason: 'silence',
		}))
		.filter((c) => c.end - c.start > 0.1);

	const total = padded.reduce((n, c) => n + c.end - c.start, 0);
	console.log(JSON.stringify(padded, null, 2));
	console.log(`\n${padded.length} silent sections, ${total.toFixed(1)}s of ${duration.toFixed(1)}s (noise ${noise}dB, min ${min}s, pad ${pad}s)`);

	if (args.apply) {
		edit.cuts = [...(edit.cuts ?? []).filter((c) => c.reason !== 'silence'), ...padded];
		fs.writeFileSync(abs(editFile), JSON.stringify(edit, null, 2) + '\n');
		console.log(`Applied to ${editFile}`);
	}
} catch (e) {
	console.error(`✖ ${e.message}`);
	process.exit(1);
}
