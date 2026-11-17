// Velora design kit: tokens, motion helpers and reusable pieces.
// Look follows the user's style reference (light Stripe-like UI): off-white canvas, white cards with deep soft
// shadows, navy type in Inter, indigo accent, warm orange → pink → violet gradient.
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import React from 'react';
import {Easing, interpolate} from 'remotion';

export const inter = loadInter('normal', {weights: ['300', '400', '500', '600', '700'], subsets: ['latin']}).fontFamily;

export const C = {
	bg: '#F6F9FC',
	white: '#FFFFFF',
	navy: '#0A2540',
	slate: '#425466',
	muted: '#8792A2',
	line: '#E3E8EE',
	soft: '#F0F3F8',
	indigo: '#635BFF',
	indigoSoft: '#EDEBFF',
	peach: '#FDE6DA',
	orange: '#F2733C',
	pink: '#F07DB4',
	violet: '#9E6CF0',
	green: '#1EA672',
	greenSoft: '#E3F6EE',
	skin: '#B9825C',
	hair: '#1E1B2B',
};
export const GRADIENT = 'linear-gradient(115deg, #FFB46A 0%, #FF8A6B 22%, #F47FB6 48%, #B77CF2 74%, #7C7BFF 100%)';
export const SHADOW = '0 50px 100px -20px rgba(50,50,93,0.20), 0 30px 60px -30px rgba(0,0,0,0.25)';
export const SHADOW_SM = '0 13px 27px -5px rgba(50,50,93,0.18), 0 8px 16px -8px rgba(0,0,0,0.2)';

