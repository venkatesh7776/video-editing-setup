// SaaS landing-page redesign reel (9:16, 1080×1920) — reference: "Want to get your website re-designed? DM us!".
// v2 (user review): real voice (polished audios v2), per-sentence lip-sync, 70/30 split (UI on the blue-waves card on
// top, talking head below) for the problems, full-screen site + PiP for the solutions, full-screen before/after,
// clean stylus annotations, scroll to the demo video on "product demo video", tighter pacing, lighter captions.
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';

const inter = loadInter('normal', {weights: ['500', '600', '700'], subsets: ['latin']}).fontFamily;
const FPS = 30;
type Word = {w: string; s: number; e: number};
type Seg = {from: number; offset: number; n?: number};
type Chunk = {n0: number; o0: number; len?: number; rate?: number};
type Part = {id: string; start: number; end: number; duration: number; clip: string | null; offset: number; segs?: Seg[]; chunks?: Chunk[]; words: Word[]};
export type RedesignProps = {parts: Part[]; duration: number};
export const calculateRedesignMetadata: CalculateMetadataFunction<RedesignProps> = ({props}) => ({fps: FPS, durationInFrames: Math.max(1, Math.ceil(props.duration * FPS))});

const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
const prog = (t: number, a: number, d: number, e: (x: number) => number = EXPO) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
const RED = '#FF4747';
const GREEN = '#36E58A';
const TOP_H = 1344; // 70 %

const useCues = (parts: Part[]) => {
	const P = (id: string) => parts.find((p) => p.id === id)!;
	const W = (id: string, w: string, k = 0) => {
		const ws = P(id).words;
		const exact = ws.filter((x) => clean(x.w) === w);
		const hits = exact.length > k ? exact : ws.filter((x) => clean(x.w).startsWith(w));
		return (hits[k] ?? hits[hits.length - 1]).s;
	};
	return {P, W};
};

// ── talking head (piecewise lip-sync) ─────────────────────────────────────────────────────────────

const BRIGHT: Record<string, string> = {'1': 'brightness(1.5) contrast(1.04)', '2': 'brightness(1.14)', '3': 'brightness(1.14)', '4': 'brightness(1.14)'};
/** The talking head, lip-synced per voice chunk: reel t → take time (o0 + t − n0) → camera time (+ offset of that phrase). */
const Talk: React.FC<{p: Part; a: number; b: number; zoom?: number; focus?: string}> = ({p, a, b, zoom = 1, focus = '50% 35%'}) => {
	const t = useCurrentFrame() / FPS;
	const segs = (p.segs ?? []).filter((x) => (x.n ?? 2) >= 2);
	const offAt = (o: number) => {
		if (!segs.length) return p.offset;
		let off = segs[0].offset;
		for (const x of segs) if (x.from <= o + 0.05) off = x.offset;
		return off;
	};
	const chunks: Chunk[] = p.chunks && p.chunks.length ? p.chunks : [{n0: 0, o0: 0, len: p.duration}];
	const wins: [number, number, number, number][] = [];
	chunks.forEach((c, i) => {
		const r0 = p.start + c.n0;
		const r1 = i < chunks.length - 1 ? p.start + chunks[i + 1].n0 : Math.max(b, p.start + c.n0 + (c.len ?? 0));
		const s0 = Math.max(a, i === 0 ? a : r0);
		const s1 = Math.min(b, r1);
		const rate = c.rate ?? 1; // TTS phrase ↔ camera phrase: the camera plays at `rate` so the mouth lands with the words
		if (s1 > s0) wins.push([s0, s1, c.o0 + (s0 - r0) * rate + offAt(c.o0), rate]);
	});
	const z = zoom * mix(1, 1.035, prog(t, a, b - a, Easing.linear));
	return (
		<AbsoluteFill style={{overflow: 'hidden', background: '#060608'}}>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: focus, filter: BRIGHT[p.clip ?? '2']}}>
				{wins.map(([s0, s1, from, rate]) => (
					<Sequence key={s0} from={Math.round(s0 * FPS)} durationInFrames={Math.max(1, Math.round(s1 * FPS) - Math.round(s0 * FPS))} layout="none">
						<OffthreadVideo src={staticFile(`rd/talk${p.clip}.mp4`)} startFrom={Math.max(0, Math.round(from * FPS))} playbackRate={rate} muted style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus}} />
					</Sequence>
				))}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ── screen recordings (2880×1556): time-mapped + camera ───────────────────────────────────────────

