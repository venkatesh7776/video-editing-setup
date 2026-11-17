// Wedding reel 2 (9:16, ~31 s): "A client asked me to turn their wedding invitation into a website."
// Emerald and champagne-gold look; a layered 3D invitation card slides away as an iPhone 15
// pulls in with the primary site (blurred until "here's what I built"), then the second site, then the CTA.
// All timing comes from the word timings of the ElevenLabs voiceover (props.words).
import {loadFont as loadPinyon} from '@remotion/google-fonts/PinyonScript';
import {loadFont as loadSora} from '@remotion/google-fonts/Sora';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';

const sora = loadSora('normal', {weights: ['400', '500', '600', '700', '800'], subsets: ['latin']}).fontFamily;
const script = loadPinyon('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;

const FPS = 30;
const C = {
	bg0: '#020E0C',
	bg1: '#06231F',
	bg2: '#0B3A34',
	ivory: '#FBF6EC',
	gold: '#E6C27A',
	goldLight: '#F7E2AE',
	goldDeep: '#B48A3C',
	muted: 'rgba(251,246,236,0.55)',
};

export type Word = {w: string; s: number; e: number};
export type Span = {s: number; e: number};
export type Reel2Props = {words: Word[]; voDuration: number; lead: number; duration: number; musicOffset: number; segments: Span[]};

export const calculateReel2Metadata: CalculateMetadataFunction<Reel2Props> = ({props}) => ({
	fps: FPS,
	width: 1080,
	height: 1920,
	durationInFrames: Math.max(30, Math.ceil(props.duration * FPS)),
});

// ─── helpers ─────────────────────────────────────────────────────────────────
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const prog = (t: number, from: number, dur: number, e = ease) => interpolate(t, [from, from + dur], [0, 1], {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');

// ─── layout ──────────────────────────────────────────────────────────────────
const SCREEN = {w: 520, h: Math.round((520 * 1920) / 886)}; // iPhone 15 ratio, 520×1127
const BEZEL = 12;
const FRAME = 5;
const PHONE = {w: SCREEN.w + (BEZEL + FRAME) * 2, h: SCREEN.h + (BEZEL + FRAME) * 2};
const SCREEN_R = Math.round(SCREEN.w * 0.142);
const PHONE_Y = 640;

// ─── background: emerald depth, slow champagne light, film grain ─────────────
const Backdrop: React.FC<{t: number; lift: number}> = ({t, lift}) => {
	const lx = 50 + Math.sin(t * 0.25) * 18;
	const ly = 40 + Math.cos(t * 0.21) * 10;
	return (
		<AbsoluteFill style={{background: `radial-gradient(1500px 1900px at 50% 45%, ${C.bg2} 0%, ${C.bg1} 38%, ${C.bg0} 78%)`, overflow: 'hidden'}}>
			<AbsoluteFill style={{background: `radial-gradient(700px 700px at ${lx}% ${ly}%, rgba(230,194,122,${0.1 + 0.12 * lift}) 0%, transparent 70%)`}} />
			<AbsoluteFill style={{background: `radial-gradient(900px 600px at ${100 - lx}% 88%, rgba(120,200,180,${0.06 + 0.04 * lift}) 0%, transparent 70%)`}} />
			{/* thin champagne arcs, very faint, slowly rotating (an echo of the sites' arch motif) */}
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.1 + 0.05 * lift}}>
				<g transform={`rotate(${t * 2} 540 1060)`} fill="none" stroke={C.gold} strokeWidth={1.2}>
					<circle cx={540} cy={1060} r={620} />
					<circle cx={540} cy={1060} r={760} strokeDasharray="2 14" />
				</g>
			</svg>
			<AbsoluteFill style={{background: 'radial-gradient(1200px 1800px at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)'}} />
			{/* film grain */}
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.08, mixBlendMode: 'overlay'}}>
				<filter id="grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(t * 12) % 8} />
				</filter>
				<rect width="100%" height="100%" filter="url(#grain)" />
			</svg>
		</AbsoluteFill>
	);
};

