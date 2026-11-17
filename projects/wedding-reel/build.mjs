// Builds the wedding-website showcase reel (1080×1920, ~32 s).
//   node projects/wedding-reel/build.mjs --still 1.5,5,12      (PNG frames → work/stills/)
//   node projects/wedding-reel/build.mjs [--output output/x.mp4] [--overwrite]
// Steps: stage proxies, VO, music, SFX → lay lines out with pauses → align written words to
// the spoken timings → props → Remotion → loudnorm −14 LUFS (Instagram).
// VO: sarvam_tts.py (Sarvam Bulbul v3, speaker shubh; key from SARVAM_API_KEY) + vibelevel-screening/vo_words.py for word timings.
// Proxies: crop=886:1490:0:250 of the raw screen recordings (removes status, URL and tool bars).
import fs from 'node:fs';
import path from 'node:path';
import {abs, parseArgs, PUBLIC_DIR, rel, ROOT, run, WORK} from '../../scripts/lib/common.mjs';

const args = parseArgs();
const HERE = 'projects/wedding-reel';
const W = path.join(WORK, 'wedding-reel');
const VO = path.join(W, 'vo');
const STAGE = path.join(PUBLIC_DIR, 'wedding');
const output = abs(args.output ?? 'output/wedding-website-reel.mp4');
if (!args.still && fs.existsSync(output) && !args.overwrite) {
	console.error(`✖ ${rel(output)} already exists. Re-run with --overwrite or pass --output.`);
	process.exit(1);
}

for (const d of ['vo', 'sfx']) fs.mkdirSync(path.join(STAGE, d), {recursive: true});
for (const s of ['A', 'B']) fs.copyFileSync(path.join(W, 'proxy', `site-${s}-clean.mp4`), path.join(STAGE, `site-${s}-clean.mp4`)); // steady Chrome bars (clean_chrome.py)
for (const s of ['A', 'B']) for (const b of ['top', 'bot']) fs.copyFileSync(path.join(W, 'proxy', `chrome-${b}-${s}.png`), path.join(STAGE, `chrome-${b}-${s}.png`));
fs.copyFileSync(abs('assets/music/wedding-reel/wedding-song-03.mp3'), path.join(STAGE, 'music.mp3'));
for (const f of ['whoosh-air', 'logo-sweep', 'tech-slide', 'text-pop', 'ui-click']) fs.copyFileSync(abs(`assets/music/vibelevel-screening/sfx/${f}.mp3`), path.join(STAGE, 'sfx', `${f}.mp3`));
for (const f of ['msg-pop', 'light-sweep', 'deep-impact']) fs.copyFileSync(abs(`assets/music/wedding-reel/sfx/${f}.mp3`), path.join(STAGE, 'sfx', `${f}.mp3`));

const narration = JSON.parse(fs.readFileSync(abs(`${HERE}/narration.json`), 'utf8'));
const timeline = JSON.parse(fs.readFileSync(path.join(VO, 'timeline.json'), 'utf8'));
const spoken = JSON.parse(fs.readFileSync(path.join(VO, 'words.json'), 'utf8'));
for (const id of timeline.order) fs.copyFileSync(path.join(VO, `${id}.wav`), path.join(STAGE, 'vo', `${id}.wav`));

// Pause before each line (s): room for the reveal, the feature beats and the finale.
const GAP = {'l1-hook': 0.15, 'l2-reveal': 0.45, 'l3-story': 1.6, 'l4-countdown': 0.45, 'l5-ceremonies': 0.45, 'l6-rsvp': 0.45, 'l7-any': 1.1, 'l8-detail': 0.7, 'l9-cta': 0.9};
const END_HOLD = 3.2;

const letters = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
/** Written words timed by spreading each spoken word's time over its letters. */
const timeWritten = (text, sp) => {
	const stream = [];
	for (const w of sp) {
		const l = letters(w.w);
		for (let i = 0; i < l.length; i++) stream.push(w.s + ((w.e - w.s) * i) / l.length);
	}
	let k = 0;
	return text.split(/\s+/).map((w) => {
		const n = letters(w).length;
		const s = stream[Math.min(k, stream.length - 1)];
		const e = k + n < stream.length ? stream[k + n] : sp.at(-1).e;
		k += n;
		return {w, s: Math.round(s * 100) / 100, e: Math.round(e * 100) / 100};
	});
};

let t = 0;
const lines = narration.scenes.map((sc) => {
	t += GAP[sc.id];
	const dur = timeline.scenes[sc.id].duration;
	const l = {id: sc.id, start: Math.round(t * 100) / 100, dur, words: timeWritten(sc.text, spoken[sc.id])};
	t += dur;
	return l;
});
const duration = Math.round((t + END_HOLD) * 100) / 100;

// Music: the track's swell (21.2 s into "Wedding Song 03") lands as the phone reveals the first site.
const SWELL = 21.2;
const l2 = lines.find((l) => l.id === 'l2-reveal');
const reveal = l2.start + (l2.words.find((w) => letters(w.w) === 'this')?.s ?? 0);
const musicOffset = Math.round((SWELL - reveal) * 100) / 100;

const props = {lines, duration, musicOffset, captionLines: ['l3-story', 'l4-countdown', 'l5-ceremonies', 'l6-rsvp', 'l8-detail']};
const propsFile = path.join(W, 'props.json');
fs.writeFileSync(propsFile, JSON.stringify(props));
for (const l of lines) console.log(`  ${l.id.padEnd(14)} ${l.start.toFixed(2)}–${(l.start + l.dur).toFixed(2)}`);
console.log(`[reel] ${duration}s, reveal at ${reveal.toFixed(2)}s, music offset ${musicOffset}s`);

const REMOTION = path.join(ROOT, 'node_modules/.bin/remotion');
if (args.still) {
	fs.mkdirSync(path.join(WORK, 'stills'), {recursive: true});
	for (const sec of String(args.still).split(',').map(Number)) {
		const out = path.join(WORK, 'stills', `wedding-${sec.toFixed(2)}.png`);
		run(REMOTION, ['still', 'src/index.ts', 'WeddingReel', out, `--props=${propsFile}`, `--frame=${Math.round(sec * 30)}`, ...(args.scale ? [`--scale=${args.scale}`] : [])], {quiet: true});
		console.log(`✔ ${rel(out)}`);
	}
} else {
	const raw = path.join(W, 'render-raw.mp4');
	run(REMOTION, ['render', 'src/index.ts', 'WeddingReel', raw, `--props=${propsFile}`, '--codec=h264', '--crf=16', '--jpeg-quality=100', '--audio-codec=aac', '--audio-bitrate=256k']);
	run('node', ['scripts/processing/loudnorm.mjs', raw, output, '--target', '-14']);
	console.log(`✔ rendered ${rel(output)}`);
}
