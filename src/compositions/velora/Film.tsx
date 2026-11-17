// VELORA — the complete product film: the core film (S1–S8, re-voiced) continues into the master script
// (projects/velora-film/master-script.md): the story continues → Flex → Pay → Hub → Protect → ecosystem → finale.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction} from 'remotion';
import {Flex, Open} from './ChOpenFlex';
import {Hub} from './ChHub';
import {Pay} from './ChPay';
import {Eco, Final, Protect} from './ChProtectEco';
import {type ChapterProps, makeCue, type Part} from './filmkit';
import {C, mix, prog} from './kit';
import {S5, S6, S7, S8} from './ScenesProduct';
import {S1, S2, S3, S4} from './ScenesStory';
import {coreSfx, Sfx} from './Velora';

type Music = {file: string; from: number; to: number; offset: number};
export type FilmProps = {parts: Part[]; coreT: number[]; duration: number; segments: {s: number; e: number}[]; music: Music[]; fps?: number};

export const calculateFilmMetadata: CalculateMetadataFunction<FilmProps> = ({props}) => {
	const fps = props.fps ?? 30;
	return {fps, width: 1920, height: 1080, durationInFrames: Math.max(fps, Math.ceil(props.duration * fps))};
};

export const VeloraFilm: React.FC<FilmProps> = (props) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	if (!props.parts.length) return <AbsoluteFill style={{background: C.bg}} />;
	const c = makeCue(props.parts);
	const T = (i: number) => props.coreT[Math.min(i, props.coreT.length - 1)];
	const core: [React.FC<{t: number; T: (i: number) => number}>, number, number][] = [
		[S1, 0, T(22)],
		[S2, T(22) - 0.05, T(51)],
		[S3, T(51) - 0.1, T(77)],
		[S4, T(77) - 0.8, T(103)],
		[S5, T(103) - 0.05, T(136)],
		[S6, T(136) - 0.6, T(157)],
		[S7, T(157) - 0.6, T(177)],
		[S8, T(177) - 0.6, c.P('s1') - 0.6],
	];
	const chapters: [React.FC<ChapterProps & {duration: number}>, number, number][] = [
		[Open, c.P('s1') - 2.5, c.P('flexa')],
		[Flex, c.P('flexa') - 1.4, c.P('paya')],
		[Pay, c.P('paya') - 1.4, c.P('huba')],
		[Hub, c.P('huba') - 1.4, c.P('protecta')],
		[Protect, c.P('protecta') - 1.4, c.P('eco')],
		[Eco, c.P('eco') - 1.4, c.P('final')],
		[Final, c.P('final') - 1.3, props.duration + 1],
	];
	return (
		<AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
			{core.map(([Scene, a, b], i) => (t >= a && t < b ? <Scene key={`c${i}`} t={t} T={T} /> : null))}
			{chapters.map(([Ch, a, b], i) => (t >= a && t < b ? <Ch key={`p${i}`} t={t} c={c} duration={props.duration} /> : null))}
			<FilmSound {...props} />
		</AbsoluteFill>
	);
};

// ─── audio ───────────────────────────────────────────────────────────────────
// VO (Vikram S) ≈ −18.5 LUFS. Music ~16 dB under the voice while speaking, a little up in pauses; each track trimmed
// to the same loudness (Piano Reflections −13, Skyline −9.5, Discover −14.2, Drawing the Sky −13.3, River Flow −11).
const LEVEL = {voice: 0.084, gap: 0.15, end: 0.32};
const TRIM: Record<string, number> = {'piano-reflections': 1, skyline: 0.67, discover: 1.15, 'drawing-the-sky': 1.03, 'river-flow': 0.79};
const XF = 1.6; // crossfade between chapter tracks
const SFX_GAIN = 1.4; // SFX gains were set against the quieter core VO; keep the same relation to this voice

