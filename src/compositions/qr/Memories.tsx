// Digital Wedding Memories — the QR feature reel (9:16, ~43 s), projects/qr-memories.
// Design system: Royal Indian Heritage × Modern Luxury — maroon #651E2B, burgundy #48141F, ivory #FAF5EC,
// antique gold #DCC58E / #C5A15B; Cormorant Garamond (headings, italic taglines) + Inter (labels, captions);
// the QR app's own ornaments (lotus divider, kolam texture, mandala watermark, zari band) and temple-arch reveals.
// All timing comes from the ElevenLabs word timings (props.parts).
import {loadFont as loadCormorant} from '@remotion/google-fonts/CormorantGaramond';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';

const serif = loadCormorant('normal', {weights: ['400', '500', '600'], subsets: ['latin']}).fontFamily;
loadCormorant('italic', {weights: ['400', '500', '600'], subsets: ['latin']});
const sans = loadInter('normal', {weights: ['400', '500', '600'], subsets: ['latin']}).fontFamily;

const FPS = 30;
export const C = {
	maroon: '#651E2B',
	burgundy: '#48141F',
	ivory: '#FAF5EC',
	ivoryDeep: '#F3EAD9',
	gold: '#C5A15B',
	goldMuted: '#DCC58E',
	rose: '#E8D4CF',
	blush: '#F5E9E4',
	charcoal: '#2E2624',
};

type Word = {w: string; s: number; e: number};
type Part = {id: string; start: number; end: number; words: Word[]};
export type QrProps = {parts: Part[]; duration: number; segments: {s: number; e: number}[]; musicOffset: number};

export const calculateQrMetadata: CalculateMetadataFunction<QrProps> = ({props}) => ({fps: FPS, durationInFrames: Math.max(1, Math.ceil(props.duration * FPS))});

const SOFT = Easing.bezier(0.25, 0.1, 0.25, 1);
const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
const prog = (t: number, a: number, d: number, e: (x: number) => number = SOFT) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const clean = (w: string) => w.toLowerCase().replace(/[^a-z']/g, '');

const useTimes = (parts: Part[]) => {
	const P = (id: string) => parts.find((p) => p.id === id) ?? {id, start: 0, end: 0, words: []};
	const W = (id: string, word: string, k = 0) => {
		const hits = P(id).words.filter((w) => clean(w.w).startsWith(word));
		return (hits[k] ?? hits[0] ?? {s: P(id).start}).s;
	};
	return {P, W};
};

// ── ornaments (ported from the QR app: src/features/memories/components/art/Ornaments.tsx) ──────────────

const LotusDivider: React.FC<{p?: number; w?: number; color?: string}> = ({p = 1, w = 120, color = C.gold}) => (
	<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: Math.min(1, p * 1.5)}}>
		<div style={{height: 1.5, width: w * p, background: `linear-gradient(to right, transparent, ${color})`}} />
		<svg viewBox="0 0 48 24" width={64} height={32} style={{transform: `scale(${mix(0.6, 1, p)})`}}>
			<path d="M24 2 C28 8 28 14 24 20 C20 14 20 8 24 2 Z" fill={C.rose} stroke={color} strokeWidth={0.9} />
			<path d="M24 20 C17 18 12 13 11 7 C17 9 21 13 24 20 Z" fill="none" stroke={color} strokeWidth={0.9} />
			<path d="M24 20 C31 18 36 13 37 7 C31 9 27 13 24 20 Z" fill="none" stroke={color} strokeWidth={0.9} />
			<path d="M24 20 C16 21 8 18 3 13 M24 20 C32 21 40 18 45 13" fill="none" stroke={color} strokeWidth={0.7} strokeOpacity={0.7} />
		</svg>
		<div style={{height: 1.5, width: w * p, background: `linear-gradient(to left, transparent, ${color})`}} />
	</div>
);

const Kolam: React.FC<{id: string; opacity?: number; color?: string}> = ({id, opacity = 0.18, color = C.goldMuted}) => (
	<svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity}}>
		<defs>
			<pattern id={id} width={96} height={96} patternUnits="userSpaceOnUse">
				<g fill="none" stroke={color} strokeWidth={1.1}>
					<path d="M48 9 C69 9 87 27 87 48 C87 69 69 87 48 87 C27 87 9 69 9 48 C9 27 27 9 48 9 Z" />
					<path d="M48 27 L69 48 L48 69 L27 48 Z" />
					<path d="M0 0 C15 15 15 33 0 48 M96 0 C81 15 81 33 96 48 M0 96 C15 81 15 63 0 48 M96 96 C81 81 81 63 96 48" />
				</g>
				<g fill={color}>
					<circle cx={48} cy={48} r={2.2} />
					<circle cx={0} cy={0} r={1.8} />
					<circle cx={96} cy={0} r={1.8} />
					<circle cx={0} cy={96} r={1.8} />
					<circle cx={96} cy={96} r={1.8} />
				</g>
			</pattern>
		</defs>
		<rect width="100%" height="100%" fill={`url(#${id})`} />
	</svg>
);

const Mandala: React.FC<{size: number; color: string; opacity: number; rot?: number; style?: React.CSSProperties}> = ({size, color, opacity, rot = 0, style}) => {
	const rings = [
		{r: 60, n: 12, len: 46, w: 14},
		{r: 120, n: 16, len: 64, w: 18},
		{r: 200, n: 24, len: 80, w: 20},
		{r: 300, n: 32, len: 96, w: 22},
	];
	return (
		<svg viewBox="-420 -420 840 840" width={size} height={size} fill="none" stroke={color} strokeWidth={1.4} style={{position: 'absolute', opacity, transform: `rotate(${rot}deg)`, ...style}}>
			{rings.map(({r, n, len, w}) => (
				<g key={r}>
					<circle r={r} />
					{Array.from({length: n}, (_, k) => (
						<path key={k} transform={`rotate(${(360 / n) * k + (r % 2 ? 0 : 180 / n)}) translate(0 ${-r})`} d={`M0 0 C${w} ${-len * 0.3} ${w * 0.6} ${-len * 0.8} 0 ${-len} C${-w * 0.6} ${-len * 0.8} ${-w} ${-len * 0.3} 0 0 Z M0 ${-len * 0.25} V${-len * 0.75}`} />
					))}
				</g>
			))}
			<circle r={396} strokeDasharray="1 7" strokeLinecap="round" strokeWidth={3} />
			<circle r={410} />
		</svg>
	);
};

