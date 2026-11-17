import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, Series, staticFile, useCurrentFrame} from 'remotion';
import type {FramedSegment} from '../utils/timeline';

export type ZoomWindow = {from: number; to: number; scale: number; x: number; y: number};

type Props = {
	src: string;
	segments: FramedSegment[];
	fit: 'cover' | 'contain' | 'blur';
	focus: {x: number; y: number};
	zooms: ZoomWindow[];
	volume: number;
};

const RAMP_FRAMES = 8;

/** Smoothly ramps the zoom in and out around each zoom window (output frames). */
const useZoom = (zooms: ZoomWindow[]) => {
	const frame = useCurrentFrame();
	for (const z of zooms) {
		if (frame < z.from - RAMP_FRAMES || frame > z.to + RAMP_FRAMES) continue;
		const ramp = Math.max(1, Math.min(RAMP_FRAMES, (z.to - z.from) / 2));
		const t = interpolate(frame, [z.from, z.from + ramp, z.to - ramp, z.to], [0, 1, 1, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
		return {scale: 1 + (z.scale - 1) * t, origin: `${z.x * 100}% ${z.y * 100}%`};
	}
	return {scale: 1, origin: '50% 50%'};
};

export const VideoLayer: React.FC<Props> = ({src, segments, fit, focus, zooms, volume}) => {
	const {scale, origin} = useZoom(zooms);
	const objectPosition = `${focus.x * 100}% ${focus.y * 100}%`;

	return (
		<AbsoluteFill style={{backgroundColor: 'black', transform: `scale(${scale})`, transformOrigin: origin}}>
			<Series>
				{segments.map((seg) => (
					<Series.Sequence key={seg.outputFrom} durationInFrames={seg.durationInFrames} premountFor={30}>
						{fit === 'blur' ? (
							<AbsoluteFill style={{overflow: 'hidden'}}>
								<OffthreadVideo
									src={staticFile(src)}
									trimBefore={seg.sourceFrom}
									muted
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
										filter: 'blur(40px) brightness(0.6)',
										transform: 'scale(1.15)',
									}}
								/>
							</AbsoluteFill>
						) : null}
						{/* Wrapped in AbsoluteFill so it stacks above the blurred background. */}
						<AbsoluteFill>
							<OffthreadVideo
								src={staticFile(src)}
								trimBefore={seg.sourceFrom}
								volume={volume}
								style={{
									width: '100%',
									height: '100%',
									objectFit: fit === 'cover' ? 'cover' : 'contain',
									objectPosition,
								}}
							/>
						</AbsoluteFill>
					</Series.Sequence>
				))}
			</Series>
		</AbsoluteFill>
	);
};
