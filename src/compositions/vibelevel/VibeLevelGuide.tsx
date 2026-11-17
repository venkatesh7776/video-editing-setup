// "VibeLevel Aura — user guide" (16:9, ~2 min). Scene lengths follow the
// voiceover timeline passed in as props (see projects/vibelevel-guide/build.mjs).
import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';
import {AvatarBubble} from './Avatar';
import {colors, fonts} from './brand';
import {BadgesPanel, Connect, FloatingChips, Intro, Observe, Outro, Privacy, Score, TwoWays} from './graphics';
import {ScreenShot} from './ScreenShot';
import {FPS, layout, spokenAt, TRANSITION, type SceneTiming, type VoTimeline} from './timing';

/** `avatarScenes`: scene ids that have a lip-synced presenter clip (work/public/vibelevel-guide/avatar/<id>.mp4). */
export type GuideProps = {timeline: VoTimeline | null; musicVolume?: number; avatarScenes?: string[]};

const IMG = (name: string) => `vibelevel-guide/img/${name}.png`;
const TOP = {imgW: 1920, imgH: 1080};

export const calculateGuideMetadata: CalculateMetadataFunction<GuideProps> = ({props}) => ({
	fps: FPS,
	width: 1920,
	height: 1080,
	durationInFrames: props.timeline ? layout(props.timeline).total : 150,
});