// ─── kinetic headline (the voiceover, phrase by phrase) ──────────────────────
const GOLD: React.CSSProperties = {backgroundImage: `linear-gradient(180deg, ${C.goldLight} 0%, ${C.gold} 55%, ${C.goldDeep} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

type Phrase = {text: string; start: number; end: number; gold?: string[]};

const Phrase: React.FC<{t: number; p: Phrase; size: number; top: number; times: number[]}> = ({t, p, size, top, times}) => {
	const out = prog(t, p.end - 0.24, 0.2, Easing.in(Easing.cubic)); // fully gone by p.end − 0.04 …
	if (t < p.start - 0.05 || out >= 1) return null;
	const words = p.text.split(' ');
	return (
		<div style={{position: 'absolute', left: 70, width: 940, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: size * 0.26, rowGap: size * 0.06, opacity: 1 - out, transform: `translateY(${-out * 36}px)`}}>
			{words.map((w, i) => {
				const at = times[i] ?? p.start;
				const r = prog(t, at - 0.03, 0.5); // … before the next line's first word starts to rise
				const gold = (p.gold ?? []).includes(key(w));
				return (
					<span key={i} style={{display: 'inline-block', overflow: 'hidden', padding: `0 0.02em ${size * 0.12}px`}}>
						<span
							style={{
								display: 'inline-block',
								fontFamily: sora,
								fontWeight: 800,
								fontSize: size,
								lineHeight: 1.06,
								letterSpacing: `${mix(0.06, -0.03, r)}em`,
								color: C.ivory,
								...(gold ? GOLD : {}),
								transform: `translateY(${(1 - r) * 105}%) rotate(${(1 - r) * 4}deg)`,
								transformOrigin: 'left bottom',
								textShadow: gold ? 'none' : '0 6px 28px rgba(0,0,0,0.45)',
							}}
						>
							{w}
						</span>
					</span>
				);
			})}
		</div>
	);
};

// ─── the invitation card: a layered 3D paper object (fictional couple) ──────
// Layers in depth: emerald envelope (z −60) · card stock with real edge thickness · printed face (z 0)
// · laser-cut arch overlay (z 26) · gold monogram seal (z 70). The card sways so the depth reads.
const CW = 620;
const CH = 880;
const FOIL = 'linear-gradient(135deg, #9C7434 0%, #E9C98A 30%, #B68B3F 50%, #F3DDA4 72%, #A47A36 100%)';
const ARCH = (inset: number) => {
	const x0 = inset;
	const x1 = CW - inset;
	const mid = CW / 2;
	const top = inset + 250;
	return `M ${x0} ${CH - inset} L ${x0} ${top} C ${x0} ${inset + 70} ${mid - 120} ${inset} ${mid} ${inset} C ${mid + 120} ${inset} ${x1} ${inset + 70} ${x1} ${top} L ${x1} ${CH - inset} Z`;
};
const Sheen: React.FC<{p: number; a?: number}> = ({p, a = 0.7}) => <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${p - 16}%, rgba(255,246,220,${a}) ${p}%, transparent ${p + 16}%)`, mixBlendMode: 'soft-light'}} />;
const lbl = (size: number, extra: React.CSSProperties = {}): React.CSSProperties => ({fontFamily: sora, fontWeight: 500, fontSize: size, letterSpacing: size * 0.24, color: '#8B6A33', ...extra});

