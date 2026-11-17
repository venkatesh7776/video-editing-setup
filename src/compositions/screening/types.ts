// Props for the VibeLevel Screening demo (projects/vibelevel-screening).
// All times are absolute video seconds, produced by projects/vibelevel-screening/build.mjs.

export type Beat = {label: string; t: number; word: string};
export type SceneTiming = {id: string; start: number; end: number; voStart: number; voDuration: number; beats: Beat[]};
export type Timing = {fps: number; duration: number; voice: string; scenes: SceneTiming[]};
export type Cue = {text: string; start: number; end: number};

export type ImageInfo = {src: string; w: number; h: number};

export type ScreeningProps = {
	timing: Timing | null;
	/** Staged images by short name (see build.mjs), with their pixel sizes. */
	images: Record<string, ImageInfo>;
	/** Subtitle cues, already filtered for scenes where the headline carries the words. */
	cues: Cue[];
	/** QA only: render the soundtrack without the voiceover (to measure the music bed). */
	muteVoice?: boolean;
	/** QA only: render without sound effects. */
	muteSfx?: boolean;
	/** Seconds into the music file that line up with t = 0. */
	musicOffset?: number;
};
