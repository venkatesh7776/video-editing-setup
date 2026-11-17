// The Digital Moments — Hindu (Temple theme) wedding-website reel, 4K 9:16 (projects/temple-reel).
// Remotion renders only the 4K intro (the real wedding site scrolling under frosted glass, curved serif line,
// 3 → 2 → 1) and a transparent still overlay (top headline + brand mark). FFmpeg composites them onto the
// untouched 4K phone footage, so the main shot never passes through a browser screenshot.
import {loadFont as loadManrope} from '@remotion/google-fonts/Manrope';
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const manrope = loadManrope('normal', {weights: ['300', '500', '600', '700', '800'], subsets: ['latin']}).fontFamily;

export const W = 2160;
export const H = 3840;
const LOGO_AR = 1334 / 753;
const prog = (t: number, a: number, d: number, e = Easing.bezier(0.25, 0.1, 0.25, 1)) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

/** The brand mark: same place from the first frame to the last (intro and main shot). */
const BrandMark: React.FC = () => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30}}>
		<Img src={staticFile('temple/tdm-logo.png')} style={{height: 118, width: 118 * LOGO_AR, filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.55))'}} />
		<div style={{fontFamily: manrope, fontWeight: 700, fontSize: 64, letterSpacing: '-0.01em', color: '#FFFFFF', textShadow: '0 4px 18px rgba(0,0,0,0.7)'}}>The Digital Moments</div>
	</div>
);

const ARC = ({id, d}: {id: string; d: string}) => <path id={id} d={d} />;

/** The couple, cut out (no background), standing in the bottom corners. */
const Cutout: React.FC<{src: string; side: 'left' | 'right'; h: number; ar: number; p: number; inset: number}> = ({src, side, h, ar, p, inset}) => (
	<Img src={staticFile(`temple/${src}`)} style={{position: 'absolute', bottom: 0, [side]: inset, height: h, width: h * ar, opacity: p, transform: `translateX(${(1 - p) * (side === 'left' ? -140 : 140)}px)`, filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.55))'}} />
);

/** Intro: the site's static hero (gopuram), groom left / bride right, curved line, countdown 3 → 2 → 1. */
export const TempleIntro: React.FC = () => {
	const {fps} = useVideoConfig();
	const t = useCurrentFrame() / fps;
	const lineIn = prog(t, 0.1, 0.7);
	const pics = prog(t, 0.25, 0.9);
	const nums = [3, 2, 1];
	return (
		<AbsoluteFill style={{background: '#0B0708'}}>
			<AbsoluteFill style={{transform: `scale(${1.06 + t * 0.012})`}}>
				<Img src={staticFile('temple/hero-gopuram-mobile.webp')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(6px)'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(12,6,8,0.78) 0%, rgba(12,6,8,0.6) 45%, rgba(12,6,8,0.82) 100%)'}} />
			{/* curved serif line */}
			<svg viewBox="0 0 2160 760" style={{position: 'absolute', left: 0, top: 470, width: W, height: 760, opacity: lineIn, transform: `translateY(${(1 - lineIn) * 30}px)`}}>
				<defs>
					<ARC id="arc1" d="M 300 400 Q 1080 180 1860 400" />
					<ARC id="arc2" d="M 330 590 Q 1080 380 1830 590" />
				</defs>
				<text style={{fontFamily: manrope, fontWeight: 700, fontSize: 124, fill: '#FFFFFF', letterSpacing: '-3px'}}>
					<textPath href="#arc1" startOffset="50%" textAnchor="middle">
						Experience a beautiful
					</textPath>
				</text>
				<text style={{fontFamily: manrope, fontWeight: 700, fontSize: 124, fill: '#FFFFFF', letterSpacing: '-3px'}}>
					<textPath href="#arc2" startOffset="50%" textAnchor="middle">
						digital wedding website in
					</textPath>
				</text>
			</svg>
			{/* 3 → 2 → 1 */}
			{nums.map((n, i) => {
				const a = 0.55 + i * 1.05;
				const p = prog(t, a, 0.35);
				const o = 1 - prog(t, a + 0.82, 0.22);
				if (p <= 0 || o <= 0) return null;
				return (
					<div key={n} style={{position: 'absolute', left: 0, right: 0, top: 1290, textAlign: 'center', fontFamily: manrope, fontWeight: 800, fontSize: 500, letterSpacing: '-0.04em', lineHeight: 1, color: '#FFFFFF', fontVariantNumeric: 'lining-nums', opacity: p * o, transform: `scale(${1.12 - 0.12 * p})`, textShadow: '0 20px 60px rgba(0,0,0,0.5)'}}>
						{n}
					</div>
				);
			})}
			{/* groom left, bride right */}
			<Cutout src="groom-cut.png" side="left" h={1260} ar={818 / 1297} p={pics} inset={-130} />
			<Cutout src="bride-cut.png" side="right" h={1260} ar={666 / 1282} p={pics} inset={-40} />
			<BrandMark />
		</AbsoluteFill>
	);
};

