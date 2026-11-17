// Groups transcript words into short caption "pages" on the output timeline.

import {mapRange, type FramedSegment} from './timeline';
import type {CaptionsConfig, Word} from './types';

export type CaptionWord = {text: string; from: number; to: number};
export type CaptionPage = {from: number; to: number; words: CaptionWord[]};

export const buildCaptionPages = (
	words: Word[],
	segments: FramedSegment[],
	fps: number,
	config: CaptionsConfig,
): CaptionPage[] => {
	const maxWords = config.maxWordsPerPage ?? 4;
	const maxChars = config.maxCharsPerPage ?? 22;
	const maxGapFrames = 0.6 * fps;

	const mapped: CaptionWord[] = [];
	for (const w of words) {
		const r = mapRange(w, segments, fps);
		if (r && r.to > r.from) mapped.push({text: w.text.trim(), from: r.from, to: r.to});
	}

	const pages: CaptionPage[] = [];
	let current: CaptionWord[] = [];
	const flush = () => {
		if (current.length) pages.push({from: current[0].from, to: current[current.length - 1].to, words: current});
		current = [];
	};

	for (const w of mapped) {
		const prev = current[current.length - 1];
		const chars = current.reduce((n, c) => n + c.text.length + 1, 0) + w.text.length;
		if (
			prev &&
			(current.length >= maxWords ||
				chars > maxChars ||
				w.from - prev.to > maxGapFrames ||
				/[.?!]$/.test(prev.text))
		) {
			flush();
		}
		current.push(w);
	}
	flush();

	// Hold each page until the next one starts (if the gap is small) to avoid flicker.
	for (let i = 0; i < pages.length; i++) {
		const next = pages[i + 1];
		const holdUntil = next ? Math.min(next.from, pages[i].to + 0.4 * fps) : pages[i].to + 0.4 * fps;
		pages[i].to = Math.max(pages[i].to, holdUntil, pages[i].from + 0.3 * fps);
		if (next) pages[i].to = Math.min(pages[i].to, next.from);
	}
	return pages;
};