const InviteCard: React.FC<{t: number; sheenAt: number; rx: number; ry: number}> = ({t, sheenAt, rx, ry}) => {
	const sheen = mix(-40, 140, prog(t, sheenAt, 1.4, inOut));
	const layer = (z: number, style: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: 0, top: 0, width: CW, height: CH, transform: `translateZ(${z}px)`, ...style});
	return (
		<div style={{position: 'relative', width: CW, height: CH, transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg)`}}>
			{/* envelope behind, peeking out */}
			<div style={layer(-60, {left: -40, top: 70, width: CW + 80, height: CH - 40, borderRadius: 14, background: 'linear-gradient(150deg, #1F6B5C 0%, #0F4A40 55%, #0A3430 100%)', boxShadow: '0 50px 110px rgba(0,0,0,0.6), inset 0 0 0 3px rgba(230,194,122,0.85)', transform: 'translateZ(-60px) rotateZ(-5deg)'})}>
				<svg width={CW + 80} height={CH - 40} style={{position: 'absolute', inset: 0}}>
					<path d={`M 0 0 L ${(CW + 80) / 2} ${(CH - 40) * 0.42} L ${CW + 80} 0`} fill="none" stroke="rgba(230,194,122,0.6)" strokeWidth={2} />
				</svg>
			</div>
			{/* card stock thickness */}
			{Array.from({length: 7}, (_, k) => (
				<div key={k} style={layer(-(k + 1) * 1.2, {borderRadius: 16, background: k === 6 ? '#B89A62' : '#E3D2AE'})} />
			))}
			{/* printed face */}
			<div style={layer(0, {borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(160deg, #FFFBF2 0%, #F7EDDA 60%, #F0E1C4 100%)', boxShadow: '0 40px 90px rgba(0,0,0,0.45)'})}>
				<svg width={CW} height={CH} style={{position: 'absolute', inset: 0, opacity: 0.14, mixBlendMode: 'multiply'}}>
					<filter id="paper">
						<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves={3} seed={3} />
						<feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.9 0" />
					</filter>
					<rect width="100%" height="100%" filter="url(#paper)" />
				</svg>
				<div style={{position: 'absolute', left: 0, right: 0, top: 196, textAlign: 'center', color: '#1C2E57'}}>
					<div style={lbl(15)}>TOGETHER WITH THEIR FAMILIES</div>
					<div style={{fontFamily: sora, fontWeight: 500, fontSize: 18, color: '#4A4F66', marginTop: 12, lineHeight: 1.5}}>
						Mr. &amp; Mrs. Rakesh Malhotra
						<br />
						Mr. &amp; Mrs. Suresh Iyer
					</div>
					<div style={lbl(13, {marginTop: 20})}>REQUEST THE HONOUR OF YOUR PRESENCE</div>
					<div style={lbl(13, {marginTop: 4})}>AT THE WEDDING OF</div>
					<div style={{fontFamily: script, fontSize: 96, lineHeight: 1.0, marginTop: 22, color: '#1C2E57'}}>Arjun</div>
					<div style={{fontFamily: script, fontSize: 70, lineHeight: 0.8, color: '#A47A36'}}>&amp;</div>
					<div style={{fontFamily: script, fontSize: 96, lineHeight: 1.0, color: '#1C2E57'}}>Meera</div>
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 26}}>
						<div style={{width: 130, borderTop: '1.5px solid #B68B3F', borderBottom: '1.5px solid #B68B3F', padding: '8px 0', ...lbl(14, {letterSpacing: 3})}}>SATURDAY</div>
						<div style={{fontFamily: sora, fontWeight: 700, fontSize: 56, lineHeight: 1, color: '#1C2E57'}}>12</div>
						<div style={{width: 130, borderTop: '1.5px solid #B68B3F', borderBottom: '1.5px solid #B68B3F', padding: '8px 0', ...lbl(14, {letterSpacing: 3})}}>DEC 2026</div>
					</div>
					<div style={lbl(13, {marginTop: 18, color: '#4A4F66'})}>SEVEN O&apos;CLOCK IN THE EVENING</div>
					<div style={{fontFamily: sora, fontWeight: 700, fontSize: 21, letterSpacing: 1.5, color: '#1C2E57', marginTop: 16}}>The Ivory Courtyard</div>
					<div style={lbl(13, {marginTop: 6, color: '#4A4F66'})}>UDAIPUR, RAJASTHAN</div>
				</div>
				<Sheen p={sheen} />
			</div>
			{/* laser-cut arch overlay, floating above the face (casts a soft shadow onto it) */}
			<div style={layer(26, {filter: 'drop-shadow(0 14px 14px rgba(60,40,10,0.35))'})}>
				<svg width={CW} height={CH} style={{position: 'absolute', inset: 0}}>
					<defs>
						<linearGradient id="foil2" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0" stopColor="#9C7434" />
							<stop offset="0.35" stopColor="#E9C98A" />
							<stop offset="0.55" stopColor="#B68B3F" />
							<stop offset="0.8" stopColor="#F3DDA4" />
							<stop offset="1" stopColor="#A47A36" />
						</linearGradient>
						<linearGradient id="stock" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#FFFDF7" />
							<stop offset="1" stopColor="#F1E4C9" />
						</linearGradient>
					</defs>
					<path d={`M 0 16 Q 0 0 16 0 L ${CW - 16} 0 Q ${CW} 0 ${CW} 16 L ${CW} ${CH - 16} Q ${CW} ${CH} ${CW - 16} ${CH} L 16 ${CH} Q 0 ${CH} 0 ${CH - 16} Z ${ARCH(46)}`} fill="url(#stock)" fillRule="evenodd" />
					<path d={ARCH(46)} fill="none" stroke="url(#foil2)" strokeWidth={3} />
					<path d={ARCH(30)} fill="none" stroke="url(#foil2)" strokeWidth={1.2} />
					{/* corner filigree */}
					{[
						[22, CH - 22, 1, -1],
						[CW - 22, CH - 22, -1, -1],
					].map(([x, y, sx, sy], i) => (
						<g key={i} transform={`translate(${x} ${y}) scale(${sx} ${sy})`} fill="none" stroke="url(#foil2)" strokeWidth={1.6}>
							<path d="M 0 0 C 10 -30 30 -40 58 -40 M 0 0 C 30 -10 40 -30 40 -58" />
							<circle cx={8} cy={-8} r={3} fill="url(#foil2)" />
						</g>
					))}
				</svg>
				<Sheen p={sheen - 10} a={0.55} />
			</div>
			{/* gold monogram seal */}
			<div style={layer(70, {left: CW / 2 - 64, top: 2, width: 128, height: 128, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #FBE7B5 0%, #E2BC72 35%, #A97E35 75%, #7E5A22 100%)', boxShadow: '0 18px 30px rgba(40,25,5,0.45), inset 0 -6px 12px rgba(80,50,10,0.5), inset 0 5px 10px rgba(255,245,215,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
				<div style={{width: 100, height: 100, borderRadius: '50%', border: '2px solid rgba(110,78,28,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: script, fontSize: 50, color: '#5E4114', textShadow: '0 1px 0 rgba(255,240,200,0.7)'}}>A&amp;M</div>
			</div>
		</div>
	);
};

// ─── iPhone 15 with steady Chrome bars ───────────────────────────────────────
type Clip = {site: 'A' | 'B'; at: number; to: number; src: number; rate?: number};
type Cam = {t: number; z: number; y: number};
const camAt = (keys: Cam[], t: number) => {
	if (!keys.length) return {z: 1, y: 0.5};
	if (t <= keys[0].t) return keys[0];
	for (let i = 0; i < keys.length - 1; i++) {
		if (t <= keys[i + 1].t) {
			const p = inOut((t - keys[i].t) / Math.max(0.001, keys[i + 1].t - keys[i].t));
			return {z: mix(keys[i].z, keys[i + 1].z, p), y: mix(keys[i].y, keys[i + 1].y, p)};
		}
	}
	return keys[keys.length - 1];
};

const Screen: React.FC<{t: number; clips: Clip[]; cam?: Cam[]; blur?: number; children?: React.ReactNode}> = ({t, clips, cam = [], blur = 0, children}) => {
	const c = camAt(cam, t);
	const vis = clips.map((clip, i) => (t < clip.at - 0.3 || t > clip.to + 0.35 ? 0 : i === 0 ? 1 : prog(t, clip.at - 0.25, 0.35, Easing.linear)));
	return (
		<AbsoluteFill style={{filter: blur > 0.05 ? `blur(${blur}px) saturate(${1 + blur * 0.02})` : undefined, transform: blur > 0.05 ? `scale(${1 + blur * 0.004})` : undefined}}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${c.z})`, transformOrigin: `50% ${c.y * 100}%`}}>
				{clips.map((clip, i) =>
					vis[i] <= 0 ? null : (
						<AbsoluteFill key={i} style={{opacity: vis[i]}}>
							<Sequence from={Math.round(clip.at * FPS)} layout="none">
								<OffthreadVideo src={staticFile(`wedding2/site-${clip.site}-clean.mp4`)} startFrom={Math.round(clip.src * FPS)} playbackRate={clip.rate ?? 1} muted style={{width: SCREEN.w, height: SCREEN.h, objectFit: 'fill'}} />
							</Sequence>
						</AbsoluteFill>
					),
				)}
				{children}
			</div>
			{c.z > 1.001
				? clips.map((clip, i) =>
						vis[i] <= 0 ? null : (
							<AbsoluteFill key={`b${i}`} style={{opacity: vis[i]}}>
								<Img src={staticFile(`wedding2/chrome-top-${clip.site}.png`)} style={{position: 'absolute', left: 0, top: 0, width: SCREEN.w, height: (SCREEN.w * 245) / 886}} />
								<Img src={staticFile(`wedding2/chrome-bot-${clip.site}.png`)} style={{position: 'absolute', left: 0, bottom: 0, width: SCREEN.w, height: (SCREEN.w * 175) / 886}} />
							</AbsoluteFill>
						),
					)
				: null}
		</AbsoluteFill>
	);
};