/** Visual for each scene. Camera/cursor times are fractions of the scene length. */
const SceneVisual: React.FC<{scene: SceneTiming}> = ({scene}) => {
	const d = scene.durationInFrames - TRANSITION;
	const f = (x: number) => Math.round(x * d);

	switch (scene.id) {
		case 'intro':
			return <Intro scene={scene} />;
		case 'hero':
			return (
				<ScreenShot
					src={IMG('aura-top')}
					{...TOP}
					url="vibelevel.ai/products/aura"
					camera={[
						{at: 0, x: 960, y: 540, zoom: 1},
						{at: f(0.28), x: 560, y: 480, zoom: 1.4},
						{at: f(0.58), x: 560, y: 520, zoom: 1.4},
						{at: f(0.88), x: 1370, y: 620, zoom: 1.25},
					]}
					cursor={[
						{at: f(0.18), x: 820, y: 760},
						{at: f(0.45), x: 317, y: 851, click: true},
						{at: f(0.8), x: 1250, y: 560},
					]}
					boxes={[{from: f(0.62), to: d, x: 987, y: 288, w: 773, h: 672, label: 'Discover · Learn · Prove'}]}
				/>
			);
		case 'connect':
			return <Connect scene={scene} />;
		case 'settings':
			return (
				<ScreenShot
					src={IMG('dash-settings-top')}
					{...TOP}
					url="vibelevel.ai/aura/settings"
					camera={[
						{at: 0, x: 960, y: 540, zoom: 1},
						{at: f(0.25), x: 1060, y: 860, zoom: 1.2},
						{at: d, x: 1060, y: 880, zoom: 1.24},
					]}
					cursor={[
						{at: f(0.22), x: 900, y: 760},
						{at: f(0.42), x: 352, y: 891, click: true},
						{at: f(0.72), x: 1820, y: 952, click: true},
					]}
					boxes={[
						{from: f(0.3), to: f(0.55), x: 290, y: 874, w: 812, h: 36, label: 'Pick your agent'},
						{from: f(0.6), to: d, x: 290, y: 980, w: 1576, h: 84, label: 'Run one command'},
					]}
				/>
			);
		case 'observe':
			return <Observe scene={scene} />;
		case 'privacy':
			return <Privacy scene={scene} />;
		case 'sessions':
			return (
				<ScreenShot
					src={IMG('dash-sessions-top')}
					{...TOP}
					url="vibelevel.ai/aura/sessions"
					camera={[
						{at: 0, x: 960, y: 540, zoom: 1},
						{at: f(0.3), x: 1060, y: 500, zoom: 1.2},
						{at: d, x: 1060, y: 520, zoom: 1.22},
					]}
					cursor={[
						{at: f(0.3), x: 1300, y: 640},
						{at: f(0.65), x: 1800, y: 402},
						{at: f(0.8), x: 1800, y: 402, click: true},
					]}
					boxes={[{from: f(0.35), to: d, x: 290, y: 296, w: 1600, h: 62, label: 'Analyzed & scored'}]}
				/>
			);
		case 'score':
			return <Score scene={scene} />;
		case 'profile':
			return (
				<ScreenShot
					src={IMG('dash-aura-profile-full')}
					imgW={1920}
					imgH={5333}
					url="vibelevel.ai/aura"
					camera={[
						{at: 0, x: 960, y: 450, zoom: 1},
						{at: f(0.2), x: 560, y: 340, zoom: 1.5},
						{at: f(0.45), x: 560, y: 340, zoom: 1.5},
						{at: f(0.7), x: 1000, y: 1500, zoom: 1.1},
						{at: d, x: 1000, y: 1560, zoom: 1.12},
					]}
					boxes={[
						{from: f(0.18), to: f(0.47), x: 300, y: 326, w: 830, h: 50, label: 'Your AI archetype'},
						{from: f(0.72), to: d, x: 262, y: 1316, w: 1640, h: 696, label: 'Insights into how you work'},
					]}
				/>
			);
		case 'leaderboard':
			return (
				<ScreenShot
					src={IMG('dash-leaderboard-top')}
					{...TOP}
					url="vibelevel.ai/?tab=aura-leaderboard"
					camera={[
						{at: 0, x: 960, y: 540, zoom: 1},
						{at: f(0.45), x: 1040, y: 420, zoom: 1.15},
						{at: d, x: 1040, y: 420, zoom: 1.18},
					]}
					boxes={[{from: f(0.3), to: d, x: 256, y: 230, w: 1640, h: 60, label: 'Climb the leaderboard'}]}
				/>
			);
		case 'labs': {
			const labsAt = spokenAt(scene, 'In AI Labs', 0.25) - 8;
			const rest = d - labsAt;
			const g = (x: number) => Math.round(x * rest);
			return (
				<AbsoluteFill>
					<TwoWays />
					<Sequence from={labsAt} layout="none">
						<AbsoluteFill>
							<ScreenShot
								src={IMG('dash-courses-top')}
								{...TOP}
								url="vibelevel.ai/learn/courses"
								camera={[
									{at: 0, x: 1100, y: 540, zoom: 1},
									{at: g(0.4), x: 1150, y: 420, zoom: 1.45},
									{at: rest, x: 1150, y: 420, zoom: 1.5},
								]}
								cursor={[
									{at: g(0.2), x: 900, y: 760},
									{at: g(0.5), x: 1250, y: 504, click: true},
								]}
								boxes={[{from: g(0.25), to: rest, x: 830, y: 160, w: 516, h: 370, label: 'AI Labs project'}]}
							>
								<FloatingChips from={spokenAt(scene, 'Mentor', 0.6) - labsAt} chips={['🧑‍🏫 AI Mentor', '🤖 Coding Agent', '🎯 Your weakest dimensions']} />
							</ScreenShot>
						</AbsoluteFill>
					</Sequence>
				</AbsoluteFill>
			);
		}
		case 'practice':
			return (
				<ScreenShot
					src={IMG('practice-top')}
					{...TOP}
					url="vibelevel.ai/?tab=practice"
					camera={[
						{at: 0, x: 960, y: 540, zoom: 1},
						{at: f(0.35), x: 900, y: 440, zoom: 1.22},
						{at: d, x: 900, y: 440, zoom: 1.24},
					]}
					cursor={[
						{at: f(0.15), x: 1000, y: 700},
						{at: f(0.4), x: 736, y: 464, click: true},
					]}
					boxes={[{from: f(0.2), to: f(0.55), x: 280, y: 160, w: 520, h: 360, label: 'AI-native challenge'}]}
				>
					<BadgesPanel from={spokenAt(scene, 'earn verified', 0.55) - 6} />
				</ScreenShot>
			);
		case 'campus':
			return (
				<ScreenShot
					src={IMG('campus-top')}
					{...TOP}
					url="vibelevel.ai/products/campus"
					camera={[
						{at: 0, x: 960, y: 540, zoom: 1},
						{at: f(0.5), x: 960, y: 420, zoom: 1.3},
						{at: d, x: 960, y: 430, zoom: 1.32},
					]}
					cursor={[
						{at: f(0.25), x: 1200, y: 760},
						{at: f(0.55), x: 848, y: 656, click: true},
					]}
				>
					<FloatingChips from={spokenAt(scene, 'vibeathons', 0.5) - 4} chips={['🏆 Vibeathons', '📈 Live leaderboards', '🤝 Hiring partners']} />
				</ScreenShot>
			);
		case 'outro':
			return <Outro scene={scene} />;
		default:
			return <AbsoluteFill style={{background: colors.page}} />;
	}
};

