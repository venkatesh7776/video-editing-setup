// Picture-in-picture presenter: a lip-synced AI avatar clip in a small circle.
import React from 'react';
import {interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from './brand';

const SIZE = 220;

/** Rendered inside a Sequence that starts where the clip's voice starts. */
export const AvatarBubble: React.FC<{src: string; durationInFrames: number; label?: string}> = ({src, durationInFrames, label = 'Ava · Your AI guide'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame: frame + 8, fps, config: {damping: 13, stiffness: 140}});
	const exit = interpolate(frame, [durationInFrames - 6, durationInFrames + 8], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const scale = enter * exit;
	// Gentle, natural-looking head motion so the still portrait never feels frozen.
	const sway = Math.sin(frame / 37) * 1.2;
	const bob = Math.sin(frame / 23) * 3;
	const ring = 0.5 + 0.5 * Math.sin(frame / 6);

	return (
		<div style={{position: 'absolute', right: 48, bottom: 64, width: SIZE, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${scale})`, transformOrigin: '50% 100%', opacity: exit}}>
			<div
				style={{
					width: SIZE,
					height: SIZE,
					borderRadius: SIZE / 2,
					overflow: 'hidden',
					border: `6px solid ${colors.white}`,
					boxShadow: `0 0 0 ${4 + ring * 4}px rgba(0,230,118,${0.35 + ring * 0.25}), 0 18px 40px rgba(7,36,26,0.45)`,
					background: colors.mintBg,
				}}
			>
				<OffthreadVideo
					src={staticFile(src)}
					muted
					style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(1.08) translateY(${bob}px) rotate(${sway}deg)`}}
				/>
			</div>
			<div style={{marginTop: -16, fontFamily: fonts.heading, fontWeight: 700, fontSize: 19, color: colors.neon, background: colors.greenDeep, padding: '6px 14px', borderRadius: 20, whiteSpace: 'nowrap', boxShadow: '0 6px 16px rgba(7,36,26,0.35)'}}>
				{label}
			</div>
		</div>
	);
};
