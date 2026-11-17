// VibeLevel Screening — product demo v4 (projects/vibelevel-v4): master-prompt structure.
// 1 hook (1,000 → 5) · 2 evidence gap · 3 intro (v3 assets) · 4 recruiter report · 5 workspace (v3 assets) ·
// 6 Review Session (real captures) · 7 four dimensions · 8 AI-led interview · 9 closing + end card.
// On-screen text follows the voiceover word by word (makeSay); confidential data in captures is pre-blurred.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction} from 'remotion';
import {type Cue, makeCue, type Part} from '../velora/filmkit';
import {Sfx} from '../velora/Velora';
import {CODE, mono, PixelPerson} from '../vl2/Demo';
import {Captions, Chip, Cursor, IN_OUT, K, life, Line, mix, Pixels, prog, sans, Screen, serif} from '../vl2/kit';
import {AIArt, ContributeArt, Corner, LogoLockup, makeSay, Marquee, NONTECH, type Say, TECH, ThinkArt} from '../vl3/Demo3';

export type Demo4Props = {parts: Part[]; duration: number; segments: {s: number; e: number}[]; fps?: number; musicOffset: number};
export const calculateDemo4Metadata: CalculateMetadataFunction<Demo4Props> = ({props}) => {
	const fps = props.fps ?? 30;
	return {fps, width: 1920, height: 1080, durationInFrames: Math.max(fps, Math.ceil(props.duration * fps))};
};
type S = {t: number; c: Cue; a: number; end: number; say: Say};
const hash = (x: number, y = 0) => {
	const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
	return s - Math.floor(s);
};

