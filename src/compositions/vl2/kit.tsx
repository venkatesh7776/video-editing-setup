// VibeLevel demo v2 design kit. Motion language after the HackerRank reference (charcoal grounds, light sans
// statements, green chips, tilted real product screens, light-grey report section, small captions) and the VibeLevel
// landing page (animated green pixel grid, serif-italic green accents). Brand green = logo green #00D76B.
import {loadFont as loadGeist} from '@remotion/google-fonts/Geist';
import {loadFont as loadLora} from '@remotion/google-fonts/Lora';
import React, {useLayoutEffect, useRef} from 'react';
import {Easing, Img, interpolate, staticFile} from 'remotion';

export const sans = loadGeist('normal', {weights: ['300', '400', '500', '600'], subsets: ['latin']}).fontFamily;
export const serif = loadLora('italic', {weights: ['400', '500'], subsets: ['latin']}).fontFamily;

export const K = {
	bg: '#0E0F12',
	bg2: '#15171B',
	panel: '#1C1E23',
	line: '#2A2D33',
	text: '#F2F3F5',
	dim: '#8E939D',
	green: '#00D76B',
	greenDeep: '#00A853',
	light: '#ECEDEF',
	ink: '#0B0C0E',
};

// ─── motion ──────────────────────────────────────────────────────────────────
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const prog = (t: number, from: number, dur: number, e: (x: number) => number = EASE) => interpolate(t, [from, from + dur], [0, 1], {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
export const life = (t: number, a: number, b: number, i = 0.6, o = 0.5) => prog(t, a, i) * (1 - prog(t, b - o, o, IN_OUT));
const hash = (x: number, y: number, z = 0) => {
	const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
	return s - Math.floor(s);
};

// ─── pixel grid (landing-page motif) ─────────────────────────────────────────
export type PixelMode =
	| {kind: 'ambient'; strength: number; light?: boolean} // edges dense, centre clear, gentle flicker
	| {kind: 'wipe'; p: number} // 0→1 covers the frame with pixels, 1→2 uncovers (cut hidden at 1)
	| {kind: 'gather'; p: number; box: [number, number, number, number]}; // pixels swarm into a box (logo build)

/** Canvas pixel field, deterministic per frame. */
export const Pixels: React.FC<{t: number; w: number; h: number; mode: PixelMode; cell?: number}> = ({t, w, h, mode, cell: cellIn}) => {
	const cell = cellIn ?? (mode.kind === 'ambient' ? 14 : 22);
	const ref = useRef<HTMLCanvasElement>(null);
	useLayoutEffect(() => {
		const cv = ref.current;
		if (!cv) return;
		const g = cv.getContext('2d')!;
		g.clearRect(0, 0, w, h);
		const cols = Math.ceil(w / cell);
		const rows = Math.ceil(h / cell);
		const tick = Math.floor(t * 7);
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				const n = hash(x, y);
				let a = 0;
				let col = K.green;
				let gap = 6;
				if (mode.kind === 'ambient') {
					// landing-page field: fine squares, dense only at the outer edges, slow twinkle
					const ex = Math.min(x / cols, 1 - x / cols) * 2; // 0 at the edges → 1 centre
					const edge = Math.pow(Math.max(0, 1 - ex * 2.2), 2.2);
					const fl = hash(x, y, Math.floor(t * 2.5 + n * 7));
					if (n < edge * 0.75) a = (0.18 + 0.5 * fl) * mode.strength;
					col = hash(x, y, 9) > 0.62 ? K.green : mode.light ? '#C9CEC8' : '#34383F';
					if (col === K.green) a *= mode.light ? 0.6 : 0.8;
					gap = 5;
				} else if (mode.kind === 'wipe') {
					gap = 0;
					const p = mode.p;
					const sweep = (x / cols) * 0.35; // sweeps left → right
					const on = p <= 1 ? n * 0.65 + sweep < p * 1.0 : n * 0.65 + sweep > (p - 1) * 1.0;
					if (on) {
						a = 1;
						col = hash(x, y, 3) > 0.94 ? K.green : hash(x, y, 4) > 0.5 ? K.panel : K.bg2;
					}
				} else {
					const [bx, by, bw, bh] = mode.box;
					const cx = x * cell + cell / 2;
					const cy = y * cell + cell / 2;
					const inside = cx > bx && cx < bx + bw && cy > by && cy < by + bh;
					const p = mode.p;
					if (inside) {
						const appear = n * 0.6;
						const fade = 0.7 + n * 0.3;
						a = p > appear ? 1 - Math.max(0, (p - fade) / (1 - fade + 1e-6)) : 0;
						col = hash(x, y, Math.floor(p * 8)) > 0.45 ? K.green : '#3A3E45';
						if (hash(x, y, 7) > 0.7) col = '#9EF5C4';
					} else {
						const d = Math.hypot(cx - (bx + bw / 2), cy - (by + bh / 2)) / 900;
						if (n > 0.86 && p > d && p < d + 0.5) a = 0.5;
						col = '#3A3E45';
					}
				}
				if (a <= 0.01) continue;
				g.globalAlpha = Math.min(1, a);
				g.fillStyle = col;
				g.fillRect(x * cell + gap / 2, y * cell + gap / 2, cell - gap, cell - gap);
			}
		}
	});
	return <canvas ref={ref} width={w} height={h} style={{position: 'absolute', left: 0, top: 0, width: w, height: h}} />;
};