const FilmSound: React.FC<FilmProps> = ({parts, coreT, duration, segments, music}) => {
	const {fps} = useVideoConfig();
	const c = makeCue(parts);
	const T = (i: number) => coreT[Math.min(i, coreT.length - 1)];
	const voEnd = parts[parts.length - 1].end;
	const speech = (t: number) => Math.max(0, ...segments.map((g) => prog(t, g.s - 0.25, 0.25, Easing.linear) * (1 - prog(t, g.e, 0.4, Easing.linear))));
	const level = (t: number) => (t > voEnd ? mix(LEVEL.gap, LEVEL.end, prog(t, voEnd, 1, Easing.linear)) * (1 - prog(t, duration - 2.6, 2.6, Easing.linear)) : mix(LEVEL.gap, LEVEL.voice, speech(t)));

	const W = c.W;
	const sfx: [number, string, number][] = [
		...coreSfx(T),
		// the story continues
		[c.P('s1') - 2.2, 'soft-swoosh', 0.14],
		[W('s1', 'hundred') - 0.3, 'soft-swoosh', 0.16],
		[W('s1', 'together') - 0.3, 'line-draw', 0.14],
		[W('s1', 'velora') - 0.3, 'logo-reveal', 0.14],
		[c.P('flexa') - 2.0, 'soft-swoosh', 0.14],
		// Flex
		[W('flexa', 'sometimes') + 0.2, 'phone-notify', 0.16],
		[W('flexa', 'when') - 0.2, 'soft-swoosh', 0.12],
		[W('flexa', 'rent', 1) - 0.1, 'ui-tap', 0.18],
		[W('flexa', 'salary') - 0.1, 'ui-tap', 0.18],
		[W('flexa', 'timing') - 0.1, 'tension-pulse', 0.12],
		[c.P('flexb') - 0.2, 'logo-reveal', 0.16],
		[W('flexc', 'next') - 0.3, 'ui-tap', 0.18],
		[W('flexc', 'next') + 2.5, 'ui-tap', 0.18],
		[W('flexc', 'if') + 0.2, 'confirm-chime', 0.12],
		[W('flexd', 'because') + 0.2, 'line-draw', 0.12],
		// Pay
		[c.P('paya') + 0.3, 'phone-notify', 0.1],
		[W('paya', 'managing'), 'phone-notify', 0.16],
		[c.P('payb') - 0.3, 'soft-swoosh', 0.14],
		[c.P('payb'), 'logo-reveal', 0.16],
		[c.P('payc') - 0.05, 'ui-tap', 0.18],
		[W('payc', 'authoriz*') + 0.2, 'ui-tap', 0.2],
		[W('payc', 'authoriz*') + 1.8, 'confirm-chime', 0.12],
		[W('payc', 'confirmed') + 0.2, 'confirm-chime', 0.14],
		[W('payd', 'manual*'), 'ui-tap', 0.18],
		[W('payd', 'reminders') - 0.1, 'phone-notify', 0.16],
		[W('payd', 'complete') + 0.3, 'ui-tap', 0.2],
		[W('payd', 'confirmed') + 0.1, 'confirm-chime', 0.14],
		[W('paye', 'view'), 'ui-tap', 0.18],
		[W('paye', 'keep'), 'ui-tap', 0.18],
		[c.P('payf') + 0.1, 'confirm-chime', 0.14],
		[W('payf', 'velora') + 0.2, 'line-draw', 0.12],
		// Hub
		[W('huba', 'but') + 0.5, 'soft-swoosh', 0.14],
		[c.P('hubb') - 0.4, 'soft-swoosh', 0.16],
		[c.P('hubb'), 'logo-reveal', 0.16],
		[c.P('hubd') - 0.2, 'ui-tap', 0.18],
		[c.P('hube') - 0.2, 'ui-tap', 0.18],
		[W('hube', 'whether'), 'ui-tap', 0.16],
		[c.P('hubf') - 0.2, 'soft-swoosh', 0.12],
		[W('hubf', 'one') - 0.2, 'line-draw', 0.14],
		[c.E('hubf') - 0.6, 'line-draw', 0.12],
		// Protect
		[W('protecta', 'delayed') - 0.1, 'tension-pulse', 0.12],
		[c.P('protectb') - 0.1, 'logo-reveal', 0.18],
		[W('protectc', 'review') - 0.3, 'ui-tap', 0.18],
		[W('protectc', 'proceed') - 0.3, 'ui-tap', 0.18],
		[W('protectc', 'if') + 0.2, 'confirm-chime', 0.12],
		[W('protectd', 'covered') - 0.1, 'ui-tap', 0.14],
		[W('protectd', 'evaluates') - 0.1, 'ui-tap', 0.14],
		[W('protecte', 'because') + 0.2, 'line-draw', 0.12],
		// ecosystem + finale
		...(['flexibility', 'simpler', 'access', 'protection'] as const).map((w): [number, string, number] => [W('eco', w) - 0.3, 'ui-tap', 0.16]),
		[W('eco', 'together') - 0.3, 'line-draw', 0.16],
		[W('final', 'from') - 0.2, 'line-draw', 0.14],
		[W('final', 'velora') - 0.4, 'logo-reveal', 0.16],
		[W('final', 'velora', 1) - 0.1, 'sonic-logo', 0.3],
	];
	return (
		<>
			<Audio src={staticFile('velora-film/narration.wav')} />
			{music.map((m, i) => {
				const len = m.to - m.from + XF;
				return (
					<Sequence key={i} from={Math.round(m.from * fps)} durationInFrames={Math.round(len * fps)} layout="none">
						<Audio
							src={staticFile(`velora-film/${m.file}.mp3`)}
							startFrom={Math.max(0, Math.round(m.offset * fps))}
							volume={(f) => {
								const t = m.from + f / fps;
								const env = prog(t, m.from, i === 0 ? 0.8 : XF, Easing.linear) * (1 - prog(t, m.to, XF, Easing.linear));
								return level(t) * env * (TRIM[m.file] ?? 1);
							}}
						/>
					</Sequence>
				);
			})}
			{sfx.map(([at, name, v], i) => (
				<Sfx key={i} at={at} name={name} v={v * SFX_GAIN} dir="velora-film" />
			))}
		</>
	);
};