const Zari: React.FC<{id: string; y: number; opacity?: number}> = ({id, y, opacity = 0.9}) => (
	<svg style={{position: 'absolute', left: 0, top: y, width: '100%', height: 20, opacity}} preserveAspectRatio="none">
		<defs>
			<pattern id={id} width="26" height="20" patternUnits="userSpaceOnUse">
				<path d="M13 3.5 19 10l-6 6.5L7 10z" fill="none" stroke={C.gold} strokeWidth="1.2" />
				<circle cx="13" cy="10" r="1.4" fill={C.gold} />
				<circle cx="0" cy="10" r="1.5" fill={C.gold} />
				<circle cx="26" cy="10" r="1.5" fill={C.gold} />
			</pattern>
		</defs>
		<rect width="100%" height="1.4" y="0.6" fill={C.gold} />
		<rect width="100%" height="20" fill={`url(#${id})`} />
		<rect width="100%" height="1.4" y="18" fill={C.gold} />
	</svg>
);

const Eyebrow: React.FC<{children: React.ReactNode; p: number; color?: string; size?: number}> = ({children, p, color = C.gold, size = 26}) => (
	<div style={{fontFamily: sans, fontWeight: 600, fontSize: size, letterSpacing: '0.34em', textTransform: 'uppercase', color, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 16}px)`, paddingLeft: '0.34em'}}>{children}</div>
);

// words revealed one by one on the voice (soft upward fade)
const Words: React.FC<{t: number; text: string; times: number[]; italic?: number[]; color: string; accent?: string; size: number; style?: React.CSSProperties}> = ({t, text, times, italic = [], color, accent, size, style}) => (
	<div style={{fontFamily: serif, fontWeight: 500, fontSize: size, lineHeight: 1.08, color, textAlign: 'center', letterSpacing: '-0.005em', ...style}}>
		{text.split(' ').map((w, i, arr) => {
			const p = prog(t, (times[i] ?? times[times.length - 1]) - 0.12, 0.45);
			const it = italic.includes(i);
			return (
				<span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 22}px)`, marginRight: i < arr.length - 1 ? '0.24em' : 0, fontStyle: it ? 'italic' : 'normal', color: it && accent ? accent : color}}>
					{w === '|' ? '' : w}
				</span>
			);
		})}
	</div>
);

// ── footage + phone ────────────────────────────────────────────────────────────────────────────────

/** A full-bleed clip: plays src from `src0` at `rate`, between reel times a and b, with a slow push-in. */
const Clip: React.FC<{t: number; src: string; a: number; b: number; src0: number; rate?: number; zoom?: [number, number]; origin?: string; filter?: string}> = ({t, src, a, b, src0, rate = 1, zoom = [1.0, 1.06], origin = '50% 45%', filter}) => {
	const z = mix(zoom[0], zoom[1], prog(t, a, b - a + 0.8, Easing.linear));
	return (
		<Sequence from={Math.round(a * FPS)} durationInFrames={Math.round((b - a + 1) * FPS)} layout="none">
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: origin, filter}}>
				<OffthreadVideo src={staticFile(`qr/${src}`)} startFrom={Math.round(src0 * FPS)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
		</Sequence>
	);
};

const SITE = 'brightness(1.32) contrast(1.06) saturate(1.08) sepia(0.06)';
export const SCR_W = 886;
export const SCR_H = 1920;
const STATUS = '#34353A'; // the recordings' status-bar colour (constant)

/**
 * iPhone 15 (Black, aluminium) drawn to Apple's proportions around a 886×1920 screen recording
 * (iPhone 15 screen recordings are 1179×2556 → same 0.4613 aspect): 55 pt display corners (0.14 w),
 * ~3.5 mm border (black bezel + aluminium band), Action button + volume up/down on the left, side button on the right,
 * standard Dynamic Island (126×37 pt at 11 pt). The recording's expanded island (screen-recording indicator) is painted over.
 */
export const IPhone15: React.FC<{x: number; y: number; h: number; p: number; rec?: boolean; shadow?: string; children: (s: number) => React.ReactNode}> = ({x, y, h, p, rec = true, shadow = '72,20,31', children}) => {
	const s = h / SCR_H;
	const w = SCR_W * s;
	const bez = 0.031 * w; // black glass border
	const band = 0.024 * w; // aluminium frame
	const r = 0.14 * w;
	const W = w + 2 * (bez + band);
	const H = h + 2 * (bez + band);
	const btn = (side: 'l' | 'r', y0: number, y1: number) => (
		<div style={{position: 'absolute', [side === 'l' ? 'left' : 'right']: -0.011 * w, top: y0 * H, width: 0.016 * w, height: (y1 - y0) * H, borderRadius: 0.008 * w, background: 'linear-gradient(to right, #26272A, #5A5B60 45%, #2C2D30)'}} />
	);
	return (
		<div style={{position: 'absolute', left: x - W / 2, top: y - bez - band, width: W, height: H, opacity: p, transform: `translateY(${(1 - p) * 120}px) scale(${mix(0.94, 1, p)})`}}>
			{btn('l', 0.168, 0.205)}
			{btn('l', 0.252, 0.316)}
			{btn('l', 0.336, 0.4)}
			{btn('r', 0.27, 0.385)}
			{/* aluminium band */}
			<div style={{position: 'absolute', inset: 0, borderRadius: r + bez + band, background: 'linear-gradient(135deg, #5C5D62 0%, #34353A 22%, #2A2B2E 50%, #3A3B3F 78%, #6A6B70 100%)', boxShadow: `0 60px 90px -30px rgba(${shadow},0.55), 0 22px 40px -20px rgba(${shadow},0.4)`}} />
			<div style={{position: 'absolute', inset: band * 0.42, borderRadius: r + bez + band * 0.58, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)'}} />
			{/* glass + black border */}
			<div style={{position: 'absolute', inset: band, borderRadius: r + bez, background: '#050506'}} />
			<div style={{position: 'absolute', left: band + bez, top: band + bez, width: w, height: h, borderRadius: r, overflow: 'hidden', background: C.ivory}}>
				{children(s)}
				{/* paint over the recording's expanded island, draw the standard one */}
				{rec ? <div style={{position: 'absolute', left: 232 * s, top: 14 * s, width: 410 * s, height: 102 * s, background: STATUS}} /> : <StatusBar s={s} w={w} />}
				<div style={{position: 'absolute', left: w / 2 - 0.16 * w, top: 0.028 * w, width: 0.32 * w, height: 0.094 * w, borderRadius: 0.047 * w, background: '#000'}} />
				{/* glass sheen */}
				<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 35%)', pointerEvents: 'none'}} />
			</div>
		</div>
	);
};

