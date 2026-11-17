// npm run probe [-- path/to/video.mp4]   — prints resolution, fps, duration, codecs.
import {loadEdit, parseArgs, probe} from '../lib/common.mjs';

try {
	const args = parseArgs();
	const file = args._[0] ?? args.input ?? loadEdit(args.edit).input;
	console.log(JSON.stringify(probe(file), null, 2));
} catch (e) {
	console.error(`✖ ${e.message}`);
	process.exit(1);
}
