// VibeLevel Screening — "Can You Get Away With It?" v5 (16:9; designed 1920×1080, rendered ×2 → 3840×2160).
// v5 (user review 2026-11-15): demo-v4 theme — dark charcoal + green pixel field for the story, light grey for product
// screens and the report; demo-v4 logo and dark pixel-tile transitions; pixel "masked cheater" character instead of
// live footage; new cheats wheel ("by performing these cheats"); Attempt 03 = proxy test-taker (live camera snapshots →
// flagged in the report); proctoring one-liners after the interview; closing "Cheating keeps evolving" wheel + beam.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';
import {Pixels} from '../vl2/kit';
import {BACK, Browser, C, CODE, CODE_LEN, Code, Cursor, EXPO, hash, IN_OUT, inter, keys, Keycaps, mix, NovaMark, ProblemPage, prog, Star, Workspace, type WS} from './ui';

const FPS = 30;
type Word = {w: string; s: number; e: number};
type Part = {id: string; start: number; end: number; words: Word[]};
export type Cyg5Props = {parts: Part[]; cards: number[]; card: number; duration: number; segments: {s: number; e: number; int?: boolean}[]; musicOffset: number};
export const calculateCyg5Metadata: CalculateMetadataFunction<Cyg5Props> = ({props}) => ({fps: FPS, durationInFrames: Math.max(1, Math.ceil(props.duration * FPS))});

const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9&']/g, '');
const useCues = (parts: Part[]) => {
	const P = (id: string) => parts.find((p) => p.id === id) ?? {id, start: 0, end: 0, words: []};
	const W = (id: string, w: string, k = 0) => {
		const ws = P(id).words;
		const exact = ws.filter((x) => clean(x.w) === w);
		const hits = exact.length > k ? exact : ws.filter((x) => clean(x.w).startsWith(w));
		return (hits[k] ?? hits[hits.length - 1] ?? {s: P(id).start}).s;
	};
	return {P, W};
};
type Q = ReturnType<typeof useCues>;
type SP = {t: number; q: Q; a: number; b: number};

// ── demo-v4 theme ───────────────────────────────────────────────────────────────────────────────────
const D = {bg: '#0E0F12', bg2: '#15171B', panel: '#1C1E23', line: '#2A2D33', text: '#F2F3F5', dim: '#8E939D', green: '#00D76B', greenDeep: '#00A853', mint: '#9EF5C4', light: '#ECEDEF', ink: '#0B0C0E', red: '#FF5A4E', amber: '#F2B441'};

const Dark: React.FC<{t: number; s?: number}> = ({t, s = 0.6}) => (
	<AbsoluteFill style={{background: D.bg}}>
		<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: s}} />
	</AbsoluteFill>
);
const Light: React.FC<{t: number; s?: number}> = ({t, s = 0.55}) => (
	<AbsoluteFill style={{background: D.light}}>
		<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: s, light: true}} />
	</AbsoluteFill>
);
/** Dark pixel-tile transition (demo v4): tiles cover the frame (p 0→1), the cut happens under cover, then clear (1→2). */
const Wipe: React.FC<{t: number; at: number}> = ({t, at}) => {
	const p = prog(t, at - 0.55, 1.1, Easing.linear) * 2;
	return p > 0 && p < 2 ? <Pixels t={t} w={1920} h={1080} mode={{kind: 'wipe', p}} cell={40} /> : null;
};
const LOGO_AR = 4528 / 1076;
const Logo: React.FC<{h: number; style?: React.CSSProperties}> = ({h, style}) => <Img src={staticFile('vl2/img/logo.png')} style={{height: h, width: h * LOGO_AR, display: 'block', ...style}} />;
const Corner: React.FC<{o: number}> = ({o}) => (o > 0.01 ? <Logo h={50} style={{position: 'absolute', left: 60, top: 44, opacity: o}} /> : null);

/** Kinetic headline: words rise out of a mask on their spoken time. */
const Kinetic: React.FC<{t: number; text: string; times: number[]; size: number; color?: string; accent?: string[]; weight?: number; style?: React.CSSProperties; out?: number}> = ({t, text, times, size, color = D.text, accent = [], weight = 600, style, out = 1e9}) => {
	const o = prog(t, out, 0.5, IN_OUT);
	return (
		<div style={{fontFamily: inter, fontWeight: weight, fontSize: size, lineHeight: 1.1, letterSpacing: weight >= 600 ? '-0.04em' : '-0.025em', color, textAlign: 'center', ...style}}>
			{text.split(' ').map((w, i, arr) => {
				const p = prog(t, (times[i] ?? times[times.length - 1]) - 0.1, 0.8, EXPO);
				return (
					<span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: i < arr.length - 1 ? '0.22em' : 0, paddingBottom: '0.1em'}}>
						<span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 100 - o * 40}%)`, opacity: Math.pow(p, 1.4) * (1 - o), color: accent.includes(w) ? D.green : undefined}}>{w}</span>
					</span>
				);
			})}
		</div>
	);
};

const Cam: React.FC<{x?: number; y?: number; z?: number; rx?: number; ry?: number; children: React.ReactNode}> = ({x = 0, y = 0, z = 1, rx = 0, ry = 0, children}) => (
	<AbsoluteFill style={{perspective: 2600, perspectiveOrigin: '50% 45%'}}>
		<AbsoluteFill style={{transform: `translate(${x}px, ${y}px) scale(${z}) rotateX(${rx}deg) rotateY(${ry}deg)`, transformStyle: 'preserve-3d'}}>{children}</AbsoluteFill>
	</AbsoluteFill>
);
const rise = (t: number, a: number) => {
	const p = prog(t, a, 0.9, EXPO);
	return {y: (1 - p) * 220, z: mix(0.86, 1, p), rx: (1 - p) * 16, o: Math.min(1, p * 1.8)};
};

// ── characters: flat illustrated "masked cheater" (Ryan) and his friend ─────────────────────────────
// Drawn in a 200×250 box; `cell` keeps the old sizing API (box = 16·cell × 20·cell).
type Expr = 'smirk' | 'o' | 'flat' | 'talk';
const INKM = '#3A1F14';
const LOOK = {
	cheater: {skin: '#EDBE95', shade: '#D49F76', hair: '#2B211C', hood: '#159653', hoodHi: '#1FB066', hoodDk: '#0E6E3C'},
	friend: {skin: '#C68B5F', shade: '#A9714A', hair: '#1D1A18', hood: '#4E5868', hoodHi: '#5E6A7C', hoodDk: '#394250'},
	honest: {skin: '#F1C7A2', shade: '#D9A57E', hair: '#5A3A22', hood: '#DDE3EA', hoodHi: '#EEF1F4', hoodDk: '#9FA9B6'},
};
/** The laptop, seen from behind (same 200×250 coordinates). */
const LaptopArt: React.FC<{glow?: number}> = ({glow = 0}) => (
	<>
		<rect x={26} y={170} width={148} height={76} rx={9} fill="#CDD2D9" />
		<rect x={26} y={170} width={148} height={10} rx={5} fill="#E3E6EA" />
		<rect x={92} y={198} width={16} height={16} rx={4} fill={glow > 0 ? D.green : '#E9ECEF'} opacity={0.6 + 0.4 * glow} />
		<rect x={12} y={244} width={176} height={9} rx={4} fill="#8E949D" />
	</>
);
type Who = 'cheater' | 'friend' | 'honest';
const Avatar: React.FC<{who: Who; expr: Expr; look: number; talk: number; laptop: boolean; bust: boolean}> = ({who, expr, look, talk, laptop, bust}) => {
	const L = LOOK[who];
	const open = expr === 'talk' && talk > 0.5;
	const eyeRy = expr === 'o' ? 10 : 8;
	return (
		<>
			{/* hoodie */}
			<path d="M14 250 C14 196 50 166 100 166 C150 166 186 196 186 250 Z" fill={L.hood} />
			<path d="M100 166 C150 166 186 196 186 250 L150 250 C150 210 130 180 100 176 Z" fill={L.hoodDk} opacity={0.35} />
			<path d="M64 170 Q100 214 136 170" fill="none" stroke={L.hoodDk} strokeWidth={8} strokeLinecap="round" />
			<line x1={88} y1={196} x2={85} y2={bust ? 236 : 226} stroke="#EEF0F2" strokeWidth={3.5} strokeLinecap="round" />
			<line x1={112} y1={196} x2={115} y2={bust ? 236 : 226} stroke="#EEF0F2" strokeWidth={3.5} strokeLinecap="round" />
			{/* neck, ears, head */}
			<rect x={84} y={136} width={32} height={38} rx={12} fill={L.shade} />
			<circle cx={46} cy={100} r={12} fill={L.shade} />
			<circle cx={154} cy={100} r={12} fill={L.shade} />
			<ellipse cx={100} cy={92} rx={54} ry={58} fill={L.skin} />
			<path d="M100 34 C140 34 154 70 154 92 C154 130 128 150 100 150 C128 140 142 118 142 92 C142 66 128 44 100 34 Z" fill={L.shade} opacity={0.45} />
			{who === 'cheater' ? (
				<>
					{/* messy hair */}
					<path d="M46 86 C40 42 70 24 100 26 C132 26 160 42 154 88 C146 70 136 62 122 60 C126 52 120 46 112 50 C104 44 92 46 88 54 C74 54 58 66 46 86 Z" fill={L.hair} />
					{/* bandit mask + knot tails */}
					<path d="M150 90 L182 78 L176 96 Z" fill="#0B0C0E" />
					<path d="M150 104 L184 112 L168 118 Z" fill="#0B0C0E" />
					<path d="M42 86 Q100 74 158 86 L158 114 Q100 104 42 114 Z" fill="#0B0C0E" />
					{[78, 122].map((cx) => (
						<g key={cx}>
							<ellipse cx={cx} cy={97} rx={12} ry={eyeRy} fill="#FFFFFF" />
							<circle cx={cx + look * 4.5} cy={98} r={expr === 'o' ? 3.6 : 4.8} fill="#0B0C0E" />
						</g>
					))}
				</>
			) : who === 'honest' ? (
				<>
					{/* neat hair with a side part */}
					<path d="M46 84 C42 44 70 28 102 28 C134 28 158 46 154 84 C150 66 138 56 118 54 C104 62 80 64 60 62 C52 68 48 76 46 84 Z" fill={L.hair} />
					{[78, 122].map((cx) => (
						<g key={cx}>
							<path d={`M${cx - 12} 82 Q${cx} ${expr === 'o' ? 74 : 78} ${cx + 12} 82`} fill="none" stroke={L.hair} strokeWidth={4.5} strokeLinecap="round" />
							<ellipse cx={cx} cy={97} rx={10} ry={eyeRy} fill="#FFFFFF" />
							<circle cx={cx + look * 4} cy={98} r={4.6} fill="#2B211C" />
						</g>
					))}
				</>
			) : (
				<>
					{/* cap (green) */}
					<path d="M44 80 C44 38 72 24 100 24 C130 24 156 38 156 80 Z" fill={D.green} />
					<path d="M100 74 L182 72 Q186 84 172 88 L100 86 Z" fill={D.greenDeep} />
					<circle cx={100} cy={26} r={5} fill={D.greenDeep} />
					{/* sunglasses */}
					<rect x={58} y={88} width={36} height={22} rx={8} fill="#0B0C0E" />
					<rect x={106} y={88} width={36} height={22} rx={8} fill="#0B0C0E" />
					<rect x={92} y={94} width={16} height={4} rx={2} fill="#0B0C0E" />
					<rect x={64} y={92} width={10} height={4} rx={2} fill="#FFFFFF" opacity={0.5} />
					<rect x={112} y={92} width={10} height={4} rx={2} fill="#FFFFFF" opacity={0.5} />
				</>
			)}
			{/* nose */}
			<path d="M101 112 Q107 122 99 125" fill="none" stroke={L.shade} strokeWidth={4} strokeLinecap="round" />
			{/* mouth */}
			{expr === 'o' ? (
				<ellipse cx={100} cy={136} rx={7} ry={9} fill={INKM} />
			) : open ? (
				<path d="M85 130 Q100 150 115 130 Z" fill={INKM} />
			) : expr === 'smirk' && who === 'honest' ? (
				<path d="M84 130 Q100 146 116 130" fill="none" stroke={INKM} strokeWidth={4.5} strokeLinecap="round" />
			) : expr === 'smirk' ? (
				<path d="M84 134 Q100 142 118 128" fill="none" stroke={INKM} strokeWidth={4.5} strokeLinecap="round" />
			) : (
				<path d="M87 135 L113 134" fill="none" stroke={INKM} strokeWidth={4.5} strokeLinecap="round" />
			)}
			{laptop && !bust ? <LaptopArt /> : null}
		</>
	);
};
/** A character. `p` builds it in; `look` −1…1 moves the pupils; `bust` = no laptop. */
const Char: React.FC<{who?: Who; x: number; y: number; cell: number; p?: number; look?: number; expr?: Expr; talk?: number; laptop?: boolean; bust?: boolean; o?: number; seed?: number}> = ({who = 'cheater', x, y, cell, p = 1, look = 0, expr = 'smirk', talk = 0, laptop = true, bust = false, o = 1}) => {
	const w = 16 * cell;
	const h = 20 * cell;
	const e = Easing.bezier(0.34, 1.56, 0.64, 1)(Math.min(1, Math.max(0, p)));
	return (
		<svg viewBox="0 0 200 250" width={w} height={h} style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity: o * Math.min(1, p * 2), transform: `translateY(${(1 - e) * 30}px) scale(${mix(0.9, 1, e)})`, transformOrigin: '50% 100%'}}>
			<Avatar who={who} expr={expr} look={look} talk={talk} laptop={laptop} bust={bust} />
		</svg>
	);
};
const CW = 16; // character width in cells
const CH = 20; // character height in cells

/** The character pops up in a dark rounded panel (bottom-left) for a beat — replaces the live-action inserts. */
const CharPop: React.FC<{t: number; a: number; d: number; expr: Expr; mark?: '!' | '✕'; look?: number}> = ({t, a, d, expr, mark, look = 0}) => {
	if (t < a - 0.05 || t > a + d + 0.05) return null;
	const i = prog(t, a, 0.5, BACK);
	const o = prog(t, a + d - 0.3, 0.3, IN_OUT);
	const m = prog(t, a + 0.25, 0.4, BACK);
	return (
		<div style={{position: 'absolute', left: 70, top: 560, width: 380, height: 420, borderRadius: 28, background: D.bg2, boxShadow: `0 0 0 1px ${D.line}, 0 40px 80px -30px rgba(0,0,0,0.7)`, overflow: 'hidden', opacity: Math.min(1, i * 1.5) * (1 - o), transform: `translateY(${(1 - i) * 60 + o * 30}px) scale(${mix(0.85, 1, i)})`, zIndex: 30}}>
			<Pixels t={t} w={380} h={420} mode={{kind: 'ambient', strength: 0.5}} cell={12} />
			<Char x={190 - (CW * 18) / 2} y={70} cell={18} expr={expr} look={look} bust seed={3} />
			{mark ? (
				<div style={{position: 'absolute', right: 34, top: 26, width: 74, height: 74, borderRadius: 18, background: mark === '!' ? D.amber : D.red, color: D.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: inter, fontWeight: 900, fontSize: 46, transform: `scale(${m}) rotate(${(1 - m) * -20}deg)`}}>{mark}</div>
			) : null}
		</div>
	);
};

// ── small pixel icons (5×5) for the wheel, signals and report ────────────────────────────────────────
const ICON: Record<string, string[]> = {
	tab: ['1111.', '1..11', '1111.', '.1..1', '.1111'],
	ai: ['..1..', '.111.', '11111', '.111.', '..1..'],
	proxy: ['11.11', '11.11', '.....', '11.11', '11.11'],
	device: ['.111.', '.1.1.', '.1.1.', '.1.1.', '.111.'],
	agent: ['11111', '1.1.1', '11111', '1...1', '11111'],
	ext: ['.11..', '1111.', '.1111', '1111.', '.11..'],
	paste: ['.111.', '11111', '1...1', '1...1', '11111'],
	video: ['111..', '11111', '11111', '11111', '111..'],
	cam: ['.111.', '11111', '11.11', '11111', '.....'],
};
const PixIcon: React.FC<{k: string; size: number; color?: string; o?: number}> = ({k, size, color = D.green, o = 1}) => {
	const c = size / 5;
	return (
		<div style={{position: 'relative', width: size, height: size, opacity: o}}>
			{ICON[k].flatMap((row, r) => [...row].map((ch, q) => (ch === '1' ? <div key={`${r}-${q}`} style={{position: 'absolute', left: q * c, top: r * c, width: c - 1.5, height: c - 1.5, borderRadius: 1.5, background: color}} /> : null)))}
		</div>
	);
};

// ── the cheats wheel ─────────────────────────────────────────────────────────────────────────────────
const WHEEL: {k: string; label: string[]; ang: number}[] = [
	{k: 'tab', label: ['Tab', 'switching'], ang: -120},
	{k: 'proxy', label: ['Proxy', 'test-taker'], ang: -60},
	{k: 'ai', label: ['Outside', 'AI tools'], ang: 0},
	{k: 'ext', label: ['Prompt', 'extensions'], ang: 60},
	{k: 'agent', label: ['Browser', 'agents'], ang: 120},
	{k: 'device', label: ['Second', 'device'], ang: 180},
];
const sector = (cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) => {
	const P = (r: number, a: number) => `${(cx + r * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(cy + r * Math.sin((a * Math.PI) / 180)).toFixed(1)}`;
	return `M ${P(r0, a0)} L ${P(r1, a0)} A ${r1} ${r1} 0 0 1 ${P(r1, a1)} L ${P(r0, a1)} A ${r0} ${r0} 0 0 0 ${P(r0, a0)} Z`;
};
/** `on[k]` 0–1 lights an item; `build` 0–1 assembles the wheel; `scan` (deg, optional) = the detection beam's angle. */
const Wheel: React.FC<{t: number; cx: number; cy: number; R: number; build: number; on: Record<string, number>; caught?: Record<string, number>; expr?: Expr}> = ({t, cx, cy, R, build, on, caught = {}, expr = 'smirk'}) => {
	const r0 = R * 0.4;
	const rim = Array.from({length: 72}, (_, k) => k);
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}}>
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
				{WHEEL.map((w, i) => {
					const b = prog(build, i * 0.08, 0.5, Easing.linear);
					const lit = on[w.k] ?? 0;
					return <path key={w.k} d={sector(cx, cy, r0 + 6, R - 8, w.ang - 30 + 1.2, w.ang + 30 - 1.2)} fill={`rgba(0,215,107,${0.05 + 0.2 * lit})`} stroke={lit > 0.05 ? D.green : D.line} strokeOpacity={0.4 + 0.6 * lit} strokeWidth={2 + lit} opacity={b} />;
				})}
				<circle cx={cx} cy={cy} r={r0} fill={D.bg2} stroke={D.green} strokeWidth={3} opacity={build} />
			</svg>
			{rim.map((k) => {
				const a = (k / rim.length) * Math.PI * 2;
				const b = prog(build, hash(k, 2) * 0.5, 0.4);
				if (b <= 0) return null;
				const tw = 0.5 + 0.5 * Math.sin(t * 2.4 + k * 1.7);
				return <div key={k} style={{position: 'absolute', left: cx + Math.cos(a) * R - 7, top: cy + Math.sin(a) * R - 7, width: 14, height: 14, borderRadius: 2, background: hash(k, 5) > 0.7 ? D.green : '#3A3E45', opacity: b * (hash(k, 5) > 0.7 ? 0.5 + 0.5 * tw : 0.9)}} />;
			})}
			{WHEEL.map((w, i) => {
				const b = prog(build, 0.2 + i * 0.08, 0.6);
				const lit = on[w.k] ?? 0;
				const rr = (r0 + R) / 2;
				const x = cx + Math.cos((w.ang * Math.PI) / 180) * rr;
				const y = cy + Math.sin((w.ang * Math.PI) / 180) * rr;
				const ok = caught[w.k] ?? 0;
				return (
					<div key={w.k} style={{position: 'absolute', left: x - 120, top: y - 62, width: 240, textAlign: 'center', opacity: b, transform: `scale(${1 + 0.08 * lit * (1 - prog(lit, 0.6, 0.4))})`}}>
						<div style={{display: 'flex', justifyContent: 'center', marginBottom: 10}}>
							<PixIcon k={w.k} size={34} color={lit > 0.3 ? D.green : D.dim} />
						</div>
						<div style={{fontFamily: inter, fontWeight: 700, fontSize: 28, lineHeight: 1.12, letterSpacing: '-0.02em', color: lit > 0.3 ? '#FFFFFF' : D.dim}}>
							{w.label.map((l) => (
								<div key={l}>{l}</div>
							))}
						</div>
						{ok > 0 ? (
							<div style={{position: 'absolute', right: 6, top: -8, width: 36, height: 36, borderRadius: 8, background: D.green, color: D.ink, fontFamily: inter, fontWeight: 900, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${prog(ok, 0, 1, BACK)})`}}>✓</div>
						) : null}
					</div>
				);
			})}
			<div style={{position: 'absolute', left: cx - r0, top: cy - r0, width: r0 * 2, height: r0 * 2, borderRadius: '50%', overflow: 'hidden', opacity: build}}>
				<Char x={r0 - (CW * (r0 / 11)) / 2} y={r0 * 0.18} cell={r0 / 11} expr={expr} look={Math.sin(t * 1.6) > 0.3 ? 1 : Math.sin(t * 1.6) < -0.3 ? -1 : 0} p={prog(build, 0.3, 0.7, Easing.linear)} seed={5} />
			</div>
		</div>
	);
};