const Subtitles: React.FC<{scenes: SceneTiming[]}> = ({scenes}) => {
	const frame = useCurrentFrame();
	const cues = scenes.flatMap((s) =>
		s.chunks.map((c) => ({text: c.text, from: s.from + s.voFrom + c.start * FPS, to: s.from + s.voFrom + c.end * FPS})),
	);
	// Hold each cue across short pauses so subtitles don't flicker.
	const cue = cues.find((c, i) => frame >= c.from && frame < Math.max(c.to, Math.min(cues[i + 1]?.from ?? Infinity, c.to + 8)));
	if (!cue) return null;
	const age = frame - cue.from;
	const opacity = interpolate(age, [0, 4], [0, 1], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 44}}>
			<div
				style={{
					maxWidth: 1400,
					textAlign: 'center',
					fontFamily: fonts.body,
					fontWeight: 600,
					fontSize: 42,
					lineHeight: 1.3,
					color: colors.white,
					background: 'rgba(8,17,31,0.82)',
					padding: '12px 30px',
					borderRadius: 14,
					opacity,
					boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
				}}
			>
				{cue.text}
			</div>
		</AbsoluteFill>
	);
};

export const VibeLevelGuide: React.FC<GuideProps> = ({timeline, musicVolume = 0.2, avatarScenes = []}) => {
	if (!timeline) {
		return <AbsoluteFill style={{background: colors.greenDeep, color: 'white', justifyContent: 'center', alignItems: 'center', fontSize: 40}}>Run: node projects/vibelevel-guide/build.mjs</AbsoluteFill>;
	}
	const {scenes, total} = layout(timeline);
	const voice = scenes.map((s) => ({from: s.from + s.voFrom, to: s.from + s.voFrom + Math.round(s.duration * FPS)}));

	// Music sits under the voice: louder in gaps, ducked while speaking, faded at both ends.
	const musicVol = (f: number) => {
		const duck = Math.max(0, ...voice.map((v) => interpolate(f, [v.from - 12, v.from, v.to, v.to + 18], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
		const edges = interpolate(f, [0, 30, total - 75, total], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		return musicVolume * (1 - 0.55 * duck) * edges;
	};

	return (
		<AbsoluteFill style={{background: colors.page}}>
			<TransitionSeries>
				{scenes.map((s, i) => (
					<React.Fragment key={s.id}>
						{i > 0 ? <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANSITION})} /> : null}
						<TransitionSeries.Sequence durationInFrames={s.durationInFrames}>
							<SceneVisual scene={s} />
						</TransitionSeries.Sequence>
					</React.Fragment>
				))}
			</TransitionSeries>
			{scenes
				.filter((s) => avatarScenes.includes(s.id))
				.map((s) => (
					<Sequence key={`avatar-${s.id}`} from={s.from + s.voFrom} durationInFrames={Math.ceil(s.duration * FPS) + 14}>
						<AvatarBubble src={`vibelevel-guide/avatar/${s.id}.mp4`} durationInFrames={Math.ceil(s.duration * FPS)} />
					</Sequence>
				))}
			<Subtitles scenes={scenes} />
			{scenes.map((s) => (
				<Sequence key={s.id} from={s.from + s.voFrom} durationInFrames={Math.ceil(s.duration * FPS) + 5}>
					<Audio src={staticFile(`vibelevel-guide/vo/${s.file}`)} />
				</Sequence>
			))}
			<Audio src={staticFile('vibelevel-guide/music.wav')} loop volume={musicVol} />
		</AbsoluteFill>
	);
};
