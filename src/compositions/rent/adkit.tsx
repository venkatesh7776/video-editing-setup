// Rent ad campaign kit — same design system as the Velora film (src/compositions/velora/kit.tsx): Inter, navy type,
// indigo accent, orange→pink→violet gradient, white cards. Brand: "Rent" (user: ONERENT → Rent).
// Claims guardrails (scripts.md): financing is being explored through regulated lending partners; waitlist ≠ loan
// application; no invented rates/EMIs/approvals; conceptual UI labelled illustrative.
import React from 'react';
import {Easing} from 'remotion';
import type {Part} from '../velora/filmkit';
import {BODY, C, GRADIENT, H, Icon, IconTile, IN_OUT, inter, life, mix, NUM, prog, SHADOW, SHADOW_SM, SPRINGY, Words} from '../velora/kit';

/** Restrained blue → purple gradient for the product reveal (script: video 01 editor direction). */
export const BLUE_PURPLE = 'linear-gradient(115deg, #7C9BFF 0%, #7C7BFF 40%, #9E6CF0 75%, #B77CF2 100%)';

/** Rent mark: the same gradient tile as the Velora mark, with a forward "R". */
export const RMark: React.FC<{size: number; draw?: number; fill?: number}> = ({size, draw = 1, fill = 1}) => {
	const id = React.useId().replace(/:/g, '');
	const ink = fill > 0.5 ? '#fff' : C.indigo;
	return (
		<svg width={size} height={size} viewBox="0 0 64 64" style={{display: 'block', overflow: 'visible'}}>
			<defs>
				<linearGradient id={`r${id}`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#FFB46A" />
					<stop offset="0.45" stopColor="#F47FB6" />
					<stop offset="1" stopColor="#7C7BFF" />
				</linearGradient>
			</defs>
			<rect x="2" y="2" width="60" height="60" rx="17" fill={`url(#r${id})`} opacity={fill} />
			<rect x="2" y="2" width="60" height="60" rx="17" fill="none" stroke={C.indigo} strokeWidth="2.5" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} opacity={1 - fill} />
			<path d="M22 46 V18 H35 a10 10 0 0 1 0 20 H22" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog(draw, 0.2, 0.6)} />
			<path d="M33 38 L45 47" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" opacity={prog(draw, 0.75, 0.25)} />
		</svg>
	);
};

export const RWordmark: React.FC<{t: number; at: number; size: number; color?: string}> = ({t, at, size, color = C.navy}) => (
	<div style={{display: 'flex', fontFamily: inter, fontWeight: 600, fontSize: size, letterSpacing: '-0.035em', color, lineHeight: 1}}>
		{'Rent'.split('').map((ch, i) => {
			const p = prog(t, at + i * 0.06, 0.8);
			return (
				<span key={i} style={{display: 'inline-block', opacity: p, transform: `translateX(${(1 - p) * -0.25 * size}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 6}px)` : undefined}}>
					{ch}
				</span>
			);
		})}
	</div>
);

/** Logo lockup that draws itself (mark lines → fill → wordmark). */
export const RLockup: React.FC<{t: number; at: number; size: number; style?: React.CSSProperties}> = ({t, at, size, style}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: size * 0.28, ...style}}>
		<RMark size={size} draw={prog(t, at, 1.0, Easing.bezier(0.45, 0, 0.2, 1))} fill={prog(t, at + 0.75, 0.45)} />
		<RWordmark t={t} at={at + 0.25} size={size} />
	</div>
);