const Phone: React.FC<{style?: React.CSSProperties; children: React.ReactNode; glow?: number}> = ({style, children, glow = 1}) => {
	const outerR = SCREEN_R + BEZEL + FRAME;
	const btn = (side: 'l' | 'r', top: number, h: number) => <div style={{position: 'absolute', [side === 'l' ? 'left' : 'right']: -3, top, width: 5, height: h, borderRadius: 3, background: 'linear-gradient(90deg, #1E1E21, #4A4A4F 50%, #1E1E21)'}} />;
	return (
		<div style={{position: 'absolute', width: PHONE.w, height: PHONE.h, ...style}}>
			{btn('l', 138, 30)}
			{btn('l', 202, 60)}
			{btn('l', 274, 60)}
			{btn('r', 228, 96)}
			<div style={{position: 'absolute', inset: 0, borderRadius: outerR, background: 'linear-gradient(145deg, #5A5A60 0%, #222225 14%, #161618 50%, #26262A 86%, #5E5E64 100%)', boxShadow: `0 60px 120px rgba(0,0,0,0.6), 0 0 ${120 * glow}px rgba(230,194,122,${0.18 * glow})`}} />
			<div style={{position: 'absolute', inset: FRAME, borderRadius: outerR - FRAME, background: '#000'}} />
			<div style={{position: 'absolute', left: FRAME + BEZEL, top: FRAME + BEZEL, width: SCREEN.w, height: SCREEN.h, borderRadius: SCREEN_R, overflow: 'hidden', background: '#000'}}>
				{children}
				<div style={{position: 'absolute', left: '50%', top: Math.round(SCREEN.w * 0.03), width: Math.round(SCREEN.w * 0.32), height: Math.round(SCREEN.w * 0.094), marginLeft: -Math.round(SCREEN.w * 0.16), borderRadius: 999, background: '#000'}} />
				<div style={{position: 'absolute', inset: 0, borderRadius: SCREEN_R, background: 'linear-gradient(118deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 26%)', pointerEvents: 'none'}} />
			</div>
		</div>
	);
};

/** Frosted "locked" overlay on the blurred site: a premium tease, not a UI claim. */
const Tease: React.FC<{t: number; o: number}> = ({t, o}) => {
	if (o <= 0) return null;
	const scan = (t * 0.55) % 1;
	return (
		<AbsoluteFill style={{opacity: o}}>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,35,31,0.25), rgba(6,35,31,0.45))'}} />
			<AbsoluteFill style={{background: `linear-gradient(180deg, transparent ${scan * 100 - 8}%, rgba(247,226,174,0.35) ${scan * 100}%, transparent ${scan * 100 + 8}%)`}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: '44%', display: 'flex', justifyContent: 'center'}}>
				<div style={{padding: '16px 30px', borderRadius: 999, background: 'rgba(2,14,12,0.55)', border: `1.5px solid ${C.gold}`, fontFamily: sora, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: C.goldLight, backdropFilter: 'blur(6px)'}}>👀 WAIT FOR IT</div>
			</div>
		</AbsoluteFill>
	);
};