/** iOS status bar drawn over captures that have none (white, over a soft top shade). */
const StatusBar: React.FC<{s: number; w: number}> = ({s, w}) => (
	<>
		<div style={{position: 'absolute', left: 0, top: 0, width: w, height: 150 * s, background: 'linear-gradient(to bottom, rgba(0,0,0,0.38), rgba(0,0,0,0))'}} />
		<div style={{position: 'absolute', left: 92 * s, top: 34 * s, fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: 600, fontSize: 40 * s, color: '#fff'}}>9:41</div>
		<svg viewBox="0 0 72 16" style={{position: 'absolute', right: 70 * s, top: 40 * s, width: 172 * s, height: 38 * s}} fill="#fff">
			<rect x="0" y="10" width="3.5" height="5" rx="1" />
			<rect x="5.5" y="7" width="3.5" height="8" rx="1" />
			<rect x="11" y="4" width="3.5" height="11" rx="1" />
			<rect x="16.5" y="1" width="3.5" height="14" rx="1" />
			<path d="M33 4.5a10 10 0 0 1 13 0l-1.6 1.7a7.6 7.6 0 0 0-9.8 0Z M35.6 7.4a6.2 6.2 0 0 1 7.8 0l-1.6 1.7a3.8 3.8 0 0 0-4.6 0Z M38.2 10.3a2.3 2.3 0 0 1 2.6 0L39.5 12Z" />
			<rect x="51" y="2.5" width="18" height="11" rx="3" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1" />
			<rect x="52.8" y="4.3" width="14" height="7.4" rx="1.6" />
			<rect x="70" y="6" width="1.5" height="4" rx="0.7" fillOpacity="0.6" />
		</svg>
	</>
);

/** Plays a recording inside the phone from reel time a (src seconds src0, rate). */
const ScreenVideo: React.FC<{s: number; src: string; a: number; src0: number; rate?: number}> = ({s, src, a, src0, rate = 1}) => (
	<Sequence from={Math.round(a * FPS)} layout="none">
		<OffthreadVideo src={staticFile(`qr/${src}`)} startFrom={Math.round(src0 * FPS)} playbackRate={rate} muted style={{position: 'absolute', width: SCR_W * s, height: SCR_H * s}} />
	</Sequence>
);
const ScreenStill: React.FC<{s: number; src: string; o?: number}> = ({s, src, o = 1}) => <Img src={staticFile(`qr/img/${src}`)} style={{position: 'absolute', width: SCR_W * s, height: SCR_H * s, opacity: o}} />;

const Polaroid: React.FC<{src: string; w: number; h: number; pad?: number; style?: React.CSSProperties}> = ({src, w, h, pad = 1, style}) => (
	<div style={{position: 'absolute', width: w + 28 * pad, height: h + 76 * pad, background: '#FFFDF8', padding: `${14 * pad}px ${14 * pad}px ${62 * pad}px`, boxSizing: 'border-box', borderRadius: 6 * (1 - pad), boxShadow: `0 30px 50px -20px rgba(72,20,31,${0.45 * pad}), 0 0 0 1px rgba(197,161,91,${0.35 * pad})`, ...style}}>
		<Img src={staticFile(`qr/img/${src}`)} style={{width: w, height: h, objectFit: 'cover', display: 'block', borderRadius: 6 * (1 - pad)}} />
	</div>
);

// ── captions on the footage scenes ───────────────────────────────────────────────────────────────────

const KEY = new Set(['qr', 'code', 'scan', 'beautiful', 'photos', 'website', 'relive', 'memories', 'moments', 'wedding']);
const Captions: React.FC<{t: number; words: Word[]; groups: number[]; y?: number}> = ({t, words, groups, y = 1300}) => {
	const chunks: Word[][] = [];
	let k = 0;
	for (const n of groups) {
		chunks.push(words.slice(k, k + n));
		k += n;
	}
	if (k < words.length) chunks.push(words.slice(k));
	const idx = chunks.findIndex((c, i) => t >= c[0].s - 0.12 && t < (chunks[i + 1] ? chunks[i + 1][0].s - 0.12 : c[c.length - 1].e + 0.45));
	if (idx < 0) return null;
	const c = chunks[idx];
	const out = chunks[idx + 1] ? 1 : 1 - prog(t, c[c.length - 1].e + 0.25, 0.2);
	return (
		<div style={{position: 'absolute', left: 70, right: 70, top: y, textAlign: 'center', opacity: out}}>
			{c.map((w, i) => {
				const p = prog(t, w.s - 0.1, 0.25);
				const k = KEY.has(clean(w.w));
				const text = w.w.replace(/[.…,]$/, '');
				return (
					<span key={i} style={{display: 'inline-block', marginRight: '0.26em', opacity: mix(0.0, 1, p), transform: `translateY(${(1 - p) * 10}px)`, fontFamily: k ? serif : sans, fontStyle: k ? 'italic' : 'normal', fontWeight: k ? 600 : 600, fontSize: k ? 74 : 54, color: k ? C.goldMuted : C.ivory, textShadow: '0 2px 18px rgba(30,8,12,0.75), 0 1px 3px rgba(30,8,12,0.6)', lineHeight: 1.25}}>
						{text}
					</span>
				);
			})}
		</div>
	);
};

const Shade: React.FC = () => <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(40,10,16,0.0) 45%, rgba(40,10,16,0.55) 72%, rgba(40,10,16,0.7) 100%)'}} />;

// ── temple-arch reveal between scenes ────────────────────────────────────────────────────────────────

