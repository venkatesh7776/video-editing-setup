// npm run check — verifies every tool the pipeline needs.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {PYTHON, ROOT} from './lib/common.mjs';

const results = [];
const check = (name, cmd, args, pick = (o) => o.split('\n')[0], fix = '') => {
	const r = spawnSync(cmd, args, {cwd: ROOT, encoding: 'utf8'});
	const ok = !r.error && r.status === 0;
	results.push({name, ok, detail: ok ? pick((r.stdout || r.stderr).trim()) : fix});
};

check('Node.js', 'node', ['--version'], undefined, 'brew install node');
check('npm', 'npm', ['--version'], undefined, 'brew install node');
check('Python (venv)', PYTHON, ['--version'], undefined, '/opt/homebrew/bin/python3.13 -m venv .venv');
check(
	'faster-whisper',
	PYTHON,
	['-c', 'import faster_whisper, ctranslate2; print("faster-whisper", faster_whisper.__version__, "/ ctranslate2", ctranslate2.__version__)'],
	undefined,
	'.venv/bin/pip install -r requirements.txt',
);
check('FFmpeg', 'ffmpeg', ['-version'], (o) => o.split('\n')[0].split(' Copyright')[0], 'brew install ffmpeg');
check('FFprobe', 'ffprobe', ['-version'], (o) => o.split('\n')[0].split(' Copyright')[0], 'brew install ffmpeg');
check('Remotion', path.join(ROOT, 'node_modules/.bin/remotion'), ['versions'], (o) => {
	const v = o.match(/remotion\s+([\d.]+)/i);
	return v ? `remotion ${v[1]} (all packages aligned)` : o.split('\n').slice(-1)[0];
}, 'npm install');
check('Remotion browser', path.join(ROOT, 'node_modules/.bin/remotion'), ['browser', 'ensure'], () => 'Chrome Headless Shell ready', 'npx remotion browser ensure');

const models = path.join(ROOT, '.cache/whisper-models');
const cached = fs.existsSync(models) ? fs.readdirSync(models).filter((d) => d.startsWith('models--')) : [];
results.push({name: 'Whisper models', ok: true, detail: cached.length ? cached.map((d) => d.split('--').pop()).join(', ') : 'none yet (downloaded on first transcribe)'});
results.push({
	name: 'Input video',
	ok: true,
	detail: fs.existsSync(path.join(ROOT, 'input/raw-video.mp4')) ? 'input/raw-video.mp4 present' : 'input/raw-video.mp4 not found (add one to run the pipeline)',
});

for (const r of results) console.log(`${r.ok ? '✔' : '✖'} ${r.name.padEnd(17)} ${r.detail}`);
const failed = results.filter((r) => !r.ok);
if (failed.length) {
	console.log(`\n${failed.length} problem(s). Fix with the command shown next to each ✖.`);
	process.exit(1);
}
console.log('\nAll good.');