/** Feature index: editorial numbered list; the active item glows (also shows progress). */
const FEATURES = ['Grand welcome', 'Every ceremony', 'Countdown', 'Easy RSVP'];
const FeatureList: React.FC<{t: number; at: number[]; out: number}> = ({t, at, out}) => {
	const active = at.filter((a) => t >= a - 0.15).length - 1;
	const vis = prog(t, at[0] - 0.4, 0.6) * (1 - prog(t, out, 0.4));
	if (vis <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 64, top: PHONE_Y + 150, width: 380, opacity: vis, transform: `translateX(${(1 - vis) * -40}px)`}}>
			{FEATURES.map((f, i) => {
				const on = i === active;
				const seen = i <= active;
				const p = prog(t, at[i] - 0.15, 0.45);
				return (
					<div key={f} style={{display: 'flex', alignItems: 'center', gap: 22, height: 150, opacity: seen ? 1 : 0.32}}>
						<div style={{fontFamily: sora, fontWeight: 700, fontSize: 24, color: on ? C.gold : C.muted, width: 44}}>0{i + 1}</div>
						<div style={{position: 'relative'}}>
							<div style={{fontFamily: sora, fontWeight: on ? 800 : 600, fontSize: on ? 46 : 38, letterSpacing: '-0.02em', lineHeight: 1.05, color: C.ivory, ...(on ? GOLD : {})}}>{f}</div>
							<div style={{position: 'absolute', left: 0, bottom: -14, height: 3, width: `${(on ? p : seen ? 1 : 0) * 100}%`, background: `linear-gradient(90deg, ${C.gold}, transparent)`, opacity: on ? 1 : 0.3}} />
						</div>
					</div>
				);
			})}
		</div>
	);
};

/** Tap ripple (fractions of the screen). */
const Tap: React.FC<{t: number; at: number; x: number; y: number}> = ({t, at, x, y}) => {
	if (t < at - 0.5 || t > at + 1.4) return null;
	const finger = prog(t, at - 0.5, 0.45) * (1 - prog(t, at + 0.8, 0.4));
	return (
		<>
			{[0, 0.16].map((d, i) => {
				const r = prog(t, at + d, 0.85, Easing.out(Easing.cubic));
				if (r <= 0 || r >= 1) return null;
				return <div key={i} style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: 220, height: 220, marginLeft: -110, marginTop: -110, borderRadius: '50%', border: `4px solid ${C.gold}`, opacity: 1 - r, transform: `scale(${mix(0.15, 1, r)})`}} />;
			})}
			<div style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: 80, height: 80, marginLeft: -40, marginTop: -40, borderRadius: '50%', background: 'rgba(251,246,236,0.85)', opacity: finger * 0.9, transform: `scale(${(t > at && t < at + 0.16 ? 0.86 : 1) * mix(1.4, 1, finger)})`}} />
		</>
	);
};