// ─── Scene 1 — the hook: a pool of applicants narrows to the top 5 AI builders ─
// 30 cards stand for the pool (+ "970+ more"); they filter 30 → 12 → 5 with staggered, eased moves.
const POOL = 30;
const ORDER = Array.from({length: POOL}, (_, i) => i).sort((a, b) => hash(a, 3) - hash(b, 3));
const RANK = (() => {
	const r = new Array(POOL);
	ORDER.forEach((card, k) => (r[card] = k));
	return r as number[];
})();
type Box = {x: number; y: number; w: number; h: number};
const layout = (k: number, stage: number): Box => {
	if (stage === 0) {
		const cw = 270;
		const ch = 122;
		return {x: 960 + ((k % 6) - 2.5) * cw, y: 330 + Math.floor(k / 6) * ch, w: 244, h: 104};
	}
	if (stage === 1) {
		const cw = 290;
		const ch = 170;
		return {x: 960 + ((k % 6) - 2.5) * cw, y: 520 + Math.floor(k / 6) * ch, w: 262, h: 146};
	}
	return {x: 960 + (k - 2) * 340, y: 640, w: 310, h: 360};
};
const ROLES = ['Full-stack engineer', 'ML engineer', 'Backend engineer', 'Data scientist', 'Product engineer'];
const SKILLS = [['React', 'Node'], ['PyTorch', 'MLOps'], ['Go', 'APIs'], ['SQL', 'Python'], ['TypeScript', 'UX']];
const Scene1: React.FC<S> = ({t, c, say}) => {
	const tA = c.W('s1', 'to') - 0.1; // 30 → 12
	const tB = c.W('s1', 'five') - 0.2; // 12 → 5
	const tQ = c.W('s1', 'how') - 0.25;
	const head = (txt: string, words: string, a: number, b: number, extra: Partial<React.ComponentProps<typeof Line>> = {}) =>
		t >= a - 0.05 && t < b ? <Line t={t} text={txt} at={0} times={say('s1', words)} size={84} weight={400} out={b - 0.3} {...extra} /> : null;
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.35}} />
			<div style={{position: 'absolute', left: 300, right: 300, top: 110}}>
				{head('From 1,000 applicants', 'from 1,000 applicants', 0, tA + 0.2, {hl: ['1,000']})}
				{head('to the top 5 AI builders.', 'to the top 5 AI builders.', tA + 0.2, tQ + 0.05, {hl: ['5', 'ai']})}
				{t >= tQ ? (
					<>
						<Line t={t} text="How do you identify the people" at={0} times={say('s1', 'how do you identify the people')} size={76} weight={400} />
						<div style={{height: 4}} />
						<Line t={t} text="who can actually deliver?" at={0} times={say('s1', 'who can actually deliver?')} size={76} weight={400} it={['deliver']} />
					</>
				) : null}
			</div>
			{Array.from({length: POOL}, (_, card) => {
				const k = RANK[card];
				const appear = prog(t, 0.15 + (card % 6) * 0.04 + Math.floor(card / 6) * 0.06, 0.6);
				const pA = prog(t, tA + (k % 6) * 0.035, 1.1, IN_OUT);
				const pB = prog(t, tB + (k % 5) * 0.05, 1.1, IN_OUT);
				const b0 = layout(k, 0);
				let box = b0;
				let o = appear;
				if (k >= 12) {
					o *= 1 - pA; // leaves in the first cut
				} else {
					const b1 = layout(k, 1);
					box = {x: mix(b0.x, b1.x, pA), y: mix(b0.y, b1.y, pA), w: mix(b0.w, b1.w, pA), h: mix(b0.h, b1.h, pA)};
					if (k >= 5) o *= 1 - pB;
					else {
						const b2 = layout(k, 2);
						box = {x: mix(box.x, b2.x, pB), y: mix(box.y, b2.y, pB), w: mix(box.w, b2.w, pB), h: mix(box.h, b2.h, pB)};
					}
				}
				const leaving = (k >= 12 && pA > 0) || (k >= 5 && k < 12 && pB > 0);
				const shrink = leaving ? 1 - 0.12 * (k >= 12 ? pA : pB) : 1;
				if (o <= 0.01) return null;
				const final = k < 5 ? pB : 0;
				const lift = k < 5 ? prog(t, tQ, 0.8, IN_OUT) * 60 : 0;
				return (
					<div key={card} style={{position: 'absolute', left: box.x - box.w / 2, top: box.y - box.h / 2 + lift, width: box.w, height: box.h, borderRadius: 14, background: final > 0.5 ? '#1D2026' : '#181B20', boxShadow: '0 0 0 1px #2E3238', opacity: o, transform: `scale(${shrink})`, padding: mix(16, 26, final), boxSizing: 'border-box', overflow: 'hidden', fontFamily: sans}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
							<div style={{position: 'relative', width: mix(46, 96, final), height: mix(50, 106, final), flexShrink: 0}}>
								<div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${mix(46, 96, final) / 240})`, transformOrigin: 'left top'}}>
									<PixelPerson t={t + card * 0.37} p={1} x={0} y={0} cell={10} />
								</div>
							</div>
							<div style={{flex: 1, minWidth: 0}}>
								<div style={{height: 10, width: '75%', borderRadius: 5, background: '#3A3E45', opacity: 1 - final}} />
								<div style={{height: 8, width: '50%', borderRadius: 4, background: '#2E3238', marginTop: 8, opacity: 1 - final}} />
							</div>
						</div>
						{final > 0 ? (
							<div style={{opacity: prog(final, 0.5, 0.5), marginTop: -6}}>
								<div style={{fontWeight: 600, fontSize: 28, color: K.text}}>Candidate {k + 1}</div>
								<div style={{fontSize: 21, color: '#B5BAC2', marginTop: 6}}>{ROLES[k]}</div>
								<div style={{display: 'flex', gap: 8, marginTop: 18}}>
									{SKILLS[k].map((s) => (
										<span key={s} style={{padding: '6px 12px', borderRadius: 8, background: '#2A2E35', color: '#D7DBE0', fontSize: 17}}>
											{s}
										</span>
									))}
								</div>
								<div style={{marginTop: 22}}>
									<Chip size={20}>AI builder</Chip>
								</div>
							</div>
						) : null}
					</div>
				);
			})}
			{/* the rest of the pool */}
			{(() => {
				const o = prog(t, 0.9, 0.6) * (1 - prog(t, tA, 0.6));
				return o > 0 ? (
					<div style={{position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', opacity: o}}>
						<span style={{display: 'inline-block', padding: '12px 26px', borderRadius: 999, border: '1.5px dashed #3A3E45', fontFamily: sans, fontSize: 30, color: K.text}}>
							<span style={{color: K.green, fontWeight: 600}}>970+</span> more applicants
						</span>
					</div>
				) : null;
			})()}
		</AbsoluteFill>
	);
};

// ─── Scene 2 — the evidence gap ──────────────────────────────────────────────
const Scene2: React.FC<S> = ({t, c, a, say}) => {
	const tBut = c.W('s2', 'but');
	const split = prog(t, tBut - 0.3, 0.9, IN_OUT);
	const enter = prog(t, a, 0.8);
	const typed = CODE.join('\n').slice(0, Math.floor(prog(t, a + 0.3, 3.2, Easing.linear) * CODE.join('\n').length));
	const reply = 'Try a verify step before returning the report.';
	const tRes = c.W('s2', 'results') - 0.4;
	const rows: [string, string][] = [
		['AI conversations', 'conversations'],
		['Code changes', 'code'],
		['Decisions', 'decisions'],
		['Actual contributions', 'contributions'],
	];
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.3}} />
			{/* the candidate at work: laptop with code + AI assistant */}
			{split < 1 ? (
				<AbsoluteFill style={{opacity: 1 - split}}>
					<div style={{position: 'absolute', left: 330, right: 330, top: 60}}>
						<Line t={t} text="AI helps candidates build faster and deliver impressive results." at={0} times={say('s2', 'AI helps candidates build faster and deliver impressive results.')} size={56} weight={400} hl={['ai', 'faster', 'impressive']} />
					</div>
					<div style={{position: 'absolute', left: 150, top: 520, transform: 'scale(0.9)', transformOrigin: 'left top', opacity: enter}}>
						<PixelPerson t={t} p={1} x={0} y={0} cell={18} />
					</div>
					<div style={{position: 'absolute', left: 640, top: 230, width: 1140, height: 600, borderRadius: 16, background: K.bg2, boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7), 0 0 0 1px #2A2D33', overflow: 'hidden', opacity: enter, transform: `translateY(${(1 - enter) * 50}px)`, display: 'flex'}}>
						<div style={{flex: 1, padding: 28, borderRight: `1px solid ${K.line}`}}>
							<div style={{fontFamily: sans, fontSize: 18, color: K.dim, marginBottom: 16}}>agent/handler.ts</div>
							<pre style={{margin: 0, fontFamily: mono, fontSize: 20, lineHeight: 1.65, color: '#C9CDD4', whiteSpace: 'pre'}}>
								{typed}
								<span style={{color: K.green}}>▍</span>
							</pre>
						</div>
						<div style={{width: 420, padding: 24, fontFamily: sans}}>
							<div style={{fontSize: 18, color: K.dim}}>AI assistant</div>
							<div style={{marginTop: 16, marginLeft: 50, padding: '12px 16px', borderRadius: '14px 14px 4px 14px', background: K.green, color: K.ink, fontSize: 19, opacity: prog(t, a + 0.8, 0.4)}}>How should I verify each step?</div>
							<div style={{marginTop: 12, marginRight: 30, padding: '12px 16px', borderRadius: '14px 14px 14px 4px', background: K.panel, color: K.text, fontSize: 19, minHeight: 52, opacity: prog(t, a + 1.4, 0.4)}}>{reply.slice(0, Math.round(reply.length * prog(t, a + 1.5, 1.4, Easing.linear)))}</div>
						</div>
					</div>
					{/* the final working output */}
					{(() => {
						const p = prog(t, tRes, 0.6, Easing.bezier(0.34, 1.4, 0.64, 1));
						return p > 0 ? (
							<div style={{position: 'absolute', left: 1340, top: 690, padding: '20px 26px', borderRadius: 14, background: K.bg2, boxShadow: `0 0 0 2px ${K.green}, 0 30px 60px -20px rgba(0,215,107,0.35)`, fontFamily: sans, transform: `scale(${p})`, transformOrigin: 'right bottom'}}>
								<div style={{fontSize: 26, color: K.text, display: 'flex', alignItems: 'center', gap: 12}}>
									<span style={{color: K.green}}>✓</span> 24 tests passed
								</div>
								<div style={{fontSize: 20, color: K.dim, marginTop: 6}}>Shipped to production</div>
							</div>
						) : null;
					})()}
				</AbsoluteFill>
			) : null}
			{/* Final Result vs Evidence Behind the Work */}
			{split > 0 ? (
				<AbsoluteFill style={{opacity: split}}>
					<div style={{position: 'absolute', left: 330, right: 330, top: 70}}>
						<Line t={t} text="But where's the evidence behind their work?" at={0} times={say('s2', "but where's the evidence behind their work?")} size={68} weight={400} it={['evidence']} />
					</div>
					<div style={{position: 'absolute', left: 140, top: 270, width: 760, height: 620, borderRadius: 20, background: K.bg2, boxShadow: `0 0 0 2px ${K.green}`, padding: 40, boxSizing: 'border-box', transform: `translateX(${(1 - split) * -60}px)`}}>
						<Chip size={30}>Final result</Chip>
						<div style={{fontFamily: sans, fontSize: 56, color: K.text, marginTop: 70, display: 'flex', alignItems: 'center', gap: 18}}>
							<span style={{color: K.green}}>✓</span> 24 tests passed
						</div>
						<div style={{fontFamily: sans, fontSize: 32, color: K.dim, marginTop: 16}}>Shipped to production</div>
						<svg width={680} height={160} style={{marginTop: 40}}>
							<polyline fill="none" stroke={K.green} strokeWidth={3} points={Array.from({length: 14}, (_, i) => `${i * 52},${140 - (i * 8 + ((i * 37) % 5) * 7)}`).join(' ')} />
						</svg>
						<div style={{fontFamily: sans, fontSize: 24, color: '#5C616B', marginTop: 10}}>What you can see</div>
					</div>
					<div style={{position: 'absolute', left: 1020, top: 270, width: 760, height: 620, borderRadius: 20, border: '2px dashed #3A3E45', padding: 40, boxSizing: 'border-box', transform: `translateX(${(1 - split) * 60}px)`}}>
						<Chip size={30} dark>
							Evidence behind the work
						</Chip>
						<div style={{marginTop: 44}}>
							{rows.map(([l, w], i) => {
								const at = c.W('s2', w) - 0.15;
								const p = prog(t, at, 0.5);
								const pulse = 0.6 + 0.4 * Math.sin(t * 4 + i);
								return (
									<div key={l} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: i < 3 ? `1px solid ${K.line}` : undefined, opacity: 0.25 + 0.75 * p, transform: `translateX(${(1 - p) * 20}px)`}}>
										<span style={{fontFamily: sans, fontSize: 36, color: K.text}}>{l}</span>
										<span style={{width: 50, height: 50, borderRadius: 25, border: `2px solid ${K.green}`, color: K.green, fontFamily: serif, fontStyle: 'italic', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p * pulse}}>?</span>
									</div>
								);
							})}
						</div>
					</div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};

// ─── Scene 3 — introducing VibeLevel Screening (v3 intro assets) ────────────
const Scene3: React.FC<S> = ({t, c, a, say}) => {
	const tAn = c.W('s3', 'an');
	const tRoles = c.W('s3', 'technical') - 0.4;
	const tWith = c.W('s3', 'with') - 0.2;
	const three = [c.W('s3', 'think'), c.W('s3', 'work'), c.W('s3', 'contribute')];
	const up = prog(t, tAn - 0.25, 0.9, IN_OUT);
	const roles = life(t, tRoles, tWith + 0.2, 0.6, 0.45);
	const beyond = prog(t, tWith, 0.6);
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.45}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: mix(420, 46, up), display: 'flex', justifyContent: 'center', transform: `scale(${mix(1, 0.58, up)})`, transformOrigin: 'center top'}}>
				<LogoLockup t={t} at={Math.max(c.W('s3', 'vibe') - 0.45, a + 0.4)} scrAt={c.W('s3', 'screening')} h={130} />
			</div>
			{t > tAn - 0.3 && t < tWith + 0.4 ? (
				<AbsoluteFill style={{opacity: prog(t, tAn + 0.5, 0.4) * (1 - prog(t, tWith - 0.2, 0.4))}}>
					<div style={{position: 'absolute', left: 120, right: 120, top: 240}}>
						<Line t={t} text="An AI-era assessment platform" at={0} times={say('s3', 'an AI-era assessment platform').map((x) => Math.max(x, tAn + 0.7))} size={80} weight={400} hl={['ai-era']} />
						<div style={{height: 14}} />
						<Line t={t} text="that helps recruiters evaluate" at={0} times={say('s3', 'that helps recruiters evaluate')} size={48} weight={300} color={K.dim} />
						<div style={{height: 4}} />
						<Line t={t} text="technical and non-technical talent" at={0} times={say('s3', 'technical and non-technical talent')} size={48} weight={300} hl={['technical', 'non-technical']} />
					</div>
					{roles > 0 ? (
						<div style={{opacity: roles}}>
							<Marquee t={t} items={TECH} dir={-1} y={640} label="Technical" at={tRoles} />
							<Marquee t={t} items={NONTECH} dir={1} y={820} label="Non-technical" at={tRoles + 0.5} />
						</div>
					) : null}
				</AbsoluteFill>
			) : null}
			{beyond > 0 ? (
				<AbsoluteFill style={{opacity: beyond}}>
					<div style={{position: 'absolute', left: 120, right: 120, top: 230}}>
						<Line t={t} text="With evidence-backed insights" at={0} times={say('s3', 'with evidence-backed insights')} size={64} weight={400} it={['evidence-backed']} />
						<div style={{height: 8}} />
						<Line t={t} text="into how candidates think, work with AI, and contribute." at={0} times={say('s3', 'into how candidates think, work with AI, and contribute.')} size={42} weight={300} color={K.dim} />
					</div>
					<div style={{position: 'absolute', left: 150, right: 150, top: 450, display: 'flex', gap: 40}}>
						{(
							[
								['Think', ThinkArt],
								['Work with AI', AIArt],
								['Contribute', ContributeArt],
							] as const
						).map(([l, Art], i) => {
							const p = prog(t, three[i] - 0.25, 0.6);
							const active = three.filter((x) => t >= x - 0.15).length - 1 === i;
							return (
								<div key={l} style={{flex: 1, height: 440, borderRadius: 18, background: K.bg2, boxShadow: active ? `0 0 0 1.5px ${K.green}` : '0 0 0 1px #2A2D33', padding: 34, boxSizing: 'border-box', opacity: 0.35 + 0.65 * p, transform: `translateY(${(1 - p) * 40}px) scale(${active ? 1.03 : 1})`}}>
									{active ? <Chip size={40}>{l}</Chip> : <div style={{fontFamily: sans, fontWeight: 400, fontSize: 40, color: K.text, padding: '12px 0'}}>{l}</div>}
									<div style={{marginTop: 50, display: 'flex', justifyContent: 'center'}}>
										<Art t={t} on={prog(t, three[i] - 0.1, 1.4, Easing.linear)} />
									</div>
								</div>
							);
						})}
					</div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};

// ─── Scene 4 — the recruiter report: layered stack, every layer named ────────
// Each layer is a real (blurred) report section shown in full (contained, never cropped).
type Layer = {label: string; word: string; img: string; iw: number; ih: number};
const LAYERS: Layer[] = [
	{label: 'Performance scores', word: 'performance', img: 'v4-p01-card.png', iw: 2280, ih: 1390},
	{label: 'AI collaboration insights', word: 'collaboration', img: 'v4-wwai-card.png', iw: 2280, ih: 1510},
	{label: 'Code Review', word: 'code', img: 'code-review.png', iw: 2240, ih: 1570},
	{label: 'Video Q&A', word: 'video', img: 'video-qa.png', iw: 2240, ih: 1090},
	{label: 'Interview Guide', word: 'interview', img: 'interview-guide.png', iw: 2240, ih: 1410},
];
const Scene4: React.FC<S> = ({t, c, a}) => {
	const enter = prog(t, a, 0.7);
	const at = LAYERS.map((l, i) => (i === 0 ? Math.min(c.W('s4', l.word) - 0.3, a + 0.6) : c.W('s4', l.word) - 0.2));
	const latest = at.filter((x) => t >= x).length - 1;
	return (
		<AbsoluteFill style={{background: K.light}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.3, light: true}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center', fontFamily: sans, fontWeight: 400, fontSize: 64, letterSpacing: '-0.02em', color: K.ink, opacity: enter}}>
				The candidate <span style={{fontFamily: serif, fontStyle: 'italic', color: K.greenDeep}}>report</span>
			</div>
			<div style={{position: 'absolute', left: 740, top: 680, perspective: 2400}}>
				{LAYERS.map((l, i) => {
					const p = prog(t, at[i], 0.8);
					const k = i - 2;
					const w = 680;
					const h = Math.min(465, (w * l.ih) / l.iw);
					return (
						<div key={l.img} style={{position: 'absolute', left: -w / 2, top: -h / 2, width: w, height: h, borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 60px -20px rgba(20,24,30,0.35)', transform: `rotateX(52deg) rotateZ(-28deg) translate3d(${k * 40}px, ${k * -40}px, ${mix(-260, i * 70, p)}px)`, opacity: p}}>
							<Img src={staticFile(`vl2/img/${l.img}`)} style={{width: '100%', height: '100%', objectFit: 'contain', background: '#fff'}} />
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', left: 1260, top: 230}}>
				{[...LAYERS].reverse().map((l, ri) => {
					const i = LAYERS.length - 1 - ri;
					const p = prog(t, at[i] + 0.15, 0.5);
					return (
						<div key={l.label} style={{display: 'flex', alignItems: 'center', gap: 18, height: 112, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}>
							<div style={{width: 70, height: 2, background: i === latest ? K.greenDeep : '#B9BEC6'}} />
							<div style={{fontFamily: sans, fontWeight: 500, fontSize: 20, color: '#8E939D', width: 64, lineHeight: 1.1}}>Layer {i + 1}</div>
							{i === latest ? <Chip size={32}>{l.label}</Chip> : <span style={{fontFamily: sans, fontWeight: 400, fontSize: 32, color: K.ink}}>{l.label}</span>}
						</div>
					);
				})}
				<div style={{display: 'flex', gap: 12, marginTop: 18, marginLeft: 152}}>
					<Chip size={26} p={prog(t, c.W('s4', 'strengths') - 0.15, 0.4)}>
						Strengths
					</Chip>
					<Chip size={26} dark p={prog(t, c.W('s4', 'gaps') - 0.15, 0.4)}>
						Gaps
					</Chip>
				</div>
			</div>
			<div style={{position: 'absolute', left: 60, bottom: 90, fontFamily: sans, fontSize: 17, color: '#8E939D'}}>Candidate details blurred for privacy</div>
		</AbsoluteFill>
	);
};

// ─── Scene 5 — the candidate workspace (v3 assets) ───────────────────────────
const Scene5: React.FC<S> = ({t, c, a, say}) => {
	const P = c.P('s5');
	const tIn = c.W('s5', 'in');
	const tWith = c.W('s5', 'with');
	const tFor = c.W('s5', 'integrated');
	const tClaude = c.W('s5', 'clodcode') || c.W('s5', 'like');
	const tCopilot = c.W('s5', 'copilot') - 0.3;
	const dark = prog(t, tFor - 0.4, 0.7, IN_OUT);
	const enter = prog(t, a, 1.0);
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.3}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: sans, fontWeight: 400, fontSize: 56, letterSpacing: '-0.02em', color: K.text, opacity: enter}}>
				Real-world challenges. <span style={{color: K.green}}>Real AI tools.</span>
			</div>
			<Screen
				t={t}
				src="workspace.png"
				iw={1920}
				ih={991}
				w={1480}
				h={764}
				light
				style={{left: 220, top: 220, opacity: (1 - dark) * Math.min(1, enter * 1.5), transform: `translateY(${(1 - enter) * 60}px) scale(${mix(0.93, 1, enter)})`}}
				cam={[
					{t: P, x: 0.5, y: 0.5, z: 1},
					{t: c.W('s5', 'realistic'), x: 0.5, y: 0.5, z: 1},
					{t: c.W('s5', 'realistic') + 1.1, x: 0.22, y: 0.3, z: 1.6},
					{t: tIn + 0.3, x: 0.5, y: 0.45, z: 1.15},
					{t: tClaude, x: 0.78, y: 0.32, z: 1.7},
				]}
			/>
			<Screen t={t} src="ide-dark.png" iw={1405} ih={985} w={1200} h={841} style={{left: 360, top: 215, opacity: dark, transform: `translateY(${(1 - dark) * 60}px)`}} cam={[{t: tFor - 0.3, x: 0.5, y: 0.5, z: 1}, {t: tFor + 2.2, x: 0.55, y: 0.35, z: 1.35}]} />
			<div style={{position: 'absolute', left: 250, top: 935, display: 'flex', gap: 18}}>
				<Chip p={prog(t, c.W('s5', 'realistic') - 0.1, 0.5)} size={32}>
					Role-specific challenge
				</Chip>
				<Chip p={prog(t, tClaude - 0.2, 0.5)} size={32} dark={t > tCopilot + 0.3}>
					Claude Code
				</Chip>
				<Chip p={prog(t, tCopilot, 0.5)} size={32} dark={t < tCopilot}>
					GitHub Copilot
				</Chip>
			</div>
			<Cursor t={t} x={mix(1300, 1120, prog(t, tClaude - 0.8, 0.8, IN_OUT))} y={mix(700, 470, prog(t, tClaude - 0.8, 0.8, IN_OUT))} at={tClaude - 0.9} click={tClaude + 0.05} out={tFor - 0.3} />
		</AbsoluteFill>
	);
};

// ─── Scene 6 — Review Session (real captures; candidate name + score blurred) ─
/** A full 16:9 product capture with a camera that frames regions (fractions [x0,y0,x1,y1]) and green highlights. */
type Region = [number, number, number, number];
const CamShot: React.FC<{t: number; src: string; keys: {t: number; r: Region}[]; hl?: {r: Region; at: number; out: number}[]; style?: React.CSSProperties}> = ({t, src, keys, hl = [], style}) => {
	const W = 1440;
	const Hh = 810;
	let r = keys[0].r;
	for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i].t) r = keys[i].r.map((v, k) => mix(v, keys[i + 1].r[k], IN_OUT(Math.min(1, (t - keys[i].t) / Math.max(0.01, keys[i + 1].t - keys[i].t))))) as Region;
	if (t >= keys[keys.length - 1].t) r = keys[keys.length - 1].r;
	const s = Math.min(1 / (r[2] - r[0]), 1 / (r[3] - r[1])); // zoom
	const cx = (r[0] + r[2]) / 2;
	const cy = (r[1] + r[3]) / 2;
	const iw = W * s;
	const ih = Hh * s;
	const left = Math.min(0, Math.max(W - iw, W / 2 - cx * iw));
	const top = Math.min(0, Math.max(Hh - ih, Hh / 2 - cy * ih));
	return (
		<div style={{position: 'absolute', left: 240, top: 165, width: W, height: Hh, borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7), 0 0 0 1px #2A2D33', ...style}}>
			<div style={{position: 'absolute', left, top, width: iw, height: ih}}>
				<Img src={staticFile(`vl2/img/${src}`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
				{hl.map((h, i) => {
					const o = life(t, h.at, h.out, 0.35, 0.3);
					return o > 0 ? <div key={i} style={{position: 'absolute', left: `${h.r[0] * 100}%`, top: `${h.r[1] * 100}%`, width: `${(h.r[2] - h.r[0]) * 100}%`, height: `${(h.r[3] - h.r[1]) * 100}%`, borderRadius: 12, boxShadow: `0 0 0 4px ${K.green}, 0 0 40px rgba(0,215,107,0.35)`, opacity: o}} /> : null;
				})}
			</div>
		</div>
	);
};
const Scene6: React.FC<S> = ({t, c, a, say}) => {
	const P = c.P('s6');
	const w = (x: string) => c.W('s6', x);
	const tConv = w('conversations') - 0.3;
	const tCode = w('code') - 0.3;
	const tOut = w('outputs') - 0.3;
	const tWell = w('well') - 0.5;
	const tShort = w('short') - 0.5;
	const tEvid = w('evidence') - 0.3;
	const end = c.E('s6') + 0.9;
	const enter = prog(t, a, 0.8);
	// which capture is on screen
	const shots: {src: string; from: number; to: number; keys: {t: number; r: Region}[]; hl?: {r: Region; at: number; out: number}[]}[] = [
		{src: 'v4-r01-chat-timeline.png', from: a, to: tOut, keys: [{t: a, r: [0, 0, 1, 1]}, {t: tConv, r: [0, 0, 1, 1]}, {t: tConv + 0.9, r: [0.68, 0.07, 1, 0.75]}, {t: tCode, r: [0.68, 0.07, 1, 0.75]}, {t: tCode + 0.9, r: [0.15, 0.05, 0.71, 0.75]}], hl: [{r: [0.21, 0.0, 0.69, 0.055], at: P + 0.4, out: tConv}, {r: [0.705, 0.24, 0.995, 0.71], at: tConv + 0.8, out: tCode + 0.2}, {r: [0.17, 0.12, 0.69, 0.72], at: tCode + 0.9, out: tOut}]},
		{src: 'v4-r03-final-code.png', from: tOut, to: tWell, keys: [{t: tOut, r: [0, 0.04, 0.71, 0.75]}, {t: tWell, r: [0, 0.04, 0.71, 0.72]}], hl: [{r: [0.005, 0.12, 0.165, 0.66], at: tOut + 0.4, out: tWell}]},
		{src: 'v4-r05-done-well.png', from: tWell, to: tShort, keys: [{t: tWell, r: [0.12, 0.2, 0.7, 0.62]}, {t: tShort, r: [0.15, 0.24, 0.66, 0.58]}], hl: [{r: [0.215, 0.37, 0.615, 0.52], at: tWell + 0.5, out: tShort}]},
		{src: 'v4-r06-weakness-l37.png', from: tShort, to: end + 1, keys: [{t: tShort, r: [0.12, 0.2, 0.7, 0.68]}, {t: tEvid, r: [0.12, 0.2, 0.7, 0.68]}, {t: tEvid + 0.9, r: [0.14, 0.05, 0.72, 0.5]}], hl: [{r: [0.215, 0.37, 0.615, 0.64], at: tShort + 0.5, out: tEvid + 0.2}, {r: [0.43, 0.105, 0.535, 0.135], at: tEvid + 0.8, out: end + 1}, {r: [0.16, 0.65, 0.69, 0.69], at: tEvid + 1.3, out: end + 1}]},
	];
	const chips: [string, number][] = [
		['AI conversations', tConv],
		['Code changes', tCode],
		['Files & outputs', tOut],
		['Done well', tWell],
		['Fell short', tShort],
		['Evidence behind every finding', tEvid],
	];
	const activeChip = chips.filter(([, x]) => t >= x).length - 1;
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.25}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: sans, fontWeight: 400, fontSize: 52, letterSpacing: '-0.02em', color: K.text, opacity: enter}}>
				Review <span style={{fontFamily: serif, fontStyle: 'italic', color: K.green}}>Session</span>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 104, display: 'flex', justifyContent: 'center', gap: 12}}>
				{chips.map(([l, x], i) => (
					<Chip key={l} size={22} p={prog(t, x, 0.4)} dark={i !== activeChip}>
						{l}
					</Chip>
				))}
			</div>
			{shots.map((s, i) => {
				const o = life(t, s.from, s.to + 0.2, i === 0 ? 0.6 : 0.3, 0.25) * enter;
				return o > 0 ? <CamShot key={s.src} t={t} src={s.src} keys={s.keys} hl={s.hl} style={{opacity: o}} /> : null;
			})}
		</AbsoluteFill>
	);
};

// ─── Scene 7 — four dimensions ───────────────────────────────────────────────
const DIMS: [string, string][] = [
	['Core Skills', 'core'],
	['Working with AI', 'working'],
	['Ownership', 'ownership'],
	['Human Contribution', 'human'],
];
const Scene7: React.FC<S> = ({t, c, say}) => {
	const tU = c.W('s7', 'understand') - 0.2;
	const beyond = prog(t, tU, 0.7, IN_OUT);
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.35}} />
			<div style={{position: 'absolute', left: 120, right: 120, top: 120}}>
				{t < tU ? <Line t={t} text="VibeLevel evaluates candidates across four dimensions" at={0} times={say('s7', 'VibeLevel evaluates candidates across four dimensions')} size={72} weight={400} hl={['four']} out={tU - 0.3} /> : <Line t={t} text="Understand what they bring beyond the final output." at={0} times={say('s7', 'understand what they bring beyond the final output.')} size={72} weight={400} it={['beyond']} />}
			</div>
			<div style={{position: 'absolute', left: 960 - 470, top: 330, width: 940, height: 600, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 24, transform: `scale(${mix(1, 0.92, beyond)})`}}>
				{DIMS.map(([l, w], i) => {
					const at = c.W('s7', w) - 0.15;
					const p = prog(t, at, 0.5);
					const appear = prog(t, c.P('s7') + 0.2 + i * 0.12, 0.6);
					return (
						<div key={l} style={{borderRadius: 18, border: p > 0.5 ? 'none' : '2px dashed #3A3E45', background: p > 0.5 ? 'rgba(0,215,107,0.12)' : 'transparent', boxShadow: p > 0.5 ? `inset 0 0 0 2px ${K.green}` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: appear, transform: `scale(${mix(0.94, 1, appear) * (1 + 0.04 * Math.sin(Math.PI * p))})`, fontFamily: sans, fontSize: 46, color: p > 0.5 ? K.text : '#5C616B'}}>
							{l}
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

// ─── Scene 8 — AI-led interview (v3 visuals) ─────────────────────────────────
const Scene8: React.FC<S> = ({t, c, a, say}) => {
	const P = c.P('s8');
	const enter = prog(t, a, 0.8);
	const q = "Walk me through how you verified the agent's output before you submitted.";
	const typed = q.slice(0, Math.round(q.length * prog(t, P + 0.4, 1.8, Easing.linear)));
	const speaking = t > P + 2.4;
	const chips = [c.W('s8', 'thinking'), c.W('s8', 'reasoning')];
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.3}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: sans, fontWeight: 400, fontSize: 60, letterSpacing: '-0.02em', color: K.text, opacity: enter}}>
				<span style={{color: K.green}}>AI-led</span> interview
			</div>
			<div style={{position: 'absolute', left: 210, top: 210, width: 1500, height: 690, borderRadius: 16, background: K.bg2, boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7), 0 0 0 1px #2A2D33', overflow: 'hidden', opacity: Math.min(1, enter * 1.4), transform: `translateY(${(1 - enter) * 60}px)`}}>
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: `1px solid ${K.line}`, fontFamily: sans}}>
					<span style={{fontSize: 22, color: K.dim}}>AI-led interview</span>
					<span style={{fontSize: 20, color: K.dim}}>Question 2 of 4</span>
				</div>
				<div style={{display: 'flex', height: 600}}>
					<div style={{flex: 1, padding: 40, borderRight: `1px solid ${K.line}`}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
							<div style={{position: 'relative', width: 72, height: 72}}>
								{Array.from({length: 16}, (_, i) => {
									const ang = (i / 16) * Math.PI * 2 + t * 0.6;
									const rr = 26 + (speaking ? 0 : Math.sin(t * 6 + i) * 5);
									return <div key={i} style={{position: 'absolute', left: 36 + Math.cos(ang) * rr - 5, top: 36 + Math.sin(ang) * rr - 5, width: 10, height: 10, background: i % 3 ? K.green : '#9EF5C4', opacity: 0.85}} />;
								})}
							</div>
							<div style={{fontFamily: sans}}>
								<div style={{fontSize: 26, color: K.text, fontWeight: 500}}>AI interviewer</div>
								<div style={{fontSize: 20, color: K.dim}}>{speaking ? 'Listening…' : 'Asking'}</div>
							</div>
						</div>
						<div style={{fontFamily: sans, fontWeight: 300, fontSize: 42, lineHeight: 1.32, color: K.text, marginTop: 44, minHeight: 170}}>
							{typed}
							{typed.length < q.length ? <span style={{color: K.green}}>▍</span> : null}
						</div>
						<div style={{display: 'flex', gap: 14, marginTop: 40}}>
							{['Thinking', 'Reasoning'].map((l, i) => (
								<Chip key={l} p={prog(t, chips[i] - 0.15, 0.5)} size={32} dark={i !== chips.filter((x) => t >= x - 0.15).length - 1}>
									{l}
								</Chip>
							))}
						</div>
					</div>
					<div style={{width: 560, padding: 32, display: 'flex', flexDirection: 'column'}}>
						<div style={{position: 'relative', height: 380, borderRadius: 12, background: '#121317', overflow: 'hidden'}}>
							<div style={{position: 'absolute', left: 140, top: 60, transform: 'scale(0.62)', transformOrigin: 'left top'}}>
								<PixelPerson t={t} p={1} x={0} y={0} cell={20} />
							</div>
							<div style={{position: 'absolute', left: 16, bottom: 14, fontFamily: sans, fontSize: 18, color: K.text, background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: 6}}>Candidate</div>
						</div>
						<div style={{display: 'flex', alignItems: 'center', gap: 6, height: 120, marginTop: 30}}>
							{Array.from({length: 40}, (_, i) => {
								const h = speaking ? 12 + Math.abs(Math.sin(t * 9 + i * 0.7) * Math.sin(t * 3.3 + i * 0.2)) * 80 : 6;
								return <div key={i} style={{width: 7, height: h, borderRadius: 4, background: i % 5 === 0 ? '#9EF5C4' : K.green, opacity: 0.85}} />;
							})}
						</div>
					</div>
				</div>
			</div>
			<div style={{position: 'absolute', left: 210, top: 915, fontFamily: sans, fontSize: 18, color: '#5C616B', opacity: enter}}>Illustrative interface</div>
		</AbsoluteFill>
	);
};

// ─── Scene 9 — closing + end card ────────────────────────────────────────────
const Scene9: React.FC<S> = ({t, c, a, end, say}) => {
	const toEnd = prog(t, end - 0.3, 0.8, IN_OUT);
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.5}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: mix(300, 200, toEnd), display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<LogoLockup t={t} at={Math.max(a + 0.4, c.W('s9', 'vibe') - 0.4)} scrAt={c.W('s9', 'screening')} h={124} />
				<div style={{marginTop: 54, opacity: 1 - prog(t, end - 0.55, 0.35)}}>
					<Line t={t} text="Understand the person behind the performance." at={0} times={say('s9', 'understand the person behind the performance.')} size={60} weight={400} it={['person']} />
				</div>
			</div>
			{toEnd > 0 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: toEnd}}>
					<div style={{marginTop: 70, padding: '24px 54px', borderRadius: 999, background: K.green, color: K.ink, fontFamily: sans, fontWeight: 600, fontSize: 36, display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${prog(t, end + 0.6, 0.6, Easing.bezier(0.34, 1.4, 0.64, 1))})`, boxShadow: '0 20px 50px -12px rgba(0,215,107,0.45)'}}>
						Book a Demo
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={K.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
							<path d="M5 12h14M13 6l6 6-6 6" />
						</svg>
					</div>
					<div style={{fontFamily: sans, fontSize: 26, color: K.dim, marginTop: 26, opacity: prog(t, end + 1.0, 0.6)}}>vibelevel.ai</div>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ─── film ────────────────────────────────────────────────────────────────────
export const VibeLevelDemo4: React.FC<Demo4Props> = (p) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	if (!p.parts.length) return <AbsoluteFill style={{background: K.bg}} />;
	const c = makeCue(p.parts);
	const say = makeSay(p.parts);
	const cut = (id: string) => c.P(id) - 0.3;
	const end = c.E('s9') + 0.1;
	const ids = ['s1', 's2', 's3', 's4', 's6', 's5', 's7', 's8', 's9']; // Review Session follows the report
	const SC = [Scene1, Scene2, Scene3, Scene4, Scene6, Scene5, Scene7, Scene8, Scene9];
	const starts = ids.map((id, i) => (i === 0 ? 0 : cut(id)));
	// transitions vary: pixel wipe into the reveal moments, a soft cross-dissolve elsewhere
	const WIPE = new Set(ids.slice(1)); // pixel transition on every scene change
	const XF = 0.45;
	const wipe = ids.filter((id) => WIPE.has(id)).map(cut).map((x) => (t > x - 0.45 && t < x + 0.45 ? (t - (x - 0.45)) / 0.45 : null)).find((v) => v !== null);
	const corner = (t > 0.4 ? 1 : 0) * (1 - life(t, cut('s3') - 0.2, cut('s4') + 0.3, 0.3, 0.3)) * (1 - prog(t, cut('s9') - 0.2, 0.3));
	return (
		<AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
			{SC.map((Sc, i) => {
				const a = starts[i];
				const b = i < SC.length - 1 ? starts[i + 1] : p.duration + 1;
				const soft = i > 0 && !WIPE.has(ids[i]);
				const from = soft ? a - XF : a;
				const until = i < SC.length - 1 && !WIPE.has(ids[i + 1]) ? b + 0.01 : b;
				if (t < from || t >= until + (i < SC.length - 1 && !WIPE.has(ids[i + 1]) ? 0 : 0)) return null;
				const o = soft ? prog(t, a - XF, XF, Easing.linear) : 1;
				return (
					<AbsoluteFill key={i} style={{opacity: o}}>
						<Sc t={t} c={c} a={a} end={end} say={say} />
					</AbsoluteFill>
				);
			})}
			{wipe !== null && wipe !== undefined ? <Pixels t={t} w={1920} h={1080} cell={30} mode={{kind: 'wipe', p: wipe}} /> : null}
			<Corner o={Math.max(0, corner)} />
			{/* subtitles only on the product screens, whose titles don't repeat the spoken line */}
			{(() => {
				const cap = p.parts.filter((x) => ['s4', 's6', 's5', 's8'].includes(x.id));
				const on = cap.find((x) => t >= x.start - 0.1 && t <= x.end + 0.4);
				return on ? <Captions t={t} words={on.words} light={on.id === 's4'} /> : null;
			})()}
			<Sound p={p} c={c} cuts={ids.slice(1).map(cut)} wipes={ids.filter((id) => WIPE.has(id)).map(cut)} end={end} />
		</AbsoluteFill>
	);
};

// ─── sound: V8's Deep Urban under the v3 voice ───────────────────────────────
const LEVEL = {voice: 0.09 * 0.66, gap: 0.16 * 0.66, end: 0.3 * 0.66}; // Deep Urban is ~3.7 dB louder than v3's track
const Sound: React.FC<{p: Demo4Props; c: Cue; cuts: number[]; wipes: number[]; end: number}> = ({p, c, cuts, wipes, end}) => {
	const {fps} = useVideoConfig();
	const voEnd = p.parts[p.parts.length - 1].end;
	const speech = (t: number) => Math.max(0, ...p.segments.map((g) => prog(t, g.s - 0.25, 0.25, Easing.linear) * (1 - prog(t, g.e, 0.4, Easing.linear))));
	const sfx: [number, string, number][] = [
		...wipes.map((x, i): [number, string, number] => [x - 0.4, i % 2 ? 'pixel-2' : 'pixel-1', 0.2]),
		...cuts.filter((x) => !wipes.includes(x)).map((x): [number, string, number] => [x - 0.45, 'soft-swoosh', 0.1]),
		...['applicants', 'to', 'top'].map((w): [number, string, number] => [c.W('s1', w), 'ui-tap', 0.12]),
		[c.W('s1', 'five') + 0.5, 'confirm-chime', 0.14],
		...['conversations', 'code', 'decisions', 'contributions'].map((w): [number, string, number] => [c.W('s2', w) - 0.15, 'ui-tap', 0.12]),
		[c.W('s3', 'vibe') - 0.45, 'logo-reveal', 0.18],
		...['performance', 'collaboration', 'code', 'video', 'interview'].map((w): [number, string, number] => [c.W('s4', w) - 0.2, 'ui-tap', 0.12]),
		[c.W('s5', 'clodcode') + 0.05, 'soft-click', 0.28],
		...['conversations', 'code', 'outputs', 'well', 'short', 'evidence'].map((w): [number, string, number] => [c.W('s6', w) - 0.3, 'ui-tap', 0.13]),
		...['core', 'working', 'ownership', 'human'].map((w): [number, string, number] => [c.W('s7', w) - 0.15, 'ui-tap', 0.13]),
		[c.W('s9', 'vibe') - 0.4, 'logo-reveal', 0.18],
		[end + 0.6, 'confirm-chime', 0.12],
	];
	return (
		<>
			<Audio src={staticFile('vl2/narration-v4.wav')} />
			<Audio
				src={staticFile('vl2/music-v4.mp3')}
				startFrom={Math.round(p.musicOffset * fps)}
				volume={(f) => {
					const t = f / fps;
					const lv = t > voEnd ? mix(LEVEL.gap, LEVEL.end, prog(t, voEnd, 1, Easing.linear)) : mix(LEVEL.gap, LEVEL.voice, speech(t));
					return lv * prog(t, 0, 0.6, Easing.linear) * (1 - prog(t, p.duration - 2, 2, Easing.linear));
				}}
			/>
			{sfx.map(([at, name, v], i) => (
				<Sfx key={i} at={at} name={name} v={v * 1.4} dir="vl2" />
			))}
		</>
	);
};
