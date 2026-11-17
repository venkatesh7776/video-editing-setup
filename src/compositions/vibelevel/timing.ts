// Scene timing derived from the voiceover timeline (work/vibelevel-guide/vo/timeline.json).

export type Chunk = {text: string; start: number; end: number};
export type VoScene = {id: string; file: string; duration: number; chunks: Chunk[]};
export type VoTimeline = {order: string[]; scenes: Record<string, VoScene>};

export const FPS = 30;
export const TRANSITION = 12; // frames of cross-fade between scenes
export const LEAD = 0.4; // seconds of picture before the voice starts
export const TAIL = 0.6; // seconds after the voice ends
export const EXTRA_LEAD: Record<string, number> = {intro: 0.9};
export const EXTRA_TAIL: Record<string, number> = {outro: 2.2};

export type SceneTiming = VoScene & {
	from: number; // global start frame
	durationInFrames: number;
	voFrom: number; // frame (relative to scene) where the voice starts
};

export const layout = (timeline: VoTimeline): {scenes: SceneTiming[]; total: number} => {
	let from = 0;
	const scenes = timeline.order.map((id, i) => {
		const s = timeline.scenes[id];
		const lead = LEAD + (EXTRA_LEAD[id] ?? 0);
		const last = i === timeline.order.length - 1;
		const seconds = lead + s.duration + TAIL + (EXTRA_TAIL[id] ?? 0);
		const durationInFrames = Math.ceil(seconds * FPS) + (last ? 0 : TRANSITION);
		const timing = {...s, from, durationInFrames, voFrom: Math.round(lead * FPS)};
		from += durationInFrames - (last ? 0 : TRANSITION);
		return timing;
	});
	return {scenes, total: from};
};

/**
 * Frame (relative to the scene) at which `phrase` is spoken, estimated from the
 * subtitle chunk that contains it. Falls back to `fallback` (0..1 of the scene).
 */
export const spokenAt = (scene: SceneTiming, phrase: string, fallback = 0): number => {
	const needle = phrase.toLowerCase();
	for (const c of scene.chunks) {
		const idx = c.text.toLowerCase().indexOf(needle);
		if (idx >= 0) {
			const t = c.start + ((c.end - c.start) * idx) / Math.max(1, c.text.length);
			return scene.voFrom + Math.round(t * FPS);
		}
	}
	return Math.round(fallback * scene.durationInFrames);
};