// ─── the reel ────────────────────────────────────────────────────────────────
export const WeddingReel2: React.FC<Reel2Props> = ({words, lead, duration, musicOffset, voDuration, segments}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (!words.length) return <AbsoluteFill style={{background: C.bg0}} />;

	// word lookup: time of the k-th spoken word equal to `word` (absolute reel time)
	const W = (word: string, k = 0) => {
		const hits = words.filter((w) => key(w.w) === word);
		return lead + (hits[k] ? hits[k].s : 0);
	};
	/** Phrase helper: text + the timings of its words, by position from the first word's index. */
	const phrases: Phrase[] = [];
	const P = (text: string, firstPrefix: string, k: number, endPrefix: string | null, ek: number, gold: string[] = []) => {
		const start = W(firstPrefix, k);
		const end = endPrefix ? W(endPrefix, ek) : lead + voDuration + 2.5;
		phrases.push({text, start, end, gold});
	};
	P('A client recently approached me', 'a', 0, 'to', 0);
	P('to turn their wedding invitation', 'to', 0, 'into', 0, ['invitation']);
	P('into a wedding website…', 'into', 0, 'and', 0, ['website']);
	P("And here's what I built.", 'and', 0, 'a', 2, ['built']);
	P('A beautiful digital wedding invitation', 'a', 2, 'that', 0, ['digital']);
	P('that lasts forever,', 'that', 0, 'with', 0, ['forever']);
	P('with a grand welcome,', 'with', 0, 'every', 0, ['grand', 'welcome']);
	P('every ceremony in one place,', 'every', 0, 'a', 4, ['ceremony']);
	P('a countdown to the big day,', 'a', 4, 'and', 1, ['countdown']);
	P('and an easy way for guests to RSVP.', 'and', 1, 'and', 2, ['rsvp']);
	P("And here's another wedding website", 'and', 2, 'i', 1, ['another']);
	P('I created for a different couple.', 'i', 1, 'different', 1, ['different', 'couple']);
	P('Different styles,', 'different', 1, 'different', 2, ['styles']);
	P('different details,', 'different', 2, 'each', 0, ['details']);
	P('each website designed around the couple', 'each', 0, 'and', 3, ['couple']);
	P('and their big day.', 'and', 3, 'want', 0, ['big', 'day']);
	P('Want a wedding website of your own?', 'want', 0, null, 0, ['your', 'own']);
	// per-word times inside each phrase (spoken words in order from the phrase start)
	const timesFor = (p: Phrase) => {
		const i0 = words.findIndex((w) => Math.abs(lead + w.s - p.start) < 0.005);
		return p.text.split(' ').map((_, j) => lead + (words[i0 + j]?.s ?? words[i0]?.s ?? 0));
	};

	const tInvite = W('invitation');
	const tWebsite = W('website', 0);
	const tBuilt = W('built');
	const tBeautiful = W('beautiful');
	const tWelcome = W('grand');
	const tCer = W('every');
	const tCount = W('countdown');
	const tRsvp = W('and', 1);
	const tTap = W('rsvp');
	const tAnother = W('and', 2);
	const tStyles = W('different', 1);
	const tDetails = W('different', 2);
	const tEach = W('each');
	const tWant = W('want');
	const tDM = W('dm');

	// ── card slides out left as the phone is pulled in from the right ("into a website") ──
	const tInto = W('into');
	const cardIn = prog(t, -0.35, 0.9);
	const slide = prog(t, tInto - 0.12, 0.7, inOut);
	const phoneIn = prog(t, tInto - 0.02, 0.8);
	const blur = mix(22, 0, prog(t, tBuilt - 0.25, 0.7, inOut));
	const tease = (1 - prog(t, tBuilt - 0.3, 0.35)) * phoneIn;
	const burst = prog(t, tBuilt - 0.15, 0.9, Easing.out(Easing.cubic));

	// ── phone choreography ──
	const centerX = (1080 - PHONE.w) / 2;
	const rightX = 1080 - PHONE.w - 56;
	const toRight = prog(t, W('with') - 0.45, 0.8, inOut) * (1 - prog(t, tAnother - 0.4, 0.7, inOut));
	const bOut = prog(t, tAnother - 0.35, 0.8, inOut); // primary phone exits left with a turn
	const aIn = prog(t, tAnother - 0.15, 0.85); // second phone enters from right
	const pair = prog(t, tStyles - 0.3, 0.8, inOut); // both phones side by side
	const cta = prog(t, tWant - 0.3, 0.9, inOut);

	const clipsB: Clip[] = [
		{site: 'B', at: tInto - 0.1, to: tBeautiful - 0.3, src: 2.0, rate: 0.6}, // verse intro (blurred, then revealed)
		{site: 'B', at: tBeautiful - 0.3, to: tWelcome - 0.3, src: 4.6, rate: 0.95}, // "digital invitation… forever": mosque reveal → names
		{site: 'B', at: tWelcome - 0.3, to: tCer - 0.1, src: 8.4, rate: 0.25}, // grand welcome: names hero
		{site: 'B', at: tCer - 0.1, to: tCount - 0.1, src: 16.2, rate: 0.75}, // ceremonies: Mehandi → Nikkah → Reception
		{site: 'B', at: tCount - 0.1, to: tRsvp - 0.1, src: 20.1, rate: 0.3}, // countdown
		{site: 'B', at: tRsvp - 0.1, to: tRsvp + 0.6, src: 21.4, rate: 1.0}, // into RSVP
		{site: 'B', at: tRsvp + 0.6, to: tStyles + 0.3, src: 22.0, rate: 0.01}, // hold on Submit RSVP
	];
	const camB: Cam[] = [
		{t: tCount - 0.1, z: 1, y: 0.5},
		{t: tCount + 0.7, z: 1.1, y: 0.62},
		{t: tRsvp - 0.2, z: 1.1, y: 0.62},
		{t: tRsvp + 0.1, z: 1, y: 0.5},
	];
	const clipsA: Clip[] = [
		{site: 'A', at: tAnother - 0.2, to: tAnother + 2.0, src: 2.5, rate: 1.0}, // monogram → hero reveal
		{site: 'A', at: tAnother + 2.0, to: tDetails - 0.1, src: 4.7, rate: 0.08}, // hold hero
		{site: 'A', at: tDetails - 0.1, to: tEach - 0.1, src: 15.0, rate: 1.0}, // love-story timeline
		{site: 'A', at: tEach - 0.1, to: duration + 1, src: 4.6, rate: 0.12}, // back to Ishan & Priya
	];
	const clipsB2: Clip[] = [
		{site: 'B', at: tStyles - 0.3, to: tDetails - 0.1, src: 8.4, rate: 0.2}, // Sahla & Abdul Basith
		{site: 'B', at: tDetails - 0.1, to: tEach - 0.1, src: 16.5, rate: 0.6}, // ceremony cards
		{site: 'B', at: tEach - 0.1, to: duration + 1, src: 8.4, rate: 0.12}, // names
	];

	const showB = t < tAnother + 0.9;
	const bX = mix(mix(centerX, rightX, toRight), -PHONE.w - 80, bOut);
	const pairS = 0.78;
	// pair layout: A left, B right (B re-enters)
	const aX = mix(mix(1080 + 60, centerX, aIn), 1080 / 2 - PHONE.w * pairS - 10 + (PHONE.w * (1 - pairS)) / 2 - 20, pair);
	const b2X = mix(1080 + 60, 1080 / 2 + 10 - (PHONE.w * (1 - pairS)) / 2 + 20, pair);
	const pairScale = mix(1, pairS, pair) * mix(1, 0.72, cta);
	const pairY = PHONE_Y + mix(0, 60, pair) + mix(0, 260, cta);

	return (
		<AbsoluteFill style={{background: C.bg0}}>
			<Backdrop t={t} lift={prog(t, tBuilt - 0.2, 1.2)} />

			{/* reveal light burst behind the phone on "built" */}
			{burst > 0 && burst < 1 ? <div style={{position: 'absolute', left: 540 - 700, top: PHONE_Y + PHONE.h / 2 - 700, width: 1400, height: 1400, borderRadius: '50%', background: `radial-gradient(circle, rgba(247,226,174,${0.55 * (1 - burst)}) 0%, rgba(230,194,122,${0.2 * (1 - burst)}) 30%, transparent 62%)`, transform: `scale(${mix(0.3, 1.2, burst)})`}} /> : null}

			{/* ── invitation card ── */}
			{slide < 1 ? (
				<div style={{position: 'absolute', left: 540 - CW / 2, top: 730, width: CW, height: CH, perspective: 1600, opacity: cardIn}}>
					<div style={{transformStyle: 'preserve-3d', transform: `translateX(${-1300 * slide}px) translateY(${mix(160, 0, cardIn) + Math.sin(t * 1.6) * 8}px) rotateZ(${mix(-8, -2, cardIn) - 6 * slide}deg) scale(${mix(0.82, 1, cardIn)})`}}>
						<InviteCard t={t} sheenAt={tInvite - 0.2} rx={mix(28, 9, cardIn) + Math.sin(t * 1.1) * 3} ry={mix(-60, 0, cardIn) + Math.sin(t * 1.3) * 18 - 35 * slide} />
					</div>
				</div>
			) : null}

			{/* ── primary website (Sahla & Abdul Basith) ── */}
			{showB && phoneIn > 0 ? (
				<Phone glow={mix(0.3, 1, prog(t, tBuilt, 0.8))} style={{left: bX, top: PHONE_Y, opacity: Math.min(1, phoneIn * 1.4), transform: `perspective(1800px) translateX(${mix(1150, 0, phoneIn)}px) scale(${mix(0.9, 1, phoneIn)}) rotateY(${mix(-35, 0, phoneIn) + bOut * 35}deg) rotateZ(${mix(6, 0, phoneIn)}deg)`, transformOrigin: 'center'}}>
					<Screen t={t} clips={clipsB} cam={camB} blur={blur}>
						<Tap t={t} at={tTap} x={0.5} y={0.712} />
					</Screen>
					<Tease t={t} o={tease} />
				</Phone>
			) : null}
			<FeatureList t={t} at={[tWelcome, tCer, tCount, tRsvp]} out={tAnother - 0.4} />

			{/* ── second website (Ishan & Priya) ── */}
			{aIn > 0 ? (
				<Phone style={{left: aX, top: pairY, opacity: Math.min(1, aIn * 1.4), transform: `perspective(1800px) scale(${pairScale}) rotateY(${mix(30, 0, aIn) + pair * 8}deg) rotateZ(${-pair * 3 * (1 - cta) - cta * 6}deg)`, transformOrigin: 'center top'}}>
					<Screen t={t} clips={clipsA} />
				</Phone>
			) : null}
			{pair > 0 ? (
				<Phone style={{left: b2X, top: pairY, opacity: Math.min(1, pair * 1.4), transform: `perspective(1800px) scale(${pairScale}) rotateY(${-pair * 8}deg) rotateZ(${pair * 3 * (1 - cta) + cta * 6}deg)`, transformOrigin: 'center top'}}>
					<Screen t={t} clips={clipsB2} />
				</Phone>
			) : null}

			{/* "Different styles / different details" tags over the pair */}
			{([
				['STYLE', tStyles, tDetails],
				['DETAILS', tDetails, tWant],
			] as const).map(([label, a, b]) => {
				const o = prog(t, a, 0.3) * (1 - prog(t, b - 0.3, 0.25)); // STYLE is gone before DETAILS rises
				if (o <= 0) return null;
				return (
					<div key={label} style={{position: 'absolute', left: 0, right: 0, top: PHONE_Y - 20, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 16}px)`}}>
						<div style={{display: 'flex', gap: 300}}>
							{['01', '02'].map((n) => (
								<span key={n} style={{fontFamily: sora, fontWeight: 700, fontSize: 22, letterSpacing: 4, color: C.goldLight, padding: '10px 20px', borderRadius: 999, border: `1px solid rgba(230,194,122,0.6)`, background: 'rgba(2,14,12,0.5)'}}>
									{label} {n}
								</span>
							))}
						</div>
					</div>
				);
			})}

			{/* ── headlines ── */}
			{phrases.map((p, i) => (
				<Phrase key={i} t={t} p={p} size={p.text.length > 30 ? 76 : 88} top={260} times={timesFor(p)} />
			))}

			{/* ── CTA ── */}
			{t > tDM - 0.6
				? (() => {
						const p = prog(t, tDM - 0.15, 0.6);
						const sh = mix(-40, 140, (Math.max(0, t - tDM) * 0.55) % 1);
						const breathe = 1 + 0.025 * Math.sin((t - tDM) * 4) * prog(t, tDM + 0.6, 0.4);
						return (
							<div style={{position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${mix(0.85, 1, p) * breathe})`}}>
								<div style={{position: 'relative', overflow: 'hidden', padding: '30px 70px', borderRadius: 999, background: `linear-gradient(135deg, ${C.goldLight}, ${C.gold} 50%, ${C.goldDeep})`, boxShadow: '0 24px 60px rgba(230,194,122,0.4)', fontFamily: sora, fontWeight: 800, fontSize: 54, letterSpacing: '-0.01em', color: '#1A140C'}}>
									DM “WEDDING”
									<div style={{position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent ${sh - 14}%, rgba(255,255,255,0.6) ${sh}%, transparent ${sh + 14}%)`}} />
								</div>
								<div style={{fontFamily: sora, fontWeight: 600, fontSize: 38, color: 'rgba(251,246,236,0.78)', marginTop: 26, opacity: prog(t, W('lets') - 0.1, 0.5)}}>and let&apos;s build yours 💍</div>
							</div>
						);
					})()
				: null}

			<Soundtrack lead={lead} duration={duration} musicOffset={musicOffset} segments={segments} cues={{card: -0.05, invite: tInvite, pull: tInto - 0.12, website: tWebsite, built: tBuilt, features: [tWelcome, tCer, tCount], tap: tTap, another: tAnother, styles: tStyles, want: tWant, dm: tDM}} voEnd={lead + voDuration} />
		</AbsoluteFill>
	);
};

// ─── audio ───────────────────────────────────────────────────────────────────
// One song throughout ("geetha.mp3", the user's pick), from its top: the intro kicks into the full song at
// 2.0 s, on "wedding invitation". The hook plays it forward (~8 dB under the voice) for energy; from "built"
// it sits ~16 dB under the voice (VO −22.8 LUFS, track −14.6 LUFS) and breathes up in the gaps and end hold.
const MUSIC = {hook: 0.155, voice: 0.062, gap: 0.11, end: 0.25};
type Cues = {card: number; invite: number; pull: number; website: number; built: number; features: number[]; tap: number; another: number; styles: number; want: number; dm: number};
const Soundtrack: React.FC<{lead: number; duration: number; musicOffset: number; voEnd: number; segments: Span[]; cues: Cues}> = ({lead, duration, musicOffset, voEnd, segments, cues: c}) => {
	const speech = (t: number) => Math.max(0, ...segments.map((g) => prog(t, g.s - 0.2, 0.2, Easing.linear) * (1 - prog(t, g.e, 0.35, Easing.linear))));
	const musicVol = (f: number) => {
		const t = f / FPS;
		const body = t > voEnd ? mix(MUSIC.gap, MUSIC.end, prog(t, voEnd, 0.8, Easing.linear)) : mix(MUSIC.gap, MUSIC.voice, speech(t));
		const level = mix(MUSIC.hook, body, prog(t, c.built - 0.1, 0.8, Easing.linear));
		return level * prog(t, 0, 0.1, Easing.linear) * (1 - prog(t, duration - 2.4, 2.4, Easing.linear));
	};
	const sfx: [number, string, number][] = [
		// soft, warm effects (ElevenLabs), each ~11–13 dB under the voice
		[Math.max(0, c.card), 'card-slide', 0.5],
		[c.invite - 0.05, 'soft-chime', 0.45],
		[c.pull - 0.1, 'air-whoosh', 0.2], // card out, phone in
		[c.built - 0.2, 'harp-reveal', 0.08], // the blur lifts
		[c.another - 0.3, 'silk-swish', 0.2], // second site's phone in
		[c.styles - 0.25, 'sweep', 0.18],
		[c.want - 0.25, 'soft-swoosh', 0.2],
		[c.dm - 0.6, 'light-sweep', 0.18],
	];
	return (
		<>
			<Audio src={staticFile('wedding2/music.mp3')} startFrom={Math.round(musicOffset * FPS)} volume={musicVol} />
			<Sequence from={Math.round(lead * FPS)}>
				<Audio src={staticFile('wedding2/narration.wav')} volume={1.0} />
			</Sequence>
			{sfx.map(([at, name, v], i) => (
				<Sequence key={i} from={Math.max(0, Math.round(at * FPS))} durationInFrames={Math.round(3 * FPS)} layout="none">
					<Audio src={staticFile(`wedding2/sfx/${name}.mp3`)} volume={(f) => v * interpolate(f, [70, 90], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
				</Sequence>
			))}
		</>
	);
};