// ── chapter cards (dark) ───────────────────────────────────────────────────────────────────────────
const DIG: Record<string, string[]> = {
	'0': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
	'1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
	'2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
	'3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
	'4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
};
const SUB = 24;
const BIT = SUB * 2;
const numeralCells = (n: string) => {
	const cells: {x: number; y: number; col: number; row: number; r: number}[] = [];
	[...n].forEach((d, di) =>
		DIG[d].forEach((rowS, row) =>
			[...rowS].forEach((b, col) => {
				if (b !== '1') return;
				for (let sy = 0; sy < 2; sy++)
					for (let sx = 0; sx < 2; sx++) {
						const gc = di * 6 + col;
						cells.push({x: gc * BIT + sx * SUB, y: row * BIT + sy * SUB, col: gc * 2 + sx, row: row * 2 + sy, r: hash(gc * 2 + sx, row * 2 + sy, 7)});
					}
			}),
		),
	);
	return cells;
};
const NUM_W = 11 * BIT;
const NUM_H = 7 * BIT;
const CARDS = [
	{n: '01', head: 'The External AI Shortcut', sub: 'Can an external AI tool do the work for him?', next: 'Attempt 02'},
	{n: '02', head: 'The Copy-Paste Trick', sub: 'Can he bring an external solution into the assessment?', next: 'Attempt 03'},
	{n: '03', head: 'The Proxy Test-Taker', sub: 'Can someone else take the assessment for him?', next: 'Attempt 04'},
	{n: '04', head: 'The Final Bluff', sub: 'Can he explain the work that was submitted?', next: 'The report'},
];

const ChapterCard: React.FC<{t: number; a: number; d: number; i: number}> = ({t, a, d, i}) => {
	const u = t - a;
	if (u < -0.05 || u > d + 0.05) return null;
	const cd = CARDS[i];
	const cells = numeralCells(cd.n);
	const ex = prog(u, d - 0.45, 0.45, IN_OUT);
	const fadeOut = i === 0 ? 0 : prog(u, d - 0.28, 0.28, Easing.linear); // reveal the next (light) scene under it
	const fadeIn = i === 0 ? 1 : prog(u, 0, 0.22, Easing.linear);
	const X0 = 960 - NUM_W / 2;
	const Y0 = 226;
	const textIn = (k: number) => prog(u, 0.45 + k * 0.14, 0.8, EXPO);
	return (
		<AbsoluteFill style={{opacity: fadeIn * (1 - fadeOut)}}>
			<Dark t={t} s={0.7} />
			<AbsoluteFill style={{transform: `scale(${mix(1.03, 1, prog(u, 0, d, Easing.linear))})`}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 104, display: 'flex', justifyContent: 'center', gap: 8, opacity: prog(u, 0.1, 0.4) * (1 - ex)}}>
					{[0, 1, 2, 3].map((k) => (
						<div key={k} style={{width: 20, height: 20, borderRadius: 4, background: k < i ? D.greenDeep : k === i ? D.green : 'transparent', boxShadow: k > i ? `inset 0 0 0 1.5px ${D.line}` : undefined}} />
					))}
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: inter, fontWeight: 700, fontSize: 20, letterSpacing: '0.42em', paddingLeft: '0.42em', color: D.dim, opacity: prog(u, 0.15, 0.5) * (1 - ex)}}>ATTEMPT</div>
				{Array.from({length: 70}, (_, k) => {
					const p = prog(u, 0.05 + hash(k, 4) * 0.5, 0.9, EXPO);
					if (p <= 0 || p >= 1) return null;
					const tx = X0 + hash(k, 5) * NUM_W;
					const ty = Y0 + hash(k, 6) * NUM_H;
					const ang = hash(k, 7) * Math.PI * 2;
					const dd = (1 - p) * (220 + hash(k, 8) * 380);
					const sz = 6 + hash(k, 9) * 10;
					return <div key={`sp${k}`} style={{position: 'absolute', left: tx + Math.cos(ang) * dd, top: ty + Math.sin(ang) * dd, width: sz, height: sz, borderRadius: 2, background: k % 3 ? '#3A3E45' : D.green, opacity: Math.sin(Math.PI * p) * 0.9}} />;
				})}
				{cells.map((c, k) => {
					let x = X0 + c.x;
					let y = Y0 + c.y;
					let o = 1;
					let sx = 1;
					let bg = c.r > 0.8 ? D.mint : D.green;
					if (i === 0) {
						const p = prog(u, (1 - c.col / 22) * 0.3 + c.r * 0.1, 0.6, EXPO);
						x += (1 - p) * (1200 + c.r * 400);
						sx = 1 + (1 - p) * 4;
						o = p > 0 ? 1 : 0;
						x -= ex * (1900 + c.r * 300);
						sx += ex * 5;
					} else if (i === 1) {
						const p = prog(u, (1 - c.row / 14) * 0.26 + c.r * 0.12, 0.65, BACK);
						y -= (1 - p) * (900 + c.r * 260);
						o = p > 0 ? 1 : 0;
						x = mix(x, 960 - SUB / 2, ex);
						y = mix(y, 600, ex);
						o *= 1 - prog(ex, 0.7, 0.3);
					} else if (i === 2) {
						const lock = (c.row / 14) * 0.6 + 0.1;
						o = u > lock - 0.22 + c.r * 0.1 ? 1 : 0;
						if (o && u < lock) bg = hash(c.col, c.row, Math.floor(u * 24)) > 0.5 ? D.green : '#3A3E45';
						x += ex * (1500 + c.r * 700) * (0.4 + c.row / 14);
					} else {
						const p = prog(u, (c.col / 22) * 0.32, 0.8, IN_OUT);
						y = mix(Y0 + NUM_H / 2 + Math.sin(c.col * 0.55 + u * 9) * 100 * Math.sin((c.col / 22) * Math.PI), y, p);
						o = prog(u, (c.col / 22) * 0.15, 0.2);
						y = mix(y, Y0 + NUM_H / 2 + Math.sin(c.col * 0.6 + u * 14) * 40, ex);
					}
					if (o <= 0) return null;
					return <div key={k} style={{position: 'absolute', left: x, top: y, width: SUB - 4, height: SUB - 4, borderRadius: 3, background: bg, opacity: o, transform: `scaleX(${sx})`, transformOrigin: 'left center', boxShadow: '0 0 18px -6px rgba(0,215,107,0.6)'}} />;
				})}
				<div style={{position: 'absolute', left: 0, right: 0, top: Y0 + NUM_H + 50, textAlign: 'center', opacity: 1 - ex, transform: `translateY(${-ex * 20}px)`}}>
					<div style={{overflow: 'hidden', paddingBottom: 8}}>
						<div style={{fontFamily: inter, fontWeight: 700, fontSize: 80, letterSpacing: '-0.04em', color: D.text, transform: `translateY(${(1 - textIn(0)) * 105}%)`, opacity: Math.pow(textIn(0), 1.4)}}>{cd.head}</div>
					</div>
					<div style={{marginTop: 8, fontFamily: inter, fontWeight: 400, fontSize: 32, color: D.dim, opacity: textIn(1), transform: `translateY(${(1 - textIn(1)) * 16}px)`}}>{cd.sub}</div>
				</div>
				<div style={{position: 'absolute', right: -50, top: Y0 + NUM_H / 2 - 40, fontFamily: inter, fontWeight: 700, fontSize: 60, letterSpacing: '-0.04em', color: D.text, opacity: 0.12 * prog(u, 0.4, 0.6) * (1 - ex), filter: 'blur(5px)', whiteSpace: 'nowrap'}}>{cd.next}</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ── signals (bigger, for mobile) ───────────────────────────────────────────────────────────────────
