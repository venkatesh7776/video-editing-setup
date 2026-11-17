// Renders many stills of one composition from a single bundle (much faster than repeated `remotion still`),
// plus an optional labelled contact sheet.
//   node scripts/analyze/stills.mjs --comp Velora --props work/velora/props.json --times 1,4.5,9 [--scale 0.5] [--sheet out.jpg] [--cols 6]
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../lib/common.mjs';

const args = parseArgs();
if (!args.comp || !args.times) {
	console.error('usage: --comp <id> --times a,b,c [--props file.json] [--scale 0.5] [--sheet out.jpg] [--cols 6]');
	process.exit(1);
}
const inputProps = args.props ? JSON.parse(fs.readFileSync(abs(args.props), 'utf8')) : {};
const scale = Number(args.scale ?? 1);
const outDir = path.join(WORK, 'stills');
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: PUBLIC_DIR});
const composition = await selectComposition({serveUrl, id: args.comp, inputProps});
const files = [];
for (const sec of String(args.times).split(',').map(Number)) {
	const output = path.join(outDir, `${args.comp.toLowerCase()}-${sec.toFixed(2)}.png`);
	await renderStill({serveUrl, composition, inputProps, frame: Math.min(composition.durationInFrames - 1, Math.round(sec * composition.fps)), output, scale, overwrite: true});
	files.push([sec, output]);
	console.log(`✔ ${rel(output)}`);
}
if (args.sheet) {
	// contact sheet with ffmpeg: label each tile with its time, tile N columns
	const cols = Number(args.cols ?? 6);
	const w = Math.round(composition.width * scale * 0.5);
	const inputs = files.flatMap(([, f]) => ['-i', f]);
	const chains = files.map(([, ], i) => `[${i}:v]scale=${w}:-2,pad=iw+6:ih+6:3:3:white[v${i}]`);
	const rows = [];
	for (let r = 0; r * cols < files.length; r++) {
		const idx = files.slice(r * cols, r * cols + cols).map((_, k) => r * cols + k);
		while (idx.length < cols) idx.push(-1);
		rows.push(idx);
	}
	const blank = files.length % cols ? [`color=white:s=${w + 6}x${Math.round((w * composition.height) / composition.width) + 6}[blank]`] : [];
	let blanks = 0;
	const rowChains = rows.map((idx, r) => `${idx.map((i) => (i < 0 ? `[b${blanks++}]` : `[v${i}]`)).join('')}hstack=inputs=${cols}[r${r}]`);
	const splitBlank = blanks ? [`[blank]split=${blanks}${Array.from({length: blanks}, (_, k) => `[b${k}]`).join('')}`] : [];
	const graph = [...chains, ...blank, ...splitBlank, ...rowChains, rows.length > 1 ? `${rows.map((_, r) => `[r${r}]`).join('')}vstack=inputs=${rows.length}[out]` : '[r0]copy[out]'].join(';');
	run('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', graph, '-map', '[out]', '-frames:v', '1', '-q:v', '3', abs(args.sheet)], {quiet: true});
	console.log(`✔ sheet ${rel(abs(args.sheet))}  (times: ${files.map(([s]) => s).join(', ')})`);
}