const archPath = (p: number) => {
	const w = mix(120, 2700, p);
	const top = mix(1920, -1500, p);
	const x0 = 540 - w / 2;
	const r = w / 2;
	return `M ${x0} 2100 L ${x0} ${top + r} A ${r} ${r} 0 0 1 ${x0 + w} ${top + r} L ${x0 + w} 2100 Z`;
};
const Arch: React.FC<{t: number; at: number; d?: number; children: React.ReactNode}> = ({t, at, d = 0.85, children}) => {
	const p = prog(t, at, d, IN_OUT);
	if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
	const path = archPath(p);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{clipPath: `path('${path}')`}}>{children}</AbsoluteFill>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<path d={path} fill="none" stroke={C.goldMuted} strokeWidth={5} opacity={Math.sin(Math.PI * p)} />
			</svg>
		</AbsoluteFill>
	);
};

// ── scenes ──────────────────────────────────────────────────────────────────────────────────────────

type T = ReturnType<typeof useTimes>;
type SP = {t: number; c: T; a: number; b: number};

/** 3 · moments come together inside the wedding website: the album's own photos fly in and land on their tiles. */
// album tiles (image area) in the recording's frame at 16.5 s (album-grid.png), screen px
const TILES: [string, number, number, number, number][] = [
	['p1.jpg', 44, 560, 382, 200],
	['p2.jpg', 460, 560, 382, 200],
	['p3.jpg', 44, 876, 382, 186],
	['p4.jpg', 460, 876, 382, 186],
	['p5.jpg', 44, 1192, 382, 188],
	['p6.jpg', 460, 1192, 382, 188],
];
const SceneTogether: React.FC<SP> = ({t, c, a}) => {
	const tLike = c.W('q3', 'just');
	const tTogether = c.W('q3', 'come');
	const tSite = c.W('q3', 'website');
	const phone = prog(t, a + 0.25, 0.9);
	const PH = 1140;
	const s = PH / SCR_H;
	const sx = 540 - (SCR_W * s) / 2; // screen origin
	const sy = 640;
	// scattered resting spots (polaroid top-left), before they gather
	const spots: [number, number, number][] = [
		[30, 600, -9],
		[770, 640, 7],
		[20, 1020, 6],
		[790, 1010, -6],
		[50, 1420, -5],
		[770, 1400, 8],
	];
	const grid = prog(t, tTogether + 0.25, 0.35, Easing.linear); // phone screen → the album grid, under the flying photos
	return (
		<AbsoluteFill style={{background: C.ivory}}>
			<Kolam id="k3" opacity={0.22} />
			<Mandala size={1500} color={C.gold} opacity={0.08} rot={t * 2} style={{left: -210, top: 420}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 170}}>
				<Eyebrow p={prog(t, a + 0.2, 0.6)}>Capture · Share · Relive</Eyebrow>
				<Words t={t} text="All your moments," times={[tLike, tLike + 0.1, c.W('q3', 'moments')]} color={C.maroon} size={104} style={{marginTop: 26}} />
				<Words t={t} text="in one place" times={[tTogether, c.W('q3', 'together'), c.W('q3', 'right')]} italic={[0, 1, 2]} color={C.maroon} accent={C.maroon} size={104} />
				<div style={{marginTop: 22}}>
					<LotusDivider p={prog(t, tTogether, 0.7)} />
				</div>
			</div>
			<IPhone15 x={540} y={sy} h={PH} p={phone}>
				{(sc) => (
					<>
						{grid < 1 ? <ScreenVideo s={sc} src="r22.mp4" a={a} src0={3.4} /> : null}
						{grid > 0 ? <ScreenStill s={sc} src="album-grid.png" o={grid} /> : null}
					</>
				)}
			</IPhone15>
			{TILES.map(([src, tx, ty, tw, th], i) => {
				const [x, y, rot] = spots[i];
				const W0 = 250;
				const H0 = (W0 * th) / tw;
				const pin = prog(t, tLike + i * 0.11, 0.75, Easing.bezier(0.2, 0.9, 0.3, 1));
				const pg = prog(t, tTogether + i * 0.08, 0.95, IN_OUT);
				const land = prog(t, tTogether + i * 0.08 + 0.95, 0.35, Easing.linear); // dissolve into the real tile
				if (pin <= 0 || land >= 1) return null;
				const pad = 1 - pg;
				const w = mix(W0, tw * s, pg);
				const h = mix(H0, th * s, pg);
				const fromX = x < 540 ? -420 : 1420;
				const px = mix(mix(fromX, x, pin), sx + tx * s - 14 * pad, pg);
				const py = mix(y, sy + ty * s - 14 * pad, pg);
				return <Polaroid key={src} src={src} w={w} h={h} pad={pad} style={{left: px, top: py, transform: `rotate(${mix(rot, 0, pg)}deg)`, opacity: pin * (1 - land)}} />;
			})}
			{/* soft gold glint as the album fills */}
			<div style={{position: 'absolute', left: 540 - 320, top: 1100 - 320, width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,197,142,0.5), rgba(220,197,142,0) 65%)', opacity: Math.sin(Math.PI * prog(t, tSite - 0.9, 1.2)) * 0.8, pointerEvents: 'none'}} />
		</AbsoluteFill>
	);
};

