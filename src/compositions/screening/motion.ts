// Time helpers. Everything in this composition is keyed in absolute seconds.
import {Easing, interpolate} from 'remotion';

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 over [from, from + dur], eased. */
export const prog = (t: number, from: number, dur: number, easing = ease) =>
	interpolate(t, [from, from + dur], [0, 1], {easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Fade in at `from`, fade out ending at `to`. */
export const window01 = (t: number, from: number, to: number, fadeIn = 0.3, fadeOut = 0.3) =>
	Math.min(prog(t, from, fadeIn), 1 - prog(t, to - fadeOut, fadeOut, Easing.linear));

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

export type Key = {t: number; x: number; y: number; z: number};

/** Eased interpolation between camera keys (x, y are 0..1 of the image; z is zoom). */
export const camAt = (keys: Key[], t: number): {x: number; y: number; z: number} => {
	if (keys.length === 1 || t <= keys[0].t) return keys[0];
	for (let i = 0; i < keys.length - 1; i++) {
		const a = keys[i];
		const b = keys[i + 1];
		if (t <= b.t) {
			const p = easeInOut((t - a.t) / Math.max(0.001, b.t - a.t));
			return {x: mix(a.x, b.x, p), y: mix(a.y, b.y, p), z: mix(a.z, b.z, p)};
		}
	}
	return keys[keys.length - 1];
};
