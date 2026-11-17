// Shared pieces for the complete product film (pillars): cue lookup, product identities, title cards, browser window,
// notifications, step lists, desk + laptop, calendar. Same look as kit.tsx (user's style reference).
import React from 'react';
import {Easing} from 'remotion';
import {BODY, C, GRADIENT, H, Icon, IN_OUT, inter, life, Mark, mix, NUM, prog, SHADOW, SHADOW_SM, SPRINGY, Words} from './kit';

export type Part = {id: string; start: number; end: number; words: {w: string; s: number; e: number}[]};
export type Cue = {
	P: (id: string) => number;
	E: (id: string) => number;
	/** k-th occurrence of `word` (case/punctuation-insensitive; "rent*" = prefix) in part `id`. */
	W: (id: string, word: string, k?: number) => number;
};
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
export const makeCue = (parts: Part[]): Cue => {
	const by = Object.fromEntries(parts.map((p) => [p.id, p]));
	return {
		P: (id) => by[id]?.start ?? 0,
		E: (id) => by[id]?.end ?? 0,
		W: (id, word, k = 0) => {
			const p = by[id];
			if (!p) return 0;
			const pre = word.endsWith('*');
			const key = norm(word);
			const hits = p.words.filter((w) => (pre ? norm(w.w).startsWith(key) : norm(w.w) === key));
			return (hits[k] ?? hits[hits.length - 1] ?? p.words[0])?.s ?? p.start;
		},
	};
};
export type ChapterProps = {t: number; c: Cue};

// ─── product identities (accent per pillar, drawn from the reference gradient + green) ───
export const PRODUCTS = {
	flex: {name: 'Flex', accent: '#F2733C', soft: '#FDE6DA', icon: 'calendar', line: 'Rent financing, with more flexibility.'},
	pay: {name: 'Pay', accent: C.indigo, soft: C.indigoSoft, icon: 'repeat', line: 'Rent day, made simpler.'},
	hub: {name: 'Hub', accent: '#B356D9', soft: '#F5E8FB', icon: 'building', line: 'Your rental experience, connected.'},
	protect: {name: 'Protect', accent: C.green, soft: C.greenSoft, icon: 'shield', line: 'Explore protection for rental income.'},
} as const;
export type ProductKey = keyof typeof PRODUCTS;

/** Compact product lockup: mark + "Velora" + product name in its accent. */
export const Lockup: React.FC<{t: number; at: number; product: ProductKey; size?: number; style?: React.CSSProperties}> = ({t, at, product, size = 56, style}) => {
	const pr = PRODUCTS[product];
	const p = prog(t, at, 0.9);
	const n = prog(t, at + 0.35, 0.8);
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: size * 0.3, opacity: Math.min(1, p * 1.5), ...style}}>
			<div style={{transform: `scale(${mix(0.6, 1, prog(t, at, 0.8, SPRINGY))}) rotate(${(1 - p) * -20}deg)`}}>
				<Mark size={size * 1.15} />
			</div>
			<div style={{fontFamily: inter, fontWeight: 600, fontSize: size, letterSpacing: '-0.035em', color: C.navy, display: 'flex', gap: size * 0.25}}>
				<span>Velora</span>
				<span style={{color: pr.accent, display: 'inline-block', opacity: n, transform: `translateX(${(1 - n) * -size * 0.4}px)`, filter: n < 0.98 ? `blur(${(1 - n) * 6}px)` : undefined}}>{pr.name}</span>
			</div>
		</div>
	);
};

/** End-of-chapter title: lockup + one line, centred, with an accent rule. */
export const TitleCard: React.FC<{t: number; at: number; out: number; product: ProductKey}> = ({t, at, out, product}) => {
	const o = life(t, at, out, 0.7, 0.5);
	if (o <= 0) return null;
	const pr = PRODUCTS[product];
	const rule = prog(t, at + 0.4, 1.0, IN_OUT);
	return (
		<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: o, background: `rgba(246,249,252,${0.92 * o})`}}>
			<Lockup t={t} at={at} product={product} size={96} />
			<div style={{width: 520 * rule, height: 4, borderRadius: 2, background: `linear-gradient(90deg, transparent, ${pr.accent}, transparent)`, marginTop: 40}} />
			<div style={{...H, fontWeight: 400, fontSize: 46, marginTop: 34, color: C.slate}}>
				<Words t={t} text={pr.line} at={at + 0.6} />
			</div>
		</div>
	);
};

