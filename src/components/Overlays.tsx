import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Img,
	interpolate,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import type {EditConfig} from '../utils/types';

const {fontFamily} = loadFont('normal', {weights: ['500', '800'], subsets: ['latin']});

export const Logo: React.FC<{logo: NonNullable<EditConfig['logo']>}> = ({logo}) => {
	const {width, height} = useVideoConfig();
	const margin = Math.min(width, height) * 0.045;
	const [v, h] = (logo.position ?? 'top-right').split('-') as ['top' | 'bottom', 'left' | 'right'];
	return (
		<Img
			src={staticFile(logo.src)}
			style={{
				position: 'absolute',
				[v]: margin,
				[h]: margin,
				width: width * (logo.widthScale ?? 0.14),
				height: 'auto',
				opacity: logo.opacity ?? 0.95,
			}}
		/>
	);
};

const TitleContent: React.FC<{title: NonNullable<EditConfig['title']>; durationInFrames: number}> = ({
	title,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const enter = spring({frame, fps, config: {damping: 14, stiffness: 120}});
	const exit = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const base = Math.min(width, height);
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: exit}}>
			<div
				style={{
					fontFamily,
					textAlign: 'center',
					color: 'white',
					padding: `${base * 0.035}px ${base * 0.06}px`,
					borderRadius: base * 0.035,
					background: 'rgba(10,10,14,0.72)',
					backdropFilter: 'blur(12px)',
					maxWidth: width * 0.86,
					transform: `translateY(${(1 - enter) * base * 0.08}px) scale(${0.9 + 0.1 * enter})`,
					opacity: Math.min(1, enter * 1.5),
				}}
			>
				<div style={{fontWeight: 800, fontSize: base * 0.085, lineHeight: 1.05}}>{title.text}</div>
				{title.subtitle ? (
					<div style={{fontWeight: 500, fontSize: base * 0.04, marginTop: base * 0.02, opacity: 0.8}}>
						{title.subtitle}
					</div>
				) : null}
			</div>
		</AbsoluteFill>
	);
};

export const TitleCard: React.FC<{title: NonNullable<EditConfig['title']>}> = ({title}) => {
	const {fps} = useVideoConfig();
	const durationInFrames = Math.round((title.duration ?? 2.5) * fps);
	return (
		<Sequence durationInFrames={durationInFrames}>
			<TitleContent title={title} durationInFrames={durationInFrames} />
		</Sequence>
	);
};

export const BackgroundMusic: React.FC<{music: NonNullable<EditConfig['music']>}> = ({music}) => {
	const {fps, durationInFrames} = useVideoConfig();
	const vol = music.volume ?? 0.12;
	const fadeIn = Math.max(1, (music.fadeIn ?? 1) * fps);
	const fadeOut = Math.max(1, (music.fadeOut ?? 2) * fps);
	return (
		<Audio
			src={staticFile(music.src)}
			loop
			volume={(f) =>
				interpolate(f, [0, fadeIn, durationInFrames - fadeOut, durationInFrames], [0, vol, vol, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})
			}
		/>
	);
};
