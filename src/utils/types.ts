// Shape of an edit file (edits/*.json). All times are in seconds of the
// ORIGINAL source video, so edits never have to be recalculated after cuts.

export type FormatName = '9:16' | '16:9' | '1:1' | '4:5';
export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type TimeRange = {start: number; end: number; reason?: string};

export type CaptionsConfig = {
	enabled: boolean;
	position?: 'bottom' | 'center' | 'top';
	maxWordsPerPage?: number;
	maxCharsPerPage?: number;
	/** Font size as a fraction of the shorter frame side (0.065 ≈ 70px at 1080). */
	fontScale?: number;
	uppercase?: boolean;
	textColor?: string;
	highlightActiveWord?: boolean;
	highlightColor?: string;
	/** Words/phrases to always colour, e.g. product names. Case-insensitive. */
	keywords?: string[];
	keywordColor?: string;
};

export type ZoomConfig = TimeRange & {
	/** 1.0 = no zoom. */
	scale?: number;
	/** Zoom anchor, 0..1 of the frame. */
	x?: number;
	y?: number;
};

export type EditConfig = {
	input: string;
	output: string;
	format: FormatName | {width: number; height: number};
	/** Output frame rate. null/omitted = keep the source frame rate. */
	fps?: number | null;
	/** How the source fills a frame of a different aspect ratio. Never stretches. */
	fit?: 'auto' | 'cover' | 'contain' | 'blur';
	/** Crop focus for 'cover' (0..1). 0.5/0.5 = centre. */
	focus?: {x: number; y: number};
	trim?: {start?: number; end?: number | null};
	/** Source ranges to remove (silences, filler words, mistakes...). */
	cuts?: TimeRange[];
	zooms?: ZoomConfig[];
	captions?: CaptionsConfig;
	logo?: {src: string; position?: Corner; widthScale?: number; opacity?: number} | null;
	title?: {text: string; subtitle?: string; duration?: number} | null;
	music?: {src: string; volume?: number; fadeIn?: number; fadeOut?: number} | null;
	audio?: {normalize?: boolean; volume?: number};
	whisper?: {model?: string; language?: string; keepFillers?: boolean};
	render?: {codec?: 'h264' | 'h265'; crf?: number; audioBitrate?: string};
};

export type Word = {text: string; start: number; end: number};

export type SourceMeta = {
	/** Path relative to the Remotion public dir (work/public). */
	src: string;
	duration: number;
	fps: number;
	width: number;
	height: number;
	hasAudio: boolean;
};

/** Input props for the Main composition (written to work/props.json by the pipeline). */
export type MainProps = {
	config: EditConfig;
	source: SourceMeta | null;
	words: Word[];
};
