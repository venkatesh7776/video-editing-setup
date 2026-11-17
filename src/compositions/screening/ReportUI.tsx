// Brand-styled re-creations of report sections for scenes 6–7 (instead of raw
// screenshots, which clip at video size). Every label, score and level below is
// copied from the real shared report (vibelevel.ai/share/report/5kOev08_); only
// the presentation is ours. Descriptions are VibeLevel's own wording (report
// Appendix and the Hiring page's scoring section).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {fonts, palette} from './brand';
import type {SceneCtx} from './context';
import {mix, prog} from './motion';

const HEAD: React.CSSProperties = {fontFamily: fonts.heading, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.02, margin: 0, color: palette.ink};
const BODY: React.CSSProperties = {fontFamily: fonts.subtitle, color: palette.muted};

const Backdrop: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{background: `radial-gradient(1300px 760px at 12% 8%, #DDF3E5 0%, transparent 60%), radial-gradient(1100px 700px at 92% 100%, #E2F3EA 0%, transparent 55%), ${palette.page}`}}>{children}</AbsoluteFill>
);

const Eyebrow: React.FC<{text: string}> = ({text}) => (
	<div style={{fontFamily: fonts.heading, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: palette.green, textTransform: 'uppercase'}}>{text}</div>
);

/** Section heading at the top-left of a built scene. */
const Heading: React.FC<{t: number; at: number; eyebrow: string; title: string; sub?: string}> = ({t, at, eyebrow, title, sub}) => {
	const p = prog(t, at, 0.6);
	return (
		<div style={{position: 'absolute', left: 160, top: 92, opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>
			<Eyebrow text={eyebrow} />
			<h1 style={{...HEAD, fontSize: 68, marginTop: 10}}>{title}</h1>
			{sub ? <div style={{...BODY, fontSize: 28, fontWeight: 600, marginTop: 12}}>{sub}</div> : null}
		</div>
	);
};

const LEVEL_COLOR: Record<string, string> = {Novice: '#B42318', Developing: '#8A6D0A', Capable: palette.green, Advanced: '#1D4FD7'};

const LevelChip: React.FC<{level: string}> = ({level}) => (
	<span style={{fontFamily: fonts.subtitle, fontWeight: 700, fontSize: 24, color: LEVEL_COLOR[level]}}>{level}</span>
);

/** 0–10 bar that fills when it appears. */
const ScoreBar: React.FC<{score: number; p: number; width: number}> = ({score, p, width}) => (
	<div style={{width, height: 14, borderRadius: 7, background: '#E3E9E5', overflow: 'hidden'}}>
		<div style={{width: `${(score / 10) * 100 * p}%`, height: '100%', borderRadius: 7, background: `linear-gradient(90deg, ${palette.green}, #19B866)`}} />
	</div>
);

const Panel: React.FC<{style?: React.CSSProperties; lit?: number; children: React.ReactNode}> = ({style, lit = 0, children}) => (
	<div
		style={{
			position: 'absolute',
			borderRadius: 26,
			background: '#fff',
			border: `3px solid rgba(0,230,118,${0.9 * lit})`,
			boxShadow: `0 24px 60px rgba(5,12,8,0.10), 0 0 ${50 * lit}px rgba(0,230,118,${0.28 * lit})`,
			...style,
		}}
	>
		{children}
	</div>
);

const Tag: React.FC<{text: string; o: number}> = ({text, o}) => (
	<div style={{position: 'absolute', top: -26, right: 28, background: palette.dark, color: palette.neon, fontFamily: fonts.heading, fontWeight: 800, fontSize: 26, padding: '8px 22px', borderRadius: 999, opacity: o, transform: `scale(${mix(0.8, 1, o)})`, boxShadow: '0 10px 24px rgba(5,12,8,0.25)'}}>{text}</div>
);

// ─── Scene 6a: Core Skills ───────────────────────────────────────────────────
const SKILLS = ['Python', 'AI agents', 'Generative AI', 'LangChain', 'LLM integration', 'Separation of concerns', 'Testing'];
const COMPETENCIES = [
	{name: 'Product Thinking', weight: 15, score: 5.7, level: 'Developing'},
	{name: 'Requirements Completion', weight: 15, score: 4.0, level: 'Novice'},
	{name: 'Problem & Design Thinking', weight: 20, score: 3.5, level: 'Novice'},
	{name: 'Code Understanding', weight: 10, score: 4.0, level: 'Novice'},
	{name: 'Testing', weight: 10, score: 4.3, level: 'Developing'},
];

export const CoreSkillsUI: React.FC<{ctx: SceneCtx; from: number}> = ({ctx, from}) => {
	const {t, beat} = ctx;
	const comp = beat('role-specific competencies');
	const lit = prog(t, comp - 0.2, 0.4);
	return (
		<Backdrop>
			<Heading t={t} at={from} eyebrow="Core Skills" title="Role-specific competencies" />
			<Panel style={{left: 160, top: 250, width: 1600, height: 128}}>
				<div style={{display: 'flex', alignItems: 'center', height: '100%', padding: '0 30px', gap: 11}}>
					<div style={{...BODY, fontSize: 24, fontWeight: 700, color: palette.ink, whiteSpace: 'nowrap', marginRight: 10}}>
						Skills evidenced
						<div style={{fontSize: 20, fontWeight: 600, color: palette.green}}>7 of 7</div>
					</div>
					{SKILLS.map((s, i) => {
						const p = prog(t, from + 0.2 + i * 0.1, 0.4);
						return (
							<span key={s} style={{fontFamily: fonts.subtitle, fontWeight: 700, fontSize: 23, color: palette.green, padding: '0 8px', opacity: p, transform: `translateY(${(1 - p) * 14}px)`, whiteSpace: 'nowrap'}}>
								✓ {s}
							</span>
						);
					})}
				</div>
			</Panel>
			<Panel style={{left: 160, top: 404, width: 1600, height: 500, padding: '18px 40px'}} lit={lit}>
				{COMPETENCIES.map((c, i) => {
					const p = prog(t, from + 0.45 + i * 0.22, 0.5);
					const bar = prog(t, from + 0.65 + i * 0.22, 0.9);
					return (
						<div key={c.name} style={{display: 'flex', alignItems: 'center', height: 92, borderBottom: i < 4 ? '1.5px solid #EDF1EE' : 'none', opacity: p, transform: `translateX(${(1 - p) * -30}px)`}}>
							<div style={{flex: 1, fontFamily: fonts.heading, fontWeight: 600, fontSize: 34, color: palette.ink, letterSpacing: '-0.01em'}}>
								{c.name}
								<span style={{...BODY, fontSize: 22, fontWeight: 600, marginLeft: 14}}>{c.weight}%</span>
							</div>
							<LevelChip level={c.level} />
							<div style={{width: 40}} />
							<ScoreBar score={c.score} p={bar} width={360} />
							<div style={{width: 90, textAlign: 'right', fontFamily: fonts.heading, fontWeight: 600, fontSize: 38, color: palette.ink}}>{(c.score * Math.min(1, bar * 1.2)).toFixed(1)}</div>
						</div>
					);
				})}
			</Panel>
		</Backdrop>
	);
};

// ─── Scene 6b: Working with AI ───────────────────────────────────────────────
const WWAI = [
	{name: 'Plan & Decompose', line: 'Broke the problem down and chose an approach before reaching for the assistant.', score: 3.5, level: 'Novice', tag: 'Guide'},
	{name: 'Define Goals & Spec', line: 'Framed the task, context and constraints for the AI.', score: 6.0, level: 'Developing', tag: 'Guide'},
	{name: 'Build & Steer', line: 'Steered the assistant and corrected it as the work went on.', score: 6.4, level: 'Developing', tag: 'Evaluate'},
	{name: 'Verify & Iterate', line: 'Checked what came back and acted on what they found.', score: 4.1, level: 'Developing', tag: 'Verify'},
];

export const WorkingWithAIUI: React.FC<{ctx: SceneCtx; from: number}> = ({ctx, from}) => {
	const {t, beat} = ctx;
	const tagAt: Record<string, number> = {Guide: beat('guide AI'), Evaluate: beat('evaluate its suggestions'), Verify: beat('verify its output')};
	const order = ['Guide', 'Evaluate', 'Verify'];
	const current = order.filter((k) => t >= tagAt[k] - 0.1).at(-1);
	return (
		<Backdrop>
			<Heading t={t} at={from} eyebrow="Working with AI" title="How they direct the assistant" sub="Not who typed the code" />
			{WWAI.map((w, i) => {
				const col = i % 2;
				const row = Math.floor(i / 2);
				const p = prog(t, from + 0.4 + i * 0.2, 0.55);
				const bar = prog(t, from + 0.7 + i * 0.2, 0.9);
				const on = current === w.tag ? prog(t, tagAt[w.tag] - 0.1, 0.35) : 0;
				const shown = prog(t, tagAt[w.tag] - 0.1, 0.35);
				return (
					<Panel key={w.name} lit={on} style={{left: 160 + col * 816, top: 330 + row * 300, width: 784, height: 268, padding: '30px 38px', opacity: p * (current && !on ? 0.6 : 1), transform: `translateY(${(1 - p) * 40}px) scale(${1 + 0.02 * on})`}}>
						<Tag text={w.tag} o={shown} />
						<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
							<div style={{fontFamily: fonts.heading, fontWeight: 600, fontSize: 40, color: palette.ink, letterSpacing: '-0.01em'}}>{w.name}</div>
							<LevelChip level={w.level} />
						</div>
						<div style={{...BODY, fontSize: 26, fontWeight: 600, lineHeight: 1.35, marginTop: 14, height: 72}}>{w.line}</div>
						<div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 22}}>
							<ScoreBar score={w.score} p={bar} width={560} />
							<div style={{fontFamily: fonts.heading, fontWeight: 600, fontSize: 38, color: palette.ink}}>{(w.score * Math.min(1, bar * 1.2)).toFixed(1)}</div>
						</div>
					</Panel>
				);
			})}
		</Backdrop>
	);
};