/** Transparent overlay for the main shot: fixed headline at the top + the brand mark. */
export const TempleOverlay: React.FC = () => (
	<AbsoluteFill>
		<AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.45) 21%, rgba(0,0,0,0) 30%)'}} />
		<AbsoluteFill style={{background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 12%)'}} />
		<div style={{position: 'absolute', left: 110, right: 110, top: 520, textAlign: 'center', fontFamily: manrope, fontWeight: 800, fontSize: 118, lineHeight: 1.12, letterSpacing: '-0.035em', color: '#F4D30B', WebkitTextStroke: '6px #2A2205', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.45)'}}>
			The Wedding Website every
			<br />
			2026–27 couple needs.
		</div>
		<BrandMark />
	</AbsoluteFill>
);

/** Closing CTA: same temple-hero look as the intro, couple in the corners, "DM me". */
export const TempleOutro: React.FC = () => {
	const {fps} = useVideoConfig();
	const t = useCurrentFrame() / fps;
	const head = prog(t, 0.35, 0.6);
	const btn = prog(t, 0.85, 0.5, Easing.bezier(0.3, 1.4, 0.5, 1));
	const pics = prog(t, 0.2, 0.9);
	return (
		<AbsoluteFill style={{background: '#0B0708'}}>
			<AbsoluteFill style={{transform: `scale(${1.08 - t * 0.01})`}}>
				<Img src={staticFile('temple/hero-gopuram-mobile.webp')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(6px)'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(12,6,8,0.82) 0%, rgba(12,6,8,0.66) 45%, rgba(12,6,8,0.84) 100%)'}} />
			<div style={{position: 'absolute', left: 140, right: 140, top: 900, textAlign: 'center', fontFamily: manrope, fontWeight: 800, fontSize: 150, lineHeight: 1.1, letterSpacing: '-0.04em', color: '#FFFFFF', opacity: head, transform: `translateY(${(1 - head) * 40}px)`, textShadow: '0 10px 40px rgba(0,0,0,0.5)'}}>
				Want this website
				<br />
				for <span style={{color: '#F4D30B'}}>your wedding?</span>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1420, display: 'flex', justifyContent: 'center', opacity: Math.min(1, btn * 1.4)}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 28, padding: '46px 110px', borderRadius: 999, background: '#F4D30B', color: '#1A1405', fontFamily: manrope, fontWeight: 800, fontSize: 104, letterSpacing: '-0.02em', transform: `scale(${0.8 + 0.2 * btn})`, boxShadow: '0 30px 70px -20px rgba(244,211,11,0.45)'}}>
					DM me
					<svg viewBox="0 0 24 24" width={96} height={96} fill="none" stroke="#1A1405" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
						<path d="M22 2 11 13 M22 2l-7 20-4-9-9-4 20-7Z" />
					</svg>
				</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1760, textAlign: 'center', fontFamily: manrope, fontWeight: 600, fontSize: 60, color: 'rgba(255,255,255,0.9)', opacity: prog(t, 1.2, 0.5)}}>@thedigitalmoments</div>
			<Cutout src="groom-cut.png" side="left" h={1260} ar={818 / 1297} p={pics} inset={-130} />
			<Cutout src="bride-cut.png" side="right" h={1260} ar={666 / 1282} p={pics} inset={-40} />
			<BrandMark />
		</AbsoluteFill>
	);
};

/** Transparent layer: the DM line under the headline (FFmpeg fades it in 5 s after the headline). */
export const TempleDmLine: React.FC = () => (
	<AbsoluteFill>
		<div style={{position: 'absolute', left: 0, right: 0, top: 870, textAlign: 'center', fontFamily: manrope, fontWeight: 600, fontSize: 60, letterSpacing: '-0.01em', color: '#FFFFFF', textShadow: '0 3px 12px rgba(0,0,0,0.85)'}}>DM us to get your wedding website! 💌</div>
	</AbsoluteFill>
);