const SIG = {
	tab: {label: 'Tab switch', state: 'Warning shown', tone: 'amber'},
	paste: {label: 'External paste', state: 'Blocked', tone: 'red'},
	proxy: {label: 'Proxy test-taker', state: 'Flagged', tone: 'red'},
} as const;
type SigKey = keyof typeof SIG;
const TONE = {amber: [C.amber, C.amberBg], red: [C.red, C.redBg], green: [C.green, C.mint]} as const;
const BigChip: React.FC<{k: SigKey; p: number}> = ({k, p}) => {
	const s = SIG[k];
	const [fg, bg] = TONE[s.tone];
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '22px 34px 22px 22px', borderRadius: 24, background: '#fff', boxShadow: `0 0 0 1px ${C.line}, 0 30px 60px -24px rgba(14,21,18,0.55)`, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 30}px) scale(${mix(0.86, 1, p)})`, transformOrigin: 'right bottom', whiteSpace: 'nowrap'}}>
			<div style={{width: 60, height: 60, borderRadius: 14, background: bg, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, padding: 11, boxSizing: 'border-box'}}>
				{Array.from({length: 9}, (_, i) => (
					<div key={i} style={{background: fg, opacity: hash(i, k.length) > 0.4 ? 1 : 0.35, borderRadius: 2}} />
				))}
			</div>
			<div style={{fontFamily: inter}}>
				<div style={{fontWeight: 700, fontSize: 36, color: C.ink, letterSpacing: '-0.02em'}}>{s.label}</div>
				<div style={{fontWeight: 600, fontSize: 26, color: fg, marginTop: 4}}>{s.state}</div>
			</div>
		</div>
	);
};
const Tray: React.FC<{t: number; items: [SigKey, number][]}> = ({t, items}) => {
	const shown = items.filter(([, at]) => t >= at);
	if (!shown.length) return null;
	return (
		<div style={{position: 'absolute', right: 56, bottom: 64, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14, zIndex: 35}}>
			{shown.map(([k, at]) => (
				<BigChip key={k} k={k} p={prog(t, at, 0.6, BACK)} />
			))}
		</div>
	);
};

// ── S1 · opening (dark) ───────────────────────────────────────────────────────────────────────────

/** Demo-v4 logo: blurs in with a thin green sweep, then docks top-left when the VO starts (no pixels behind it). */
const LogoIntro: React.FC<{t: number; dockAt: number}> = ({t, dockAt}) => {
	const H0 = 120;
	const W0 = H0 * LOGO_AR;
	const p = prog(t, 0.3, 1.0);
	const dock = prog(t, dockAt, 0.9, IN_OUT);
	if (dock >= 1) return null;
	const h = mix(H0, 50, dock);
	const left = mix(960 - W0 / 2, 60, dock);
	const top = mix(540 - H0 / 2, 44, dock);
	return (
		<>
			<div style={{position: 'absolute', left, top, opacity: p, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined, transform: `scale(${mix(0.94, 1, p)})`, transformOrigin: 'left top'}}>
				<Logo h={h} />
			</div>
			<div style={{position: 'absolute', left: 960 - 280, top: 540 + H0 / 2 + 14, width: 560 * prog(t, 0.9, 1.0, IN_OUT), height: 2, background: `linear-gradient(90deg, transparent, ${D.green}, transparent)`, opacity: 1 - prog(t, 1.9, 0.5) - dock}} />
		</>
	);
};

const S1Opening: React.FC<SP> = ({t, q, a, b}) => {
	const W = (w: string, k = 0) => q.W('s1a', w, k);
	const tToday = W('today');
	return (
		<AbsoluteFill>
			<Dark t={t} s={0.6} />
			<LogoIntro t={t - a} dockAt={tToday - 0.7 - a} />
			<AbsoluteFill style={{opacity: 1 - prog(t, b - 0.35, 0.35, IN_OUT)}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 300}}>
					<Kinetic t={t} text="Today, we're putting" times={[tToday, W('we'), W('putting')]} size={84} color={D.dim} weight={400} />
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 425}}>
					<Kinetic t={t} text="VibeLevel Screening" times={[W('vibe'), W('screening')]} size={124} color={D.text} weight={700} />
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 600}}>
					<Kinetic t={t} text="to the test." times={[W('to'), W('the'), W('test')]} size={92} accent={['test.']} weight={700} />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const S1Cheats: React.FC<SP> = ({t, q, a, b}) => {
	const W = (w: string, k = 0) => q.W('s1b', w, k);
	const build = prog(t, W('these') - 0.1, 1.4, Easing.linear);
	const lit = (cue: string, k = 0) => prog(t, W(cue, k) - 0.08, 0.35);
	const on = {tab: lit('tab'), ai: lit('outside'), proxy: lit('proxy'), device: lit('second'), agent: lit('browser'), ext: lit('prompt')};
	const out = prog(t, b - 0.4, 0.4, IN_OUT);
	return (
		<AbsoluteFill>
			<Dark t={t} s={0.6} />
			<AbsoluteFill style={{opacity: 1 - out, transform: `scale(${mix(1, 1.04, out)})`}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 96}}>
					<Kinetic t={t} text="by performing these cheats" times={[Math.max(a + 0.1, W('by')), W('performing'), W('these'), W('cheats')]} size={76} accent={['cheats']} weight={700} />
				</div>
				<Wheel t={t} cx={960} cy={640} R={370} build={build} on={on} expr="smirk" />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const S1Shortcuts: React.FC<SP> = ({t, q, a, b}) => {
	const W = (w: string, k = 0) => q.W('s1c', w, k);
	const tCand = Math.max(a + 0.2, W('candidate') - 0.35);
	const tDec = W('decides') - 0.15;
	const tLet = W('let') - 0.2;
	const invite = prog(t, tCand, 0.9, EXPO);
	const tClick = W('link') + 0.15;
	const click = prog(t, tClick, 0.45, Easing.linear);
	return (
		<AbsoluteFill>
			<Dark t={t} s={0.6} />
			{t < tDec + 0.6 ? (
				<AbsoluteFill style={{opacity: 1 - prog(t, tDec - 0.2, 0.4, IN_OUT)}}>
					<Cam rx={mix(14, 3, invite)} ry={mix(-12, -4, invite)} z={mix(0.88, 1, invite) + click * 0.04} y={mix(90, 0, invite)}>
						<div style={{position: 'absolute', left: 560, top: 290, width: 800, height: 390, borderRadius: 26, background: '#fff', boxShadow: '0 60px 110px -40px rgba(0,0,0,0.8)', padding: 36, boxSizing: 'border-box', opacity: Math.min(1, invite * 1.5), fontFamily: inter}}>
							<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
								<Logo h={30} />
								<div style={{fontSize: 17, color: C.muted, marginLeft: 6}}>· Assessment invitation · just now</div>
							</div>
							<div style={{marginTop: 26, fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', color: C.ink}}>You're invited: Password Generator</div>
							<div style={{display: 'flex', gap: 10, marginTop: 18}}>
								{['JavaScript', 'Beginner', '⏱ 60 min', '✦ AI Assistant Included'].map((x) => (
									<span key={x} style={{padding: '8px 14px', borderRadius: 8, background: x.includes('AI') ? C.mint : C.soft, color: x.includes('AI') ? C.green : C.body, fontSize: 17, fontWeight: 600}}>{x}</span>
								))}
							</div>
							<div style={{position: 'absolute', left: 36, right: 36, bottom: 36, height: 62, borderRadius: 13, background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 21, transform: `scale(${1 - 0.04 * Math.sin(Math.PI * click)})`, boxShadow: click > 0 && click < 1 ? `0 0 0 ${10 * (1 - click)}px rgba(11,122,62,0.25)` : undefined}}>Open assessment →</div>
						</div>
						<Cursor x={mix(1260, 958, prog(t, tClick - 0.75, 0.7, IN_OUT))} y={mix(860, 618, prog(t, tClick - 0.75, 0.7, IN_OUT))} click={click} o={prog(t, tClick - 0.85, 0.25)} />
					</Cam>
				</AbsoluteFill>
			) : null}
			{t > tDec + 0.2 && t < tLet + 0.5 ? (
				<AbsoluteFill style={{opacity: 1 - prog(t, tLet - 0.25, 0.4, IN_OUT)}}>
					<div style={{position: 'absolute', left: 0, right: 0, top: 360}}>
						<Kinetic t={t} text="…and decides to take a few" times={[tDec + 0.3, W('decides'), W('to'), W('take'), W('a', 1), W('few')]} size={72} color={D.dim} weight={400} />
						<Kinetic t={t} text="shortcuts." times={[W('shortcuts')]} size={170} accent={['shortcuts.']} weight={700} />
					</div>
				</AbsoluteFill>
			) : null}
			{t > tLet - 0.1 ? (
				<AbsoluteFill style={{opacity: 1 - prog(t, b - 0.2, 0.3, IN_OUT)}}>
					<div style={{position: 'absolute', left: 0, right: 0, top: 330}}>
						<Kinetic t={t} text="Let's see" times={[W('let'), W('see')]} size={150} weight={700} />
						<Kinetic t={t} text="how far he gets." times={[W('how'), W('far'), W('he'), W('gets')]} size={150} accent={['gets.']} weight={700} />
					</div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};

// ── shared product pieces ──────────────────────────────────────────────────────────────────────────
const BX = 70;
const BY = 112;
const BW = 1540;
const BH = 900;
const CT = BY + 94;
const VL_URL = 'vibelevel.ai/assess/password-generator';
const NOVA_URL = 'nova.ai/chat';
const VL_TAB = {title: 'VibeLevel · Password Generator', icon: 'vl' as const};
const NOVA_TAB = {title: 'Nova — Ask anything', icon: 'nova' as const};
const timerAt = (t: number, t0: number) => {
	const left = Math.max(0, 3600 - Math.max(0, (t - t0) * 9));
	return `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(Math.floor(left % 60)).padStart(2, '0')}`;
};
const Switch: React.FC<{p: number; from: React.ReactNode; to: React.ReactNode; dir?: 1 | -1}> = ({p, from, to, dir = 1}) => (
	<>
		{p < 1 ? <div style={{position: 'absolute', inset: 0, opacity: 1 - p, transform: `translateX(${-p * 60 * dir}px) scale(${1 - p * 0.02})`, filter: `blur(${p * 6}px)`}}>{from}</div> : null}
		{p > 0 ? <div style={{position: 'absolute', inset: 0, opacity: p, transform: `translateX(${(1 - p) * 60 * dir}px)`, filter: `blur(${(1 - p) * 6}px)`}}>{to}</div> : null}
	</>
);
/** Dark glass pill with a pixel badge. */
const Pill: React.FC<{text: string; p: number; x: number; y: number; green?: boolean; float?: number}> = ({text, p, x, y, green, float = 0}) =>
	p > 0.01 ? (
		<div style={{position: 'absolute', left: x, top: y + Math.sin(float) * 6, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 28px 16px 16px', borderRadius: 18, background: 'rgba(28,30,35,0.92)', boxShadow: `0 0 0 1px ${D.line}, 0 24px 44px -22px rgba(0,0,0,0.7)`, fontFamily: inter, fontWeight: 600, fontSize: 28, color: green ? D.green : D.text, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * -40}px)`, whiteSpace: 'nowrap'}}>
			<div style={{width: 40, height: 40, borderRadius: 10, background: D.bg2, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3, padding: 7, boxSizing: 'border-box'}}>
				{Array.from({length: 9}, (_, i) => (
					<div key={i} style={{borderRadius: 1.5, background: hash(i, text.length) > 0.55 ? D.green : '#3A3E45'}} />
				))}
			</div>
			{text}
		</div>
	) : null;

// ── S2 · the assessment: the character at his laptop → the product (light) ──────────────────────────

const InviteCard: React.FC<{press: number}> = ({press}) => (
	<AbsoluteFill style={{background: '#F7F8F7', fontFamily: inter}}>
		<div style={{position: 'absolute', left: BW / 2 - 380, top: 90, width: 760, height: 400, borderRadius: 16, background: '#fff', boxShadow: `0 0 0 1px ${C.line}`, padding: 32, boxSizing: 'border-box'}}>
			<span style={{padding: '4px 10px', borderRadius: 6, background: C.soft, fontSize: 12, fontWeight: 700, color: C.body}}>{'</>'} JAVASCRIPT</span>
			<div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 18}}>
				<Star h={26} />
				<span style={{fontSize: 16, fontWeight: 700}}>VibeLevel AI</span>
				<span style={{fontSize: 26, fontWeight: 700, color: C.ink, marginLeft: 10}}>Password Generator</span>
			</div>
			<div style={{display: 'flex', gap: 8, marginTop: 14}}>
				<span style={{padding: '4px 10px', borderRadius: 6, background: C.mint, color: C.green, fontSize: 12, fontWeight: 700}}>BEGINNER</span>
				<span style={{padding: '4px 10px', borderRadius: 6, background: C.soft, fontSize: 12}}>FrontEnd</span>
			</div>
			<div style={{marginTop: 18, fontSize: 15, color: C.body}}>Build a password generator with configurable options and a visual strength indicator.</div>
			<div style={{display: 'flex', gap: 16, marginTop: 12, fontSize: 13, color: C.body}}>
				<span>⏱ 60 min</span>
				<span style={{color: C.green}}>✦ AI Assistant Included</span>
			</div>
			<div style={{position: 'absolute', left: 32, right: 32, bottom: 32, height: 52, borderRadius: 10, background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, transform: `scale(${1 - 0.04 * Math.sin(Math.PI * press)})`}}>Sign In to Start</div>
		</div>
	</AbsoluteFill>
);