type K2 = [number, number];
type Cam = [number, number, number, number];
const SRW = 2880;
const SRH = 1556;
const camAt = (t: number, keys: Cam[]): [number, number, number] => {
	if (t <= keys[0][0]) return [keys[0][1], keys[0][2], keys[0][3]];
	for (let i = 1; i < keys.length; i++)
		if (t < keys[i][0]) {
			const p = IN_OUT((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
			return [mix(keys[i - 1][1], keys[i][1], p), mix(keys[i - 1][2], keys[i][2], p), mix(keys[i - 1][3], keys[i][3], p)];
		}
	const l = keys[keys.length - 1];
	return [l[1], l[2], l[3]];
};
type MapFn = (fx: number, fy: number) => [number, number];
const Screen: React.FC<{src: string; keys: K2[]; cam: Cam[]; w: number; h: number; children?: (m: MapFn) => React.ReactNode}> = ({src, keys, cam, w, h, children}) => {
	const t = useCurrentFrame() / FPS;
	const [fx, fy, z] = camAt(t, cam);
	const s = Math.max(w / SRW, h / SRH) * z;
	const iw = SRW * s;
	const ih = SRH * s;
	const left = Math.min(0, Math.max(w - iw, w / 2 - fx * iw));
	const top = Math.min(0, Math.max(h - ih, h / 2 - fy * ih));
	const map: MapFn = (px, py) => [left + px * iw, top + py * ih];
	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#fff'}}>
			<div style={{position: 'absolute', left, top, width: iw, height: ih}}>
				{keys.slice(0, -1).map(([r0, s0], i) => {
					const [r1, s1] = keys[i + 1];
					const rate = Math.max(0.05, (s1 - s0) / Math.max(0.01, r1 - r0));
					return (
						<Sequence key={i} from={Math.round(r0 * FPS)} durationInFrames={Math.max(1, Math.round(r1 * FPS) - Math.round(r0 * FPS))} layout="none">
							<OffthreadVideo src={staticFile(`rd/${src}`)} startFrom={Math.round(s0 * FPS)} playbackRate={rate} muted style={{position: 'absolute', left: 0, top: 0, width: iw, height: ih}} />
						</Sequence>
					);
				})}
			</div>
			{children ? <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>{children(map)}</svg> : null}
		</div>
	);
};

// ── clean stylus annotations ──────────────────────────────────────────────────────────────────────

const Stroke: React.FC<{t: number; at: number; d?: number; path: string; color?: string; width?: number; out?: number}> = ({t, at, d = 0.55, path, color = RED, width = 3.5, out = 1e9}) => {
	const p = prog(t, at, d, Easing.bezier(0.5, 0, 0.3, 1));
	const o = 1 - prog(t, out, 0.25);
	if (p <= 0 || o <= 0) return null;
	return (
		<g opacity={o}>
			<path d={path} pathLength={1} fill="none" stroke={color} strokeWidth={width + 4} strokeOpacity={0.12} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - p} />
			<path d={path} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - p} />
		</g>
	);
};
const ring = (m: MapFn, x0: number, y0: number, x1: number, y1: number) => {
	const [ax, ay] = m(x0, y0);
	const [bx, by] = m(x1, y1);
	const cx = (ax + bx) / 2;
	const cy = (ay + by) / 2;
	const rx = (bx - ax) / 2 + 6;
	const ry = (by - ay) / 2 + 5;
	const pts: string[] = [];
	for (let i = 0; i <= 64; i++) {
		const a = -2.35 + (i / 64) * Math.PI * 2.12;
		const k = 1 + 0.025 * Math.sin(a * 2.3) + (i > 58 ? 0.03 : 0);
		pts.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)},${(cy + Math.sin(a) * ry * k - (i / 64) * 4).toFixed(1)}`);
	}
	return 'M ' + pts.join(' L ');
};
const line = (m: MapFn, x0: number, y0: number, x1: number, y1: number, bow = 6) => {
	const [ax, ay] = m(x0, y0);
	const [bx, by] = m(x1, y1);
	return `M ${ax} ${ay} Q ${(ax + bx) / 2} ${(ay + by) / 2 + bow} ${bx} ${by}`;
};
const crossAt = (m: MapFn, fx: number, fy: number, r = 34) => {
	const [x, y] = m(fx, fy);
	return `M ${x - r} ${y - r} L ${x + r} ${y + r} M ${x + r} ${y - r} L ${x - r} ${y + r}`;
};
const tickAt = (m: MapFn, fx: number, fy: number, r = 26) => {
	const [x, y] = m(fx, fy);
	return `M ${x - r} ${y} L ${x - r * 0.25} ${y + r * 0.75} L ${x + r} ${y - r * 0.85}`;
};

// ── frames ────────────────────────────────────────────────────────────────────────────────────────

const Waves: React.FC<{t: number}> = ({t}) => (
	<AbsoluteFill style={{overflow: 'hidden', background: '#020616'}}>
		<Img src={staticFile('rd/bluewaves.png')} style={{position: 'absolute', width: 1080, height: 1920, objectFit: 'cover', transform: `scale(${1.1 + 0.025 * Math.sin(t * 0.35)}) translate(${Math.sin(t * 0.25) * 14}px, ${Math.cos(t * 0.2) * 18}px)`}} />
		<AbsoluteFill style={{background: 'rgba(2,6,22,0.18)'}} />
	</AbsoluteFill>
);
const Frame: React.FC<{x: number; y: number; w: number; h: number; p?: number; children: React.ReactNode}> = ({x, y, w, h, p = 1, children}) => (
	<div style={{position: 'absolute', left: x, top: y, width: w, height: h, padding: 12, boxSizing: 'border-box', borderRadius: 18, background: '#131316', boxShadow: '0 50px 90px -30px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06)', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px) scale(${mix(0.95, 1, p)})`}}>
		<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden'}}>{children}</div>
	</div>
);