// ─── motion ──────────────────────────────────────────────────────────────────
export const EASE = Easing.bezier(0.22, 1, 0.36, 1); // expo-like out: fast start, long settle
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const SPRINGY = Easing.bezier(0.34, 1.32, 0.64, 1); // restrained overshoot
export const prog = (t: number, from: number, dur: number, e: (x: number) => number = EASE) => interpolate(t, [from, from + dur], [0, 1], {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 0 → 1 in, then 1 → 0 out (window helper). */
export const life = (t: number, a: number, b: number, inDur = 0.6, outDur = 0.5) => prog(t, a, inDur) * (1 - prog(t, b - outDur, outDur, IN_OUT));

/** Indian digit grouping: 100000 → 1,00,000 */
export const inr = (n: number) => {
	const s = Math.round(n).toString();
	if (s.length <= 3) return s;
	const last3 = s.slice(-3);
	return s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
};

// ─── type ────────────────────────────────────────────────────────────────────
export const H: React.CSSProperties = {fontFamily: inter, fontWeight: 500, color: C.navy, letterSpacing: '-0.025em', lineHeight: 1.08};
export const BODY: React.CSSProperties = {fontFamily: inter, fontWeight: 400, color: C.slate, letterSpacing: '-0.005em'};
export const NUM: React.CSSProperties = {fontFamily: inter, fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"', letterSpacing: '-0.03em'};
export const GRAD_TEXT: React.CSSProperties = {backgroundImage: GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

/** Words rise through a mask, one by one (times = absolute start per word, or a stagger from `at`). */
export const Words: React.FC<{t: number; text: string; at: number; times?: number[]; stagger?: number; style?: React.CSSProperties; grad?: string[]; out?: number; dim?: number}> = ({t, text, at, times, stagger = 0.06, style, grad = [], out, dim = 0}) => {
	const words = text.split(' ');
	const o = out === undefined ? 0 : prog(t, out, 0.45, IN_OUT);
	return (
		<span style={{display: 'inline', opacity: (1 - o) * (1 - dim * 0.62), ...style}}>
			{words.map((w, i) => {
				const s = times?.[i] ?? at + i * stagger;
				const p = prog(t, s - 0.05, 0.7);
				const k = w.toLowerCase().replace(/[^a-z0-9₹]/g, '');
				return (
					<span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.08em', marginBottom: '-0.08em', marginRight: '0.24em'}}>
						<span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110 - o * 40}%)`, ...(grad.includes(k) ? GRAD_TEXT : {})}}>{w}</span>
					</span>
				);
			})}
		</span>
	);
};

/** White UI card with a soft lift-in (y, scale, blur). */
export const Card: React.FC<{t: number; at: number; out?: number; style?: React.CSSProperties; children?: React.ReactNode; from?: number; pad?: number; radius?: number}> = ({t, at, out, style, children, from = 60, pad = 36, radius = 18}) => {
	const p = prog(t, at, 0.9);
	const o = out === undefined ? 0 : prog(t, out, 0.5, IN_OUT);
	if (p <= 0 || o >= 1) return null;
	return (
		<div
			style={{
				position: 'absolute',
				background: C.white,
				borderRadius: radius,
				padding: pad,
				boxShadow: SHADOW,
				opacity: Math.min(1, p * 1.6) * (1 - o),
				transform: `translateY(${(1 - p) * from - o * 30}px) scale(${mix(0.96, 1, p) * mix(1, 0.97, o)})`,
				filter: p < 0.98 ? `blur(${(1 - p) * 8}px)` : undefined,
				...style,
			}}
		>
			{children}
		</div>
	);
};

/** Small uppercase label (eyebrow). */
export const Eyebrow: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = C.muted, style}) => (
	<div style={{fontFamily: inter, fontWeight: 600, fontSize: 17, letterSpacing: '0.08em', textTransform: 'uppercase', color, ...style}}>{children}</div>
);

/** Rolling rupee figure. */
export const Rupees: React.FC<{t: number; at: number; dur?: number; value: number; from?: number; style?: React.CSSProperties}> = ({t, at, dur = 1.1, value, from = 0, style}) => {
	const p = prog(t, at, dur, Easing.bezier(0.16, 1, 0.3, 1));
	return <span style={{...NUM, ...style}}>₹{inr(mix(from, value, p))}</span>;
};

export const Pill: React.FC<{children: React.ReactNode; bg?: string; color?: string; style?: React.CSSProperties}> = ({children, bg = C.greenSoft, color = C.green, style}) => (
	<span style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, background: bg, color, fontFamily: inter, fontWeight: 600, fontSize: 18, ...style}}>{children}</span>
);

/** Fine print for the brief's compliance qualifications. */
export const Footnote: React.FC<{t: number; at: number; out: number; children: React.ReactNode}> = ({t, at, out, children}) => {
	const o = life(t, at, out, 0.6, 0.4);
	if (o <= 0) return null;
	return <div style={{position: 'absolute', left: 120, bottom: 54, fontFamily: inter, fontSize: 17, color: C.muted, opacity: o}}>{children}</div>;
};

// ─── the gradient "aurora" band (from the style reference) ───────────────────
/** Full-frame soft gradient ribbon. `y` = band centre (px), `h` = thickness, `angle` in degrees; `x0`/`x1`
 *  fade the band in/out horizontally so it never shows a hard edge. */
export const Aurora: React.FC<{t: number; o: number; y?: number; h?: number; angle?: number; x0?: number; x1?: number}> = ({t, o, y = 760, h = 260, angle = -14, x0 = 0, x1 = 100}) => {
	if (o <= 0) return null;
	const drift = Math.sin(t * 0.35) * 18;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o, pointerEvents: 'none', WebkitMaskImage: `linear-gradient(90deg, transparent ${x0}%, #000 ${x0 + 22}%, #000 ${x1 - 18}%, transparent ${x1}%)`, maskImage: `linear-gradient(90deg, transparent ${x0}%, #000 ${x0 + 22}%, #000 ${x1 - 18}%, transparent ${x1}%)`}}>
			<div style={{position: 'absolute', left: -400, right: -400, top: y - h / 2 + drift, height: h, transform: `rotate(${angle}deg)`, transformOrigin: '50% 50%'}}>
				<div style={{position: 'absolute', inset: 0, background: GRADIENT, backgroundSize: '220% 100%', backgroundPosition: `${50 + Math.sin(t * 0.22) * 45}% 50%`, filter: 'blur(40px)', borderRadius: h}} />
				<div style={{position: 'absolute', left: `${35 + Math.sin(t * 0.4) * 12}%`, top: '-10%', width: '22%', height: '120%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,190,120,0.9), transparent)', filter: 'blur(30px)'}} />
				<div style={{position: 'absolute', left: `${58 + Math.cos(t * 0.33) * 10}%`, top: '-10%', width: '22%', height: '120%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(124,123,255,0.85), transparent)', filter: 'blur(30px)'}} />
			</div>
		</div>
	);
};

// ─── icons (1.75 px strokes, 24 px grid) ─────────────────────────────────────
const P: Record<string, React.ReactNode> = {
	briefcase: (
		<>
			<rect x="3" y="7" width="18" height="13" rx="2.5" />
			<path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 12.5h18" />
		</>
	),
	pin: (
		<>
			<path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21Z" />
			<circle cx="12" cy="9.5" r="2.5" />
		</>
	),
	home: <path d="M4 10.5 12 4l8 6.5V20H4v-9.5ZM9.5 20v-5.5h5V20" />,
	check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
	shield: (
		<>
			<path d="M12 3.5 19 6v5.5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-2.5Z" />
			<path d="m9 12 2.2 2.2L15.5 10" />
		</>
	),
	calendar: (
		<>
			<rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
			<path d="M3.5 10h17M8 3v4M16 3v4" />
		</>
	),
	wallet: (
		<>
			<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
			<rect x="4" y="7.5" width="16.5" height="12" rx="2.5" />
			<circle cx="16.5" cy="13.5" r="1.2" />
		</>
	),
	chat: <path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 17H10l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5Z" />,
	receipt: (
		<>
			<path d="M6 3.5h12V21l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3L6 21V3.5Z" />
			<path d="M9 8h6M9 11.5h6M9 15h3.5" />
		</>
	),
	user: (
		<>
			<circle cx="12" cy="8.5" r="3.8" />
			<path d="M4.5 20c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6" />
		</>
	),
	building: (
		<>
			<rect x="5" y="3.5" width="14" height="17" rx="1.5" />
			<path d="M9 7.5h1.5M13.5 7.5H15M9 11h1.5M13.5 11H15M9 14.5h1.5M13.5 14.5H15M10.5 20.5v-3h3v3" />
		</>
	),
	bank: <path d="M3.5 9 12 4l8.5 5M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3.5 20h17" />,
	repeat: <path d="M17 3.5 20 6.5l-3 3M4 11V9.5a3 3 0 0 1 3-3h13M7 20.5l-3-3 3-3M20 13v1.5a3 3 0 0 1-3 3H4" />,
	arrow: <path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5" />,
	key: (
		<>
			<circle cx="8" cy="15" r="4" />
			<path d="m11 12 8.5-8.5M16 7l2.5 2.5M14 9l2 2" />
		</>
	),
	clock: (
		<>
			<circle cx="12" cy="12" r="8.5" />
			<path d="M12 7.5V12l3 2" />
		</>
	),
	box: (
		<>
			<path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4v-9Z" />
			<path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" />
		</>
	),
	truck: (
		<>
			<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7" />
			<circle cx="6.5" cy="17" r="1.8" />
			<circle cx="17" cy="17" r="1.8" />
		</>
	),
	bolt: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />,
};
export const Icon: React.FC<{name: keyof typeof P | string; size?: number; color?: string; sw?: number}> = ({name, size = 28, color = C.navy, sw = 1.75}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', flexShrink: 0}}>
		{P[name]}
	</svg>
);
export const IconTile: React.FC<{name: string; bg?: string; color?: string; size?: number}> = ({name, bg = C.indigoSoft, color = C.indigo, size = 64}) => (
	<div style={{width: size, height: size, borderRadius: size * 0.26, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
		<Icon name={name} size={size * 0.5} color={color} />
	</div>
);

// ─── brand (Velora by default; the explainer can be re-branded, e.g. OnlyRent) ──
export type Brand = {name: string; mark: 'v' | 'o'};
export const BrandCtx = React.createContext<Brand>({name: 'Velora', mark: 'v'});
export const useBrand = () => React.useContext(BrandCtx);

// ─── Velora mark: rounded tile with a forward "V" (two strokes + arrow tip) ──
export const Mark: React.FC<{size: number; draw?: number; fill?: number}> = ({size, draw = 1, fill = 1}) => {
	const id = React.useId().replace(/:/g, '');
	const brand = useBrand();
	return (
		<svg width={size} height={size} viewBox="0 0 64 64" style={{display: 'block', overflow: 'visible'}}>
			<defs>
				<linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#FFB46A" />
					<stop offset="0.45" stopColor="#F47FB6" />
					<stop offset="1" stopColor="#7C7BFF" />
				</linearGradient>
			</defs>
			<rect x="2" y="2" width="60" height="60" rx="17" fill={`url(#g${id})`} opacity={fill} />
			<rect x="2" y="2" width="60" height="60" rx="17" fill="none" stroke={C.indigo} strokeWidth="2.5" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} opacity={1 - fill} />
			{brand.mark === 'o' ? (
				<>
					{/* OnlyRent: an "O" with the same forward arrow tip */}
					<circle cx="30" cy="34" r="12.5" fill="none" stroke={fill > 0.5 ? '#fff' : C.indigo} strokeWidth="6" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog(draw, 0.25, 0.75)} transform="rotate(-50 30 34)" />
					<path d="M38 18.5 L46.5 18 L46 26.5 M46.5 18 L39 25.5" fill="none" stroke={fill > 0.5 ? '#fff' : C.indigo} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" opacity={prog(draw, 0.85, 0.15)} />
				</>
			) : null}
			{brand.mark === 'v' ? <path d="M18 22 L30 44 L46 20" fill="none" stroke={fill > 0.5 ? '#fff' : C.indigo} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog(draw, 0.25, 0.75)} /> : null}
			{brand.mark === 'v' ? <path d="M39 19.5 L46 20 L46.5 27" fill="none" stroke={fill > 0.5 ? '#fff' : C.indigo} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity={prog(draw, 0.85, 0.15)} /> : null}
		</svg>
	);
};
export const Wordmark: React.FC<{t: number; at: number; size: number; color?: string}> = ({t, at, size, color = C.navy}) => (
	<div style={{display: 'flex', fontFamily: inter, fontWeight: 600, fontSize: size, letterSpacing: '-0.035em', color, lineHeight: 1}}>
		{useBrand().name.split('').map((ch, i) => {
			const p = prog(t, at + i * 0.05, 0.8);
			return (
				<span key={i} style={{display: 'inline-block', opacity: p, transform: `translateX(${(1 - p) * -0.25 * size}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 6}px)` : undefined}}>
					{ch}
				</span>
			);
		})}
	</div>
);

// ─── phone (white-framed device, as in the reference) ───────────────────────
export const Phone: React.FC<{w: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, style, children}) => {
	const h = w * 2.05;
	return (
		<div style={{position: 'absolute', width: w, height: h, borderRadius: w * 0.14, background: '#111', padding: w * 0.035, boxShadow: `${SHADOW}, inset 0 0 0 2px #2a2a2e`, ...style}}>
			<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.11, overflow: 'hidden', background: C.white}}>
				{children}
				<div style={{position: 'absolute', left: '50%', top: w * 0.03, width: w * 0.28, height: w * 0.08, marginLeft: -w * 0.14, borderRadius: 99, background: '#111'}} />
			</div>
		</div>
	);
};

/** Row used in money cards: label left, value right, hairline below. */
export const Row: React.FC<{label: React.ReactNode; value: React.ReactNode; strong?: boolean; style?: React.CSSProperties; size?: number}> = ({label, value, strong, style, size = 26}) => (
	<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: `1px solid ${C.line}`, fontFamily: inter, fontSize: size, ...style}}>
		<span style={{color: C.slate, fontWeight: strong ? 600 : 400}}>{label}</span>
		<span style={{...NUM, color: C.navy, fontWeight: strong ? 600 : 500}}>{value}</span>
	</div>
);