const S2Assessment: React.FC<SP> = ({t, q, a, b}) => {
	const W = (w: string, k = 0) => q.W('s2', w, k);
	const tSigns = W('signs') - 0.25;
	const reveal = prog(t, tSigns, 0.7, Easing.bezier(0.7, 0, 0.2, 1));
	const tSign = tSigns + 0.6;
	const tReads = Math.max(W('reads') - 0.1, tSign + 0.45);
	const tReady = W('ready');
	const tStart = tReady + 0.15;
	const ws = prog(t, tStart + 0.2, 0.9);
	// the character (cell 26) sits right of centre; its laptop lid = rows 14–18, cols 2–13
	const CELL = 26;
	const cx = 1180;
	const cy = 250;
	const K2 = (CW * CELL) / 200;
	const lid = {x: cx + 26 * K2, y: cy + 170 * K2, w: 148 * K2, h: 76 * K2};
	const zoom = prog(t, tSigns - 0.2, 0.9, IN_OUT);
	const build = prog(t, a - 0.1, 1.1, Easing.linear);
	return (
		<AbsoluteFill>
			{t < tSigns + 1.0 ? (
				<AbsoluteFill style={{transform: `scale(${1 + zoom * 1.6})`, transformOrigin: `${lid.x + lid.w / 2}px ${lid.y + lid.h / 2}px`}}>
					<Dark t={t} s={0.6} />
					<div style={{position: 'absolute', left: cx - 120, top: cy + CH * CELL - 6, width: CW * CELL + 240, height: 10, borderRadius: 3, background: '#2A2D33', opacity: build}} />
					<Char x={cx} y={cy} cell={CELL} p={build} look={Math.sin(t * 1.3) > 0.5 ? 1 : 0} expr="smirk" seed={2} />
					<Pill text="60 minutes" p={prog(t, W('60') - 0.1, 0.8, EXPO) * (1 - zoom)} x={150} y={300} float={t * 1.1} />
					<Pill text="AI Assistant Included" green p={prog(t, W('minute') + 0.05, 0.8, EXPO) * (1 - zoom)} x={150} y={410} float={t * 1.1 + 1} />
					<Pill text="Password Generator · JavaScript" p={prog(t, W('assessment') - 0.1, 0.8, EXPO) * (1 - zoom)} x={150} y={520} float={t * 1.1 + 2} />
					<Pill text="Candidate · Ryan" p={prog(t, a + 0.5, 0.8, EXPO) * (1 - zoom)} x={cx + 40} y={150} float={t * 1.1 + 3} />
				</AbsoluteFill>
			) : null}
			{reveal > 0 ? (
				<AbsoluteFill style={{clipPath: `inset(${mix(400, 0, reveal)}px ${mix(560, 0, reveal)}px ${mix(380, 0, reveal)}px ${mix(560, 0, reveal)}px round ${mix(18, 0, reveal)}px)`}}>
					<Light t={t} s={0.5} />
					<Cam rx={keys(t, [[tSigns + 0.4, 8], [tSigns + 1.6, 3], [tReads, 2], [tStart + 0.6, 0], [b, 0]])} ry={keys(t, [[tSigns + 0.4, -8], [tSigns + 1.6, -3], [tStart + 0.6, 0], [b, 2]])} z={keys(t, [[tSigns + 0.4, 0.9], [tSigns + 1.6, 0.97], [tStart + 0.6, 1], [b, 1.03]])}>
						<Browser w={BW} h={BH} tabs={[VL_TAB]} active={0} url={VL_URL} style={{left: BX, top: BY}}>
							<Switch
								p={prog(t, tReads, 0.5, IN_OUT)}
								from={<InviteCard press={prog(t, tSign, 0.35, Easing.linear)} />}
								to={
									<Switch
										p={prog(t, tStart + 0.25, 0.5, IN_OUT)}
										from={<ProblemPage w={BW} h={BH - 94} scroll={keys(t, [[tReads + 0.3, 0], [tReady, 260]])} start={prog(t, tStart, 0.35, Easing.linear)} />}
										to={
											<div style={{position: 'absolute', inset: 0, transform: `scale(${mix(0.97, 1, ws)})`}}>
												<Workspace w={BW} h={BH - 94} s={{timer: timerAt(t, tStart + 0.6), file: 'style.css'}} />
											</div>
										}
									/>
								}
							/>
						</Browser>
						{t < tReads + 0.2 ? <Cursor x={mix(1250, BX + BW / 2 + 10, prog(t, tSign - 0.45, 0.4, IN_OUT))} y={mix(980, CT + 426, prog(t, tSign - 0.45, 0.4, IN_OUT))} click={prog(t, tSign, 0.45, Easing.linear)} o={prog(t, tSign - 0.5, 0.15) * (1 - prog(t, tReads + 0.1, 0.2))} /> : null}
						{t > tReady - 0.7 && t < tStart + 0.6 ? <Cursor x={mix(1200, BX + BW - 110, prog(t, tReady - 0.6, 0.6, IN_OUT))} y={mix(700, CT + 24, prog(t, tReady - 0.6, 0.6, IN_OUT))} click={prog(t, tStart, 0.45, Easing.linear)} o={1 - prog(t, tStart + 0.35, 0.2)} /> : null}
					</Cam>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};

// ── S3 · Attempt 01 ───────────────────────────────────────────────────────────────────────────────

const NovaPage: React.FC<{attach: number; sent: number; answer: number; sel?: number}> = ({attach, sent, answer, sel = 0}) => (
	<AbsoluteFill style={{background: '#FBFBFE', fontFamily: inter}}>
		<div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, opacity: 1 - sent}}>
			<NovaMark size={40} />
			<span style={{fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', color: '#1B1B3A'}}>Nova</span>
		</div>
		<div style={{position: 'absolute', left: 230, right: 230, top: mix(150, 30, sent)}}>
			{sent > 0 ? (
				<div style={{marginLeft: 'auto', width: 460, padding: 14, borderRadius: 16, background: '#EEF0FF', opacity: sent}}>
					<div style={{height: 150, borderRadius: 10, overflow: 'hidden', position: 'relative', background: '#fff', boxShadow: '0 0 0 1px #DADDF0'}}>
						<div style={{position: 'absolute', left: 0, top: 0, width: BW, height: BH - 94, transform: 'scale(0.29)', transformOrigin: 'left top'}}>
							<ProblemPage w={BW} h={BH - 94} />
						</div>
					</div>
					<div style={{marginTop: 10, fontSize: 15, fontWeight: 600, color: '#1B1B3A'}}>Solve this. Give me the full code.</div>
				</div>
			) : null}
			{answer > 0 ? (
				<div style={{marginTop: 20, display: 'flex', gap: 14}}>
					<NovaMark size={28} />
					<div style={{flex: 1, padding: '16px 20px', borderRadius: 16, background: '#fff', boxShadow: '0 0 0 1px #E6E8F2'}}>
						<div style={{fontSize: 15, color: '#1B1B3A', marginBottom: 10}}>Here's a complete solution:</div>
						<div style={{position: 'relative', padding: 14, borderRadius: 12, background: '#F6F7FB'}}>
							<Code lines={CODE} shown={answer * CODE_LEN} size={13} lh={1.5} gutter={false} />
							{sel > 0 ? <div style={{position: 'absolute', left: 8, top: 8, width: 'calc(100% - 16px)', height: `${94 * sel}%`, background: 'rgba(47,107,255,0.16)', borderRadius: 6}} /> : null}
						</div>
					</div>
				</div>
			) : null}
		</div>
		<div style={{position: 'absolute', left: 230, right: 230, bottom: 30, height: 66, borderRadius: 18, background: '#fff', boxShadow: '0 0 0 1px #E6E8F2, 0 14px 30px -18px rgba(27,27,58,0.3)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', fontSize: 16, color: '#9A9DB5'}}>
			{attach > 0 && sent < 1 ? <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 10, background: '#EEF0FF', color: '#1B1B3A', fontSize: 14, fontWeight: 600, opacity: attach, transform: `scale(${mix(0.6, 1, attach)})`}}>🖼 screenshot.png</div> : null}
			{attach > 0.5 && sent < 1 ? <span style={{color: '#1B1B3A'}}>Solve this. Give me the full code.</span> : 'Ask anything'}
			<div style={{marginLeft: 'auto', width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#7B61FF,#2F6BFF)'}} />
		</div>
	</AbsoluteFill>
);

const S3Attempt1: React.FC<SP> = ({t, q, a}) => {
	const W = (w: string, k = 0) => q.W('s3', w, k);
	const tTakes = W('takes') - 0.1;
	const tShot = W('screenshot');
	const tSends = W('sends') - 0.05;
	const tExt = W('external');
	const tMoment = W('moment');
	const tCatch = W('catches');
	const tWarn = W('warning');
	const r = rise(t, a);
	const drag = prog(t, tShot + 0.25, 0.75, IN_OUT);
	const flash = t > tShot + 1.05 && t < tShot + 1.3 ? 1 - (t - tShot - 1.05) / 0.25 : 0;
	const thumb = prog(t, tShot + 1.1, 0.6, EXPO);
	const tab = prog(t, tSends, 0.5, EXPO);
	const toNova = prog(t, tSends + 0.25, 0.55, IN_OUT);
	const attach = prog(t, tSends + 0.6, 0.45, BACK);
	const sent = prog(t, tSends + 1.3, 0.5, EXPO);
	const answer = prog(t, tExt + 0.3, 2.6, Easing.linear);
	const back = prog(t, tCatch + 0.15, 0.5, IN_OUT);
	const banner = prog(t, tWarn - 0.3, 0.6, EXPO);
	const camPush = prog(t, tWarn - 0.35, 0.9, IN_OUT);
	const tabFocus = prog(t, tMoment - 0.3, 0.7, IN_OUT) * (1 - prog(t, tCatch + 0.1, 0.6, IN_OUT));
	const R = {x: BX + 330, y: CT + 60, w: 920, h: 600};
	const onNova = toNova > 0.5 && back < 0.5;
	return (
		<AbsoluteFill>
			<Light t={t} s={0.5} />
			<Cam x={tabFocus * 1000 + camPush * 260} y={r.y + tabFocus * 560 + camPush * 300} z={r.z + tabFocus * 0.5 + camPush * 0.26} rx={r.rx}>
				<div style={{position: 'absolute', inset: 0, opacity: r.o}}>
					<Browser w={BW} h={BH} tabs={[VL_TAB, ...(tab > 0 ? [{...NOVA_TAB, grow: tab}] : [])]} active={onNova ? 1 : 0} url={onNova ? NOVA_URL : VL_URL} hlTab={tabFocus} style={{left: BX, top: BY}}>
						<Switch p={back} dir={-1} from={<Switch p={toNova} from={<ProblemPage w={BW} h={BH - 94} />} to={<NovaPage attach={attach} sent={sent} answer={answer} />} />} to={<Workspace w={BW} h={BH - 94} s={{timer: timerAt(t, a - 40), file: 'style.css', banner}} />} />
					</Browser>
					{drag > 0 && toNova < 0.3 ? (
						<>
							<div style={{position: 'absolute', left: R.x, top: R.y, width: R.w * drag, height: R.h * drag, background: 'rgba(47,107,255,0.08)', boxShadow: 'inset 0 0 0 2px rgba(47,107,255,0.9)', opacity: 1 - thumb}} />
							<div style={{position: 'absolute', left: R.x + R.w * drag - 14, top: R.y + R.h * drag - 1, width: 28, height: 2, background: '#111', opacity: 1 - thumb}} />
							<div style={{position: 'absolute', left: R.x + R.w * drag - 1, top: R.y + R.h * drag - 14, width: 2, height: 28, background: '#111', opacity: 1 - thumb}} />
						</>
					) : null}
					{thumb > 0 && attach < 1 ? (
						<div style={{position: 'absolute', left: mix(BX + BW - 330, BX + 300, toNova), top: mix(BY + BH - 230, BY + BH - 70, toNova), width: mix(280, 80, toNova), height: mix(182, 52, toNova), borderRadius: 10, overflow: 'hidden', background: '#fff', boxShadow: '0 0 0 3px #fff, 0 24px 44px -16px rgba(14,21,18,0.55)', opacity: Math.min(1, thumb * 1.5) * (1 - prog(attach, 0.5, 0.5)), transform: `scale(${mix(0.4, 1, thumb)})`}}>
							<div style={{width: BW, height: BH - 94, transform: `scale(${mix(280, 80, toNova) / BW})`, transformOrigin: 'left top'}}>
								<ProblemPage w={BW} h={BH - 94} />
							</div>
						</div>
					) : null}
					<Cursor x={keys(t, [[tMoment - 0.2, 900], [tCatch - 0.15, BX + 150]])} y={keys(t, [[tMoment - 0.2, 700], [tCatch - 0.15, BY + 30]])} o={prog(t, tMoment - 0.3, 0.3) * (1 - prog(t, tCatch + 0.5, 0.3))} click={prog(t, tCatch, 0.45, Easing.linear)} />
				</div>
			</Cam>
			{flash > 0 ? <AbsoluteFill style={{background: `rgba(255,255,255,${0.8 * flash})`}} /> : null}
			<Keycaps keys={['⌘', '⇧', '4']} p={prog(t, tTakes, 0.4, BACK) * (1 - prog(t, tShot + 0.3, 0.3))} x={790} y={880} />
			{tabFocus > 0.3 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 920, display: 'flex', justifyContent: 'center', opacity: tabFocus}}>
					<div style={{padding: '18px 34px', borderRadius: 999, background: C.amberBg, boxShadow: `0 0 0 1.5px ${C.amberLine}, 0 20px 40px -20px rgba(183,121,31,0.5)`, fontFamily: inter, fontWeight: 700, fontSize: 34, color: C.amber}}>He left the assessment tab.</div>
				</div>
			) : null}
			<CharPop t={t} a={tTakes - 0.1} d={1.2} expr="smirk" look={1} />
			<CharPop t={t} a={tWarn + 0.9} d={1.6} expr="o" mark="!" look={-1} />
		</AbsoluteFill>
	);
};

// ── S4 · Attempt 02: paste blocked ────────────────────────────────────────────────────────────────