// ── captions ──────────────────────────────────────────────────────────────────────────────────────

const Caption: React.FC<{t: number; words: Word[]; y: number}> = ({t, words, y}) => {
	let i = -1;
	for (let k = 0; k < words.length; k++) if (t >= words[k].s - 0.04) i = k;
	if (i < 0) return null;
	const w = words[i];
	const next = words[i + 1];
	if (!next && t > w.e + 0.5) return null;
	if (next && t > w.e + 0.6 && t < next.s - 0.1) return null;
	const short = w.w.replace(/[^A-Za-z]/g, '').length <= 3 && next && next.s - w.s < 0.35;
	const text = short ? `${w.w} ${next.w}` : w.w;
	const p = prog(t, w.s - 0.04, 0.14, Easing.out(Easing.quad));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: y - 52, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
			<div style={{fontFamily: inter, fontWeight: 600, fontSize: 80, letterSpacing: '-0.035em', color: '#fff', textShadow: '0 4px 22px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.55)', transform: `scale(${mix(0.88, 1, p)})`, opacity: p, whiteSpace: 'nowrap'}}>{text}</div>
		</div>
	);
};

// ── film ──────────────────────────────────────────────────────────────────────────────────────────
// v4 (user review): TTS VO, hook = static "before" photo → after clip, hook held 0.5 s, full-width site (no frame) on
// toned-down waves, cursor instead of marks in the solutions, image before/after at the end, and the talking head
// morphs between full screen and the bottom-right rectangle at every hand-off.