/** 4a · "But it's not just photos." */
const SceneNotJust: React.FC<SP> = ({t, c, a}) => {
	const ws = ['but', 'it', 'not', 'just', 'photos'].map((w) => c.W('q4', w));
	const icons = prog(t, ws[4] + 0.2, 0.6);
	return (
		<AbsoluteFill style={{background: C.burgundy}}>
			<Kolam id="k4" opacity={0.1} />
			<Mandala size={1300} color={C.goldMuted} opacity={0.14} rot={-t * 3} style={{left: -110, top: 310}} />
			<Zari id="z4a" y={150} opacity={prog(t, a, 0.6)} />
			<Zari id="z4b" y={1750} opacity={prog(t, a, 0.6)} />
			<div style={{position: 'absolute', left: 60, right: 60, top: 760}}>
				<Words t={t} text="But it's not" times={ws.slice(0, 3)} color={C.ivory} size={120} />
				<Words t={t} text="just photos." times={ws.slice(3)} italic={[0, 1]} color={C.ivory} accent={C.goldMuted} size={140} />
				<div style={{marginTop: 40}}>
					<LotusDivider p={prog(t, ws[4], 0.6)} color={C.goldMuted} />
				</div>
			</div>
			{/* note · voice · heart, rising out of the line */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center', gap: 60}}>
				{[0, 1, 2].map((k) => {
					const p = prog(icons, k * 0.2, 0.6);
					return (
						<div key={k} style={{width: 110, height: 110, borderRadius: '50%', border: `2px solid ${C.goldMuted}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
							<Glyph kind={(['note', 'mic', 'heart'] as const)[k]} color={C.goldMuted} size={50} />
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

export const Glyph: React.FC<{kind: 'note' | 'mic' | 'heart' | 'chat' | 'send'; color: string; size: number}> = ({kind, color, size}) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
		{kind === 'note' && <path d="M4 20h4L19 9l-4-4L4 16v4Z M13.5 6.5l4 4" />}
		{kind === 'mic' && <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z M5.5 11a6.5 6.5 0 0 0 13 0 M12 17.5V21 M9 21h6" />}
		{kind === 'heart' && <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" fill={color} fillOpacity={0.25} />}
		{kind === 'chat' && <path d="M4 5h16v11H9l-5 4V5Z" />}
		{kind === 'send' && <path d="M21 3 10 14 M21 3l-7 18-4-7-7-4 18-7Z" />}
	</svg>
);

/** 4b · notes, voice notes and reactions on the real upload form (frozen at 19.2 s, upload-form.png), acted out:
 *  a note is typed into the field, the voice note starts recording, the reactions get selected. */
const NOTE = 'Wishing you both a lifetime of love & laughter!';
const SceneExtras: React.FC<SP> = ({t, c, a}) => {
	const tLeave = c.W('q4', 'leave');
	const tMsg = c.W('q4', 'messages');
	const tVoice = c.W('q4', 'voice');
	const tReact = c.W('q4', 'react');
	const tUp = c.W('q4', 'uploading');
	const phone = prog(t, a, 0.8);
	const PH = 1160;
	const s = PH / SCR_H;
	const top = 640;
	const sx = 540 - (SCR_W * s) / 2;
	const freeze = a + 1.3; // the recording settles on the form (src 17.9 → 19.2)
	// screen-px geometry of upload-form.png
	const FIELD = {x: 84, y: 752, w: 718};
	const HEART = [133, 1075] as const;
	const LOVE = [367, 1075] as const;
	const VOICE = {x: 86, y: 1300, w: 714, h: 160, mic: [176, 1380] as const};
	const SHARE = {x: 46, y: 1730, w: 794, h: 112};
	const typed = Math.round(prog(t, Math.max(freeze + 0.05, tLeave - 0.1), 1.25, Easing.linear) * NOTE.length);
	const rec = prog(t, tVoice - 0.1, 0.3);
	const recSec = Math.max(0, t - (tVoice - 0.1));
	const sel = (at: number) => prog(t, at, 0.35, Easing.bezier(0.3, 1.8, 0.5, 1));
	const press = Math.sin(Math.PI * prog(t, tUp - 0.05, 0.45));
	const chips: [number, 'note' | 'mic' | 'heart', string, number, 'l' | 'r'][] = [
		[tMsg - 0.15, 'note', 'Little messages', FIELD.y - 130, 'r'],
		[tVoice - 0.15, 'mic', 'Voice notes', VOICE.y + 220, 'r'],
		[tReact - 0.15, 'heart', 'Reactions', HEART[1] + 10, 'r'],
	];
	return (
		<AbsoluteFill style={{background: C.ivory}}>
			<Kolam id="k4b" opacity={0.22} />
			<Mandala size={1500} color={C.gold} opacity={0.07} rot={t * 2} style={{left: -210, top: 480}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 170}}>
				<Eyebrow p={prog(t, a + 0.15, 0.6)}>From every guest</Eyebrow>
				<Words t={t} text="A note, a voice," times={[tMsg - 0.3, tMsg - 0.2, tVoice - 0.2, tVoice - 0.1]} color={C.maroon} size={104} style={{marginTop: 26}} />
				<Words t={t} text="a little love" times={[tReact - 0.2, tReact - 0.1, tReact]} italic={[1, 2]} color={C.maroon} accent={C.maroon} size={104} />
				<div style={{marginTop: 22}}>
					<LotusDivider p={prog(t, tReact + 0.2, 0.7)} />
				</div>
			</div>
			<IPhone15 x={540} y={top} h={PH} p={phone}>
				{(sc) => (
					<>
						{t < freeze ? <ScreenVideo s={sc} src="r23.mp4" a={a} src0={17.9} /> : <ScreenStill s={sc} src="upload-form.png" />}
						{t >= freeze ? (
							<>
								{/* the note, typed into the real field */}
								{typed > 0 ? (
									<div style={{position: 'absolute', left: FIELD.x * sc, top: FIELD.y * sc, width: FIELD.w * sc, height: 140 * sc, background: '#FCF4ED'}}>
										<div style={{fontFamily: serif, fontStyle: 'italic', fontSize: 44 * sc, lineHeight: `${52 * sc}px`, color: '#3A2A2C', paddingTop: 12 * sc}}>
											{NOTE.slice(0, typed)}
											<span style={{display: 'inline-block', width: 2.5 * sc, height: 44 * sc, marginLeft: 2 * sc, background: C.maroon, verticalAlign: 'middle', opacity: typed < NOTE.length || Math.floor(t * 2.4) % 2 ? 1 : 0}} />
										</div>
									</div>
								) : null}
								{/* reactions selected */}
								{([
									[HEART[0], HEART[1], sel(tReact - 0.05)],
									[LOVE[0], LOVE[1], sel(tReact + 0.4)],
								] as [number, number, number][]).map(([cx, cy, p], i) =>
									p > 0 ? (
										<div key={i} style={{position: 'absolute', left: (cx - 54) * sc, top: (cy - 54) * sc, width: 108 * sc, height: 108 * sc, borderRadius: '50%', border: `${4.5 * sc}px solid ${C.maroon}`, boxSizing: 'border-box', background: 'rgba(101,30,43,0.07)', transform: `scale(${mix(0.6, 1, p)})`, opacity: Math.min(1, p * 2)}} />
									) : null,
								)}
								{/* the voice note, recording */}
								{rec > 0 ? (
									<div style={{position: 'absolute', left: VOICE.x * sc, top: VOICE.y * sc, width: VOICE.w * sc, height: VOICE.h * sc, borderRadius: 10 * sc, background: '#F7EAE6', boxShadow: `inset 0 0 0 ${2.5 * sc}px ${C.maroon}`, opacity: rec}}>
										{[0, 1].map((k) => {
											const ring = ((recSec * 0.9 + k * 0.5) % 1);
											return <div key={k} style={{position: 'absolute', left: (VOICE.mic[0] - VOICE.x - 54) * sc, top: (VOICE.mic[1] - VOICE.y - 54) * sc, width: 108 * sc, height: 108 * sc, borderRadius: '50%', border: `${3 * sc}px solid ${C.maroon}`, transform: `scale(${1 + ring * 0.55})`, opacity: 0.5 * (1 - ring)}} />;
										})}
										<div style={{position: 'absolute', left: (VOICE.mic[0] - VOICE.x - 54) * sc, top: (VOICE.mic[1] - VOICE.y - 54) * sc, width: 108 * sc, height: 108 * sc, borderRadius: '50%', background: C.maroon, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
											<div style={{width: 30 * sc, height: 30 * sc, borderRadius: 5 * sc, background: C.ivory}} />
										</div>
										<div style={{position: 'absolute', left: 181 * sc, top: 34 * sc, fontFamily: sans, fontWeight: 500, fontSize: 36 * sc, color: C.maroon, display: 'flex', alignItems: 'center', gap: 12 * sc}}>
											<span style={{width: 16 * sc, height: 16 * sc, borderRadius: '50%', background: '#C8333F', opacity: Math.floor(t * 2.5) % 2 ? 1 : 0.35}} />
											Recording… 0:0{Math.min(9, Math.floor(recSec))}
										</div>
										<div style={{position: 'absolute', left: 181 * sc, top: 92 * sc, display: 'flex', alignItems: 'center', gap: 7 * sc, height: 40 * sc}}>
											{Array.from({length: 34}, (_, k) => {
												const amp = 0.25 + 0.75 * Math.abs(Math.sin(k * 1.7 + t * 9) * Math.sin(k * 0.6 + t * 4.3));
												const on = k / 34 < Math.min(1, recSec / 2.6);
												return <div key={k} style={{width: 7 * sc, height: 40 * sc * (on ? amp : 0.12), borderRadius: 4 * sc, background: on ? C.gold : '#D9C9B0'}} />;
											})}
										</div>
									</div>
								) : null}
								{/* "Share your photos" pressed on "uploading" */}
								{press > 0 ? <div style={{position: 'absolute', left: SHARE.x * sc, top: SHARE.y * sc, width: SHARE.w * sc, height: SHARE.h * sc, borderRadius: 6 * sc, background: `rgba(72,20,31,${0.18 * press})`, transform: `scale(${1 - 0.02 * press})`}} /> : null}
							</>
						) : null}
					</>
				)}
			</IPhone15>
			{chips.map(([at, g, label, y, side]) => {
				const p = prog(t, at, 0.55, Easing.bezier(0.2, 0.9, 0.3, 1.2));
				if (p <= 0) return null;
				return (
					<div key={label} style={{position: 'absolute', top: top + y * s - 44, ...(side === 'l' ? {left: 36} : {right: 36}), display: 'flex', alignItems: 'center', gap: 16, padding: '18px 28px 18px 20px', borderRadius: 16, background: C.burgundy, boxShadow: `0 0 0 1.5px ${C.goldMuted}, 0 24px 40px -18px rgba(72,20,31,0.6)`, opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * (side === 'l' ? -60 : 60)}px) scale(${mix(0.9, 1, p)})`}}>
						<div style={{width: 52, height: 52, borderRadius: '50%', background: C.goldMuted, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Glyph kind={g} color={C.burgundy} size={30} />
						</div>
						<div style={{fontFamily: sans, fontWeight: 500, fontSize: 32, color: C.ivory}}>{label}</div>
					</div>
				);
			})}
			{/* hearts float up from the selected reaction */}
			{Array.from({length: 7}, (_, k) => {
				const at = tReact + 0.1 + k * 0.16;
				const p = prog(t, at, 1.5, Easing.out(Easing.quad));
				if (p <= 0 || p >= 1) return null;
				return (
					<div key={k} style={{position: 'absolute', left: sx + HEART[0] * s - 24 + ((k % 3) - 1) * 40, top: top + HEART[1] * s - 40 - p * 360, opacity: Math.sin(Math.PI * p), transform: `scale(${mix(0.6, 1.1, p)}) rotate(${(k % 2 ? 1 : -1) * 12 * p}deg)`}}>
						<Glyph kind="heart" color={k % 3 === 1 ? C.gold : C.maroon} size={48} />
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/** 5a · "And the best part?" → 5b "Even years later," (the years roll forward). */
const SceneBestPart: React.FC<SP> = ({t, c, a}) => {
	const ws = ['and', 'the', 'best', 'part'].map((w) => c.W('q5', w));
	const tYears = c.W('q5', 'even');
	const yrs = prog(t, tYears - 0.1, 1.6, IN_OUT);
	const year = Math.round(mix(2026, 2046, yrs));
	const toYears = prog(t, tYears - 0.35, 0.6, IN_OUT);
	return (
		<AbsoluteFill style={{background: mix(0, 1, toYears) > 0.5 ? C.burgundy : C.ivory}}>
			{/* ivory "best part" card */}
			<AbsoluteFill style={{background: C.ivory, opacity: 1 - toYears}}>
				<Kolam id="k5" opacity={0.22} />
				<div style={{position: 'absolute', left: 60, right: 60, top: 740}}>
					<Words t={t} text="And the" times={ws.slice(0, 2)} color={C.maroon} size={128} />
					<Words t={t} text="best part?" times={ws.slice(2)} italic={[0, 1]} color={C.maroon} accent={C.maroon} size={150} />
					<div style={{marginTop: 34}}>
						<LotusDivider p={prog(t, ws[3], 0.6)} />
					</div>
				</div>
			</AbsoluteFill>
			{/* burgundy years card */}
			<AbsoluteFill style={{background: C.burgundy, opacity: toYears}}>
				<Kolam id="k5b" opacity={0.1} />
				<Mandala size={1400} color={C.goldMuted} opacity={0.16} rot={t * 6} style={{left: -160, top: 260}} />
				<Zari id="z5a" y={150} />
				<Zari id="z5b" y={1750} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 640}}>
					<Eyebrow p={prog(t, tYears, 0.5)} color={C.goldMuted}>Even years later</Eyebrow>
					<div style={{fontFamily: serif, fontWeight: 500, fontSize: 300, color: C.ivory, textAlign: 'center', lineHeight: 1, marginTop: 30, letterSpacing: '0.02em', fontVariantNumeric: 'lining-nums'}}>{year}</div>
					<div style={{marginTop: 30}}>
						<LotusDivider p={prog(t, tYears + 0.5, 0.7)} color={C.goldMuted} w={150} />
					</div>
					<div style={{marginTop: 30, fontFamily: serif, fontStyle: 'italic', fontSize: 58, color: C.goldMuted, textAlign: 'center', opacity: prog(t, c.W('q5', 'later'), 0.6)}}>your memories, still waiting</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** 6 · "That's what I call Digital Wedding Memories." on the invitation's temple-arch artwork. */
const SceneTitle: React.FC<SP> = ({t, c, a}) => {
	const tCall = c.W('q6', 'that');
	const tDig = c.W('q6', 'digital');
	const tMem = c.W('q6', 'memories');
	const z = mix(1.06, 1.0, prog(t, a, 3.5, Easing.linear));
	return (
		<AbsoluteFill style={{background: C.ivory}}>
			<AbsoluteFill style={{transform: `scale(${z})`}}>
				<Img src={staticFile('qr/img/temple-arch-portrait.webp')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 56% 36% at 50% 51%, rgba(250,245,236,0.96), rgba(250,245,236,0.75) 62%, rgba(250,245,236,0) 100%)'}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Eyebrow p={prog(t, tCall, 0.5)} size={28}>That's what I call</Eyebrow>
				<Words t={t} text="Digital Wedding" times={[tDig, c.W('q6', 'wedding')]} color={C.maroon} size={104} style={{marginTop: 26}} />
				<Words t={t} text="Memories" times={[tMem]} italic={[0]} color={C.maroon} accent={C.maroon} size={150} style={{marginTop: -6}} />
				<div style={{marginTop: 28}}>
					<LotusDivider p={prog(t, tMem + 0.3, 0.7)} w={140} />
				</div>
				<div style={{marginTop: 26, display: 'flex', alignItems: 'center', gap: 14, fontFamily: serif, fontStyle: 'italic', fontSize: 48, color: C.charcoal, opacity: prog(t, tMem + 0.55, 0.6)}}>
					Every moment, a memory
					<svg viewBox="0 0 24 24" width={44} height={44} style={{transform: `scale(${mix(0.4, 1, prog(t, tMem + 0.8, 0.5, Easing.bezier(0.3, 1.6, 0.5, 1)))})`}}>
						<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" fill={C.maroon} />
					</svg>
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** 7 · CTA on burgundy with the mandap artwork. */
const SceneCta: React.FC<SP> = ({t, c, a}) => {
	const ws = ['want', 'this', 'at', 'your', 'wedding', 'too'].map((w) => c.W('q7', w));
	const tDm = c.W('q7', 'dm');
	const tMem = c.W('q7', 'memories');
	const tCom = c.W('q7', 'comment');
	const btn = prog(t, tMem - 0.15, 0.55, Easing.bezier(0.3, 1.5, 0.5, 1));
	const glint = prog(t, tMem + 0.3, 1.0, Easing.linear);
	return (
		<AbsoluteFill style={{background: C.burgundy}}>
			<Img src={staticFile('qr/img/closing-mandap-mobile.webp')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${mix(1.08, 1, prog(t, a, 6, Easing.linear))})`, transformOrigin: '50% 100%'}} />
			<AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(72,20,31,0.96) 0%, rgba(72,20,31,0.9) 48%, rgba(72,20,31,0.25) 75%, rgba(72,20,31,0) 100%)'}} />
			<Mandala size={1100} color={C.goldMuted} opacity={0.035} rot={t * 3} style={{left: -10, top: 120}} />
			<Zari id="z7" y={150} />
			<div style={{position: 'absolute', left: 60, right: 60, top: 330}}>
				<Eyebrow p={prog(t, a + 0.1, 0.5)} color={C.goldMuted}>Digital Wedding Memories</Eyebrow>
				<Words t={t} text="Want this at" times={ws.slice(0, 3)} color={C.ivory} size={112} style={{marginTop: 34}} />
				<Words t={t} text="your wedding too?" times={ws.slice(3)} italic={[2]} color={C.ivory} accent={C.goldMuted} size={112} />
				<div style={{marginTop: 30}}>
					<LotusDivider p={prog(t, ws[5], 0.6)} color={C.goldMuted} />
				</div>
				<div style={{marginTop: 60, textAlign: 'center', fontFamily: sans, fontWeight: 500, fontSize: 44, letterSpacing: '0.02em', color: C.ivory, opacity: prog(t, tDm - 0.1, 0.4)}}>DM me</div>
				<div style={{marginTop: 22, display: 'flex', justifyContent: 'center'}}>
					<div style={{position: 'relative', overflow: 'hidden', padding: '30px 78px', borderRadius: 14, background: C.goldMuted, color: C.burgundy, fontFamily: sans, fontWeight: 600, fontSize: 58, letterSpacing: '0.24em', paddingRight: `calc(78px - 0.24em)`, opacity: Math.min(1, btn * 1.5), transform: `scale(${mix(0.7, 1, btn)})`, boxShadow: `0 0 0 1.5px ${C.gold}, 0 24px 50px -16px rgba(0,0,0,0.5)`}}>
						“MEMORIES”
						<div style={{position: 'absolute', top: 0, bottom: 0, left: `${mix(-30, 130, glint)}%`, width: 120, background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.65), rgba(255,255,255,0))', transform: 'skewX(-20deg)'}} />
					</div>
				</div>
				<div style={{marginTop: 34, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, fontFamily: serif, fontStyle: 'italic', fontSize: 56, color: C.goldMuted, opacity: prog(t, tCom - 0.35, 0.5)}}>
					<Glyph kind="chat" color={C.goldMuted} size={46} />
					or comment below
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ── film ────────────────────────────────────────────────────────────────────────────────────────────

export const QrMemories: React.FC<QrProps> = ({parts, duration, segments, musicOffset}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const c = useTimes(parts);
	const P = c.P;
	const tUpload = c.W('q2', 'and', 1) - 0.05; // "…scan it | and upload…"
	const s3 = P('q3').start - 0.35;
	const s4 = P('q4').start - 0.3;
	const s4b = c.W('q4', 'your') - 0.3;
	const s5 = P('q5').start - 0.35;
	const s5c = c.W('q5', 'you') - 0.3;
	const tRevisit = c.W('q5', 'revisit') - 0.2;
	const tRelive = c.W('q5', 'and', 1) - 0.1;
	const s6 = P('q6').start - 0.35;
	const s7 = P('q7').start - 0.35;
	const scenes: {a: number; b: number; arch: boolean; el: (sp: SP) => React.ReactNode}[] = [
		{
			a: 0,
			b: s3,
			arch: false,
			el: () => (
				<AbsoluteFill style={{background: C.burgundy}}>
					<Clip t={t} src="a1.mp4" a={0} b={tUpload} src0={0} zoom={[1.0, 1.07]} />
					{t >= tUpload - 0.4 ? (
						<AbsoluteFill style={{opacity: prog(t, tUpload - 0.4, 0.45)}}>
							<Clip t={t} src="a2.mp4" a={tUpload - 0.4} b={s3} src0={0} zoom={[1.04, 1.0]} />
						</AbsoluteFill>
					) : null}
					<Shade />
					<Captions t={t} words={[...P('q1').words, ...P('q2').words]} groups={[2, 3, 3, 4, 2, 2, 4, 2]} />
				</AbsoluteFill>
			),
		},
		{a: s3, b: s4, arch: true, el: (sp) => <SceneTogether {...sp} />},
		{a: s4, b: s4b, arch: true, el: (sp) => <SceneNotJust {...sp} />},
		{a: s4b, b: s5, arch: true, el: (sp) => <SceneExtras {...sp} />},
		{a: s5, b: s5c, arch: true, el: (sp) => <SceneBestPart {...sp} />},
		{
			a: s5c,
			b: s6,
			arch: true,
			el: () => (
				<AbsoluteFill style={{background: '#111'}}>
					<Clip t={t} src="site.mp4" a={s5c} b={tRevisit} src0={0.6} zoom={[1.0, 1.06]} filter={SITE} />
					{[
						[tRevisit, tRelive, 13.4, 1.9],
						[tRelive, s6, 20.2, 2.0],
					].map(([a, b, src0, rate]) =>
						t >= a - 0.35 ? (
							<AbsoluteFill key={a} style={{opacity: prog(t, a - 0.35, 0.4)}}>
								<Clip t={t} src="site.mp4" a={a - 0.35} b={b} src0={src0} rate={rate} zoom={[1.0, 1.05]} filter={SITE} />
							</AbsoluteFill>
						) : null,
					)}
					<Shade />
					<Captions t={t} words={P('q5').words.filter((w) => w.s >= s5c)} groups={[4, 4, 3, 2, 3, 3]} />
				</AbsoluteFill>
			),
		},
		{a: s6, b: s7, arch: true, el: (sp) => <SceneTitle {...sp} />},
		{a: s7, b: duration, arch: true, el: (sp) => <SceneCta {...sp} />},
	];
	return (
		<AbsoluteFill style={{background: C.burgundy}}>
			{scenes.map((s, i) => {
				const next = scenes[i + 1];
				if (t < s.a || (next && t > next.a + 0.9)) return null;
				const body = s.el({t, c, a: s.a, b: s.b});
				return s.arch ? (
					<Arch key={i} t={t} at={s.a}>
						{body}
					</Arch>
				) : (
					<AbsoluteFill key={i}>{body}</AbsoluteFill>
				);
			})}
			<AbsoluteFill style={{background: '#000', opacity: prog(t, duration - 0.6, 0.6, Easing.linear)}} />
			<Soundtrack duration={duration} segments={segments} musicOffset={musicOffset} cues={{arches: [s3, s4, s4b, s5, s5c, s6, s7], pics: c.W('q3', 'just'), chips: [c.W('q4', 'messages'), c.W('q4', 'voice'), c.W('q4', 'react')], years: c.W('q5', 'even'), title: c.W('q6', 'memories'), btn: c.W('q7', 'memories')}} voEnd={parts.length ? parts[parts.length - 1].end : 0} />
		</AbsoluteFill>
	);
};

// Music: geetha.mp3 (wedding-website-reel-2-v4's track) from 0 s, ducked under the voice like reel 2,
// breathing up in the gaps and the end hold.
const MUSIC = {intro: 0.16, voice: 0.065, gap: 0.11, end: 0.24};
type Cues = {arches: number[]; pics: number; chips: number[]; years: number; title: number; btn: number};
const Soundtrack: React.FC<{duration: number; musicOffset: number; voEnd: number; segments: {s: number; e: number}[]; cues: Cues}> = ({duration, musicOffset, voEnd, segments, cues}) => {
	const speech = (t: number) => Math.max(0, ...segments.map((g) => prog(t, g.s - 0.2, 0.2, Easing.linear) * (1 - prog(t, g.e, 0.35, Easing.linear))));
	const musicVol = (f: number) => {
		const t = f / FPS;
		const body = t > voEnd ? mix(MUSIC.gap, MUSIC.end, prog(t, voEnd, 0.8, Easing.linear)) : mix(MUSIC.gap, MUSIC.voice, speech(t));
		const level = t < 0.4 ? MUSIC.intro : body;
		return level * prog(t, 0, 0.15, Easing.linear) * (1 - prog(t, duration - 2.2, 2.2, Easing.linear));
	};
	const sfx: [number, string, number][] = [
		...cues.arches.map((a): [number, string, number] => [a - 0.05, 'silk-swish', 0.16]),
		[cues.pics - 0.05, 'paper-slide', 0.28],
		...cues.chips.map((a): [number, string, number] => [a - 0.15, 'soft-chime', 0.14]),
		[cues.years - 0.1, 'harp-reveal', 0.08],
		[cues.title - 0.1, 'harp-reveal', 0.07],
		[cues.btn - 0.15, 'soft-chime', 0.3],
	];
	return (
		<>
			<Audio src={staticFile('qr/music.mp3')} startFrom={Math.round(musicOffset * FPS)} volume={musicVol} />
			<Audio src={staticFile('qr/narration.wav')} volume={1.0} />
			{sfx.map(([at, name, v], i) => (
				<Sequence key={i} from={Math.max(0, Math.round(at * FPS))} durationInFrames={Math.round(3 * FPS)} layout="none">
					<Audio src={staticFile(`qr/sfx/${name}.mp3`)} volume={(f) => v * interpolate(f, [70, 90], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
				</Sequence>
			))}
		</>
	);
};
