// Motion-design scenes: hook, challenge, animated logo, four-pillar grid, outcome, end card.
import React from 'react';
import {AbsoluteFill, Img, spring, staticFile, useVideoConfig} from 'remotion';
import {fonts, palette} from './brand';
import type {SceneCtx} from './context';
import {AI_WIDTH, AiSuffix, BrandLogo} from './Logo';
import {mix, prog, window01} from './motion';

const H: React.CSSProperties = {fontFamily: fonts.heading, fontWeight: 800, letterSpacing: '-0.022em', lineHeight: 0.95, margin: 0};

// ─── Scene 1: hook ───────────────────────────────────────────────────────────
const HOOK_LINES = [
	{label: 'When AI can', text: 'WHEN AI CAN'},
	{label: 'write the code', text: 'WRITE THE CODE,'},
	{label: 'build the solution', text: 'BUILD THE SOLUTION,'},
	{label: 'do the work', text: 'DO THE WORK,'},
];

export const Hook: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const {t, scene, img, beat} = ctx;
	const q = beat('What are you really hiring for?');
	const r = img('recruiter');
	// The supplied portrait is already composed (subject right, navy fade left): slow push only.
	const push = mix(1.0, 1.05, prog(t, scene.start, scene.end - scene.start));
	const clear = prog(t, q - 0.15, 0.35);
	const whipAt = scene.end - 0.6;
	return (
		<AbsoluteFill style={{background: palette.dark, overflow: 'hidden'}}>
			<Img src={staticFile(r.src)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '70% 35%', transform: `scale(${push})`, transformOrigin: '72% 40%'}} />
			<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,12,8,0.80) 0%, rgba(5,12,8,0.45) 38%, rgba(5,12,8,0) 58%)'}} />
			{/* Stacked beats: each lands with a zoom-out settle, earlier ones recede. */}
			<div style={{position: 'absolute', left: 110, top: 300, width: 1100, opacity: 1 - clear, transform: `scale(${1 - 0.08 * clear})`, transformOrigin: 'left center'}}>
				{HOOK_LINES.map((l, i) => {
					const at = beat(l.label);
					const p = prog(t, at - 0.05, 0.45);
					const next = HOOK_LINES[i + 1] ? beat(HOOK_LINES[i + 1].label) : q;
					const dim = prog(t, next - 0.05, 0.3);
					return (
						<h1 key={l.text} style={{...H, fontSize: 92, color: '#fff', marginBottom: 20, opacity: p * mix(1, 0.42, dim), transform: `scale(${mix(1.35, 1, p)})`, transformOrigin: 'left center', filter: `blur(${(1 - p) * 8}px)`, whiteSpace: 'nowrap', textShadow: '0 4px 30px rgba(5,12,8,0.5)'}}>
							{l.text}
						</h1>
					);
				})}
			</div>
			{/* The question: strongest typographic beat. */}
			<div style={{position: 'absolute', left: 110, top: 270, width: 1150}}>
				{['WHAT ARE YOU', 'REALLY', 'HIRING FOR?'].map((line, i) => {
					const p = prog(t, q + i * 0.18, 0.5);
					return (
						<h1 key={line} style={{...H, fontSize: i === 2 ? 160 : 136, color: i === 2 ? palette.neon : '#fff', opacity: p, transform: `scale(${mix(1.45, 1, p)})`, transformOrigin: 'left center', filter: `blur(${(1 - p) * 10}px)`, marginBottom: 10, whiteSpace: 'nowrap', textShadow: '0 6px 40px rgba(5,12,8,0.55)'}}>
							{line}
						</h1>
					);
				})}
			</div>
			<BrandLogo h={40} star={img('logo-star')} word={img('logo-word')} style={{position: 'absolute', right: 110, top: 46, opacity: prog(t, scene.start + 0.2, 0.5)}} />
			<Whip t={t} from={whipAt} to={scene.end + 0.4} word="HIRING FOR?" />
		</AbsoluteFill>
	);
};