/** Top-left headline (screenshot heading style). */
export const Headline: React.FC<{t: number; at: number; out?: number; text: string; sub?: string; subAt?: number; grad?: string[]; size?: number; style?: React.CSSProperties}> = ({t, at, out, text, sub, subAt, grad, size = 58, style}) => {
	const o = out === undefined ? 1 : 1 - prog(t, out, 0.45, IN_OUT);
	if (t < at - 0.1 || o <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 120, top: 96, width: 1100, ...H, fontSize: size, opacity: o, ...style}}>
			<Words t={t} text={text} at={at} grad={grad} />
			{sub ? (
				<div style={{color: C.slate}}>
					<Words t={t} text={sub} at={subAt ?? at + 0.6} />
				</div>
			) : null}
		</div>
	);
};

/** Mac-style browser window like the reference ("roastery.com/checkout"). */
export const Browser: React.FC<{w: number; h: number; url: string; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, h, url, style, children}) => (
	<div style={{position: 'absolute', width: w, height: h, borderRadius: 16, background: C.white, boxShadow: SHADOW, overflow: 'hidden', ...style}}>
		<div style={{height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px', borderBottom: `1px solid ${C.line}`, background: '#FBFCFE'}}>
			{['#E3E8EE', '#E3E8EE', '#E3E8EE'].map((c, i) => (
				<div key={i} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
			))}
			<div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '8px 60px', borderRadius: 999, background: C.soft, fontFamily: inter, fontSize: 17, color: C.slate}}>
					<svg width="12" height="14" viewBox="0 0 12 14">
						<rect x="1" y="6" width="10" height="7.5" rx="1.5" fill={C.slate} />
						<path d="M3.5 6V4a2.5 2.5 0 0 1 5 0v2" fill="none" stroke={C.slate} strokeWidth="1.5" />
					</svg>
					{url}
				</div>
			</div>
			<div style={{width: 62}} />
		</div>
		<div style={{position: 'relative', height: h - 56}}>{children}</div>
	</div>
);

/** Push notification card. */
export const Toast: React.FC<{t: number; at: number; out?: number; icon?: string; title: string; body?: string; accent?: string; style?: React.CSSProperties; app?: string}> = ({t, at, out, icon = 'clock', title, body, accent = C.indigo, style, app = 'Velora'}) => {
	const p = prog(t, at, 0.7, SPRINGY);
	const o = out === undefined ? 0 : prog(t, out, 0.4, IN_OUT);
	if (p <= 0 || o >= 1) return null;
	return (
		<div style={{position: 'absolute', width: 520, padding: '18px 22px', borderRadius: 20, background: 'rgba(255,255,255,0.96)', boxShadow: SHADOW_SM, display: 'flex', gap: 16, alignItems: 'center', opacity: Math.min(1, p * 1.6) * (1 - o), transform: `translateY(${(1 - p) * -40 - o * 20}px) scale(${mix(0.94, 1, p)})`, ...style}}>
			<div style={{width: 52, height: 52, borderRadius: 14, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
				<Icon name={icon} size={28} color="#fff" />
			</div>
			<div style={{flex: 1, fontFamily: inter}}>
				<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 15, color: C.muted}}>
					<span>{app}</span>
					<span>now</span>
				</div>
				<div style={{fontWeight: 600, fontSize: 22, color: C.navy, marginTop: 2}}>{title}</div>
				{body ? <div style={{fontSize: 18, color: C.slate, marginTop: 2}}>{body}</div> : null}
			</div>
		</div>
	);
};

