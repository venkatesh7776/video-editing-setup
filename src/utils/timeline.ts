// Turns trim + cuts (in source seconds) into a list of kept segments and maps
// source timestamps onto the edited output timeline.

import type {EditConfig, TimeRange} from './types';

export type FramedSegment = {
	/** First source frame of this segment. */
	sourceFrom: number;
	durationInFrames: number;
	/** Output frame where this segment starts. */
	outputFrom: number;
};

export const keptRanges = (config: EditConfig, sourceDuration: number): TimeRange[] => {
	const start = Math.max(0, config.trim?.start ?? 0);
	const end = Math.min(sourceDuration, config.trim?.end ?? sourceDuration);
	let ranges: TimeRange[] = end > start ? [{start, end}] : [];

	const cuts = [...(config.cuts ?? [])].sort((a, b) => a.start - b.start);
	for (const cut of cuts) {
		ranges = ranges.flatMap((r) => {
			if (cut.end <= r.start || cut.start >= r.end) return [r];
			const parts: TimeRange[] = [];
			if (cut.start > r.start) parts.push({start: r.start, end: cut.start});
			if (cut.end < r.end) parts.push({start: cut.end, end: r.end});
			return parts;
		});
	}
	return ranges;
};

export const frameSegments = (ranges: TimeRange[], fps: number): FramedSegment[] => {
	const segments: FramedSegment[] = [];
	let outputFrom = 0;
	for (const r of ranges) {
		const sourceFrom = Math.round(r.start * fps);
		const durationInFrames = Math.round(r.end * fps) - sourceFrom;
		if (durationInFrames < 1) continue;
		segments.push({sourceFrom, durationInFrames, outputFrom});
		outputFrom += durationInFrames;
	}
	return segments;
};

export const totalFrames = (segments: FramedSegment[]) =>
	segments.reduce((sum, s) => sum + s.durationInFrames, 0);

/** Output frame for a source time, or null if that moment was cut. */
export const sourceTimeToOutputFrame = (t: number, segments: FramedSegment[], fps: number): number | null => {
	const f = t * fps;
	for (const s of segments) {
		if (f >= s.sourceFrom && f < s.sourceFrom + s.durationInFrames) {
			return s.outputFrom + (f - s.sourceFrom);
		}
	}
	return null;
};

/**
 * Maps a source range to output frames. Ranges that straddle a cut are clamped
 * to the segment their midpoint falls in; ranges entirely inside a cut return null.
 */
export const mapRange = (
	range: TimeRange,
	segments: FramedSegment[],
	fps: number,
): {from: number; to: number} | null => {
	const mid = (range.start + range.end) / 2;
	const seg = segments.find((s) => {
		const f = mid * fps;
		return f >= s.sourceFrom && f < s.sourceFrom + s.durationInFrames;
	});
	if (!seg) return null;
	const clamp = (t: number) => {
		const f = Math.min(Math.max(t * fps, seg.sourceFrom), seg.sourceFrom + seg.durationInFrames);
		return seg.outputFrom + (f - seg.sourceFrom);
	};
	return {from: clamp(range.start), to: clamp(range.end)};
};
