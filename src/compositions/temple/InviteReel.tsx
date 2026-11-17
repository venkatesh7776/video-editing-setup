// The Digital Moments — digital video invitation reel (9:16; designed 1080×1920, rendered ×2 → 2160×3840, 30 fps).
// Intro modelled on the temple reel's countdown (temple-wedding-website-reel-4k-v5): blurred temple hero, two text lines,
// 3 → 2 → 1, but an iPhone 15 mockup (sharp screen, countdown on a light tint) instead of the couple, brand mark at the bottom. On "go" the
// invitation starts inside the phone and the phone grows to full screen (bezel melts away → plain 9:16 video), plays
// 35 s of the invitation (muted), then dissolves to a plain CTA card. Soundtrack: ReelAudio-18190 for the whole reel.
import {loadFont as loadManrope} from '@remotion/google-fonts/Manrope';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const manrope = loadManrope('normal', {weights: ['400', '500', '600', '700', '800'], subsets: ['latin']}).fontFamily;
const LOGO_AR = 1334 / 753;
const EASE = Easing.bezier(0.25, 0.1, 0.25, 1);
const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
const prog = (t: number, a: number, d: number, e = EASE) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

export const INVITE_FPS = 30;
const COUNT0 = 1.15; // "3" (after the phone has risen in)
const STEP = 0.95;
export const PLAY = COUNT0 + 3 * STEP - 0.05; // countdown done → the invitation starts in the phone
const GROW = 0.15; // the phone starts growing right after
const GROW_D = 0.9;
export const CLIP = 35; // seconds of the invitation
const CTA = PLAY + CLIP - 0.6; // dissolve to the CTA card
export const INVITE_DURATION = +(CTA + 4.6).toFixed(2);

const GOLD = '#E9A92B'; // The Digital Moments gold (logo)
const GOLD_DK = '#B97A12';
const INK = '#120B06';

const BrandMark: React.FC<{dark?: boolean; o?: number}> = ({dark, o = 1}) => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 92, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, opacity: o}}>
		<Img src={staticFile('temple/tdm-logo.png')} style={{height: 58, width: 58 * LOGO_AR, filter: dark ? undefined : 'drop-shadow(0 3px 9px rgba(0,0,0,0.55))'}} />
		<div style={{fontFamily: manrope, fontWeight: 700, fontSize: 32, letterSpacing: '-0.01em', color: dark ? '#2A1A12' : '#FFFFFF', textShadow: dark ? undefined : '0 2px 9px rgba(0,0,0,0.7)'}}>The Digital Moments</div>
	</div>
);

/** iPhone 15 frame drawn around a screen box; `bezel` 1→0 melts the frame away (screen keeps its box). */
const Phone: React.FC<{x: number; y: number; w: number; h: number; bezel: number; radius: number; children: React.ReactNode}> = ({x, y, w, h, bezel, radius, children}) => {
	const b = 14 * bezel; // black border
	const e = 4 * bezel; // titanium edge
	return (
		<div style={{position: 'absolute', left: x - b - e, top: y - b - e, width: w + 2 * (b + e), height: h + 2 * (b + e), borderRadius: radius + b + e, background: bezel > 0.01 ? 'linear-gradient(135deg,#5B5E64,#2C2E33 40%,#6B6E74 60%,#2C2E33)' : 'transparent', boxShadow: bezel > 0.01 ? `0 ${60 * bezel}px ${120 * bezel}px -40px rgba(0,0,0,${0.85 * bezel})` : 'none'}}>
			{/* side buttons */}
			{bezel > 0.01 ? (
				<>
					<div style={{position: 'absolute', left: -5 * bezel, top: 150, width: 5 * bezel, height: 34, borderRadius: 3, background: '#3A3C41'}} />
					<div style={{position: 'absolute', left: -5 * bezel, top: 210, width: 5 * bezel, height: 62, borderRadius: 3, background: '#3A3C41'}} />
					<div style={{position: 'absolute', left: -5 * bezel, top: 285, width: 5 * bezel, height: 62, borderRadius: 3, background: '#3A3C41'}} />
					<div style={{position: 'absolute', right: -5 * bezel, top: 240, width: 5 * bezel, height: 96, borderRadius: 3, background: '#3A3C41'}} />
				</>
			) : null}
			<div style={{position: 'absolute', left: e, top: e, right: e, bottom: e, borderRadius: radius + b, background: '#050505'}} />
			<div style={{position: 'absolute', left: b + e, top: b + e, width: w, height: h, borderRadius: radius, overflow: 'hidden', background: '#000'}}>
				{children}
				{/* Dynamic Island */}
				<div style={{position: 'absolute', left: '50%', top: 12, width: 104, height: 30, marginLeft: -52, borderRadius: 15, background: '#000', opacity: bezel}} />
			</div>
		</div>
	);
};