/** Vertical step list; `at[i]` = when step i becomes active. */
export const StepList: React.FC<{t: number; at: number[]; steps: string[]; accent: string; style?: React.CSSProperties; subs?: string[]; show?: number}> = ({t, at, steps, accent, style, subs = [], show = 1}) => {
	const active = at.filter((a) => t >= a - 0.15).length - 1;
	return (
		<div style={{position: 'absolute', opacity: show, ...style}}>
			{steps.map((s, i) => {
				const on = prog(t, at[i] - 0.15, 0.5);
				const appear = prog(t, at[0] - 0.6 + i * 0.12, 0.7);
				const isActive = i === active;
				return (
					<div key={s} style={{display: 'flex', gap: 24, alignItems: 'flex-start', opacity: appear * (i <= active ? 1 : 0.42), transform: `translateX(${(1 - appear) * -30}px)`, marginBottom: i < steps.length - 1 ? 18 : 0, position: 'relative'}}>
						<div style={{position: 'relative', width: 56, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
							<div style={{width: 56, height: 56, borderRadius: 28, background: on > 0.5 ? accent : C.white, border: `2px solid ${on > 0.5 ? accent : C.line}`, color: on > 0.5 ? '#fff' : C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: inter, fontWeight: 600, fontSize: 22, boxShadow: isActive ? `0 0 0 8px ${accent}22` : undefined}}>
								{i < active ? <Icon name="check" size={26} color="#fff" sw={2.6} /> : i + 1}
							</div>
							{i < steps.length - 1 ? (
								<div style={{width: 3, height: 74, background: C.line, marginTop: 6, borderRadius: 2, overflow: 'hidden'}}>
									<div style={{width: '100%', height: `${prog(t, at[i + 1] - 0.5, 0.45) * 100}%`, background: accent}} />
								</div>
							) : null}
						</div>
						<div style={{paddingTop: 10}}>
							<div style={{fontFamily: inter, fontWeight: isActive ? 600 : 500, fontSize: 30, color: C.navy, letterSpacing: '-0.02em'}}>{s}</div>
							{subs[i] ? <div style={{...BODY, fontSize: 21, marginTop: 6, maxWidth: 520, opacity: isActive ? 1 : 0.7}}>{subs[i]}</div> : null}
						</div>
					</div>
				);
			})}
		</div>
	);
};

/** Desk with an open laptop (front view); `open` 0 = closed. Placed so the desk top sits at `top`. */
export const Desk: React.FC<{left: number; top: number; w?: number; open?: number; screen?: React.ReactNode; keys?: boolean; laptopX?: number}> = ({left, top, w = 760, open = 1, screen, keys, laptopX}) => (
	<div style={{position: 'absolute', left, top, width: w, height: 1080 - top}}>
		{/* laptop */}
		<div style={{position: 'absolute', left: (laptopX ?? w / 2) - 170, bottom: '100%', width: 340, height: 230 * open + 12, transformOrigin: 'bottom center'}}>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 12, height: 230 * open, borderRadius: '12px 12px 0 0', background: '#1d2433', padding: 10, boxSizing: 'border-box', overflow: 'hidden'}}>
				<div style={{width: '100%', height: '100%', borderRadius: 6, background: C.white, overflow: 'hidden', position: 'relative'}}>{screen}</div>
			</div>
			<div style={{position: 'absolute', left: -24, right: -24, bottom: 0, height: 12, borderRadius: '0 0 10px 10px', background: '#C8D0DC'}} />
		</div>
		{keys ? (
			<div style={{position: 'absolute', left: w - 170, top: -22}}>
				<Icon name="key" size={34} color={C.slate} />
			</div>
		) : null}
		<div style={{position: 'absolute', left: 30, right: 30, top: 20, height: 150, borderRadius: '0 0 10px 10px', background: '#EDF1F7'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 26, borderRadius: 8, background: '#E2E8F1'}} />
		<div style={{position: 'absolute', left: 40, top: 26, width: 18, bottom: 0, background: '#D5DDE8'}} />
		<div style={{position: 'absolute', right: 40, top: 26, width: 18, bottom: 0, background: '#D5DDE8'}} />
	</div>
);

