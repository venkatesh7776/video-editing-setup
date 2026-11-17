// npm run fillers [-- --apply] [--soft] [--edit edits/x.json]
// Lists filler words (um, uh, ...) from the transcript as cuts. --soft also
// includes context-dependent ones ("like", "you know") — review before applying.
// Whisper drops most fillers by default; transcribe with --keep-fillers first.
import fs from 'node:fs';
import {abs, DEFAULT_EDIT, loadEdit, parseArgs, rel, requireFile} from '../lib/common.mjs';
import {transcriptPath} from '../transcribe/run.mjs';

const HARD = new Set(['um', 'umm', 'uh', 'uhh', 'uhm', 'erm', 'er', 'ah', 'hmm', 'mm', 'mhm']);
const SOFT = new Set(['like', 'basically', 'actually', 'literally']);
const clean = (w) => w.toLowerCase().replace(/[^a-z']/g, '');

try {
	const args = parseArgs();
	const editFile = args.edit ?? DEFAULT_EDIT;
	const edit = loadEdit(editFile);
	const tPath = transcriptPath(args.input ?? edit.input);
	requireFile(tPath, 'Run `npm run transcribe -- --keep-fillers` first');
	const {words} = JSON.parse(fs.readFileSync(tPath, 'utf8'));

	const cuts = [];
	words.forEach((w, i) => {
		const t = clean(w.text);
		const next = words[i + 1] ? clean(words[i + 1].text) : '';
		if (HARD.has(t) || (args.soft && SOFT.has(t))) {
			cuts.push({start: w.start, end: w.end, reason: `filler:${t}`});
		} else if (args.soft && t === 'you' && next === 'know') {
			cuts.push({start: w.start, end: words[i + 1].end, reason: 'filler:you know'});
		}
	});

	console.log(JSON.stringify(cuts, null, 2));
	console.log(`\n${cuts.length} filler words in ${rel(tPath)}`);
	if (args.apply) {
		edit.cuts = [...(edit.cuts ?? []).filter((c) => !c.reason?.startsWith('filler:')), ...cuts];
		fs.writeFileSync(abs(editFile), JSON.stringify(edit, null, 2) + '\n');
		console.log(`Applied to ${editFile}`);
	}
} catch (e) {
	console.error(`✖ ${e.message}`);
	process.exit(1);
}
