// Final scene (v7): "We're exhibiting — Booth SU80 — HR Tech", laid out after the HR Tech
// exhibitor card the user supplied, in VibeLevel's navy/green. Copy is exactly as provided.
import React from 'react';
import {AbsoluteFill, spring, useVideoConfig} from 'remotion';
import {fonts, palette} from './brand';
import type {SceneCtx} from './context';
import {mix, prog} from './motion';

const CORAL = '#E0594A';
const MAROON = '#8A2626';

/** Vector redraw of the HR Tech™ logo lockup (mark + wordmark + "An HR Executive event"). */
export const HRTechLogo: React.FC<{h: number; o?: number}> = ({h, o = 1}) => {
	const s = h / 100; // design units: lockup is 100 tall
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 22 * s, opacity: o}}>
			{/* Mark traced from the official icon (214×200 reference): two circles on top; bottom-left
			    is a circle with a squared bottom-right corner; bottom-right is a petal with a straight
			    left edge sweeping down to a point. */}
			<svg width={142 * s} height={133 * s} viewBox="28 0 150 188">
				<circle cx="64" cy="40" r="36" fill={CORAL} />
				<circle cx="136" cy="40" r="36" fill={MAROON} />
				<path d="M64 77 A36 36 0 0 0 28 113 A36 36 0 0 0 64 149 L100 149 L100 113 A36 36 0 0 0 64 77 Z" fill={MAROON} />
				<path d="M100 113 A36 36 0 0 1 172 113 A72 72 0 0 1 100 185 Z" fill={CORAL} />
			</svg>
			<div style={{display: 'flex', flexDirection: 'column'}}>
				<div style={{display: 'flex', alignItems: 'flex-start'}}>
					<span style={{fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: 500, fontSize: 88 * s, lineHeight: 0.95, color: '#fff', letterSpacing: -1 * s}}>HR Tech</span>
					<span style={{fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: 500, fontSize: 20 * s, color: '#fff', marginLeft: 6 * s, marginTop: 4 * s}}>TM</span>
				</div>
				<span style={{fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: 400, fontSize: 30 * s, color: '#fff', marginTop: 8 * s}}>An HR Executive event</span>
			</div>
		</div>
	);
};

export const Exhibit: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const {t, scene, beat} = ctx;
	const {fps} = useVideoConfig();
	const a1 = prog(t, beat("We're exhibiting") - 0.1, 0.6);
	const boothAt = beat('Booth SU80');
	const booth = spring({frame: Math.max(0, (t - boothAt) * fps), fps, config: {damping: 13, stiffness: 120}});
	const panel = prog(t, beat('HR Tech') - 0.35, 0.8);
	const logo = prog(t, beat('HR Tech') + 0.1, 0.6);
	const date = prog(t, beat('HR Tech') + 0.45, 0.6);
	const sheen = prog(t, boothAt + 0.9, 1.0);
	const drift = mix(1, 1.03, prog(t, scene.start, scene.end - scene.start));
	return (
		<AbsoluteFill style={{background: `radial-gradient(1400px 800px at 30% 20%, #0B3A26 0%, ${palette.dark} 65%)`, overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${drift})`, transformOrigin: '30% 30%'}}>
				{/* WE'RE EXHIBITING */}
				<div style={{position: 'absolute', left: 140, top: 130, opacity: a1, transform: `translateY(${(1 - a1) * 26}px)`}}>
					<div style={{fontFamily: fonts.heading, fontWeight: 800, fontSize: 64, letterSpacing: '0.06em', color: '#fff'}}>WE’RE EXHIBITING</div>
				</div>
				{/* BOOTH SU80: the largest, most prominent element. */}
				<div style={{position: 'absolute', left: 130, top: 205, opacity: Math.min(1, booth * 1.3), transform: `scale(${mix(0.86, 1, booth)})`, transformOrigin: 'left center'}}>
					<div
						style={{
							fontFamily: fonts.heading,
							fontWeight: 900,
							fontSize: 236,
							lineHeight: 1,
							letterSpacing: '-0.03em',
							whiteSpace: 'nowrap',
							backgroundImage: `linear-gradient(105deg, ${palette.neon} 0%, ${palette.neon} ${mix(-40, 120, sheen) - 12}%, #CFFFE5 ${mix(-40, 120, sheen)}%, ${palette.neon} ${mix(-40, 120, sheen) + 12}%, ${palette.neon} 100%)`,
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
							color: 'transparent',
						}}
					>
						BOOTH SU80
					</div>
				</div>
				{/* Curved lower panel (after the reference's black arc), in deep brand green. */}
				<div
					style={{
						position: 'absolute',
						left: -260,
						top: mix(1080, 560, panel),
						width: 2440,
						height: 1400,
						borderRadius: '50% 50% 0 0 / 34% 34% 0 0',
						background: `linear-gradient(180deg, #0B3B26 0%, #072A1C 60%)`,
						boxShadow: '0 -30px 80px rgba(0,0,0,0.35)',
					}}
				/>
				<div style={{position: 'absolute', left: 0, right: 0, top: 650, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					<div style={{transform: `translateY(${(1 - logo) * 30}px)`}}>
						<HRTechLogo h={150} o={logo} />
					</div>
					<div style={{fontFamily: fonts.heading, fontWeight: 600, fontSize: 46, color: '#fff', marginTop: 34, opacity: date, transform: `translateY(${(1 - date) * 20}px)`, letterSpacing: '0.01em'}}>
						October 20–22, 2026 <span style={{color: palette.neon, margin: '0 14px'}}>·</span> Las Vegas
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