// ─── type ────────────────────────────────────────────────────────────────────
/** Statement line in the reference's light sans; words drift up softly. `hl` words in green; `it` in serif italic. */
export const Line: React.FC<{t: number; text: string; at: number; times?: number[]; size?: number; hl?: string[]; it?: string[]; color?: string; weight?: number; out?: number; align?: 'center' | 'left'; stagger?: number}> = ({t, text, at, times, size = 64, hl = [], it = [], color = K.text, weight = 300, out, align = 'center', stagger = 0.07}) => {
	const o = out === undefined ? 1 : 1 - prog(t, out, 0.45, IN_OUT);
	return (
		<div style={{fontFamily: sans, fontWeight: weight, fontSize: size, lineHeight: 1.18, letterSpacing: '-0.02em', color, textAlign: align, opacity: o}}>
			{text.split(' ').map((w, i, arr) => {
				const s = times?.[i] ?? at + i * stagger;
				const p = prog(t, s - 0.08, 0.7);
				const k = w.toLowerCase().replace(/[^a-z0-9-]/g, '');
				const isIt = it.includes(k);
				return (
					<span key={i} style={{display: 'inline-block', marginRight: i < arr.length - 1 ? '0.26em' : 0, opacity: p, transform: `translateY(${(1 - p) * 0.35}em)`, filter: p < 0.98 ? `blur(${(1 - p) * 8}px)` : undefined, color: hl.includes(k) || isIt ? K.green : undefined, fontFamily: isIt ? serif : undefined, fontStyle: isIt ? 'italic' : undefined, fontWeight: isIt ? 400 : undefined, fontSize: isIt ? '1.08em' : undefined}}>
						{w}
					</span>
				);
			})}
		</div>
	);
};

/** Green label chip (reference "AI fluency" style). */
export const Chip: React.FC<{children: React.ReactNode; p?: number; size?: number; style?: React.CSSProperties; dark?: boolean}> = ({children, p = 1, size = 32, style, dark}) => (
	<div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: `${size * 0.32}px ${size * 0.62}px`, background: dark ? K.panel : K.green, color: dark ? K.text : K.ink, fontFamily: sans, fontWeight: 500, fontSize: size, letterSpacing: '-0.01em', borderRadius: 6, transform: `scale(${mix(0.85, 1, p)})`, opacity: Math.min(1, p * 1.6), whiteSpace: 'nowrap', ...style}}>
		{children}
	</div>
);