/** Month calendar card with highlighted days. */
export const Calendar: React.FC<{month: string; marks: Record<number, {color: string; label?: string}>; t: number; at: number; w?: number; startDay?: number; days?: number; markAt?: number}> = ({month, marks, t, at, w = 520, startDay = 2, days = 31, markAt}) => {
	const cell = (w - 48) / 7;
	return (
		<div style={{width: w, padding: 24, borderRadius: 18, background: C.white, boxShadow: SHADOW, fontFamily: inter}}>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14}}>
				<span style={{fontWeight: 600, fontSize: 26, color: C.navy}}>{month}</span>
				<Icon name="calendar" size={26} color={C.muted} />
			</div>
			<div style={{display: 'grid', gridTemplateColumns: `repeat(7, ${cell}px)`, rowGap: 6}}>
				{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
					<div key={i} style={{textAlign: 'center', fontSize: 15, color: C.muted, paddingBottom: 6}}>
						{d}
					</div>
				))}
				{Array.from({length: startDay}, (_, i) => (
					<div key={`b${i}`} />
				))}
				{Array.from({length: days}, (_, i) => {
					const d = i + 1;
					const m = marks[d];
					const p = m ? prog(t, (markAt ?? at) + Object.keys(marks).indexOf(String(d)) * 0.25, 0.5, SPRINGY) : 0;
					return (
						<div key={d} style={{height: cell * 0.82, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
							{m ? <div style={{position: 'absolute', width: cell * 0.78, height: cell * 0.78, borderRadius: '50%', background: m.color, transform: `scale(${p})`}} /> : null}
							<span style={{position: 'relative', ...NUM, fontSize: 19, fontWeight: m ? 600 : 400, color: m && p > 0.5 ? '#fff' : C.navy}}>{d}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

/** Labelled legend dot. */
export const Legend: React.FC<{color: string; label: string}> = ({color, label}) => (
	<span style={{display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: inter, fontSize: 20, color: C.slate}}>
		<span style={{width: 14, height: 14, borderRadius: 7, background: color}} /> {label}
	</span>
);

/** Screen-stack inside a phone: crossfades/slides between screens by time windows. */
export const Screens: React.FC<{t: number; list: [number, number, React.ReactNode][]}> = ({t, list}) => (
	<>
		{list.map(([a, b, node], i) => {
			const o = life(t, a, b, 0.45, 0.35);
			if (o <= 0) return null;
			const x = (1 - prog(t, a, 0.6)) * 60 - prog(t, b - 0.35, 0.35, IN_OUT) * 60;
			return (
				<div key={i} style={{position: 'absolute', inset: 0, opacity: o, transform: `translateX(${x}px)`}}>
					{node}
				</div>
			);
		})}
	</>
);

/** Phone app header used by all product screens. */
export const AppBar: React.FC<{product: ProductKey; title: string}> = ({product, title}) => {
	const pr = PRODUCTS[product];
	return (
		<div style={{padding: '72px 26px 0', fontFamily: inter}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
				<Mark size={30} />
				<span style={{fontWeight: 600, fontSize: 20, color: C.navy}}>
					Velora <span style={{color: pr.accent}}>{pr.name}</span>
				</span>
			</div>
			<div style={{fontWeight: 600, fontSize: 30, color: C.navy, marginTop: 18, letterSpacing: '-0.02em'}}>{title}</div>
		</div>
	);
};

export const Btn: React.FC<{label: string; color: string; press?: number; style?: React.CSSProperties; ghost?: boolean}> = ({label, color, press = 0, style, ghost}) => (
	<div style={{height: 58, borderRadius: 12, background: ghost ? 'transparent' : color, border: ghost ? `1.5px solid ${color}` : undefined, color: ghost ? color : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: inter, fontWeight: 600, fontSize: 20, transform: `scale(${1 - press * 0.04})`, boxShadow: press > 0 ? `0 0 0 ${press * 8}px ${color}33` : undefined, ...style}}>
		{label}
	</div>
);

/** Small "illustrative" tag used on mock UI. */
export const Illustrative: React.FC<{style?: React.CSSProperties}> = ({style}) => (
	<span style={{fontFamily: inter, fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, ...style}}>Illustrative</span>
);

/** A tap ripple at (x, y) px. */
export const Tap: React.FC<{t: number; at: number; x: number; y: number; color?: string}> = ({t, at, x, y, color = C.indigo}) => {
	const r = prog(t, at, 0.6, Easing.out(Easing.cubic));
	if (t < at - 0.3 || r >= 1) return null;
	const f = prog(t, at - 0.3, 0.3);
	return (
		<>
			<div style={{position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, background: 'rgba(10,37,64,0.18)', opacity: f * (1 - r), transform: `scale(${1 - 0.15 * Math.sin(Math.PI * r)})`}} />
			<div style={{position: 'absolute', left: x - 40, top: y - 40, width: 80, height: 80, borderRadius: 40, border: `3px solid ${color}`, opacity: (1 - r) * (t > at ? 1 : 0), transform: `scale(${mix(0.3, 1.2, r)})`}} />
		</>
	);
};

export {GRADIENT};
