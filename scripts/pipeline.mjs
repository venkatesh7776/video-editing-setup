// The full pipeline: probe → FFmpeg prepare → Whisper → props → Remotion render.
//
//   npm run edit   [-- --edit edits/reel.json] [--input x.mp4] [--output y.mp4] [--overwrite]
//   npm run render  (same, but never runs Whisper — uses an existing transcript if present)
//   npm run still  [-- --time 12.5]   (renders one frame to work/stills/ for a quick look)
//
// Flags: --stop-after probe|prepare|props, --force-transcribe, --force-prepare
import fs from 'node:fs';
import path from 'node:path';
import {abs, loadEdit, parseArgs, probe, rel, requireFile, ROOT, run, WORK} from './lib/common.mjs';
import {prepareSource, stageAssets} from './processing/prepare.mjs';
import {transcribe, transcriptPath} from './transcribe/run.mjs';

const REMOTION = path.join(ROOT, 'node_modules/.bin/remotion');

const main = () => {
	const args = parseArgs();
	const editFile = args.edit ?? 'edits/default.json';
	const edit = loadEdit(editFile);
	if (args.input) edit.input = args.input;
	if (args.output) edit.output = args.output;
	if (args.format) edit.format = args.format;

	console.log(`▶ edit file: ${editFile}\n▶ input: ${edit.input}\n▶ output: ${edit.output}  (format ${JSON.stringify(edit.format)})`);
	requireFile(edit.input, `Put your video at ${edit.input}, or pass --input path/to/video.mp4`);

	const info = probe(edit.input);
	console.log(
		`[probe] ${info.video.width}×${info.video.height} @ ${info.video.fps} fps, ${info.duration.toFixed(1)}s, ` +
			`${info.video.codec}${info.audio ? ` + ${info.audio.codec}` : ', no audio'}, ${info.sizeMB} MB`,
	);
	if (args['stop-after'] === 'probe') return;

	// Refuse to clobber an existing render unless explicitly allowed.
	const output = abs(edit.output);
	if (!args.still && !args['stop-after'] && fs.existsSync(output) && !args.overwrite) {
		throw new Error(`${rel(output)} already exists. Re-run with --overwrite, or pass --output output/new-name.mp4`);
	}

	const source = prepareSource(edit, {force: Boolean(args['force-prepare'])});
	if (args['stop-after'] === 'prepare') return;

	let words = [];
	const wantCaptions = edit.captions?.enabled;
	if (wantCaptions && !args['skip-transcribe']) {
		transcribe({
			input: edit.input,
			model: edit.whisper?.model,
			language: edit.whisper?.language,
			force: Boolean(args['force-transcribe']),
			keepFillers: Boolean(edit.whisper?.keepFillers),
		});
	}
	const tPath = transcriptPath(edit.input);
	if (wantCaptions) {
		if (fs.existsSync(tPath)) words = JSON.parse(fs.readFileSync(tPath, 'utf8')).words;
		else console.warn(`[captions] ⚠ no transcript at ${rel(tPath)} — run \`npm run transcribe\`. Rendering without captions.`);
	}

	const propsFile = path.join(WORK, 'props.json');
	fs.writeFileSync(propsFile, JSON.stringify({config: stageAssets(edit), source, words}));
	console.log(`[props] wrote ${rel(propsFile)} (${words.length} caption words)`);
	if (args['stop-after'] === 'props') return;

	if (args.still) {
		const time = Number(args.time ?? 1);
		const fmt = typeof edit.format === 'string' ? edit.format.replace(':', 'x') : `${edit.format.width}x${edit.format.height}`;
		const stillOut = path.join(WORK, 'stills', `${path.basename(editFile, '.json')}-${fmt}-${time}s.png`);
		run(REMOTION, ['still', 'src/index.ts', 'Main', stillOut, `--props=${propsFile}`, `--frame=${Math.round(time * (edit.fps ?? source.fps))}`]);
		console.log(`✔ still → ${rel(stillOut)}`);
		return;
	}

	const r = edit.render ?? {};
	fs.mkdirSync(path.dirname(output), {recursive: true});
	run(REMOTION, [
		'render', 'src/index.ts', 'Main', output,
		`--props=${propsFile}`,
		`--codec=${r.codec ?? 'h264'}`,
		`--crf=${r.crf ?? 18}`,
		'--audio-codec=aac',
		`--audio-bitrate=${r.audioBitrate ?? '192k'}`,
	]);
	const result = probe(output);
	console.log(
		`✔ rendered ${rel(output)} — ${result.video.width}×${result.video.height} @ ${result.video.fps} fps, ` +
			`${result.duration.toFixed(1)}s, ${result.sizeMB} MB`,
	);
};

try {
	main();
} catch (e) {
	console.error(`\n✖ ${e.message}`);
	process.exit(1);
}