// ─── real product screens ────────────────────────────────────────────────────
export type Cam = {t: number; x: number; y: number; z: number}; // focal point (fractions of the image) + zoom
const camAt = (keys: Cam[], t: number): Omit<Cam, 't'> => {
	if (t <= keys[0].t) return keys[0];
	for (let i = 0; i < keys.length - 1; i++) {
		if (t <= keys[i + 1].t) {
			const p = IN_OUT((t - keys[i].t) / Math.max(0.001, keys[i + 1].t - keys[i].t));
			return {x: mix(keys[i].x, keys[i + 1].x, p), y: mix(keys[i].y, keys[i + 1].y, p), z: mix(keys[i].z, keys[i + 1].z, p)};
		}
	}
	return keys[keys.length - 1];
};

/** A real screenshot shown in a framed viewport with a camera (zoom/pan to focal points) and 3D tilt. */
export const Screen: React.FC<{t: number; src: string; iw: number; ih: number; w: number; h: number; cam: Cam[]; tilt?: [number, number]; style?: React.CSSProperties; light?: boolean; children?: React.ReactNode; radius?: number; fit?: 'cover' | 'contain'}> = ({t, src, iw, ih, w, h, cam, tilt = [0, 0], style, light, children, radius = 14, fit = 'cover'}) => {
	const c = camAt(cam, t);
	const base = fit === 'cover' ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
	const s = base * c.z;
	const tx = w / 2 - c.x * iw * s;
	const ty = h / 2 - c.y * ih * s;
	// keep the image covering the frame where it can; centre it on any axis where it is smaller
	const cx = iw * s <= w ? (w - iw * s) / 2 : Math.min(0, Math.max(w - iw * s, tx));
	const cy = ih * s <= h ? (h - ih * s) / 2 : Math.min(0, Math.max(h - ih * s, ty));
	return (
		<div style={{position: 'absolute', width: w, height: h, perspective: 2200, ...style}}>
			<div style={{position: 'absolute', inset: 0, borderRadius: radius, overflow: 'hidden', background: light ? '#fff' : K.panel, boxShadow: light ? '0 40px 80px -20px rgba(20,24,30,0.28), 0 0 0 1px rgba(0,0,0,0.06)' : '0 50px 100px -20px rgba(0,0,0,0.7), 0 0 0 1px #2A2D33', transform: `rotateX(${tilt[0]}deg) rotateY(${tilt[1]}deg)`}}>
				<Img src={staticFile(`vl2/img/${src}`)} style={{position: 'absolute', left: cx, top: cy, width: iw * s, height: ih * s}} />
				{children}
			</div>
		</div>
	);
};

/** macOS-like pointer with a click ripple at `click`. */
export const Cursor: React.FC<{t: number; x: number; y: number; at: number; click?: number; out?: number}> = ({t, x, y, at, click, out = 1e9}) => {
	const o = life(t, at, out, 0.3, 0.3);
	if (o <= 0) return null;
	const press = click !== undefined ? life(t, click, click + 0.25, 0.05, 0.15) : 0;
	const r = click !== undefined ? prog(t, click, 0.6) : 0;
	return (
		<div style={{position: 'absolute', left: x, top: y, opacity: o, pointerEvents: 'none'}}>
			{r > 0 && r < 1 ? <div style={{position: 'absolute', left: -34, top: -34, width: 68, height: 68, borderRadius: 34, border: `3px solid ${K.green}`, opacity: 1 - r, transform: `scale(${mix(0.3, 1.3, r)})`}} /> : null}
			<svg width="34" height="40" viewBox="0 0 17 20" style={{transform: `scale(${1 - press * 0.12})`, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))'}}>
				<path d="M1 1 L1 15 L4.6 11.6 L7 17.5 L9.6 16.4 L7.3 10.8 L12.4 10.8 Z" fill="#fff" stroke="#111" strokeWidth="1.1" strokeLinejoin="round" />
			</svg>
		</div>
	);
};

