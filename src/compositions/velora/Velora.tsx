// Velora — motion-graphics explainer (16:9, brief: projects/velora/brief.pdf). Eight scenes, all timed from the
// voiceover's word timings (props.words; index = spoken word, see projects/velora/build.mjs).
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction} from 'remotion';
import {type Brand, BrandCtx, C, mix, prog} from './kit';
import {S5, S6, S7, S8} from './ScenesProduct';
import {S1, S2, S3, S4} from './ScenesStory';

export type VWord = {w: string; s: number; e: number};
export type VeloraProps = {words: VWord[]; lead: number; duration: number; segments: {s: number; e: number}[]; musicOffset: number; voEnd: number; fps?: number; url?: string; brand?: Brand; cta?: string; narration?: string; musicGain?: number; sfxGain?: number};

export const calculateVeloraMetadata: CalculateMetadataFunction<VeloraProps> = ({props}) => {
	const fps = props.fps ?? 30;
	return {fps, width: 1920, height: 1080, durationInFrames: Math.max(fps, Math.ceil(props.duration * fps))};
};

export const Velora: React.FC<VeloraProps> = (props) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const {words} = props;
	if (!words.length) return <AbsoluteFill style={{background: C.bg}} />;
	const T = (i: number) => words[Math.min(i, words.length - 1)].s;
	// scene windows [from, to] (each scene animates its own entrance/exit inside a small overlap)
	const scenes: [React.FC<{t: number; T: (i: number) => number; url?: string; cta?: string}>, number, number][] = [
		[S1, 0, T(22)],
		[S2, T(22) - 0.05, T(51)],
		[S3, T(51) - 0.1, T(77)],
		[S4, T(77) - 0.8, T(103)],
		[S5, T(103) - 0.05, T(136)],
		[S6, T(136) - 0.6, T(157)],
		[S7, T(157) - 0.6, T(177)],
		[S8, T(177) - 0.6, props.duration + 1],
	];
	return (
		<BrandCtx.Provider value={props.brand ?? {name: 'Velora', mark: 'v'}}>
			<AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
				{scenes.map(([Scene, a, b], i) => (t >= a && t < b ? <Scene key={i} t={t} T={T} url={props.url} cta={props.cta} /> : null))}
				<Soundtrack {...props} T={T} />
			</AbsoluteFill>
		</BrandCtx.Provider>
	);
};

// ─── audio ───────────────────────────────────────────────────────────────────
// VO −24.3 LUFS. Music ("Piano Reflections", −13 LUFS) ~16 dB under the voice while speaking, up a little in the
// pauses and the end hold. SFX files are normalised to −20 LUFS; gains below put them ~10–16 dB under the voice.
// No ambience bed at the start (user: no background noise on the opening).
const MUSIC = {lead: 0.1, voice: 0.043, gap: 0.075, end: 0.2};

/** Core-film sound effects, keyed by word index (also used by the complete film). */
export const coreSfx = (T: (i: number) => number): [number, string, number][] => {
	const st5 = [T(103), T(108), T(114), T(117)];
	return [
		[T(0) + 0.55, 'phone-notify', 0.12], // offer accepted
		[T(11) + 0.4, 'suitcase-roll', 0.3],
		[T(22) - 0.85, 'soft-swoosh', 0.2], // into the building
		[T(27) - 0.25, 'soft-swoosh', 0.16], // phone up
		[T(30) - 0.1, 'counter-tick', 0.16],
		[T(44) - 0.1, 'counter-tick', 0.18],
		[T(44) + 0.4, 'tension-pulse', 0.2],
		[T(49) - 0.2, 'tension-pulse', 0.26], // "Up front."
		[T(67), 'counter-tick', 0.13],
		[T(69) + 0.3, 'calendar-flip', 0.3],
		[T(73) + 0.9, 'phone-notify', 0.18],
		[T(77) - 0.75, 'soft-swoosh', 0.18], // clutter clears
		[T(93) - 0.3, 'logo-reveal', 0.26],
		[T(95) + 0.1, 'soft-swoosh', 0.14], // phone rises
		[T(103) - 0.7, 'soft-swoosh', 0.2], // through the screen
		[st5[1] + 0.25, 'ui-tap', 0.22],
		[st5[1] + 0.75, 'ui-tap', 0.2],
		[T(110) + 0.5, 'ui-tap', 0.18],
		[T(112) + 0.3, 'ui-tap', 0.22], // submit
		[st5[2] + 2.1, 'confirm-chime', 0.13], // assessment done (no approval claim)
		[T(126), 'soft-swoosh', 0.12], // lump splits into a schedule
		[T(130), 'confirm-chime', 0.15],
		[T(136) + 0.4, 'line-draw', 0.18],
		[T(143), 'ui-tap', 0.2], // auto-pay toggle
		[T(157) - 0.8, 'soft-swoosh', 0.18],
		[T(157) - 0.1, 'suitcase-roll', 0.24],
		[T(169), 'confirm-chime', 0.12], // rent paid
		[T(177) - 0.15, 'sonic-logo', 0.28],
		[T(178), 'line-draw', 0.12],
	];
};

/** One sound effect: plays `name` from `at`, gain `v` (fades after 7.5 s). */
export const Sfx: React.FC<{at: number; name: string; v: number; dir: string}> = ({at, name, v, dir}) => {
	const {fps} = useVideoConfig();
	return (
		<Sequence from={Math.max(0, Math.round(at * fps))} durationInFrames={Math.round(9 * fps)} layout="none">
			<Audio src={staticFile(`${dir}/sfx/${name}.mp3`)} volume={(f) => v * interpolate(f / fps, [7.5, 8.5], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
		</Sequence>
	);
};

const Soundtrack: React.FC<VeloraProps & {T: (i: number) => number}> = ({lead, duration, segments, musicOffset, voEnd, T, narration = 'velora/narration.wav', musicGain = 1, sfxGain = 1}) => {
	const {fps} = useVideoConfig();
	const speech = (t: number) => Math.max(0, ...segments.map((g) => prog(t, g.s - 0.25, 0.25, Easing.linear) * (1 - prog(t, g.e, 0.4, Easing.linear))));
	const musicVol = (f: number) => {
		const t = f / fps;
		const body = t < lead ? MUSIC.lead : t > voEnd ? mix(MUSIC.gap, MUSIC.end, prog(t, voEnd, 1, Easing.linear)) : mix(MUSIC.gap, MUSIC.voice, speech(t));
		return musicGain * body * prog(t, 0, 0.8, Easing.linear) * (1 - prog(t, duration - 2.2, 2.2, Easing.linear));
	};
	return (
		<>
			<Audio src={staticFile('velora/music.mp3')} startFrom={Math.max(0, Math.round(musicOffset * fps))} volume={musicVol} />
			<Sequence from={Math.round(lead * fps)} layout="none">
				<Audio src={staticFile(narration)} />
			</Sequence>
			{coreSfx(T).map(([at, name, v], i) => (
				<Sfx key={i} at={at} name={name} v={v * sfxGain} dir="velora" />
			))}
		</>
	);
};