/** End card: logo, tagline, CTA button, disclaimer. Holds to the end (≥ 3 s, per the scripts). */
export const EndCard: React.FC<{t: number; at: number; vertical: boolean; cta: string; tagline?: string}> = ({t, at, vertical, cta, tagline = 'The Financial Layer of Renting.'}) => {
	const o = prog(t, at - 0.2, 0.6);
	if (o <= 0) return null;
	const s = vertical ? 1 : 1;
	const btn = prog(t, at + 0.9, 0.7, SPRINGY);
	const sheen = ((t - at - 1.6) * 0.5) % 1;
	return (
		<div style={{position: 'absolute', inset: 0, background: C.bg, opacity: o, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: vertical ? 160 : 40}}>
			<BlueAurora t={t} o={0.55} vertical={vertical} />
			<RLockup t={t} at={at} size={vertical ? 150 : 130} />
			<div style={{...H, fontWeight: 400, fontSize: vertical ? 48 : 44, color: C.slate, marginTop: vertical ? 40 : 34, textAlign: 'center', width: vertical ? 900 : 1200}}>
				<Words t={t} text={tagline} at={at + 0.5} />
			</div>
			<div style={{position: 'relative', overflow: 'hidden', marginTop: vertical ? 70 : 50, padding: vertical ? '34px 64px' : '28px 56px', borderRadius: 999, background: C.indigo, color: '#fff', fontFamily: inter, fontWeight: 600, fontSize: (vertical ? 46 : 36) * s, boxShadow: '0 24px 50px -12px rgba(99,91,255,0.55)', transform: `scale(${btn})`, display: 'flex', alignItems: 'center', gap: 18}}>
				{cta}
				<Icon name="arrow" size={vertical ? 40 : 32} color="#fff" sw={2.4} />
				{t > at + 1.6 ? <div style={{position: 'absolute', top: 0, bottom: 0, width: '30%', left: `${sheen * 160 - 40}%`, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)'}} /> : null}
			</div>
			<div style={{position: 'absolute', left: vertical ? 80 : 200, right: vertical ? 80 : 200, bottom: vertical ? 300 : 50, textAlign: 'center', fontFamily: inter, fontSize: vertical ? 22 : 17, lineHeight: 1.45, color: C.muted, opacity: prog(t, at + 1.2, 0.8)}}>
				Financing availability and eligibility will depend on the regulated lending partner and applicable terms. Waitlist registration is not a loan application or approval.
			</div>
		</div>
	);
};

export const BlueAurora: React.FC<{t: number; o: number; vertical?: boolean}> = ({t, o, vertical}) => (
	<div style={{position: 'absolute', inset: 0, opacity: o, pointerEvents: 'none', overflow: 'hidden'}}>
		<div style={{position: 'absolute', left: -400, right: -400, top: vertical ? 1180 : 760, height: vertical ? 320 : 240, transform: `rotate(${vertical ? -18 : -8}deg) translateY(${Math.sin(t * 0.35) * 20}px)`, background: BLUE_PURPLE, backgroundSize: '220% 100%', backgroundPosition: `${50 + Math.sin(t * 0.22) * 40}% 50%`, filter: 'blur(48px)', borderRadius: 400}} />
	</div>
);

/** Mouth openness from the voiceover's word timings (lip-sync for the talking characters). */
export const talkAt = (t: number, parts: Part[]) => {
	for (const p of parts) {
		if (t < p.start - 0.05 || t > p.end + 0.05) continue;
		for (const w of p.words) if (t >= w.s && t <= w.e) return 0.3 + 0.7 * Math.abs(Math.sin((t - w.s) * Math.PI * 5.5));
	}
	return 0;
};

/** Word-by-word captions (vertical videos): a line of words around the current one; active word in indigo. */
export const Captions: React.FC<{t: number; parts: Part[]; top: number; size?: number}> = ({t, parts, top, size = 54}) => {
	const words = parts.flatMap((p) => p.words);
	const i = words.findIndex((w, k) => t >= w.s - 0.05 && (k === words.length - 1 || t < words[k + 1].s - 0.05));
	if (i < 0 || t > words[i].e + 0.8) return null;
	// group into chunks of ~4 words that break on punctuation
	const chunks: number[][] = [];
	let cur: number[] = [];
	words.forEach((w, k) => {
		cur.push(k);
		if (cur.length >= 4 || /[.,?!]$/.test(w.w)) {
			chunks.push(cur);
			cur = [];
		}
	});
	if (cur.length) chunks.push(cur);
	const chunk = chunks.find((c) => c.includes(i)) ?? [i];
	const pop = prog(t, words[chunk[0]].s - 0.05, 0.25, SPRINGY);
	return (
		<div style={{position: 'absolute', left: 60, right: 60, top, display: 'flex', justifyContent: 'center'}}>
			<div style={{padding: '18px 30px', borderRadius: 22, background: 'rgba(255,255,255,0.94)', boxShadow: SHADOW_SM, fontFamily: inter, fontWeight: 700, fontSize: size, lineHeight: 1.2, letterSpacing: '-0.02em', textAlign: 'center', transform: `scale(${mix(0.92, 1, pop)})`}}>
				{chunk.map((k) => (
					<span key={k} style={{color: k === i ? C.indigo : k < i ? C.navy : '#9AA6B6', marginRight: '0.25em'}}>
						{words[k].w}
					</span>
				))}
			</div>
		</div>
	);
};

/** Conceptual product overview (deposit financing) for phones. */
export const DepositOverview: React.FC<{t: number; at: number}> = ({t, at}) => {
	const r = (k: number) => prog(t, at + 0.2 + k * 0.15, 0.6);
	return (
		<div style={{padding: '74px 26px 0', fontFamily: inter}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 10, opacity: r(0)}}>
				<RMark size={34} />
				<span style={{fontWeight: 600, fontSize: 22, color: C.navy}}>Rent</span>
				<span style={{marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: C.indigo, background: C.indigoSoft, padding: '5px 10px', borderRadius: 999}}>Early access</span>
			</div>
			<div style={{fontWeight: 600, fontSize: 30, color: C.navy, marginTop: 22, letterSpacing: '-0.02em', opacity: r(1)}}>Security deposit financing</div>
			<div style={{fontSize: 17, color: C.slate, marginTop: 8, lineHeight: 1.4, opacity: r(1)}}>Exploring options with regulated lending partners.</div>
			<div style={{marginTop: 20, padding: 20, borderRadius: 16, background: C.soft, position: 'relative', overflow: 'hidden', opacity: r(2)}}>
				<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: BLUE_PURPLE}} />
				<div style={{fontSize: 15, color: C.muted}}>Example deposit</div>
				<div style={{...NUM, fontWeight: 600, fontSize: 34, color: C.navy}}>₹1,00,000</div>
				<div style={{fontSize: 13, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', marginTop: 4}}>ILLUSTRATIVE</div>
			</div>
			{['Explore options', 'Apply', 'Lender assessment', 'Review terms if approved'].map((l, i) => (
				<div key={l} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, fontSize: 18, color: C.navy, opacity: r(3 + i)}}>
					<div style={{width: 28, height: 28, borderRadius: 14, background: C.indigoSoft, color: C.indigo, fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
					{l}
				</div>
			))}
			<div style={{marginTop: 24, height: 56, borderRadius: 12, background: C.indigo, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 19, opacity: r(7)}}>Join the waitlist</div>
		</div>
	);
};

/** Horizontal/vertical journey: Explore → Apply → Lender assessment → Review terms (no approval shown). */
export const Journey: React.FC<{t: number; at: number[]; steps: string[]; vertical?: boolean; style?: React.CSSProperties}> = ({t, at, steps, vertical, style}) => (
	<div style={{position: 'absolute', display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: vertical ? 'stretch' : 'center', gap: vertical ? 22 : 0, ...style}}>
		{steps.map((s, i) => {
			const p = prog(t, at[i] - 0.1, 0.7, SPRINGY);
			return (
				<React.Fragment key={s}>
					<div style={{display: 'flex', alignItems: 'center', gap: 18, padding: vertical ? '24px 30px' : '22px 26px', borderRadius: 18, background: C.white, boxShadow: SHADOW_SM, transform: `scale(${p})`, opacity: Math.min(1, p * 1.5)}}>
						<div style={{width: 52, height: 52, borderRadius: 26, background: C.indigo, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: inter, fontWeight: 600, fontSize: 22, flexShrink: 0}}>{i + 1}</div>
						<span style={{fontFamily: inter, fontWeight: 600, fontSize: vertical ? 36 : 28, color: C.navy, whiteSpace: 'nowrap'}}>{s}</span>
					</div>
					{!vertical && i < steps.length - 1 ? (
						<div style={{width: 60, display: 'flex', justifyContent: 'center', opacity: prog(t, at[i + 1] - 0.3, 0.4)}}>
							<Icon name="arrow" size={32} color={C.muted} />
						</div>
					) : null}
				</React.Fragment>
			);
		})}
	</div>
);

/** Big money / cost card used across the problem scenes. */
export const CostCard: React.FC<{t: number; at: number; icon: string; label: string; value: string; accent?: string; w?: number; style?: React.CSSProperties; out?: number}> = ({t, at, icon, label, value, accent = C.orange, w = 860, style, out}) => {
	const o = out === undefined ? life(t, at, 1e9, 0.5, 0.3) : life(t, at, out, 0.5, 0.3);
	if (o <= 0) return null;
	const p = prog(t, at, 0.6, SPRINGY);
	return (
		<div style={{position: 'absolute', width: w, padding: '30px 34px', borderRadius: 22, background: C.white, boxShadow: SHADOW, display: 'flex', alignItems: 'center', gap: 24, opacity: o, transform: `scale(${mix(0.9, 1, p)}) translateY(${(1 - p) * 30}px)`, ...style}}>
			<IconTile name={icon} size={76} bg={accent === C.orange ? C.peach : C.indigoSoft} color={accent} />
			<div style={{flex: 1, fontFamily: inter, fontWeight: 600, fontSize: 38, color: C.navy}}>{label}</div>
			<div style={{...NUM, fontFamily: inter, fontWeight: 600, fontSize: 40, color: accent}}>{value}</div>
		</div>
	);
};

export const Note: React.FC<{t: number; at: number; out: number; text: string; vertical?: boolean}> = ({t, at, out, text, vertical}) => {
	const o = life(t, at, out, 0.5, 0.3);
	if (o <= 0) return null;
	return <div style={{position: 'absolute', left: vertical ? 70 : 120, bottom: vertical ? 300 : 50, fontFamily: inter, fontSize: vertical ? 24 : 17, color: C.muted, opacity: o}}>{text}</div>;
};

export {BODY, GRADIENT, IN_OUT};