const ClipCard: React.FC<{style?: React.CSSProperties}> = ({style}) => (
	<div style={{position: 'absolute', width: 420, padding: 20, borderRadius: 18, background: '#fff', boxShadow: `0 0 0 1px ${C.line}, 0 40px 70px -30px rgba(14,21,18,0.55)`, fontFamily: inter, ...style}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, color: C.ink}}>
			<span style={{width: 26, height: 26, borderRadius: 7, background: '#EEF3FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>📋</span>
			Generated answer · copied
		</div>
		<div style={{marginTop: 12}}>
			<Code lines={CODE.slice(0, 9)} shown={600} size={11} lh={1.5} gutter={false} />
		</div>
	</div>
);
const Shatter: React.FC<{t: number; at: number; x: number; y: number; w: number; h: number}> = ({t, at, x, y, w, h}) => {
	const p = prog(t, at, 1.1, Easing.bezier(0.2, 0.7, 0.3, 1));
	if (p <= 0 || p >= 1) return null;
	return (
		<>
			{Array.from({length: 80}, (_, k) => {
				const cx = x + hash(k, 1) * w;
				const cy = y + hash(k, 2) * h;
				const ang = Math.atan2(cy - (y + h / 2), cx - (x + w / 2)) + (hash(k, 3) - 0.5);
				const d = (60 + hash(k, 4) * 260) * p;
				return <div key={k} style={{position: 'absolute', left: cx + Math.cos(ang) * d, top: cy + Math.sin(ang) * d + p * p * 150, width: 9 + hash(k, 5) * 9, height: 9 + hash(k, 5) * 9, borderRadius: 2, background: k % 3 ? '#F28B82' : C.red, opacity: (1 - p) * 0.9, transform: `rotate(${hash(k, 6) * 180 * p}deg)`}} />;
			})}
		</>
	);
};
const S4Attempt2: React.FC<SP> = ({t, q, a}) => {
	const W = (w: string, k = 0) => q.W('s4', w, k);
	const tCopies = W('copies');
	const tAnswer = W('answer');
	const tPaste = W('paste') - 0.1;
	const tWork = W('workspace');
	const tBlocks = W('blocks');
	const r = rise(t, a);
	const sel = prog(t, tCopies + 0.05, 0.6, IN_OUT);
	const lift = prog(t, tAnswer, 0.7, EXPO);
	const toVL = prog(t, tPaste, 0.55, IN_OUT);
	const fly = prog(t, tPaste + 0.1, 0.8, Easing.bezier(0.5, 0, 0.75, 0.2));
	const hit = tWork + 0.3;
	const toast = prog(t, hit + 0.05, 0.6, BACK);
	const shake = t > hit && t < hit + 0.3 ? Math.sin((t - hit) * 90) * 8 * (1 - (t - hit) / 0.3) : 0;
	const push = prog(t, tBlocks, 1.1, IN_OUT);
	return (
		<AbsoluteFill>
			<Light t={t} s={0.5} />
			<Cam x={shake + push * 260} y={r.y + push * 320} z={r.z + push * 0.26} rx={r.rx}>
				<div style={{position: 'absolute', inset: 0, opacity: r.o}}>
					<Browser w={BW} h={BH} tabs={[VL_TAB, NOVA_TAB]} active={toVL > 0.5 ? 0 : 1} url={toVL > 0.5 ? VL_URL : NOVA_URL} style={{left: BX, top: BY}}>
						<Switch p={toVL} dir={-1} from={<NovaPage attach={1} sent={1} answer={1} sel={sel} />} to={<Workspace w={BW} h={BH - 94} s={{timer: timerAt(t, a - 60), file: 'generator.js', toast}} />} />
					</Browser>
					{lift > 0 && fly < 1 ? <ClipCard style={{left: mix(BX + 520, BX + 470, fly), top: mix(BY + 300 - lift * 90, CT + 140, fly), transform: `perspective(1000px) rotateX(${mix(0, 22, fly)}deg) rotate(${mix(-5, 0, fly)}deg) scale(${mix(1, 0.92, fly)})`, opacity: fly > 0.97 ? 0 : 1}} /> : null}
					<Shatter t={t} at={hit} x={BX + 470} y={CT + 140} w={420} h={260} />
				</div>
			</Cam>
			<Keycaps keys={['⌘', 'C']} p={prog(t, tCopies + 0.4, 0.4, BACK) * (1 - prog(t, tPaste - 0.2, 0.3))} x={830} y={900} />
			<Keycaps keys={['⌘', 'V']} p={prog(t, tWork - 0.35, 0.35, BACK) * (1 - prog(t, hit + 0.6, 0.3))} x={830} y={900} />
			{t > hit ? <AbsoluteFill style={{background: `rgba(217,48,37,${0.1 * (1 - prog(t, hit, 0.5, Easing.linear))})`}} /> : null}
			<CharPop t={t} a={hit + 0.75} d={1.5} expr="flat" mark="✕" />
		</AbsoluteFill>
	);
};

// ── S5 · Attempt 03: the proxy test-taker ─────────────────────────────────────────────────────────

const SNAPS: {who: 'cheater' | 'friend'; ts: string}[] = [
	{who: 'cheater', ts: '05:12'},
	{who: 'cheater', ts: '18:40'},
	{who: 'friend', ts: '31:05'},
	{who: 'friend', ts: '44:20'},
];
const SnapCard: React.FC<{who: 'cheater' | 'friend'; ts: string; w: number; flag?: number; light?: boolean}> = ({who, ts, w, flag = 0, light}) => {
	const h = w * 1.08;
	const cell = (w * 0.62) / CW;
	return (
		<div style={{position: 'relative', width: w, height: h, borderRadius: 16, background: light ? '#F1F3F2' : D.bg2, boxShadow: flag > 0 ? `0 0 0 ${3 * flag}px ${C.red}` : `0 0 0 1px ${light ? C.line : D.line}`, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: (w - CW * cell) / 2, top: w * 0.1}}>
				<Char who={who} x={0} y={0} cell={cell} bust expr={who === 'friend' ? 'flat' : 'smirk'} seed={9} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: w * 0.24, background: light ? '#fff' : D.panel, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: inter, fontWeight: 700, fontSize: w * 0.12, color: light ? C.ink : D.text, fontVariantNumeric: 'tabular-nums'}}>
				<PixIcon k="cam" size={w * 0.1} color={flag > 0 ? C.red : light ? C.green : D.green} />
				{ts}
			</div>
		</div>
	);
};