const SW = 1080; // site: full width, recording aspect
const SH = Math.round((SW * SRH) / SRW);
const SY = 390; // a little lower (user)
const CAPY = 1200;
type Box = {x: number; y: number; w: number; h: number; r: number};
const FULL: Box = {x: 0, y: 0, w: 1080, h: 1920, r: 0};
const PIP: Box = {x: 1080 - 40 - 520, y: 1920 - 150 - 340, w: 520, h: 340, r: 26};
const lerpBox = (a: Box, b: Box, p: number): Box => ({x: mix(a.x, b.x, p), y: mix(a.y, b.y, p), w: mix(a.w, b.w, p), h: mix(a.h, b.h, p), r: mix(a.r, b.r, p)});

/** Pointer that glides between targets (screen fractions) and clicks on arrival. */
type Aim = [number, number, number]; // [arrive time, fx, fy]
const Cursor: React.FC<{t: number; m: MapFn; aims: Aim[]; from: number}> = ({t, m, aims, from}) => {
	const show = prog(t, from, 0.3);
	if (show <= 0) return null;
	let fx = aims[0][1];
	let fy = aims[0][2];
	let click = -1;
	for (let i = 1; i < aims.length; i++) {
		const [at, x, y] = aims[i];
		const mv = 0.55;
		const p = prog(t, at - mv, mv, IN_OUT);
		fx = mix(fx, x, p);
		fy = mix(fy, y, p);
		if (t >= at) click = at;
	}
	const [x, y] = m(fx, fy);
	const c = click >= 0 ? prog(t, click, 0.45, Easing.out(Easing.quad)) : 1;
	const press = click >= 0 ? 1 - 0.12 * Math.sin(Math.min(1, (t - click) / 0.18) * Math.PI) : 1;
	return (
		<g opacity={show}>
			{c < 1 ? <circle cx={x} cy={y} r={10 + 34 * c} fill="none" stroke="#7C5CFF" strokeWidth={3} opacity={0.75 * (1 - c)} /> : null}
			<g transform={`translate(${x} ${y}) scale(${1.45 * press})`}>
				<path d="M0 0 L0 24 L6.5 18 L10.8 27.4 L14.6 25.7 L10.4 16.6 L18.6 16.6 Z" fill="#111" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" style={{filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.45))'}} />
			</g>
		</g>
	);
};

