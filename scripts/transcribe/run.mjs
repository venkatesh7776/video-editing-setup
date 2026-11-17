// npm run transcribe [-- --edit edits/x.json] [--input file] [--model medium.en] [--force] [--keep-fillers]
// Extracts 16 kHz mono audio with FFmpeg, then runs Whisper locally.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {abs, baseName, CAPTIONS_DIR, loadEdit, parseArgs, PYTHON, rel, requireFile, run, WORK} from '../lib/common.mjs';

export const transcriptPath = (input) => path.join(CAPTIONS_DIR, 'transcripts', `${baseName(input)}.json`);

export const transcribe = ({input, model = 'small.en', language = 'en', force = false, keepFillers = false}) => {
	requireFile(input, 'Put your video there, or pass --input path/to/video.mp4');
	const out = transcriptPath(input);
	// Transcripts are keyed by file name, so also check it's the same file (a replaced video gets re-transcribed).
	const {size, mtimeMs} = fs.statSync(abs(input));
	const stamp = {size, mtimeMs, model};
	if (fs.existsSync(out) && !force) {
		const existing = JSON.parse(fs.readFileSync(out, 'utf8')).sourceStamp;
		if (existing && existing.size === size && existing.mtimeMs === mtimeMs) {
			console.log(`[transcribe] using existing ${rel(out)} (pass --force to redo)`);
			return out;
		}
		console.log(`[transcribe] ${rel(abs(input))} changed since ${rel(out)} was made — transcribing again`);
	}
	requireFile(PYTHON, 'Python venv missing. Run: /opt/homebrew/bin/python3.13 -m venv .venv && .venv/bin/pip install -r requirements.txt');

	const wav = path.join(WORK, 'audio', `${baseName(input)}.wav`);
	fs.mkdirSync(path.dirname(wav), {recursive: true});
	console.log(`[transcribe] extracting audio → ${rel(wav)}`);
	run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', abs(input), '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', wav]);

	run(PYTHON, ['scripts/transcribe/transcribe.py', wav, '--name', baseName(input), '--model', model, '--language', language,
		'--transcripts-dir', path.join(CAPTIONS_DIR, 'transcripts'), '--subtitles-dir', path.join(CAPTIONS_DIR, 'subtitles'), ...(keepFillers ? ['--keep-fillers'] : [])]);
	const data = JSON.parse(fs.readFileSync(out, 'utf8'));
	fs.writeFileSync(out, JSON.stringify({...data, sourceStamp: stamp}, null, 1));
	return out;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	try {
		const args = parseArgs();
		const edit = loadEdit(args.edit);
		transcribe({
			input: args.input ?? edit.input,
			model: args.model ?? edit.whisper?.model,
			language: args.language ?? edit.whisper?.language,
			force: Boolean(args.force),
			keepFillers: Boolean(args['keep-fillers'] ?? edit.whisper?.keepFillers),
		});
	} catch (e) {
		console.error(`✖ ${e.message}`);
		process.exit(1);
	}
}