/** Bottom captions (reference: small, centred). */
export type W = {w: string; s: number; e: number};
export const Captions: React.FC<{t: number; words: W[]; light?: boolean}> = ({t, words, light}) => {
	const i = words.findIndex((w, k) => t >= w.s - 0.05 && (k === words.length - 1 || t < words[k + 1].s - 0.05));
	if (i < 0 || t > words[i].e + 0.6) return null;
	const chunks: number[][] = [];
	let cur: number[] = [];
	words.forEach((w, k) => {
		cur.push(k);
		if (cur.length >= 7 || /[.,?!]$/.test(w.w)) {
			chunks.push(cur);
			cur = [];
		}
	});
	if (cur.length) chunks.push(cur);
	const chunk = chunks.find((c) => c.includes(i)) ?? [i];
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 36, textAlign: 'center', fontFamily: sans, fontWeight: 400, fontSize: 30, letterSpacing: '-0.005em', color: light ? 'rgba(20,22,26,0.82)' : 'rgba(242,243,245,0.86)', textShadow: light ? 'none' : '0 2px 10px rgba(0,0,0,0.6)'}}>
			{chunk.map((k) => words[k].w).join(' ')}
		</div>
	);
};

export const Logo: React.FC<{h: number; p?: number; style?: React.CSSProperties}> = ({h, p = 1, style}) => (
	<Img src={staticFile('vl2/img/logo.png')} style={{height: h, width: (h * 4528) / 1076, opacity: p, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined, ...style}} />
);

/** A real screenshot framed by crop rectangles (fractions [x0, y0, x1, y1] of the image), animated between keys:
 *  the chosen region always fits entirely inside the frame — no information is cut off. Flat (no 3D tilt). */
export type Rect = [number, number, number, number];
export const RectScreen: React.FC<{t: number; src: string; iw: number; ih: number; w: number; h: number; keys: {t: number; r: Rect}[]; style?: React.CSSProperties; light?: boolean; pad?: number; hl?: Rect; hlAt?: number; push?: number}> = ({t, src, iw, ih, w, h, keys, style, light = true, pad = 28, hl, hlAt = 0, push = 0}) => {
	let r = keys[0].r;
	for (let i = 0; i < keys.length - 1; i++) {
		if (t >= keys[i].t) {
			const p = IN_OUT(Math.min(1, Math.max(0, (t - keys[i].t) / Math.max(0.001, keys[i + 1].t - keys[i].t))));
			r = keys[i].r.map((v, k) => mix(v, keys[i + 1].r[k], p)) as Rect;
		}
	}
	if (t >= keys[keys.length - 1].t) r = keys[keys.length - 1].r;
	const rw = (r[2] - r[0]) * iw;
	const rh = (r[3] - r[1]) * ih;
	const s = Math.min((w - pad * 2) / rw, (h - pad * 2) / rh);
	// the card hugs the chosen region, so nothing outside it (and no half-cut text) is ever visible
	const cw = rw * s + pad * 2;
	const ch = rh * s + pad * 2;
	return (
		<div style={{position: 'absolute', width: w, height: h, ...style}}>
			<div style={{position: 'absolute', left: (w - cw) / 2, top: (h - ch) / 2, width: cw, height: ch, transform: `scale(${1 + push})`, borderRadius: 16, overflow: 'hidden', background: light ? '#fff' : K.panel, boxShadow: light ? '0 40px 80px -24px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)' : '0 0 0 1px #2A2D33'}}>
				<div style={{position: 'absolute', inset: 0}}>
					<Img src={staticFile(`vl2/img/${src}`)} style={{position: 'absolute', left: pad - r[0] * iw * s, top: pad - r[1] * ih * s, width: iw * s, height: ih * s}} />
					{hl ? (
						<div style={{position: 'absolute', left: pad + (hl[0] - r[0]) * iw * s - 8, top: pad + (hl[1] - r[1]) * ih * s - 6, width: (hl[2] - hl[0]) * iw * s + 16, height: (hl[3] - hl[1]) * ih * s + 12, borderRadius: 10, boxShadow: `0 0 0 3px ${K.green}`, background: 'rgba(0,215,107,0.07)', opacity: prog(t, hlAt, 0.5)}} />
					) : null}
				</div>
			</div>
		</div>
	);
};