export const RedesignReel: React.FC<RedesignProps> = ({parts, duration}) => {
	const t = useCurrentFrame() / FPS;
	const q = useCues(parts);
	const W = q.W;
	const p2 = q.P('02');
	const p3 = q.P('03');
	const p4 = q.P('04');
	const p5 = q.P('05');
	const words = parts.flatMap((p) => p.words);
	const cut2 = p2.start - 0.03;
	const cut3 = p3.start - 0.02;
	const cut4 = p4.start - 0.03;
	const cut5 = p5.start - 0.03;
	const t2 = W('03', 'second') - 0.25;
	const t3 = W('03', 'and', 1) - 0.15;
	const tFirst = W('04', 'first') - 0.06;
	const tNext = W('04', 'next') - 0.1;
	const tFinally = W('04', 'finally') - 0.1;
	const tBefore = W('05', 'this') - 0.1;
	const tAfter = W('05', 'this', 1) - 0.1;
	const tThats = W('05', "that's") - 0.12;
	const TR = 0.5; // full ⇄ rectangle morph

	// ── background layer ──
	let bg: React.ReactNode = null;
	let capY = CAPY;
	if (t < cut2) {
		const tm = W('01', 'modern');
		const swap = prog(t, tm - 0.25, 0.5, IN_OUT);
		bg = (
			<AbsoluteFill style={{background: '#000'}}>
				<AbsoluteFill style={{transform: `scale(${mix(1.0, 1.08, prog(t, 0, cut2, Easing.linear))})`}}>
					<Img src={staticFile('rd/hook-before.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
					<AbsoluteFill style={{opacity: swap}}>
						<Sequence from={Math.round((tm - 0.3) * FPS)} layout="none">
							<OffthreadVideo src={staticFile('rd/after.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
						</Sequence>
					</AbsoluteFill>
				</AbsoluteFill>
			</AbsoluteFill>
		);
		capY = 470;
	} else if (t < cut3) {
		bg = <AbsoluteFill style={{background: '#000'}} />;
	} else if (t < cut5) {
		const problems = t < cut4 + TR;
		const site = problems ? (
			<Screen
				src="old.mp4"
				keys={[
					[cut3, 0.3],
					[t2 - 0.3, 6.5],
					[t2 - 0.02, 17.4],
					[W('03', 'lengthy') - 0.1, 18.4],
					[W('03', 'difficult', 1) - 0.45, 18.6],
					[W('03', 'difficult', 1) + 0.1, 21.0],
					[t3 - 0.12, 21.2],
					[t3 + 0.3, 26.6],
					[cut4 + TR, 27.2],
				]}
				cam={[[cut3, 0.5, 0.5, 1]]}
				w={SW}
				h={SH}
			>
				{(m) => (
					<>
						<Stroke t={t} at={W('03', 'overloaded') + 0.05} path={ring(m, 0.025, 0.2, 0.5, 0.33)} out={t2 - 0.25} />
						<Stroke t={t} at={W('03', 'information') - 0.05} path={line(m, 0.03, 0.385, 0.5, 0.385)} out={t2 - 0.25} />
						<Stroke t={t} at={W('03', 'core') - 0.1} path={ring(m, 0.625, 0.14, 0.94, 0.77)} out={t2 - 0.25} />
						<Stroke t={t} at={W('03', 'difficult') - 0.05} path={crossAt(m, 0.785, 0.46, 22)} out={t2 - 0.25} />
						<Stroke t={t} at={W('03', 'lengthy')} path={line(m, 0.1, 0.165, 0.9, 0.165)} out={W('03', 'difficult', 1) - 0.5} />
						<Stroke t={t} at={W('03', 'sections')} path={ring(m, 0.06, 0.25, 0.46, 0.74)} out={W('03', 'difficult', 1) - 0.5} />
						<Stroke t={t} at={W('03', 'scan') - 0.05} path={ring(m, 0.035, 0.37, 0.475, 0.96)} out={t3 - 0.15} />
						<Stroke t={t} at={W('03', 'understand', 1) - 0.1} path={ring(m, 0.505, 0.37, 0.94, 0.96)} out={t3 - 0.15} />
						<Stroke t={t} at={W('03', 'features') - 0.05} path={ring(m, 0.04, 0.16, 0.46, 0.64)} />
						<Stroke t={t} at={W('03', 'structure') - 0.05} path={crossAt(m, 0.5, 0.42, 22)} />
						<Stroke t={t} at={W('03', 'separation') - 0.1} path={line(m, 0.05, 0.86, 0.7, 0.86, -6)} />
					</>
				)}
			</Screen>
		) : (
			<Screen
				src="new.mp4"
				keys={[
					[tFirst - TR, 0.8],
					[W('04', 'product') - 0.25, 3.4],
					[W('04', 'demo') - 0.05, 9.9],
					[tNext - 0.08, 11.2],
					[tNext + 0.2, 17.6],
					[W('04', 'three') - 0.2, 20.2],
					[tFinally - 0.08, 21.0],
					[tFinally + 0.25, 24.6],
					[W('04', 'vibelevel') - 0.15, 25.8],
					[cut5 + 0.4, 27.0],
				]}
				cam={[[tFirst, 0.5, 0.5, 1]]}
				w={SW}
				h={SH}
			>
				{(m) => (
					<Cursor
						t={t}
						m={m}
						from={tFirst}
						aims={[
							[tFirst, 0.82, 0.8],
							[W('04', 'clearer'), 0.56, 0.33],
							[W('04', 'demo') + 0.15, 0.5, 0.52],
							[W('04', 'three') - 0.05, 0.22, 0.4],
							[W('04', 'simple') - 0.05, 0.475, 0.4],
							[W('04', 'engaging') - 0.05, 0.735, 0.4],
							[W('04', 'vibelevel') + 0.05, 0.3, 0.235],
							[W('04', 'structured') - 0.05, 0.3, 0.6],
							[W('04', 'features', 1) - 0.05, 0.7, 0.75],
						]}
					/>
				)}
			</Screen>
		);
		const pIn = prog(t, cut3, 0.5);
		bg = (
			<AbsoluteFill>
				<Waves t={t} />
				<div style={{position: 'absolute', left: 0, top: SY, width: SW, height: SH, overflow: 'hidden', boxShadow: '0 40px 80px -30px rgba(0,0,0,0.8)', opacity: Math.min(1, pIn * 1.5), transform: `translateY(${(1 - pIn) * 40}px)`}}>{site}</div>
			</AbsoluteFill>
		);
		if (t >= cut4 && t < tFirst) capY = 1300;
	} else {
		// FINAL: the before image, then the after image wipes across it
		const IW = 1040;
		const pIn = prog(t, cut5, 0.6);
		const wipe = prog(t, tAfter - 0.05, 0.7, IN_OUT);
		const drift = (a: number) => -prog(t, a, 6, Easing.linear) * 70;
		const tag = (txt: string, on: number, green?: boolean) => (
			<div style={{position: 'absolute', left: 20, top: 18, padding: '10px 22px', borderRadius: 999, background: green ? GREEN : 'rgba(10,10,14,0.82)', color: green ? '#04210F' : '#fff', fontFamily: inter, fontWeight: 600, fontSize: 28, letterSpacing: '0.06em', opacity: on, transform: `scale(${mix(0.85, 1, on)})`, transformOrigin: 'left top'}}>{txt}</div>
		);
		const card = (src: string, aspect: number, a: number) => (
			<div style={{position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 20, background: '#fff'}}>
				<Img src={staticFile(src)} style={{position: 'absolute', left: 0, top: drift(a), width: IW, height: IW / aspect}} />
			</div>
		);
		const H = 1380;
		bg = (
			<AbsoluteFill>
				<Waves t={t} />
				<div style={{position: 'absolute', left: 20, top: 270, width: IW, height: H, borderRadius: 20, boxShadow: '0 50px 90px -30px rgba(0,0,0,0.85)', opacity: Math.min(1, pIn * 1.5), transform: `translateY(${(1 - pIn) * 40}px) scale(${mix(0.96, 1, pIn)})`}}>
					{card('rd/end-before.png', 890 / 1184, cut5)}
					{tag('BEFORE', prog(t, tBefore, 0.35) * (1 - wipe))}
					<div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0 round 20px)`}}>
						{card('rd/end-after.png', 830 / 1122, tAfter - 0.3)}
						{tag('AFTER', prog(t, tAfter + 0.3, 0.35), true)}
					</div>
					{wipe > 0 && wipe < 1 ? <div style={{position: 'absolute', top: -10, bottom: -10, left: wipe * IW - 2, width: 4, borderRadius: 2, background: '#fff', boxShadow: '0 0 24px 4px rgba(255,255,255,0.7)'}} /> : null}
				</div>
			</AbsoluteFill>
		);
		capY = 160;
	}

	// ── talking head: one box that morphs between full screen and the rectangle ──
	let talk: React.ReactNode = null;
	let box: Box = FULL;
	let tOpacity = 1;
	let zf = 1.12;
	let focus = '52% 36%';
	let tp: Part | null = null;
	let ta = 0;
	let tb = 0;
	if (t >= cut2 && t < cut3) {
		[tp, ta, tb, zf, focus] = [p2, cut2, cut3, 1.12, '55% 38%'];
	} else if (t >= cut3 && t < cut4) {
		box = lerpBox(FULL, PIP, prog(t, cut3, TR, IN_OUT));
		[tp, ta, tb, zf] = [p3, cut3, cut4, 1.3];
	} else if (t >= cut4 && t < cut5 + 0.4) {
		const k = t < tFirst ? 1 - prog(t, cut4, TR, IN_OUT) : prog(t, tFirst, TR, IN_OUT);
		box = lerpBox(FULL, PIP, k);
		[tp, ta, tb, zf] = [p4, cut4, cut5 + 0.4, 1.3];
		const out = prog(t, cut5 - 0.05, 0.35, IN_OUT);
		if (out > 0) {
			box = lerpBox(box, {x: PIP.x + PIP.w * 0.25, y: PIP.y + PIP.h * 0.6, w: PIP.w * 0.5, h: PIP.h * 0.5, r: 26}, out);
			tOpacity = 1 - out;
		}
	} else if (t >= tThats) {
		const fade = prog(t, duration - 0.6, 0.55, Easing.linear);
		const grow = W('05', 'into') - 0.45; // the after image stays up; you pop in as the rectangle, then expand
		const pop = prog(t, tThats, 0.35);
		box = lerpBox({x: PIP.x + PIP.w * 0.15, y: PIP.y + PIP.h * 0.3, w: PIP.w * 0.7, h: PIP.h * 0.7, r: 26}, PIP, pop);
		box = lerpBox(box, FULL, prog(t, grow, TR + 0.05, IN_OUT));
		tOpacity = Math.min(1, pop * 1.5);
		[tp, ta, tb, zf] = [p5, tThats, duration, 1.3];
		talk = <AbsoluteFill style={{background: `rgba(0,0,0,${fade})`}} />;
		capY = t < grow + 0.2 ? 160 : 1300;
	}
	if (tp && tp.clip) {
		const pipness = (FULL.w - box.w) / (FULL.w - PIP.w);
		if (t < cut3) capY = 1300;
		talk = (
			<>
				<div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: box.r, overflow: 'hidden', opacity: tOpacity, boxShadow: pipness > 0.02 ? `0 30px 60px -20px rgba(0,0,0,${0.85 * pipness}), 0 0 0 2px rgba(255,255,255,${0.14 * pipness})` : 'none'}}>
					<Talk p={tp} a={ta} b={tb} zoom={mix(zf, 1.4, pipness)} focus={pipness > 0.5 ? '52% 34%' : focus} />
				</div>
				{talk}
			</>
		);
	}
	const hookVol = (f: number) => 0.16 * prog(f / FPS, 0, 0.3, Easing.linear) * (1 - prog(f / FPS, cut3 - 0.1, 0.7, Easing.linear));
	const MUSIC_FROM = 24; // "Timeless" from 0:24
	const m0 = cut3 - 0.3;
	return (
		<AbsoluteFill style={{background: '#060608'}}>
			{bg}
			{talk}
			<Caption t={t} words={words} y={capY} />
			<Audio src={staticFile('rd/hook-music.wav')} volume={hookVol} />
			<Sequence from={Math.round(m0 * FPS)} layout="none">
				<Audio src={staticFile('rd/music.mp3')} startFrom={MUSIC_FROM * FPS} volume={(f) => 0.05 * prog(f / FPS, 0, 0.8, Easing.linear) * (1 - prog(f / FPS + m0, duration - 1.5, 1.5, Easing.linear))} />
			</Sequence>
			{parts.map((p) => (
				<Sequence key={p.id} from={Math.round(p.start * FPS)} layout="none">
					<Audio src={staticFile(`rd/vo${p.id}.wav`)} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