const S5Proxy: React.FC<SP> = ({t, q, a, b}) => {
	const W = (w: string, k = 0) => q.W('s5', w, k);
	const tSteps = W('steps');
	const tFriend = W('friend');
	const tTake = W('take');
	const tNothing = W('nothing');
	const tMon = W('monitors');
	const tSnap = W('snapshots');
	const tPerson = W('person');
	const tReport = W('report') - 0.3;
	const tFlag = W('flagged');
	const CELL = 24;
	const sx = 600;
	const sy = 300;
	const build = prog(t, a, 1.0, Easing.linear);
	const leave = prog(t, tSteps - 0.1, 0.9, IN_OUT);
	const enter = prog(t, tFriend - 0.15, 1.0, IN_OUT);
	const live = prog(t, tMon - 0.2, 0.6, BACK);
	const caps = [tSnap - 0.15, tPerson - 0.1];
	const dim = prog(t, tReport, 0.6, IN_OUT);
	const rep = prog(t, tReport + 0.1, 0.8, EXPO);
	const flag = prog(t, tFlag - 0.15, 0.6, BACK);
	const clock = 1880 + Math.max(0, t - a) * 140;
	const mm = Math.floor(clock / 60) % 60;
	const ss = Math.floor(clock % 60);
	const shownSnaps = (i: number) => (i < 2 ? live : prog(t, caps[i - 2] + 0.45, 0.6, EXPO));
	// face box around whoever sits at the laptop (head rows 0–12)
	const K5 = (CW * CELL) / 200;
	const face = {x: sx + 36 * K5, y: sy + 22 * K5, w: 128 * K5, h: 136 * K5};
	return (
		<AbsoluteFill>
			<Dark t={t} s={0.6} />
			<AbsoluteFill style={{opacity: 1 - dim * 0.55, filter: dim > 0 ? `blur(${dim * 3}px)` : undefined}}>
				{/* desk */}
				<div style={{position: 'absolute', left: sx - 160, top: sy + CH * CELL - 6, width: CW * CELL + 320, height: 10, borderRadius: 3, background: '#2A2D33', opacity: build}} />
				{/* he leaves (left), the friend sits down (from the right) */}
				{leave < 1 ? <Char who="cheater" x={sx - leave * 620} y={sy + Math.sin(leave * Math.PI) * -30} cell={CELL} p={build} laptop={false} look={-1} expr="smirk" o={1 - prog(leave, 0.6, 0.4)} seed={4} /> : null}
				{enter > 0 ? <Char who="friend" x={sx + (1 - enter) * 700} y={sy + Math.sin(enter * Math.PI) * -30} cell={CELL} laptop={false} expr={t > tMon ? 'flat' : 'smirk'} o={Math.min(1, enter * 2)} seed={6} /> : null}
				{/* the laptop stays put */}
				<svg viewBox="0 0 200 250" width={CW * CELL} height={CH * CELL} style={{position: 'absolute', left: sx, top: sy, overflow: 'visible', opacity: build}}>
					<LaptopArt glow={live} />
				</svg>
				{/* "the session keeps going" */}
				<div style={{position: 'absolute', left: sx + (CW * CELL) / 2 - 230, top: 170, width: 460, display: 'flex', justifyContent: 'center', opacity: prog(t, a + 0.4, 0.6)}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 26px', borderRadius: 999, background: D.panel, boxShadow: `0 0 0 ${1 + 2 * prog(t, tNothing - 0.1, 0.4) * (1 - prog(t, tNothing + 0.9, 0.5))}px ${D.green}`, fontFamily: inter, fontWeight: 600, fontSize: 28, color: D.text, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
						<span style={{width: 14, height: 14, borderRadius: '50%', background: D.green, opacity: 0.5 + 0.5 * Math.sin(t * 6)}} />
						{t > tNothing - 0.1 ? 'Session continues' : 'Session in progress'} · {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
					</div>
				</div>
				{/* live monitoring */}
				{live > 0 ? (
					<>
						<div style={{position: 'absolute', left: 120, top: 170, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderRadius: 16, background: D.panel, boxShadow: `0 0 0 1px ${D.line}`, fontFamily: inter, fontWeight: 700, fontSize: 24, letterSpacing: '0.14em', color: D.text, opacity: Math.min(1, live * 1.5), transform: `scale(${mix(0.8, 1, live)})`, transformOrigin: 'left center'}}>
							<PixIcon k="cam" size={30} />
							LIVE MONITORING
							<span style={{width: 12, height: 12, borderRadius: '50%', background: D.red, opacity: Math.sin(t * 7) > 0 ? 1 : 0.25}} />
						</div>
						{caps.map((at, i) => {
							const p = prog(t, at - 0.1, 0.5, EXPO);
							const o = 1 - prog(t, at + 0.5, 0.3);
							if (p <= 0 || o <= 0) return null;
							const L = 46 * (1 - p) + 20;
							return (
								<React.Fragment key={i}>
									<svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: o}}>
										{[
											[face.x, face.y, 1, 1],
											[face.x + face.w, face.y, -1, 1],
											[face.x, face.y + face.h, 1, -1],
											[face.x + face.w, face.y + face.h, -1, -1],
										].map(([x, y, dx, dy], k) => (
											<path key={k} d={`M ${x} ${y + dy * L} L ${x} ${y} L ${x + dx * L} ${y}`} fill="none" stroke={D.green} strokeWidth={5} />
										))}
									</svg>
									{t > at + 0.12 && t < at + 0.35 ? <AbsoluteFill style={{background: `rgba(255,255,255,${0.5 * (1 - (t - at - 0.12) / 0.23)})`}} /> : null}
								</React.Fragment>
							);
						})}
					</>
				) : null}
				{/* snapshot strip */}
				<div style={{position: 'absolute', left: 1290, top: 150, width: 520}}>
					<div style={{fontFamily: inter, fontWeight: 700, fontSize: 22, letterSpacing: '0.24em', color: D.dim, marginBottom: 20, opacity: live}}>CAMERA SNAPSHOTS</div>
					<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24}}>
						{SNAPS.map((s, i) => {
							const p = shownSnaps(i);
							return (
								<div key={i} style={{opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px) scale(${mix(0.8, 1, p)})`}}>
									<SnapCard who={s.who} ts={s.ts} w={240} />
								</div>
							);
						})}
					</div>
				</div>
			</AbsoluteFill>
			{/* the report flags the switch */}
			{rep > 0 ? (
				<div style={{position: 'absolute', left: 260, top: 210, width: 1400, borderRadius: 30, background: '#fff', boxShadow: '0 60px 120px -40px rgba(0,0,0,0.8)', padding: '44px 54px', boxSizing: 'border-box', fontFamily: inter, opacity: Math.min(1, rep * 1.5), transform: `translateY(${(1 - rep) * 60}px) scale(${mix(0.93, 1, rep)})`}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
						<div style={{fontSize: 22, fontWeight: 700, letterSpacing: '0.2em', color: C.muted}}>REPORT · IDENTITY CHECK</div>
						<div style={{marginLeft: 'auto', fontSize: 24, color: C.muted}}>Ryan M. · Password Generator</div>
					</div>
					<div style={{display: 'flex', gap: 26, marginTop: 34, alignItems: 'center'}}>
						{SNAPS.map((s, i) => (
							<React.Fragment key={i}>
								{i === 2 ? (
									<div style={{width: 6, alignSelf: 'stretch', borderRadius: 3, background: C.red, opacity: flag, transform: `scaleY(${flag})`}} />
								) : null}
								<SnapCard who={s.who} ts={s.ts} w={270} light flag={i >= 2 ? flag : 0} />
							</React.Fragment>
						))}
					</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 34, opacity: Math.min(1, flag * 1.5), transform: `translateY(${(1 - flag) * 16}px)`}}>
						<span style={{padding: '12px 24px', borderRadius: 999, background: C.red, color: '#fff', fontSize: 30, fontWeight: 800}}>Proxy test-taker · Flagged</span>
						<span style={{fontSize: 28, fontWeight: 600, color: C.ink}}>A different person was at the laptop from 31:05.</span>
					</div>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ── S6 · Attempt 04: the interview (dark, demo-v4 style) ──────────────────────────────────────────

const S6Interview: React.FC<SP> = ({t, q, a}) => {
	const W = (w: string, k = 0) => q.W('s6', w, k);
	const tSub = W('submitted');
	const tInt = W('interview');
	const tCan = W('can');
	const q1 = q.P('q1');
	const a1 = q.P('a1');
	const ui = prog(t, q1.start - 0.9, 0.9, EXPO);
	const qText = 'Can you explain how your strength indicator decides between weak, medium, strong and very strong?';
	const qShown = prog(t, q1.start, q1.end - q1.start, Easing.linear);
	const amp = t >= q1.start && t <= q1.end ? 1 : 0.12;
	const spoken = a1.words.find((w) => t >= w.s - 0.02 && t <= w.e + 0.02);
	const talk = spoken ? (Math.sin(t * 22) > -0.2 ? 1 : 0) : 0;
	const ansWords = a1.words.filter((w) => t >= w.s).map((w) => w.w);
	const link = prog(t, a1.start + 0.6, 0.8, IN_OUT);
	const evalP = prog(t, a1.end + 0.15, 0.6, BACK);
	const intro = 1 - prog(t, q1.start - 1.0, 0.5, IN_OUT);
	return (
		<AbsoluteFill>
			<Dark t={t} s={0.6} />
			{intro > 0 ? (
				<AbsoluteFill style={{opacity: intro}}>
					<div style={{position: 'absolute', left: 0, right: 0, top: 240, display: 'flex', justifyContent: 'center', opacity: prog(t, a, 0.5) * (1 - prog(t, W('one') - 0.3, 0.35))}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '20px 34px', borderRadius: 999, background: D.panel, boxShadow: `0 0 0 1px ${D.line}`, fontFamily: inter, fontSize: 32, fontWeight: 700, color: D.text, transform: `scale(${mix(0.85, 1, prog(t, tSub - 0.2, 0.6, BACK))})`}}>
							<span style={{width: 46, height: 46, borderRadius: '50%', background: D.green, color: D.ink, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900}}>✓</span>
							Assessment submitted
						</div>
					</div>
					<div style={{position: 'absolute', left: 0, right: 0, top: 380}}>
						<Kinetic t={t} text="One thing left:" times={[W('one'), W('thing'), W('left')]} size={68} color={D.dim} weight={400} out={tCan - 0.75} />
						<Kinetic t={t} text="the interview." times={[W('the', 1), tInt]} size={150} accent={['interview.']} weight={700} out={tCan - 0.75} />
					</div>
					<div style={{position: 'absolute', left: 0, right: 0, top: 400}}>
						<Kinetic t={t} text="Can he explain" times={[Math.max(tCan, tCan - 0.75 + 0.55), W('he'), W('explain')]} size={116} weight={700} />
						<Kinetic t={t} text="what was built?" times={[W('what'), W('was'), W('built')]} size={116} accent={['built?']} weight={700} />
					</div>
				</AbsoluteFill>
			) : null}
			{ui > 0 ? (
				<Cam z={mix(0.9, 1, ui)} rx={mix(8, 0, ui)} y={(1 - ui) * 120}>
					<div style={{position: 'absolute', inset: 0, opacity: ui, fontFamily: inter}}>
						<div style={{position: 'absolute', left: 90, top: 120, display: 'flex', alignItems: 'center', gap: 18}}>
							<span style={{fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', color: D.text}}>Video Q&A</span>
							<span style={{padding: '8px 18px', borderRadius: 8, background: D.green, fontSize: 22, fontWeight: 600, color: D.ink}}>Assessment-specific question</span>
						</div>
						{/* candidate tile: the character answers */}
						<div style={{position: 'absolute', left: 90, top: 200, width: 900, height: 560, borderRadius: 24, overflow: 'hidden', background: D.bg2, boxShadow: `0 0 0 1px ${D.line}, 0 40px 80px -40px rgba(0,0,0,0.8)`}}>
							<Pixels t={t} w={900} h={560} mode={{kind: 'ambient', strength: 0.45}} cell={14} />
							<Char x={450 - (CW * 26) / 2} y={70} cell={26} bust expr={spoken ? 'talk' : t > a1.end ? 'o' : 'flat'} talk={talk} look={Math.sin(t * 0.9) > 0.6 ? -1 : 0} seed={7} />
							<div style={{position: 'absolute', left: 22, bottom: 22, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 999, background: 'rgba(14,15,18,0.85)', boxShadow: `0 0 0 1px ${D.line}`, fontWeight: 600, fontSize: 22, color: D.text}}>
								{t > a1.start ? <span style={{width: 11, height: 11, borderRadius: '50%', background: D.red}} /> : null}
								Ryan · candidate
							</div>
						</div>
						<div style={{position: 'absolute', left: 90, top: 790, width: 900, fontSize: 30, lineHeight: 1.4, color: D.text}}>
							{ansWords.length ? (
								<>
									<span style={{fontSize: 18, fontWeight: 700, letterSpacing: '0.2em', color: D.dim, display: 'block', marginBottom: 8}}>ANSWER · LIVE TRANSCRIPT</span>“{ansWords.join(' ')}”
								</>
							) : null}
						</div>
						{/* AI interviewer */}
						<div style={{position: 'absolute', left: 1030, top: 200, width: 800, borderRadius: 24, background: D.panel, boxShadow: `0 0 0 1px ${D.line}`, padding: 34, boxSizing: 'border-box'}}>
							<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
								<Star h={46} />
								<div>
									<div style={{fontSize: 26, fontWeight: 700, color: D.text}}>AI Interviewer</div>
									<div style={{fontSize: 19, color: D.dim}}>Question about his submission</div>
								</div>
								<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, height: 46}}>
									{Array.from({length: 22}, (_, k) => (
										<div key={k} style={{width: 5, height: 6 + 36 * amp * Math.abs(Math.sin(k * 0.8 + t * 11) * Math.sin(k * 0.31 + t * 3)), borderRadius: 2, background: D.green, opacity: 0.4 + 0.6 * amp}} />
									))}
								</div>
							</div>
							<div style={{marginTop: 24, fontSize: 38, fontWeight: 600, lineHeight: 1.28, letterSpacing: '-0.02em', color: D.text, minHeight: 200}}>{qText.slice(0, Math.round(qText.length * Math.min(1, qShown * 1.15)))}</div>
						</div>
						<div style={{position: 'absolute', left: 1030, top: 600, width: 800, borderRadius: 20, background: '#fff', padding: '18px 22px', boxSizing: 'border-box', opacity: prog(t, a1.start, 0.6)}}>
							<div style={{fontSize: 17, fontWeight: 700, letterSpacing: '0.16em', color: C.muted, marginBottom: 10}}>FROM THE SUBMISSION · generator.js</div>
							<Code lines={CODE.slice(15, 22)} shown={900} size={16} lh={1.55} gutter={false} hl={[[2, 6, `rgba(217,48,37,${0.1 * link})`]]} />
						</div>
						<svg width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
							{link > 0 ? <path d="M 990 830 C 1010 830, 1000 760, 1030 740" fill="none" stroke={D.red} strokeWidth={3} strokeDasharray="8 8" strokeDashoffset={-t * 40} opacity={link} /> : null}
						</svg>
						{evalP > 0.01 ? (
							<div style={{position: 'absolute', left: 1030, top: 880, width: 800, padding: '20px 24px', borderRadius: 18, background: C.redBg, boxShadow: `inset 0 0 0 2px ${C.red}`, opacity: Math.min(1, evalP * 1.5), transform: `translateY(${(1 - evalP) * 20}px) scale(${mix(0.94, 1, evalP)})`}}>
								<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
									<span style={{fontSize: 20, fontWeight: 700, letterSpacing: '0.12em', color: C.body}}>UNDERSTANDING</span>
									<span style={{padding: '6px 18px', borderRadius: 999, background: C.red, color: '#fff', fontSize: 22, fontWeight: 800}}>Low</span>
								</div>
								<div style={{marginTop: 8, fontSize: 21, color: C.ink}}>Doesn’t explain how getStrength() scores the password.</div>
							</div>
						) : null}
					</div>
				</Cam>
			) : null}
		</AbsoluteFill>
	);
};

// ── S6b · more proctoring signals: one-liners that scroll up ───────────────────────────────────────

const MORE: {cue: string; k: string; title: string; sub: string}[] = [
	{cue: 'second', k: 'device', title: 'Second device', sub: 'A phone or tablet in view gets flagged.'},
	{cue: 'browser', k: 'agent', title: 'Browser agents', sub: 'Agents driving the browser are detected.'},
	{cue: 'prompt', k: 'ext', title: 'Prompt extensions', sub: 'AI prompt extensions are caught.'},
];
const S6bSignals: React.FC<SP> = ({t, q, a, b}) => {
	const W = (w: string, k = 0) => q.W('s6b', w, k);
	const head = prog(t, a + 0.1, 0.7);
	const out = prog(t, b - 0.4, 0.4, IN_OUT);
	const ats = MORE.map((m) => W(m.cue) - 0.2);
	return (
		<AbsoluteFill>
			<Dark t={t} s={0.6} />
			<AbsoluteFill style={{opacity: 1 - out}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', opacity: head}}>
					<div style={{fontFamily: inter, fontWeight: 700, fontSize: 22, letterSpacing: '0.3em', paddingLeft: '0.3em', color: D.dim}}>PROCTORING SIGNALS</div>
					<div style={{marginTop: 14}}>
						<Kinetic t={t} text="VibeLevel watches for more." times={[W('vibe'), W('watches'), W('for'), W('more')]} size={64} accent={['more.']} weight={700} />
					</div>
				</div>
				{MORE.map((m, i) => {
					const p = prog(t, ats[i] + (i ? 0.2 : 0), 0.7, EXPO);
					if (p <= 0) return null;
					// one line at a time: it rises into the centre; when the next is named it scrolls up and out
					const nx = ats[i + 1];
					const up = nx === undefined ? 0 : prog(t, nx - 0.15, 0.45, IN_OUT);
					const y = 470 + (1 - p) * 120 - up * 140;
					const focus = 1;
					const gone = nx === undefined ? 0 : prog(t, nx - 0.15, 0.3, Easing.linear); // clears before the next arrives
					return (
						<div key={m.k} style={{position: 'absolute', left: 960, top: y, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 34, opacity: Math.min(1, p * 1.5) * (1 - gone), transform: `translateX(-50%) scale(${mix(0.96, 1, p)})`, transformOrigin: 'center center'}}>
							<div style={{width: 120, height: 120, borderRadius: 26, background: D.panel, boxShadow: `0 0 0 ${focus > 0.5 ? 2 : 1}px ${focus > 0.5 ? D.green : D.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<PixIcon k={m.k} size={60} color={focus > 0.5 ? D.green : D.dim} />
							</div>
							<div style={{fontFamily: inter}}>
								<div style={{fontWeight: 700, fontSize: 72, letterSpacing: '-0.035em', color: D.text, lineHeight: 1.05}}>{m.title}</div>
								<div style={{fontWeight: 400, fontSize: 34, color: D.dim, marginTop: 8}}>{m.sub}</div>
							</div>
							<div style={{marginLeft: 20, padding: '10px 20px', borderRadius: 10, background: D.green, color: D.ink, fontFamily: inter, fontWeight: 800, fontSize: 24, opacity: prog(t, ats[i] + 0.45, 0.4), transform: `scale(${prog(t, ats[i] + 0.45, 0.5, BACK)})`}}>DETECTED</div>
						</div>
					);
				})}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ── S7 · what recruiters see (light) ──────────────────────────────────────────────────────────────

const EVIDENCE: [string, string, string][] = [
	['tab', 'tab', 'Tab-switch warnings'],
	['blocked', 'paste', 'Blocked pastes'],
	['proxy', 'proxy', 'Proxy flags'],
	['second', 'device', 'Second-device alerts'],
	['browser', 'agent', 'Browser-agent alerts'],
	['prompt', 'ext', 'Prompt extensions'],
	['video', 'video', 'Video Q&A insights'],
];
const S7Report: React.FC<SP> = ({t, q}) => {
	const W = (w: string, k = 0) => q.W('s7', w, k);
	const tSee = W('see');
	const tOne = W('one') - 0.35;
	const head = prog(t, tSee - 0.3, 0.6);
	const rep = prog(t, tOne + 0.2, 0.9, EXPO);
	const score = prog(t, tOne + 0.6, 1.4, Easing.bezier(0.2, 0.7, 0.2, 1));
	return (
		<AbsoluteFill>
			<Light t={t} s={0.55} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 420}}>
				<Kinetic t={t} text="Every attempt leaves evidence." times={[W('every'), W('attempt'), W('leaves'), W('evidence')]} size={116} color={D.ink} accent={['evidence.']} weight={700} out={tSee - 0.45} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 112, textAlign: 'center', fontFamily: inter, fontWeight: 700, fontSize: 22, letterSpacing: '0.3em', paddingLeft: '0.3em', color: '#6B7079', opacity: head}}>WHAT RECRUITERS SEE</div>
			{/* each card travels straight to its own slot as it is named (no stacking) */}
			{EVIDENCE.map(([cue, icon, label], i) => {
				const at = W(cue);
				const p = prog(t, at - 0.25, 0.85, EXPO);
				if (p <= 0) return null;
				const left = i < 4;
				const row = left ? i : i - 4;
				const slot = {x: left ? 60 : 1400, y: left ? 190 + row * 200 : 290 + row * 200, w: 460, h: 160};
				const from = {x: 960 - slot.w / 2, y: 1150};
				return (
					<div key={label} style={{position: 'absolute', left: mix(from.x, slot.x, p), top: mix(from.y, slot.y, p), width: slot.w, height: slot.h, borderRadius: 24, background: '#fff', boxShadow: '0 0 0 1px rgba(11,12,14,0.06), 0 30px 60px -34px rgba(11,12,14,0.5)', display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px', boxSizing: 'border-box', transform: `rotate(${(1 - p) * (left ? -8 : 8)}deg) scale(${mix(0.8, 1, p)})`, opacity: Math.min(1, p * 2)}}>
						<div style={{width: 68, height: 68, flexShrink: 0, borderRadius: 16, background: D.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<PixIcon k={icon} size={36} />
						</div>
						<div style={{fontFamily: inter, fontSize: 34, fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.025em', color: D.ink}}>{label}</div>
					</div>
				);
			})}
			{rep > 0 ? (
				<div style={{position: 'absolute', left: 580, top: 190, width: 780, borderRadius: 30, background: '#fff', boxShadow: '0 60px 110px -50px rgba(11,12,14,0.55)', padding: '42px 48px', boxSizing: 'border-box', opacity: Math.min(1, rep * 1.5), transform: `translateY(${(1 - rep) * 40}px) scale(${mix(0.94, 1, rep)})`, fontFamily: inter}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
						<div style={{width: 66, height: 66, borderRadius: '50%', background: D.ink, color: D.green, fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>RM</div>
						<div>
							<div style={{fontSize: 38, fontWeight: 700, letterSpacing: '-0.025em', color: D.ink}}>Ryan M.</div>
							<div style={{fontSize: 21, color: '#6B7079', marginTop: 2}}>Password Generator · 60 min</div>
						</div>
						<div style={{marginLeft: 'auto', fontSize: 64, fontWeight: 800, letterSpacing: '-0.04em', color: D.ink, lineHeight: 1}}>
							{(4.1 * score).toFixed(1)}
							<span style={{fontSize: 28, color: '#6B7079', fontWeight: 500}}> /10</span>
						</div>
					</div>
					<div style={{height: 1, background: C.line, margin: '30px 0 6px'}} />
					{(
						[
							['Tab switches', '1 warning', C.amber],
							['External paste', '1 blocked', C.red],
							['Identity check', 'Proxy flagged', C.red],
							['Video Q&A', 'Low understanding', C.red],
						] as [string, string, string][]
					).map(([l, v, col], i) => {
						const p = prog(t, tOne + 0.7 + i * 0.18, 0.5);
						return (
							<div key={l} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0', borderBottom: i < 3 ? `1px solid ${C.soft}` : undefined, opacity: p, transform: `translateY(${(1 - p) * 10}px)`}}>
								<span style={{width: 14, height: 14, borderRadius: 3, background: col}} />
								<span style={{fontSize: 28, fontWeight: 600, color: D.ink}}>{l}</span>
								<span style={{marginLeft: 'auto', fontSize: 26, fontWeight: 700, color: col}}>{v}</span>
							</div>
						);
					})}
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ── S8 · closing (dark): the wheel under the detection beam → lockup ───────────────────────────────

const S8Closing: React.FC<SP> = ({t, q, b}) => {
	const W = (w: string, k = 0) => q.W('s8', w, k);
	const tNot = W('not');
	const tVibe = W('vibe');
	const tHow = W('how');
	const end = q.P('s8').end;
	const build = prog(t, W('cheating') - 0.2, 1.1, Easing.linear);
	const beam = prog(t, tNot - 0.1, 0.5);
	const sweep = prog(t, tNot, 1.6, IN_OUT);
	const caught = Object.fromEntries(WHEEL.map((w, i) => [w.k, prog(sweep, i / 6, 0.2)]));
	const lit = Object.fromEntries(WHEEL.map((w, i) => [w.k, prog(sweep, i / 6, 0.15) * 0.8]));
	const partA = 1 - prog(t, tVibe - 0.45, 0.45, IN_OUT);
	const lock = prog(t, tVibe - 0.1, 1.0, EXPO);
	const swap = prog(t, tHow - 0.15, 0.7, IN_OUT);
	const settle = prog(t, end + 0.1, 1.0, IN_OUT);
	const tag = prog(t, end + 0.7, 0.8, EXPO);
	const cx = 820;
	const cy = 730;
	const R = 285;
	const sx = 1560;
	const sy = 420;
	const ang = mix(-150, 210, sweep);
	const target = {x: cx + Math.cos((ang * Math.PI) / 180) * R * 0.75, y: cy + Math.sin((ang * Math.PI) / 180) * R * 0.75};
	return (
		<AbsoluteFill>
			<Dark t={t} s={0.6} />
			{partA > 0 ? (
				<AbsoluteFill style={{opacity: partA}}>
					<div style={{position: 'absolute', left: 0, right: 0, top: 70}}>
						<Kinetic t={t} text="Cheating keeps evolving." times={[W('cheating'), W('keeps'), W('evolving')]} size={88} weight={700} />
						<Kinetic t={t} text="Not past our detection." times={[tNot, W('past'), W('our'), W('detection')]} size={88} color={D.green} weight={700} />
					</div>
					{beam > 0 ? (
						<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
							<defs>
								<linearGradient id="beam5" x1="1" y1="0" x2="0" y2="0">
									<stop offset="0" stopColor={D.green} stopOpacity={0.55} />
									<stop offset="1" stopColor={D.green} stopOpacity={0.04} />
								</linearGradient>
							</defs>
							<path d={`M ${sx} ${sy} L ${target.x - 120} ${target.y - 90} L ${target.x + 120} ${target.y + 90} Z`} fill="url(#beam5)" opacity={beam} />
							{Array.from({length: 7}, (_, k) => (
								<line key={k} x1={sx} y1={sy} x2={mix(target.x - 120, target.x + 120, k / 6)} y2={mix(target.y - 90, target.y + 90, k / 6)} stroke={D.green} strokeOpacity={0.35 * beam} strokeWidth={1.5} />
							))}
						</svg>
					) : null}
					<Wheel t={t} cx={cx} cy={cy} R={R} build={build} on={lit} caught={caught} expr={sweep > 0.5 ? 'o' : 'smirk'} />
					<div style={{position: 'absolute', left: sx - 60, top: sy - 60, opacity: beam, transform: `scale(${mix(0.6, 1, prog(t, tNot - 0.2, 0.6, BACK))}) rotate(${(1 - beam) * -60}deg)`, filter: 'drop-shadow(0 0 26px rgba(0,215,107,0.8))'}}>
						<Star h={120} />
					</div>
				</AbsoluteFill>
			) : null}
			{lock > 0 ? (
				<>
					<div style={{position: 'absolute', left: 0, right: 0, top: mix(150, 330, settle), display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(1, lock * 1.5)}}>
						<div style={{transform: `scale(${mix(0.7, 1, settle)})`, filter: lock < 0.98 ? `blur(${(1 - lock) * 10}px)` : undefined}}>
							<Logo h={110} />
						</div>
						<div style={{fontFamily: inter, fontWeight: 300, fontSize: mix(48, 60, settle), letterSpacing: '0.02em', color: D.text, marginTop: 4, transform: 'translateX(3px)'}}>Screening</div>
						<div style={{marginTop: 64, fontFamily: inter, fontWeight: 700, fontSize: 54, letterSpacing: '-0.035em', color: D.text, opacity: tag, transform: `translateY(${(1 - tag) * 16}px)`}}>
							Every action leaves a <span style={{color: D.green}}>signal.</span>
						</div>
					</div>
					<div style={{position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', fontFamily: inter, fontWeight: 700, fontSize: 96, letterSpacing: '-0.04em', color: D.text, opacity: 1 - prog(t, end - 0.15, 0.45, IN_OUT)}}>
						<Kinetic t={t} text="It's not just what they" times={[W('it'), W('not', 1), W('just'), W('what'), W('candidates')]} size={88} color={D.dim} weight={400} />
						<div style={{position: 'relative', height: 128, overflow: 'hidden'}}>
							<div style={{position: 'absolute', left: 0, right: 0, transform: `translateY(${-swap * 110}%)`, opacity: prog(t, W('submit') - 0.1, 0.5)}}>submit.</div>
							<div style={{position: 'absolute', left: 0, right: 0, transform: `translateY(${(1 - swap) * 110}%)`, color: D.green}}>it's how they get there.</div>
						</div>
					</div>
				</>
			) : null}
			<AbsoluteFill style={{background: D.bg, opacity: prog(t, b - 0.8, 0.8, Easing.linear)}} />
		</AbsoluteFill>
	);
};

// ── NEW opening (context) and NEW closing (pitch) — stitched around the existing film ─────────────────

/** Small tracked label + a short headline; words rise on the VO, the block lifts away at `out`. */
const Beat: React.FC<{t: number; label?: string; labelAt?: number; lines: {text: string; times: number[]; accent?: string[]; color?: string}[]; size: number; top: number; out: number}> = ({t, label, labelAt, lines, size, top, out}) => {
	const o = prog(t, out, 0.35, IN_OUT);
	if (o >= 1) return null;
	const first = lines[0].times[0];
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top, opacity: 1 - o, transform: `translateY(${-o * 40}px)`}}>
			{label ? <div style={{textAlign: 'center', fontFamily: inter, fontWeight: 700, fontSize: 22, letterSpacing: '0.34em', paddingLeft: '0.34em', color: D.green, marginBottom: 18, opacity: prog(t, (labelAt ?? first) - 0.35, 0.4)}}>{label}</div> : null}
			{lines.map((l, i) => (
				<Kinetic key={i} t={t} text={l.text} times={l.times} size={size} weight={700} accent={l.accent} color={l.color} />
			))}
		</div>
	);
};
const DarkChip: React.FC<{text: string; p: number; tone?: 'green' | 'red'; style?: React.CSSProperties}> = ({text, p, tone = 'green', style}) =>
	p > 0.01 ? (
		<div style={{display: 'inline-flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderRadius: 14, background: D.panel, boxShadow: `0 0 0 1.5px ${tone === 'green' ? D.green : D.red}`, fontFamily: inter, fontWeight: 600, fontSize: 28, color: D.text, whiteSpace: 'nowrap', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 18}px) scale(${mix(0.88, 1, p)})`, ...style}}>
			<span style={{width: 30, height: 30, borderRadius: 8, background: tone === 'green' ? D.green : D.red, color: D.ink, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18}}>{tone === 'green' ? '✓' : '✕'}</span>
			{text}
		</div>
	) : null;
const Reticle: React.FC<{x: number; y: number; r: number; color: string; o: number}> = ({x, y, r, color, o}) =>
	o > 0.01 ? (
		<svg width={r * 2 + 40} height={r * 2 + 40} style={{position: 'absolute', left: x - r - 20, top: y - r - 20, opacity: o, overflow: 'visible'}}>
			<circle cx={r + 20} cy={r + 20} r={r} fill="none" stroke={color} strokeWidth={4} />
			<circle cx={r + 20} cy={r + 20} r={5} fill={color} />
			{[0, 90, 180, 270].map((a) => (
				<line key={a} x1={r + 20 + Math.cos((a * Math.PI) / 180) * (r - 12)} y1={r + 20 + Math.sin((a * Math.PI) / 180) * (r - 12)} x2={r + 20 + Math.cos((a * Math.PI) / 180) * (r + 16)} y2={r + 20 + Math.sin((a * Math.PI) / 180) * (r + 16)} stroke={color} strokeWidth={4} strokeLinecap="round" />
			))}
		</svg>
	) : null;
const Padlock: React.FC<{x: number; y: number; s: number; o: number}> = ({x, y, s, o}) =>
	o > 0.01 ? (
		<svg viewBox="0 0 40 48" width={40 * s} height={48 * s} style={{position: 'absolute', left: x - 20 * s, top: y - 24 * s, opacity: o, overflow: 'visible'}}>
			<path d="M10 22 V14 a10 10 0 0 1 20 0 V22" fill="none" stroke={D.red} strokeWidth={5} />
			<rect x={4} y={20} width={32} height={26} rx={6} fill={D.red} />
			<rect x={18} y={28} width={4} height={10} rx={2} fill={D.ink} />
		</svg>
	) : null;

const OpeningNew: React.FC<SP> = ({t, q, a, b}) => {
	const W = (id: string, w: string, k = 0) => q.W(id, w, k);
	const o2 = q.P('o2').start;
	const o3 = q.P('o3').start;
	const words = (id: string, ws: string[]) => ws.map((w) => W(id, w));
	// beat 1 — the problem: Ryan with the six cheats circling him
	const b1 = 1 - prog(t, o2 - 0.35, 0.35, IN_OUT);
	const ICONS = ['tab', 'ai', 'proxy', 'device', 'agent', 'ext'];
	// beats 2–3 — the honest candidate: lockdown closes in, then breaks; the check moves to the work
	const b2 = prog(t, o2 - 0.2, 0.6, EXPO);
	const shift = prog(t, o3 - 0.1, 0.8, IN_OUT);
	const CELL = 17;
	const AW = 16 * CELL;
	const ax = mix(960 - AW / 2, 560 - AW / 2, shift);
	const ay = 540;
	const K = AW / 200;
	const eye = {x: ax + 100 * K, y: ay + 97 * K};
	const reticleIn = prog(t, W('o2', 'candidates') - 0.1, 0.5, BACK);
	const frameIn = prog(t, W('o2', 'face') - 0.1, 0.7, EXPO);
	const lockIn = prog(t, W('o2', 'lockdowns') - 0.05, 0.5, BACK);
	const tBreak = W('o3', 'prioritizes') - 0.1;
	const broke = prog(t, tBreak, 0.4, IN_OUT);
	const tCheck = W('o3', 'checks') - 0.15;
	const move = prog(t, tCheck, 0.7, IN_OUT);
	const card = {x: 1180, y: 560, w: 470, h: 280};
	const verified = prog(t, tCheck + 0.6, 0.5, BACK);
	const box = {x: ax - 40, y: ay - 40, w: AW + 80, h: 20 * CELL + 50};
	const fr = {x: mix(40, box.x, frameIn), y: mix(40, box.y, frameIn), w: mix(1840, box.w, frameIn), h: mix(1000, box.h, frameIn)};
	const rx = mix(eye.x, card.x + card.w / 2, move);
	const ry = mix(eye.y, card.y + card.h / 2, move);
	return (
		<AbsoluteFill>
			<Dark t={t} s={0.6} />
			{/* beat 1 */}
			{b1 > 0 ? (
				<AbsoluteFill style={{opacity: b1}}>
					<Beat t={t} label="THE PROBLEM" lines={[{text: 'Cheating in hiring', times: words('o1', ['cheating', 'in', 'hiring'])}, {text: 'assessments has evolved.', times: words('o1', ['assessments', 'has', 'evolved']), accent: ['evolved.']}]} size={88} top={110} out={o2 - 0.35} />
					<Char x={960 - (16 * 16) / 2} y={560} cell={16} bust expr="smirk" look={Math.sin(t * 2) > 0.3 ? 1 : Math.sin(t * 2) < -0.3 ? -1 : 0} p={prog(t, a + 0.1, 0.7)} />
					{ICONS.map((k, i) => {
						const p = prog(t, W('o1', 'hiring') + i * 0.16, 0.6, BACK);
						if (p <= 0) return null;
						const ang = (i / 6) * Math.PI * 2 - Math.PI / 2 + t * 0.25;
						const x = 960 + Math.cos(ang) * 420;
						const y = 720 + Math.sin(ang) * 230;
						return (
							<div key={k} style={{position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, borderRadius: 24, background: D.panel, boxShadow: `0 0 0 1.5px ${D.line}, 0 20px 40px -20px rgba(0,0,0,0.8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: Math.min(1, p * 1.5), transform: `scale(${p})`}}>
								<PixIcon k={k} size={48} />
							</div>
						);
					})}
				</AbsoluteFill>
			) : null}
			{/* beats 2–3 */}
			{b2 > 0 ? (
				<AbsoluteFill style={{opacity: Math.min(1, b2 * 1.4)}}>
					<Beat t={t} label="THE GAP" lines={[{text: 'Honest candidates', times: words('o2', ['honest', 'candidates'])}, {text: "shouldn't face lockdowns.", times: words('o2', ['shouldn\'t', 'face', 'lockdowns']), accent: ['lockdowns.'], color: D.text}]} size={88} top={110} out={o3 - 0.35} />
					<Beat t={t} label="THE VIBELEVEL DIFFERENCE" labelAt={o3 + 0.1} lines={[{text: 'Check the work.', times: [W('o3', 'checks'), W('o3', 'the'), W('o3', 'work')], accent: ['work.']}, {text: 'Not where they look.', times: words('o3', ['not', 'where', 'they', 'look'])}]} size={88} top={110} out={b + 1} />
					<div style={{position: 'absolute', left: 0, right: 0, top: 1000 - 70, display: 'flex', justifyContent: 'center', gap: 18}}>
						<DarkChip text="Advanced detection" p={prog(t, W('o3', 'advanced') - 0.05, 0.5, BACK)} />
						<DarkChip text="Candidate experience first" p={prog(t, W('o3', 'candidate') - 0.05, 0.5, BACK)} />
					</div>
					<div style={{position: 'absolute', left: ax - 120, top: ay + 20 * CELL - 6, width: AW + 240, height: 10, borderRadius: 3, background: '#2A2D33'}} />
					<Char who="honest" x={ax} y={ay} cell={CELL} expr={broke > 0.5 ? 'smirk' : frameIn > 0.4 ? 'o' : 'flat'} look={move > 0.3 ? 1 : 0} p={b2} />
					{/* lockdown: the frame closes in, padlock, eye-tracking reticle — then it all breaks away */}
					{frameIn > 0 && broke < 1 ? (
						<div style={{position: 'absolute', left: fr.x, top: fr.y, width: fr.w, height: fr.h, borderRadius: 22, boxShadow: `inset 0 0 0 5px ${D.red}`, background: `rgba(255,90,78,${0.06 * frameIn})`, opacity: 1 - broke, transform: `scale(${1 + broke * 0.15})`}}>
							<div style={{position: 'absolute', left: 18, top: 14, fontFamily: inter, fontWeight: 700, fontSize: 20, letterSpacing: '0.16em', color: D.red, opacity: prog(frameIn, 0.7, 0.3)}}>FULL SCREEN · LOCKED</div>
						</div>
					) : null}
					<Shatter t={t} at={tBreak} x={box.x} y={box.y} w={box.w} h={box.h} />
					<Padlock x={ax + AW / 2} y={ay - 70} s={1.6 * lockIn} o={Math.min(1, lockIn * 1.5) * (1 - broke)} />
					<Reticle x={rx} y={ry} r={mix(46, 70, move)} color={move > 0.5 ? D.green : D.red} o={Math.min(1, reticleIn * 1.5)} />
					{/* the work */}
					{shift > 0 ? (
						<div style={{position: 'absolute', left: card.x, top: card.y, width: card.w, height: card.h, borderRadius: 22, background: '#fff', padding: '20px 24px', boxSizing: 'border-box', opacity: Math.min(1, shift * 1.5), transform: `translateX(${(1 - shift) * 60}px)`, boxShadow: verified > 0 ? `0 0 0 ${4 * verified}px ${D.green}, 0 0 60px -10px rgba(0,215,107,${0.6 * verified})` : '0 30px 60px -30px rgba(0,0,0,0.8)'}}>
							<div style={{fontFamily: inter, fontSize: 16, fontWeight: 700, letterSpacing: '0.16em', color: C.muted, marginBottom: 10}}>THE WORK · generator.js</div>
							<Code lines={CODE.slice(15, 22)} shown={900} size={14} lh={1.55} gutter={false} />
							{verified > 0 ? (
								<div style={{position: 'absolute', right: -22, top: -22, width: 64, height: 64, borderRadius: 18, background: D.green, color: D.ink, fontFamily: inter, fontWeight: 900, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${verified})`}}>✓</div>
							) : null}
						</div>
					) : null}
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};

const ClosingNew: React.FC<SP> = ({t, q, a, b}) => {
	const W = (id: string, w: string, k = 0) => q.W(id, w, k);
	const c2 = q.P('c2').start;
	const c3 = q.P('c3').start;
	const c4 = q.P('c4').start;
	const vis = (from: number, to: number) => prog(t, from - 0.25, 0.45) * (1 - prog(t, to - 0.3, 0.3, IN_OUT));
	const v1 = vis(a + 0.25, c2);
	const v2 = vis(c2, c3);
	const v3 = vis(c3, c4);
	const end = prog(t, c4 - 0.25, 0.9, EXPO);
	const sweep = prog(t, c2 + 0.1, 1.3, IN_OUT);
	const caught = Object.fromEntries(WHEEL.map((w, i) => [w.k, prog(sweep, i / 6, 0.2)]));
	const lit = Object.fromEntries(WHEEL.map((w, i) => [w.k, prog(sweep, i / 6, 0.15) * 0.8]));
	const cut = prog(t, W('c3', 'high') - 0.1, 0.5, IN_OUT);
	const cheap = prog(t, W('c3', 'tag'), 0.6, BACK);
	const CELL = 17;
	const AW = 16 * CELL;
	return (
		<AbsoluteFill>
			<Dark t={t} s={0.6} />
			{v1 > 0 ? (
				<AbsoluteFill style={{opacity: v1}}>
					<Beat t={t} lines={[{text: 'Better candidate experience.', times: [W('c1', 'better'), W('c1', 'candidate'), W('c1', 'experience')], accent: ['experience.']}]} size={96} top={150} out={1e9} />
					<div style={{position: 'absolute', left: 960 - AW / 2 - 120, top: 470 + 20 * CELL - 6, width: AW + 240, height: 10, borderRadius: 3, background: '#2A2D33'}} />
					<Char who="honest" x={960 - AW / 2} y={470} cell={CELL} expr="smirk" look={Math.sin(t * 1.5) > 0.4 ? 1 : 0} p={prog(t, a + 0.2, 0.6)} />
					<div style={{position: 'absolute', left: 230, top: 600}}>
						<DarkChip text="No lockdowns" p={prog(t, W('c1', 'candidate'), 0.5, BACK)} />
					</div>
					<div style={{position: 'absolute', right: 230, top: 600}}>
						<DarkChip text="No forced full screen" p={prog(t, W('c1', 'experience'), 0.5, BACK)} />
					</div>
				</AbsoluteFill>
			) : null}
			{v2 > 0 ? (
				<AbsoluteFill style={{opacity: v2}}>
					<Beat t={t} lines={[{text: 'Advanced detection.', times: [W('c2', 'advanced'), W('c2', 'detection')], accent: ['detection.']}]} size={96} top={110} out={1e9} />
					<Wheel t={t} cx={960} cy={650} R={300} build={prog(t, c2 - 0.25, 0.7, Easing.linear)} on={lit} caught={caught} expr={sweep > 0.5 ? 'o' : 'smirk'} />
				</AbsoluteFill>
			) : null}
			{v3 > 0 ? (
				<AbsoluteFill style={{opacity: v3}}>
					<Beat t={t} lines={[{text: 'Without the high price tag.', times: [W('c3', 'without'), W('c3', 'the'), W('c3', 'high'), W('c3', 'price'), W('c3', 'tag')], accent: ['tag.']}]} size={96} top={150} out={1e9} />
					<svg viewBox="0 0 520 260" width={520} height={260} style={{position: 'absolute', left: 960 - 260, top: 440, overflow: 'visible', transform: `rotate(${-6 + Math.sin(t * 2) * 1.5}deg) scale(${mix(0.85, 1, prog(t, c3 - 0.2, 0.6, BACK))})`}}>
						<path d="M70 10 H500 a10 10 0 0 1 10 10 V240 a10 10 0 0 1 -10 10 H70 L10 130 Z" fill={D.panel} stroke={D.green} strokeWidth={4} />
						<circle cx={70} cy={130} r={14} fill={D.bg} stroke={D.green} strokeWidth={4} />
					</svg>
					<div style={{position: 'absolute', left: 960 - 170, top: 495, width: 420, textAlign: 'center', fontFamily: inter, fontWeight: 800, fontSize: 110, letterSpacing: '-0.04em', transform: 'rotate(-6deg)'}}>
						<span style={{position: 'relative', color: cut > 0.5 ? D.dim : D.red, opacity: 1 - cheap * 0.6}}>
							$$$$
							<span style={{position: 'absolute', left: -10, right: -10, top: '52%', height: 8, borderRadius: 4, background: D.red, transform: `scaleX(${cut})`, transformOrigin: 'left center'}} />
						</span>
					</div>
					<div style={{position: 'absolute', left: 0, right: 0, top: 800, display: 'flex', justifyContent: 'center'}}>
						<DarkChip text="Lower costs" p={cheap} />
					</div>
				</AbsoluteFill>
			) : null}
			{end > 0 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(1, end * 1.5)}}>
					<div style={{filter: end < 0.98 ? `blur(${(1 - end) * 10}px)` : undefined, transform: `scale(${mix(0.94, 1, end)})`}}>
						<Logo h={120} />
					</div>
					<div style={{fontFamily: inter, fontWeight: 300, fontSize: 60, letterSpacing: '0.02em', color: D.text, marginTop: 4, transform: 'translateX(3px)'}}>Screening</div>
					<div style={{marginTop: 70}}>
						<Kinetic t={t} text="Screen smarter with VibeLevel." times={[W('c4', 'screen'), W('c4', 'smarter'), W('c4', 'with'), W('c4', 'vibe')]} size={72} accent={['smarter']} weight={700} />
					</div>
					<div style={{marginTop: 26, fontFamily: inter, fontWeight: 500, fontSize: 40, color: D.dim, opacity: prog(t, q.P('c4').end + 0.1, 0.6), transform: `translateY(${(1 - prog(t, q.P('c4').end + 0.1, 0.6)) * 12}px)`}}>vibelevel.ai</div>
				</div>
			) : null}
			<AbsoluteFill style={{background: '#000', opacity: prog(t, b - 0.8, 0.8, Easing.linear)}} />
		</AbsoluteFill>
	);
};

// ── film ───────────────────────────────────────────────────────────────────────────────────────────

export const VibeLevelCYG5: React.FC<Cyg5Props> = ({parts, cards, card, duration, segments, musicOffset}) => {
	const t = useCurrentFrame() / FPS;
	const q = useCues(parts);
	const c = (i: number) => cards[i] ?? 0;
	const opEnd = q.P('s1a').start - 2.2; // new opening → wipe → logo reveal
	const cs = q.P('c1').start - 0.8; // existing closing → wipe → new closing
	const s1b = q.P('s1b').start - 0.3;
	const s1c = q.P('s1c').start - 0.25;
	const s2 = q.P('s2').start - 0.45;
	const s6b = q.P('s6b').start - 0.45;
	const s7 = q.P('s7').start - 0.5;
	const s8 = q.P('s8').start - 0.4;
	const scenes: [number, number, React.FC<SP>][] = [
		[0, opEnd, OpeningNew],
		[opEnd, s1b, S1Opening],
		[s1b, s1c, S1Cheats],
		[s1c, s2, S1Shortcuts],
		[s2, c(0), S2Assessment],
		[c(0) + card - 0.3, c(1) + 0.25, S3Attempt1],
		[c(1) + card - 0.3, c(2) + 0.25, S4Attempt2],
		[c(2) + card - 0.3, c(3) + 0.25, S5Proxy],
		[c(3) + card - 0.3, s6b, S6Interview],
		[s6b, s7, S6bSignals],
		[s7, s8, S7Report],
		[s8, cs, S8Closing],
		[cs, duration, ClosingNew],
	];
	const W3 = (w: string) => q.W('s3', w);
	const W4 = (w: string) => q.W('s4', w);
	const W5 = (w: string) => q.W('s5', w);
	const inA = (i: number) => t > c(i) + card - 0.1 && t < c(i + 1);
	const trayItems: [SigKey, number][] = inA(0) ? [['tab', W3('warning') + 0.4]] : inA(1) ? [['paste', W4('workspace') + 0.6]] : inA(2) ? [['proxy', W5('flagged') + 0.35]] : [];
	const onCard = cards.some((x) => t > x - 0.3 && t < x + card + 0.05);
	const cornerO = prog(t, q.W('s1a', 'today') + 0.2, 0.2) * (onCard ? 0 : 1) * (1 - prog(t, s8 + 0.2, 0.4));
	return (
		<AbsoluteFill style={{background: D.bg, fontFamily: inter}}>
			{scenes.map(([a, b, S], i) => (t >= a - 0.02 && t < b + 0.02 ? <S key={i} t={t} q={q} a={a} b={b} /> : null))}
			{cards.map((a, i) => (
				<ChapterCard key={i} t={t} a={a} d={card} i={i} />
			))}
			<Tray t={t} items={trayItems} />
			{[opEnd, c(0), s7, s8, cs].map((a, i) => (
				<Wipe key={`w${i}`} t={t} at={a} />
			))}
			<Corner o={cornerO} />
			<Sound q={q} cards={cards} duration={duration} segments={segments} musicOffset={musicOffset} />
		</AbsoluteFill>
	);
};

// ── sound ──────────────────────────────────────────────────────────────────────────────────────────

const Sound: React.FC<{q: Q; cards: number[]; duration: number; segments: {s: number; e: number}[]; musicOffset: number}> = ({q, cards, duration, segments, musicOffset}) => {
	const speech = (t: number) => Math.max(0, ...segments.map((g) => prog(t, g.s - 0.25, 0.25, Easing.linear) * (1 - prog(t, g.e, 0.4, Easing.linear))));
	const vol = (f: number) => {
		const t = f / FPS;
		const card = cards.some((c) => t > c && t < c + 2.3) ? 1 : 0;
		const base = mix(0.13, 0.055, speech(t));
		return (base + card * 0.03) * prog(t, 0, 0.8, Easing.linear) * (1 - prog(t, duration - 2.5, 2.5, Easing.linear));
	};
	const W = q.W;
	const fx: [number, string, number][] = [
		[q.P('s1a').start - 2.05, 'logo-reveal', 0.2],
		[W('o1', 'hiring') - 0.05, 'build', 0.12],
		[W('o2', 'face') - 0.1, 'whoosh', 0.12],
		[W('o2', 'lockdowns') - 0.05, 'denied', 0.16],
		[W('o3', 'prioritizes') - 0.1, 'shatter', 0.14],
		[W('o3', 'checks') + 0.45, 'success', 0.16],
		...[q.P('s1a').start - 2.75, q.P('c1').start - 1.35].map((at): [number, string, number] => [at, 'pixels', 0.16]),
		[W('c2', 'advanced') - 0.1, 'swell', 0.1],
		[W('c3', 'high') - 0.1, 'shortcut', 0.18],
		[W('c4', 'screen') - 0.3, 'logo-reveal', 0.22],
		[W('s1b', 'these') - 0.1, 'build', 0.14],
		...['tab', 'outside', 'proxy', 'second', 'browser', 'prompt'].map((w): [number, string, number] => [W('s1b', w) - 0.08, 'pixel-1', 0.1]),
		[W('s1c', 'link') + 0.15, 'soft-click', 0.25],
		[W('s2', 'signs') + 0.35, 'soft-click', 0.22],
		[W('s2', 'ready') + 0.15, 'soft-click', 0.22],
		...cards.flatMap((c): [number, string, number][] => [
			[c + 0.05, 'build', 0.16],
			[c + 0.45, 'whoosh', 0.12],
		]),
		...[cards[0] - 0.5, q.P('s7').start - 1.0, q.P('s8').start - 0.9].map((at): [number, string, number] => [at, 'pixels', 0.16]),
		[W('s3', 'takes') - 0.1, 'shortcut', 0.28],
		[W('s3', 'screenshot') + 1.05, 'paste', 0.2],
		[W('s3', 'sends') - 0.05, 'tab', 0.14],
		[W('s3', 'catches'), 'soft-click', 0.25],
		[W('s3', 'warning') - 0.3, 'warn', 0.22],
		[W('s4', 'copies') + 0.4, 'shortcut', 0.28],
		[W('s4', 'paste') - 0.1, 'tab', 0.14],
		[W('s4', 'workspace') - 0.35, 'shortcut', 0.28],
		[W('s4', 'workspace') + 0.3, 'denied', 0.2],
		[W('s5', 'steps') - 0.1, 'whoosh', 0.1],
		[W('s5', 'friend') - 0.1, 'whoosh', 0.1],
		[W('s5', 'monitors') - 0.2, 'ui-tap', 0.2],
		[W('s5', 'snapshots') - 0.03, 'paste', 0.2],
		[W('s5', 'person') + 0.02, 'paste', 0.2],
		[W('s5', 'report') - 0.3, 'cardslide', 0.14],
		[W('s5', 'flagged') - 0.15, 'warn', 0.22],
		[q.P('a1').end + 0.15, 'tick', 0.2],
		...['second', 'browser', 'prompt'].map((w): [number, string, number] => [W('s6b', w) - 0.2, 'cardslide', 0.12]),
		...['tab', 'blocked', 'proxy', 'second', 'browser', 'prompt', 'video'].map((w): [number, string, number] => [W('s7', w) - 0.25, 'cardslide', 0.12]),
		[W('s8', 'not') - 0.1, 'swell', 0.12],
		[W('s8', 'vibe') - 0.1, 'logo-reveal', 0.22],
	];
	return (
		<>
			<Audio src={staticFile('cyg/music.mp3')} startFrom={Math.round(musicOffset * FPS)} volume={vol} />
			<Audio src={staticFile('cyg/narration5.wav')} />
			{fx.map(([at, n, v], i) => (
				<Sequence key={i} from={Math.max(0, Math.round(at * FPS))} durationInFrames={5 * FPS} layout="none">
					<Audio src={staticFile(`cyg/sfx/${n}.mp3`)} volume={(f) => v * interpolate(f, [120, 150], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
				</Sequence>
			))}
		</>
	);
};