/** Repeated word scrolling fast with motion blur over the dark brand colour (scene bridge). */
const Whip: React.FC<{t: number; from: number; to: number; word: string}> = ({t, from, to, word}) => {
	if (t < from) return null;
	const p = prog(t, from, to - from);
	const bg = prog(t, from, 0.25);
	return (
		<AbsoluteFill style={{background: `rgba(5,12,8,${bg})`, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: mix(1080, -1900, p), filter: `blur(${4 + 10 * Math.sin(Math.PI * p)}px)`, textAlign: 'center'}}>
				{Array.from({length: 9}).map((_, i) => (
					<div key={i} style={{...H, fontSize: 230, color: i % 2 ? palette.neon : '#fff', opacity: 0.9, lineHeight: 1.05}}>
						{word}
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};

// ─── Scene 2: the challenge ──────────────────────────────────────────────────
// One calm, cumulative flow: each step joins the row on its word and stays visible
// (earlier steps dim), so nothing swaps out faster than the voiceover.
const STEPS = [
	{label: 'Writing prompts', title: 'Prompting'},
	{label: 'Knowing what to build', title: 'Problem-solving'},
	{label: 'how to guide AI', title: 'Guiding AI'},
	{label: 'whether the result actually works', title: 'Validating'},
];
const STEP = {w: 380, h: 430, gap: 56, y: 300};

const StepCard: React.FC<{i: number; title: string; on: number; active: boolean; children: React.ReactNode}> = ({i, title, on, active, children}) => {
	const x = (1920 - (4 * STEP.w + 3 * STEP.gap)) / 2 + i * (STEP.w + STEP.gap);
	return (
		<>
			{i > 0 ? (
				<div style={{position: 'absolute', left: x - STEP.gap + 8, top: STEP.y + STEP.h / 2 - 30, width: STEP.gap - 16, textAlign: 'center', fontFamily: fonts.heading, fontSize: 44, color: palette.neon, opacity: on}}>→</div>
			) : null}
			<div
				style={{
					position: 'absolute',
					left: x,
					top: STEP.y,
					width: STEP.w,
					height: STEP.h,
					borderRadius: 26,
					background: palette.darkCard,
					border: `2px solid ${active ? palette.neon : 'rgba(255,255,255,0.10)'}`,
					boxShadow: active ? '0 0 60px rgba(0,230,118,0.20)' : '0 24px 60px rgba(0,0,0,0.35)',
					opacity: on * (active ? 1 : 0.62),
					transform: `translateY(${(1 - on) * 60}px) scale(${mix(0.94, 1, on)})`,
					padding: '34px 30px',
					color: '#fff',
					fontFamily: fonts.subtitle,
				}}
			>
				<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 20, letterSpacing: 3, color: active ? palette.neon : 'rgba(255,255,255,0.5)'}}>STEP 0{i + 1}</div>
				<div style={{...H, fontSize: 40, marginTop: 10, marginBottom: 30, letterSpacing: '-0.02em'}}>{title}</div>
				{children}
			</div>
		</>
	);
};

const Chip: React.FC<{text: string; o: number; lit?: boolean; style?: React.CSSProperties}> = ({text, o, lit, style}) => (
	<div style={{borderRadius: 14, padding: '14px 18px', background: lit ? 'rgba(0,230,118,0.16)' : 'rgba(255,255,255,0.06)', border: `2px solid ${lit ? palette.neon : 'rgba(255,255,255,0.12)'}`, fontSize: 26, fontWeight: 700, opacity: o, transform: `translateY(${(1 - o) * 14}px)`, ...style}}>
		{text}
	</div>
);

export const Challenge: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const {t, beat} = ctx;
	const at = STEPS.map((s) => beat(s.label));
	const triad = beat('technical skills');
	const exit = prog(t, triad - 1.0, 0.7); // row steps back before the triad
	const active = at.filter((x) => t >= x - 0.15).length - 1;
	const prompt = 'Build me a booking API.';
	const typed = Math.round(prompt.length * prog(t, at[0] + 0.15, 1.2));
	const step = (i: number) => prog(t, at[i] - 0.15, 0.7);
	// Keep the visible steps centred: the row glides left as each new step joins.
	const shown = [0, 1, 2, 3].reduce((n, i) => n + prog(t, at[i] - 0.15, 0.9), 0);
	const centre = ((4 - shown) * (STEP.w + STEP.gap)) / 2;
	return (
		<AbsoluteFill style={{background: `radial-gradient(1200px 700px at 50% 45%, #0B3A26 0%, ${palette.dark} 70%)`}}>
			<div style={{position: 'absolute', inset: 0, opacity: 1 - exit, transform: `translate(${centre}px, ${-90 * exit}px) scale(${1 - 0.08 * exit})`}}>
				<StepCard i={0} title={STEPS[0].title} on={step(0)} active={active === 0}>
					<div style={{borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.12)', padding: '18px 18px', fontSize: 27, fontWeight: 600, minHeight: 84}}>
						<span style={{color: palette.neon, marginRight: 10}}>›</span>
						{prompt.slice(0, typed)}
						<span style={{opacity: Math.floor(t * 2.5) % 2 ? 1 : 0, color: palette.neon}}>▍</span>
					</div>
				</StepCard>
				<StepCard i={1} title={STEPS[1].title} on={step(1)} active={active === 1}>
					<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
						{['Requirements', 'Data model', 'API design', 'Edge cases'].map((b, k) => (
							<Chip key={b} text={b} o={prog(t, at[1] + 0.1 + k * 0.22, 0.5)} style={{fontSize: 22, textAlign: 'center', padding: '22px 8px'}} />
						))}
					</div>
				</StepCard>
				<StepCard i={2} title={STEPS[2].title} on={step(2)} active={active === 2}>
					<div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
						{['Instruction', 'AI output', 'Human review'].map((c, k) => {
							const o = prog(t, at[2] + 0.1 + k * 0.25, 0.5);
							// Highlight walks the loop slowly once all three are in.
							const lit = t > at[2] + 0.9 && Math.floor((t - at[2] - 0.9) / 0.7) % 3 === k;
							return <Chip key={c} text={(k ? '↓  ' : '') + c} o={o} lit={lit} />;
						})}
					</div>
				</StepCard>
				<StepCard i={3} title={STEPS[3].title} on={step(3)} active={active === 3}>
					<div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
						{['Meets the requirement', 'Handles edge cases', 'Tests pass'].map((c, k) => {
							const p = prog(t, at[3] + 0.3 + k * 0.4, 0.35);
							return (
								<div key={c} style={{display: 'flex', alignItems: 'center', gap: 16, fontSize: 25, fontWeight: 600}}>
									<div style={{width: 40, height: 40, flex: 'none', borderRadius: 20, border: `3px solid ${p > 0.5 ? palette.neon : 'rgba(255,255,255,0.3)'}`, background: p > 0.5 ? 'rgba(0,230,118,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: palette.neon, fontSize: 24, transform: `scale(${mix(0.7, 1, p)})`}}>
										{p > 0.5 ? '✓' : ''}
									</div>
									{c}
								</div>
							);
						})}
					</div>
				</StepCard>
			</div>
			{/* Technical skills · Judgment · Ownership: each lights on its word. */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', opacity: prog(t, triad - 0.5, 0.5)}}>
				<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: 'rgba(255,255,255,0.6)', marginBottom: 34}}>REQUIRES REAL</div>
				<div style={{display: 'flex', justifyContent: 'center', gap: 60}}>
					{[
						['Technical skills', 'technical skills'],
						['Judgment', 'judgment'],
						['Ownership', 'ownership'],
					].map(([word, label]) => {
						const p = prog(t, beat(label) - 0.05, 0.35);
						return (
							<div key={word} style={{...H, fontSize: 104, color: p > 0.5 ? palette.neon : 'rgba(255,255,255,0.22)', transform: `scale(${mix(0.92, 1, p)})`}}>
								{word}
							</div>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ─── Animated logo (scene 3 reveal and end card) ─────────────────────────────
// The supplied logo is split into its star mark and wordmark (build.mjs) so each
// can move: the star spins in, the wordmark wipes on, a sheen passes over the logo
// itself (masked to its pixels), then "Screening" rises letter by letter.
// The background stays a clean solid colour: no lines or patterns behind the logo.
type ImgInfo = {src: string; w: number; h: number};

export const AnimatedLogo: React.FC<{t: number; at: number; width: number; star: ImgInfo; word: ImgInfo; sub?: string; subSize?: number}> = ({t, at, width, star, word, sub = 'Screening', subSize = 92}) => {
	const {fps} = useVideoConfig();
	const k = width / (star.w + word.w + AI_WIDTH); // all parts share the original logo's height
	const h = star.h * k;
	const f = Math.max(0, (t - at) * fps);
	const spin = spring({frame: f, fps, config: {damping: 11, stiffness: 110, mass: 0.9}});
	const wipe = prog(t, at + 0.3, 0.75);
	const sheen = prog(t, at + 1.05, 0.9);
	const subAt = at + 0.75;
	const logoMask = (src: string): React.CSSProperties => ({WebkitMaskImage: `url(${staticFile(src)})`, WebkitMaskSize: '100% 100%', maskImage: `url(${staticFile(src)})`, maskSize: '100% 100%'});
	const sheenBg = `linear-gradient(105deg, transparent ${mix(-40, 120, sheen) - 18}%, rgba(255,255,255,0.75) ${mix(-40, 120, sheen)}%, transparent ${mix(-40, 120, sheen) + 18}%)`;
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			<div style={{display: 'flex', height: h}}>
				<div style={{position: 'relative', width: star.w * k, height: h, opacity: Math.min(1, spin * 1.4), transform: `rotate(${mix(-140, 0, spin)}deg) scale(${mix(0.2, 1, spin)})`}}>
					<Img src={staticFile(star.src)} style={{width: '100%', height: '100%'}} />
					<div style={{position: 'absolute', inset: 0, background: sheenBg, ...logoMask(star.src)}} />
				</div>
				<div style={{position: 'relative', display: 'flex', width: (word.w + AI_WIDTH) * k, height: h, clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`, transform: `translateX(${(1 - wipe) * -24}px)`}}>
					<div style={{position: 'relative', width: word.w * k, height: h}}>
						<Img src={staticFile(word.src)} style={{width: '100%', height: '100%'}} />
						<div style={{position: 'absolute', inset: 0, background: sheenBg, ...logoMask(word.src)}} />
					</div>
					<AiSuffix h={h} word={word} />
				</div>
			</div>
			{sub ? (
				<div style={{...H, fontSize: subSize, color: '#fff', marginTop: subSize * 0.34, letterSpacing: '-0.02em', display: 'flex', transform: 'translateX(4px)' /* optical centring under the logo */}}>
					{sub.split('').map((ch, i) => {
						const p = prog(t, subAt + i * 0.045, 0.45);
						return (
							<span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 30}px)`, filter: `blur(${(1 - p) * 6}px)`}}>
								{ch}
							</span>
						);
					})}
				</div>
			) : null}
		</div>
	);
};

// ─── Scene 3a: logo reveal on a clean brand background ───────────────────────
export const LogoReveal: React.FC<{t: number; at: number; star: ImgInfo; word: ImgInfo}> = ({t, at, star, word}) => (
	<AbsoluteFill style={{background: palette.dark, alignItems: 'center', justifyContent: 'center'}}>
		<AnimatedLogo t={t} at={at - 0.2} width={900} star={star} word={word} />
	</AbsoluteFill>
);

// ─── Scene 3c: four dimensions, 2×2 grid ──────────────────────────────────────
const ICONS: Record<string, React.ReactNode> = {
	core: <path d="M22 18 L10 32 L22 46 M42 18 L54 32 L42 46 M36 12 L28 52" />,
	ai: (
		<>
			<rect x="16" y="16" width="32" height="32" rx="6" />
			<path d="M24 16 V9 M32 16 V9 M40 16 V9 M24 48 V55 M32 48 V55 M40 48 V55 M16 24 H9 M16 32 H9 M16 40 H9 M48 24 H55 M48 32 H55 M48 40 H55" />
			<path d="M23.5 39 L27.5 25 L31.5 39 M24.8 34.5 H30.2 M37 25 V39" />
		</>
	),
	own: (
		<>
			<path d="M32 6 L54 14 V32 C54 45 44 54 32 58 C20 54 10 45 10 32 V14 Z" />
			<path d="M22 32 L29 39 L43 25" />
		</>
	),
	human: (
		<>
			<circle cx="26" cy="22" r="9" />
			<path d="M10 54 C10 42 18 36 26 36 C34 36 42 42 42 54" />
			<path d="M50 24 V40 M42 32 H58" />
		</>
	),
};

const PILLARS = [
	{label: 'Core Skills', icon: 'core', line: 'Role-specific competencies'},
	{label: 'Working with AI', icon: 'ai', line: 'Guide, decide, verify'},
	{label: 'Ownership', icon: 'own', line: 'Understands what they built'},
	{label: 'Human Contribution', icon: 'human', line: 'Value beyond AI output'},
];

export const Quadrants: React.FC<{ctx: SceneCtx; from: number}> = ({ctx, from}) => {
	const {t, beat} = ctx;
	const title = prog(t, from, 0.5);
	const times = PILLARS.map((p) => beat(p.label));
	const active = times.filter((x) => t >= x - 0.05).length - 1;
	const allOn = t > times[3] + 0.9;
	return (
		<AbsoluteFill style={{background: palette.page}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 78, textAlign: 'center', opacity: title}}>
				<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: palette.green}}>VIBELEVEL SCREENING EVALUATES</div>
				<div style={{...H, fontSize: 76, color: palette.ink, marginTop: 14}}>Four dimensions</div>
			</div>
			{PILLARS.map((p, i) => {
				const on = prog(t, times[i] - 0.1, 0.45);
				const isActive = i === active && !allOn;
				const col = i % 2;
				const row = Math.floor(i / 2);
				return (
					<div
						key={p.label}
						style={{
							position: 'absolute',
							left: 200 + col * 780,
							top: 300 + row * 330,
							width: 740,
							height: 290,
							borderRadius: 28,
							background: isActive ? palette.green : '#fff',
							boxShadow: isActive ? '0 30px 70px rgba(10,123,59,0.35)' : '0 18px 50px rgba(5,12,8,0.10)',
							opacity: on * (active >= 0 && !isActive && !allOn ? 0.55 : 1),
							transform: `translateY(${(1 - on) * 40}px) scale(${mix(0.94, 1, on) * (isActive ? 1.03 : 1)})`,
							display: 'flex',
							alignItems: 'center',
							gap: 40,
							padding: '0 56px',
						}}
					>
						<svg width={110} height={110} viewBox="0 0 64 64" fill="none" stroke={isActive ? palette.neon : palette.green} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
							{ICONS[p.icon]}
						</svg>
						<div>
							<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: isActive ? 'rgba(255,255,255,0.7)' : palette.muted}}>0{i + 1}</div>
							<div style={{...H, fontWeight: 600, letterSpacing: '-0.015em', fontSize: 58, color: isActive ? '#fff' : palette.ink, marginTop: 8}}>{p.label}</div>
							<div style={{fontFamily: fonts.subtitle, fontWeight: 600, fontSize: 28, color: isActive ? 'rgba(255,255,255,0.85)' : palette.muted, marginTop: 12}}>{p.line}</div>
						</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

// ─── Scene 8: outcome ────────────────────────────────────────────────────────
// Scene 9 text is the voiceover itself. Each group shows on its first beat; a line with its own
// beat label appears when that phrase is spoken.
const OUTCOME: {label: string; size: number; lines: {text: string; accent?: boolean; at?: string}[]}[] = [
	{label: 'clearer view', size: 84, lines: [{text: 'With a clearer view of how'}, {text: 'candidates think, work, and use AI,', accent: true, at: 'think, work, and use AI'}]},
	{label: 'Identify strengths', size: 124, lines: [{text: 'you can identify strengths,'}, {text: 'uncover gaps,', accent: true, at: 'uncover gaps'}]},
	{label: 'Build a shortlist backed by evidence', size: 120, lines: [{text: 'and build a shortlist'}, {text: 'backed by evidence.', accent: true}]},
];

export const Outcome: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const {t, scene, img, beat} = ctx;
	const bg = img('office');
	const drift = prog(t, scene.start, scene.end - scene.start + 1);
	return (
		<AbsoluteFill style={{background: palette.dark, overflow: 'hidden'}}>
			<Img src={staticFile(bg.src)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.55) blur(3px) brightness(0.4)', transform: `scale(${mix(1.08, 1.14, drift)}) translateX(${mix(-20, 20, drift)}px)`}} />
			<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,12,8,0.78) 0%, rgba(5,12,8,0.3) 75%)'}} />
			{OUTCOME.map((o, i) => {
				const at = beat(o.label);
				const next = OUTCOME[i + 1] ? beat(OUTCOME[i + 1].label) : scene.end + 1;
				const vis = window01(t, at - 0.08, next + 0.05, 0.4, 0.3);
				if (vis <= 0) return null;
				const p = prog(t, at - 0.08, 0.55);
				return (
					<div key={o.label} style={{position: 'absolute', left: 140, top: 540, opacity: vis, transform: `translateY(-50%) scale(${mix(1.15, 1, p)})`, transformOrigin: 'left center', filter: `blur(${(1 - p) * 8}px)`}}>
						{o.lines.map((l) => {
							const lp = l.at ? prog(t, beat(l.at) - 0.08, 0.45) : 1;
							return (
								<div key={l.text} style={{...H, fontSize: o.size, color: l.accent ? palette.neon : '#fff', marginBottom: 14, whiteSpace: 'nowrap', opacity: lp, transform: `translateY(${(1 - lp) * 24}px)`}}>
									{l.text}
								</div>
							);
						})}
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

// ─── Scene 9: closing line ───────────────────────────────────────────────────
export const Close: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const {t, beat} = ctx;
	const l1 = prog(t, beat('When AI can do the work') - 0.1, 0.6);
	const l2 = prog(t, beat('know what makes a candidate stand out') - 0.1, 0.6);
	const roles = beat('developer and non-developer roles');
	const l3 = prog(t, roles - 0.1, 0.6);
	const pills = ['Developer roles', 'Non-developer roles'];
	return (
		<AbsoluteFill style={{background: `radial-gradient(1200px 700px at 50% 45%, #0B3A26 0%, ${palette.dark} 70%)`}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center'}}>
				<div style={{...H, fontSize: 82, color: '#fff', opacity: l1, transform: `translateY(${(1 - l1) * 24}px)`}}>When AI can do the work,</div>
				<div style={{...H, fontSize: 82, color: palette.neon, opacity: l2, marginTop: 22, transform: `translateY(${(1 - l2) * 24}px)`}}>know what makes a candidate stand out</div>
				<div style={{fontFamily: fonts.heading, fontWeight: 600, fontSize: 48, color: 'rgba(255,255,255,0.85)', marginTop: 46, opacity: l3, transform: `translateY(${(1 - l3) * 20}px)`}}>across developer and non-developer roles.</div>
				<div style={{display: 'flex', justifyContent: 'center', gap: 22, marginTop: 34}}>
					{pills.map((p, i) => {
						const o = prog(t, roles + 0.5 + i * 0.35, 0.45);
						return (
							<div key={p} style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 32, color: '#fff', padding: '14px 30px', borderRadius: 999, border: `2px solid ${palette.neon}`, background: 'rgba(0,230,118,0.10)', opacity: o, transform: `scale(${mix(0.85, 1, o)})`}}>
								{p}
							</div>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ─── Scene 10: animated logo + CTA ───────────────────────────────────────────
export const LogoCTA: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const {t, img, beat} = ctx;
	const lgAt = beat('VibeLevel Screening') - 0.3;
	const cta = prog(t, beat('Book a demo') - 0.1, 0.5);
	const ctaSheen = prog(t, beat('Book a demo') + 0.5, 0.8);
	return (
		<AbsoluteFill style={{background: palette.dark}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center'}}>
				<AnimatedLogo t={t} at={lgAt} width={900} star={img('logo-star')} word={img('logo-word')} subSize={80} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 720, display: 'flex', justifyContent: 'center', opacity: cta, transform: `scale(${mix(0.9, 1, cta)})`}}>
				<div style={{position: 'relative', overflow: 'hidden', background: palette.green, color: '#fff', fontFamily: fonts.heading, fontWeight: 700, fontSize: 48, padding: '26px 70px', borderRadius: 999, boxShadow: '0 20px 60px rgba(10,123,59,0.45)'}}>
					Book a demo
					<div style={{position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent ${mix(-40, 120, ctaSheen) - 15}%, rgba(255,255,255,0.35) ${mix(-40, 120, ctaSheen)}%, transparent ${mix(-40, 120, ctaSheen) + 15}%)`}} />
				</div>
			</div>
		</AbsoluteFill>
	);
};
