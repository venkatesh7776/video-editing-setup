import type {ImageInfo, SceneTiming} from './types';

/** What every scene renderer receives. `t` is absolute video seconds. */
export type SceneCtx = {
	t: number;
	scene: SceneTiming;
	img: (name: string) => ImageInfo;
	/** Absolute time of a voiceover beat in this scene, by its label in timing.json. */
	beat: (label: string) => number;
};

export const makeBeat = (scene: SceneTiming) => (label: string) => {
	const b = scene.beats.find((x) => x.label === label);
	if (!b) throw new Error(`No beat "${label}" in ${scene.id}`);
	return b.t;
};