// ─── Scene 7a: Ownership & Human Contribution ────────────────────────────────
const QUESTIONS = ['Code understanding', 'Code understanding', 'Testing', 'Problem & design thinking'];
const LADDER = [
	{name: 'Passive Delegator', range: '0–3'},
	{name: 'Balanced Builder', range: '3–5'},
	{name: 'Active Contributor', range: '5–7'},
	{name: 'AI Steerer', range: '7–10'},
];
const EVIDENCE = ['2 independent decisions', '3 specifications', '3+ critical evaluations'];

export const OwnershipHCUI: React.FC<{ctx: SceneCtx; from: number}> = ({ctx, from}) => {
	const {t, beat} = ctx;
	const own = beat('Ownership');
	const hc = beat('Human Contribution');
	const resp = beat('responsibility');
	const value = beat('value beyond AI output');
	const left = prog(t, own - 0.2, 0.55);
	const right = prog(t, hc - 0.1, 0.55);
	const litL = prog(t, resp - 0.2, 0.4) * (1 - prog(t, value - 0.2, 0.4));
	const litR = prog(t, value - 0.2, 0.4);
	const marker = prog(t, value + 0.2, 1.3); // slides to 7.1 on "the value they bring"
	const score = 7.1;
	return (
		<Backdrop>
			{/* Ownership */}
			<Panel lit={litL} style={{left: 160, top: 120, width: 784, height: 720, padding: '44px 46px', opacity: left, transform: `translateY(${(1 - left) * 40}px)`}}>
				<Eyebrow text="Ownership" />
				<h2 style={{...HEAD, fontWeight: 600, letterSpacing: '-0.015em', fontSize: 52, marginTop: 12}}>Do they understand what they built?</h2>
				<div style={{...BODY, fontSize: 25, fontWeight: 600, marginTop: 16, lineHeight: 1.4}}>Checked through several signals, with the Video Q&A as the main check.</div>
				<div style={{marginTop: 34, borderRadius: 18, background: palette.page, padding: '22px 26px'}}>
					<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
						<div style={{fontFamily: fonts.heading, fontWeight: 600, fontSize: 28, color: palette.ink}}>Video Q&A · Understanding check</div>
						<div style={{fontFamily: fonts.subtitle, fontWeight: 700, fontSize: 22, color: palette.green}}>4 of 4 answered</div>
					</div>
					{QUESTIONS.map((q, i) => {
						const p = prog(t, resp + i * 0.3, 0.35);
						return (
							<div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '11px 0', borderTop: i ? '1.5px solid #E3E9E5' : 'none'}}>
								<div style={{width: 36, height: 36, flex: 'none', borderRadius: 18, border: `3px solid ${p > 0.5 ? palette.green : '#C9D2CC'}`, background: p > 0.5 ? palette.surface : 'transparent', color: palette.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, transform: `scale(${mix(0.75, 1, p)})`}}>
									{p > 0.5 ? '✓' : ''}
								</div>
								<div style={{fontFamily: fonts.subtitle, fontWeight: 700, fontSize: 24, color: palette.ink}}>
									Question {i + 1} <span style={{color: palette.muted, fontWeight: 600}}>· {q}</span>
								</div>
							</div>
						);
					})}
				</div>
			</Panel>
			{/* Human Contribution */}
			<Panel lit={litR} style={{left: 976, top: 120, width: 784, height: 720, padding: '44px 46px', opacity: right, transform: `translateY(${(1 - right) * 40}px)`}}>
				<Eyebrow text="Human Contribution" />
				<h2 style={{...HEAD, fontWeight: 600, letterSpacing: '-0.015em', fontSize: 52, marginTop: 12}}>What did they add beyond the AI?</h2>
				<div style={{...BODY, fontSize: 25, fontWeight: 600, marginTop: 16, lineHeight: 1.4}}>The direction, judgement and ideas that came from them, not the model.</div>
				{/* Contribution ladder with the candidate's position. */}
				<div style={{position: 'relative', marginTop: 46, height: 150}}>
					<div style={{display: 'flex', gap: 8}}>
						{LADDER.map((l, i) => {
							const reached = marker > 0.95 && i === 3;
							return (
								<div key={l.name} style={{flex: 1, height: 22, borderRadius: 11, background: reached ? palette.green : i === 3 ? '#BFE8CF' : '#E3E9E5'}} />
							);
						})}
					</div>
					<div style={{display: 'flex', gap: 8, marginTop: 14}}>
						{LADDER.map((l, i) => (
							<div key={l.name} style={{flex: 1, fontFamily: fonts.subtitle, fontWeight: 700, fontSize: 22, color: i === 3 ? palette.green : palette.muted, lineHeight: 1.25}}>
								{l.name}
								<div style={{fontWeight: 600, color: palette.muted}}>{l.range}</div>
							</div>
						))}
					</div>
					{/* Marker: 0–10 maps across the ladder. */}
					<div style={{position: 'absolute', top: -46, left: `calc(${(mix(0, score, marker) / 10) * 100}% - 34px)`, opacity: prog(t, value, 0.3)}}>
						<div style={{background: palette.dark, color: palette.neon, fontFamily: fonts.heading, fontWeight: 800, fontSize: 24, padding: '4px 0', width: 68, textAlign: 'center', borderRadius: 10}}>{mix(0, score, marker).toFixed(1)}</div>
						<div style={{width: 3, height: 26, background: palette.dark, margin: '0 auto'}} />
					</div>
				</div>
				<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 40, color: palette.green, marginTop: 8, opacity: prog(t, value + 1.2, 0.4)}}>AI Steerer</div>
				<div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 22}}>
					{EVIDENCE.map((e, i) => {
						const p = prog(t, value + 1.4 + i * 0.3, 0.4);
						return (
							<span key={e} style={{fontFamily: fonts.subtitle, fontWeight: 700, fontSize: 26, color: palette.ink, opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>
								<span style={{color: palette.green, marginRight: 10}}>✓</span>
								{e}
							</span>
						);
					})}
				</div>
			</Panel>
		</Backdrop>
	);
};

// ─── Scene 6: Ownership & Human Contribution (opens on the spoken line, then the two panels) ─
export const OwnershipScene: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const {t, scene, beat} = ctx;
	const own = beat('Ownership');
	const lineIn = prog(t, scene.start + 0.05, 0.5);
	const lineOut = prog(t, own - 0.45, 0.35);
	return (
		<Backdrop>
			{t < own + 0.2 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 390, textAlign: 'center', opacity: lineIn * (1 - lineOut), transform: `translateY(${(1 - lineIn) * 30 - lineOut * 30}px)`}}>
					<div style={{...HEAD, fontSize: 84}}>But technical ability is only</div>
					<div style={{...HEAD, fontSize: 84, color: palette.green, marginTop: 10}}>part of the picture.</div>
				</div>
			) : null}
			{t >= own - 0.4 ? <OwnershipHCUI ctx={ctx} from={own} /> : null}
		</Backdrop>
	);
};