export const InviteReel: React.FC = () => {
	const {fps} = useVideoConfig();
	const t = useCurrentFrame() / fps;
	// intro
	const small = prog(t, 0.1, 0.6);
	const big = prog(t, 0.3, 0.7);
	const phoneIn = prog(t, 0.15, 1.3, Easing.bezier(0.22, 1, 0.36, 1));
	const textOut = prog(t, PLAY, 0.45, IN_OUT);
	// grow: phone (screen 440×954, iPhone 15 aspect) → the full 1080×1920 frame
	const g = prog(t, PLAY + GROW, GROW_D, IN_OUT);
	const S0 = {w: 424, h: 920};
	const box = {x: mix(540 - S0.w / 2, 0, g), y: mix(600, 0, g), w: mix(S0.w, 1080, g), h: mix(S0.h, 1920, g)};
	const blur = 1 - prog(t, PLAY - 0.1, 0.5); // light tint behind the countdown (screen stays sharp)
	// CTA
	const cta = prog(t, CTA, 0.8, IN_OUT);
	const head = prog(t, CTA + 0.35, 0.6);
	const btn = prog(t, CTA + 0.8, 0.5, Easing.bezier(0.3, 1.4, 0.5, 1));
	const line = prog(t, CTA + 1.2, 0.6);
	return (
		<AbsoluteFill style={{background: '#0B0708'}}>
			{/* temple backdrop (as in the temple reel) */}
			{g < 1 ? (
				<>
					<AbsoluteFill style={{transform: `scale(${1.06 + t * 0.012})`}}>
						<Img src={staticFile('temple/hero-gopuram-mobile.webp')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
					</AbsoluteFill>
					<AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(12,6,8,0.8) 0%, rgba(12,6,8,0.55) 45%, rgba(12,6,8,0.85) 100%)'}} />
				</>
			) : null}
			{/* small line + the reference reel's curved line (Manrope 700, white, 124 px @4K on two arcs) */}
			<svg viewBox="0 0 2160 760" style={{position: 'absolute', left: 0, top: 230, width: 1080, height: 380, opacity: (1 - textOut) * small, transform: `translateY(${-textOut * 40 + (1 - small) * 14}px)`}}>
				<defs>
					<path id="invArc0" d="M 190 225 Q 1080 45 1970 225" />
				</defs>
				<text style={{fontFamily: manrope, fontWeight: 500, fontSize: 56, fill: 'rgba(255,255,255,0.9)', letterSpacing: '-0.5px'}}>
					<textPath href="#invArc0" startOffset="50%" textAnchor="middle">
						Wedding deserves more than just a regular invitation.
					</textPath>
				</text>
			</svg>
			<svg viewBox="0 0 2160 760" style={{position: 'absolute', left: 0, top: 230, width: 1080, height: 380, opacity: big * (1 - textOut), transform: `translateY(${(1 - big) * 15 - textOut * 40}px)`}}>
				<defs>
					<path id="invArc1" d="M 300 400 Q 1080 180 1860 400" />
					<path id="invArc2" d="M 330 590 Q 1080 380 1830 590" />
				</defs>
				<text style={{fontFamily: manrope, fontWeight: 700, fontSize: 124, fill: '#FFFFFF', letterSpacing: '-3px'}}>
					<textPath href="#invArc1" startOffset="50%" textAnchor="middle">
						Experience the digital
					</textPath>
				</text>
				<text style={{fontFamily: manrope, fontWeight: 700, fontSize: 124, fill: '#FFFFFF', letterSpacing: '-3px'}}>
					<textPath href="#invArc2" startOffset="50%" textAnchor="middle">
						video invitation in
					</textPath>
				</text>
			</svg>
			{/* the couple, revealed with the phone (bottom corners, as in the temple reel) */}
			{g < 1 ? (
				<>
					<Img src={staticFile('temple/groom-cut.png')} style={{position: 'absolute', bottom: 0, left: -65, height: 630, width: (630 * 818) / 1297, opacity: phoneIn * (1 - g), transform: `translateX(${(1 - phoneIn) * -90 - g * 120}px)`, filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.55))'}} />
					<Img src={staticFile('temple/bride-cut.png')} style={{position: 'absolute', bottom: 0, right: -20, height: 630, width: (630 * 666) / 1282, opacity: phoneIn * (1 - g), transform: `translateX(${(1 - phoneIn) * 90 + g * 120}px)`, filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.55))'}} />
				</>
			) : null}
			{/* the phone → full-screen invitation */}
			<div style={{position: 'absolute', inset: 0, opacity: Math.min(1, phoneIn * 1.25), transform: `translateY(${(1 - phoneIn) * 160}px) scale(${mix(0.94, 1, phoneIn)})`, transformOrigin: '50% 60%'}}>
				<Phone x={box.x} y={box.y} w={box.w} h={box.h} bezel={1 - g} radius={mix(58, 0, g)}>
					<AbsoluteFill style={{filter: blur > 0.01 ? `blur(${3 * blur}px)` : undefined, transform: blur > 0.01 ? 'scale(1.02)' : undefined}}>
						{t < PLAY ? (
							<Img src={staticFile('invite/poster.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
						) : (
							<Sequence from={Math.round(PLAY * fps)} durationInFrames={Math.round((CLIP + 0.5) * fps)} layout="none">
								<OffthreadVideo src={staticFile('invite/invite.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
							</Sequence>
						)}
					</AbsoluteFill>
					{blur > 0.01 ? <AbsoluteFill style={{background: `rgba(14,8,4,${0.34 * blur})`}} /> : null}
					{[3, 2, 1].map((n, i) => {
						const a = COUNT0 + i * STEP;
						const p = prog(t, a, 0.3);
						const o = 1 - prog(t, a + STEP - 0.2, 0.18);
						if (p <= 0 || o <= 0) return null;
						return (
							<AbsoluteFill key={n} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<div style={{fontFamily: manrope, fontWeight: 800, fontSize: 180, letterSpacing: '-0.04em', lineHeight: 1, color: '#FFFFFF', fontVariantNumeric: 'lining-nums', opacity: p * o, transform: `scale(${1.15 - 0.15 * p})`, textShadow: '0 8px 30px rgba(0,0,0,0.6)'}}>{n}</div>
							</AbsoluteFill>
						);
					})}
				</Phone>
			</div>
			<BrandMark o={1 - g} />
			{/* CTA card */}
			{cta > 0 ? (
				<AbsoluteFill style={{background: INK, opacity: cta}}>
					<AbsoluteFill style={{background: 'radial-gradient(110% 60% at 50% 42%, rgba(233,169,43,0.16), rgba(18,11,6,0) 70%)'}} />
					<div style={{position: 'absolute', left: 70, right: 70, top: 600, textAlign: 'center', fontFamily: manrope, fontWeight: 800, fontSize: 84, lineHeight: 1.1, letterSpacing: '-0.035em', color: '#FFFFFF', opacity: head, transform: `translateY(${(1 - head) * 30}px)`}}>
						Want this for
						<br />
						<span style={{color: GOLD}}>your wedding?</span>
					</div>
					<div style={{position: 'absolute', left: 0, right: 0, top: 870, display: 'flex', justifyContent: 'center', opacity: Math.min(1, btn * 1.4)}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '26px 64px', borderRadius: 999, background: `linear-gradient(135deg, #F6C451, ${GOLD} 45%, ${GOLD_DK})`, color: INK, fontFamily: manrope, fontWeight: 800, fontSize: 58, letterSpacing: '-0.02em', transform: `scale(${0.8 + 0.2 * btn})`, boxShadow: '0 24px 60px -20px rgba(233,169,43,0.55)'}}>
							DM us
							<svg viewBox="0 0 24 24" width={52} height={52} fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
								<path d="M22 2 11 13 M22 2l-7 20-4-9-9-4 20-7Z" />
							</svg>
						</div>
					</div>
					<div style={{position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', fontFamily: manrope, fontWeight: 600, fontSize: 44, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.86)', opacity: line, transform: `translateY(${(1 - line) * 16}px)`}}>
						Let's create yours together.
					</div>
					<div style={{position: 'absolute', left: 0, right: 0, top: 1120, textAlign: 'center', fontFamily: manrope, fontWeight: 600, fontSize: 34, color: GOLD, opacity: prog(t, CTA + 1.6, 0.6)}}>@thedigitalmoments</div>
					<BrandMark o={prog(t, CTA + 0.5, 0.6)} />
				</AbsoluteFill>
			) : null}
			<Audio src={staticFile('invite/audio.mp3')} volume={(f) => prog(f / fps, 0, 0.3) * (1 - prog(f / fps, INVITE_DURATION - 1.6, 1.6, Easing.linear))} />
		</AbsoluteFill>
	);
};
