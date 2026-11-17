// Scene 1 (v7): "The Problem". One continuous illustrated sequence in three beats:
// resume → interview → real work (task card). The on-screen text is the voiceover itself, revealed
// phrase by phrase as it is spoken (no subtitles in this scene), climaxing on "WHEN THE WORK GETS REAL."
// Minimal vector illustration only (no photos); the task card is shared with scene 2,
// which picks it up at the same position and turns it into the real product UI.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {fonts, palette} from './brand';
import type {SceneCtx} from './context';
import {mix, prog} from './motion';

const INK = '#0B1A12'; // card surface on the green-black backdrop
const LINE = 'rgba(255,255,255,0.10)';
const BAR = 'rgba(255,255,255,0.16)';
const H: React.CSSProperties = {fontFamily: fonts.heading, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 0.98, margin: 0, color: '#fff'};

/** Where the task card sits at the end of scene 1 (scene 2 starts from the same rect). */
export const TASK_RECT = {x: 530, y: 372, w: 860, h: 520};

const Bar: React.FC<{w: number | string; o?: number; h?: number; c?: string; style?: React.CSSProperties}> = ({w, o = 1, h = 12, c = BAR, style}) => (
	<div style={{width: w, height: h, borderRadius: h / 2, background: c, opacity: o, transformOrigin: 'left center', transform: `scaleX(${o})`, ...style}} />
);

const Card: React.FC<{style: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
	<div
		style={{
			position: 'absolute',
			borderRadius: 28,
			background: 'linear-gradient(160deg, rgba(22,48,34,0.96) 0%, rgba(9,22,15,0.97) 55%, rgba(6,15,10,0.98) 100%)',
			border: '1.5px solid rgba(110,231,183,0.18)',
			boxShadow: '0 50px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.10)',
			overflow: 'hidden',
			...style,
		}}
	>
		{children}
	</div>
);

/** Geometric person icon (head + shoulders), not a likeness. */
const Avatar: React.FC<{size: number; tint: string}> = ({size, tint}) => (
	<div style={{width: size, height: size, borderRadius: size / 2, background: `${tint}26`, border: `2px solid ${tint}66`, position: 'relative', overflow: 'hidden', flex: 'none'}}>
		<div style={{position: 'absolute', left: '50%', top: size * 0.2, width: size * 0.36, height: size * 0.36, marginLeft: -size * 0.18, borderRadius: '50%', background: tint}} />
		<div style={{position: 'absolute', left: '50%', top: size * 0.62, width: size * 0.7, height: size * 0.6, marginLeft: -size * 0.35, borderRadius: '50% 50% 0 0', background: tint}} />
	</div>
);

const Label: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => (
	<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 18, letterSpacing: 3, color: 'rgba(255,255,255,0.45)', ...style}}>{text}</div>
);

// ─── Beat 1: resume ──────────────────────────────────────────────────────────
const Resume: React.FC<{t: number; at: number}> = ({t, at}) => {
	const s = (i: number) => prog(t, at + 0.15 + i * 0.16, 0.45);
	return (
		<div style={{padding: '34px 36px'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: s(0)}}>
				<Avatar size={78} tint={palette.neon} />
				<div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
					<Bar w={210} h={16} c="rgba(255,255,255,0.75)" o={s(0)} />
					<Bar w={150} o={s(0)} />
				</div>
			</div>
			<Label text="EXPERIENCE" style={{marginTop: 36, opacity: s(1)}} />
			{[0, 1, 2].map((k) => (
				<div key={k} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, opacity: s(1 + k * 0.5)}}>
					<div style={{width: 12, height: 12, borderRadius: 6, background: palette.neon}} />
					<Bar w={[300, 250, 280][k]} o={s(1 + k * 0.5)} />
				</div>
			))}
			<Label text="SKILLS" style={{marginTop: 32, opacity: s(3)}} />
			<div style={{display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap'}}>
				{['Python', 'React', 'SQL', 'AWS'].map((k, i) => {
					const o = s(3 + i * 0.4);
					return (
						<span key={k} style={{fontFamily: fonts.subtitle, fontWeight: 700, fontSize: 20, color: palette.neon, padding: '7px 14px', borderRadius: 10, background: 'rgba(0,230,118,0.10)', opacity: o, transform: `scale(${mix(0.7, 1, o)})`}}>
							{k}
						</span>
					);
				})}
			</div>
			<Label text="ACHIEVEMENTS" style={{marginTop: 32, opacity: s(5)}} />
			{[0, 1].map((k) => (
				<div key={k} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, opacity: s(5 + k * 0.5)}}>
					<span style={{color: '#FFD60A', fontSize: 20}}>★</span>
					<Bar w={[260, 200][k]} o={s(5 + k * 0.5)} />
				</div>
			))}
		</div>
	);
};

// ─── Beat 2: interview ───────────────────────────────────────────────────────
const Bubble: React.FC<{o: number; side: 'l' | 'r'; widths: number[]}> = ({o, side, widths}) => (
	<div style={{alignSelf: side === 'l' ? 'flex-start' : 'flex-end', padding: '16px 20px', borderRadius: 20, borderBottomLeftRadius: side === 'l' ? 4 : 20, borderBottomRightRadius: side === 'r' ? 4 : 20, background: side === 'l' ? 'rgba(255,255,255,0.10)' : 'rgba(0,230,118,0.16)', display: 'flex', flexDirection: 'column', gap: 10, opacity: o, transform: `scale(${mix(0.6, 1, o)})`, transformOrigin: side === 'l' ? 'left bottom' : 'right bottom'}}>
		{widths.map((w, i) => (
			<Bar key={i} w={w} c={side === 'l' ? 'rgba(255,255,255,0.4)' : 'rgba(0,230,118,0.55)'} />
		))}
	</div>
);

const Interview: React.FC<{t: number; at: number; end: number}> = ({t, at, end}) => {
	const p = (d: number) => prog(t, at + d, 0.45);
	const talking = t > at + 0.9 && t < end;
	return (
		<div style={{display: 'flex', gap: 26, alignItems: 'stretch'}}>
			{[
				{who: 'INTERVIEWER', tint: '#5EEAD4', d: 0},
				{who: 'CANDIDATE', tint: palette.neon, d: 0.15},
			].map(({who, tint, d}, i) => (
				<Card key={who} style={{position: 'relative', width: 300, padding: '30px 26px', opacity: p(d), transform: `translateY(${(1 - p(d)) * 30}px)`}}>
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
						<Avatar size={110} tint={tint} />
						<Label text={who} />
						<Bar w={150} />
						{/* Audio wave: the candidate is the one presenting. */}
						<div style={{display: 'flex', alignItems: 'center', gap: 6, height: 56, marginTop: 8}}>
							{Array.from({length: 11}).map((_, k) => {
								const amp = i === 1 && talking ? 0.35 + 0.65 * Math.abs(Math.sin(t * 9 + k * 0.9) * Math.sin(t * 3.1 + k)) : 0.18;
								return <div key={k} style={{width: 7, height: 56 * amp, borderRadius: 4, background: i === 1 ? palette.neon : 'rgba(255,255,255,0.35)'}} />;
							})}
						</div>
					</div>
				</Card>
			))}
			<div style={{width: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18}}>
				<Bubble o={p(0.35)} side="l" widths={[200, 140]} />
				<Bubble o={p(0.85)} side="r" widths={[220, 180, 120]} />
				<Bubble o={p(1.45)} side="r" widths={[190, 150]} />
			</div>
		</div>
	);
};

// ─── Beat 3: task card (shared with scene 2) ─────────────────────────────────
const CODE = [
	[0.32, '#5EEAD4'],
	[0.55, BAR],
	[0.44, palette.neon],
	[0.7, BAR],
	[0.38, '#FFD60A'],
	[0.62, BAR],
	[0.5, '#5EEAD4'],
	[0.3, BAR],
] as const;

/** `k` (0..1) drives the reveal: code lines, AI panel, then tests. `tests` ticks the checks. */
export const TaskCard: React.FC<{t: number; at: number; ai: number; tests: number}> = ({t, at, ai, tests}) => {
	const line = (i: number) => prog(t, at + 0.35 + i * 0.16, 0.3);
	const aiIn = prog(t, ai, 0.45);
	const review = prog(t, ai + 0.6, 0.4);
	const tick = (i: number) => prog(t, tests + i * 0.3, 0.25);
	const passed = [0, 1, 2].filter((i) => tick(i) > 0.5).length;
	return (
		<div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>
			{/* Header */}
			<div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '20px 26px', borderBottom: `1.5px solid ${LINE}`}}>
				<span style={{fontFamily: fonts.heading, fontWeight: 800, fontSize: 18, letterSpacing: 2, color: palette.dark, background: palette.neon, padding: '6px 12px', borderRadius: 8}}>TASK</span>
				<span style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 28, color: '#fff'}}>Build a RAG API service</span>
				<span style={{marginLeft: 'auto', fontFamily: fonts.mono, fontSize: 22, color: 'rgba(255,255,255,0.55)'}}>⏱ 60:00</span>
			</div>
			<div style={{flex: 1, display: 'flex'}}>
				{/* Code editor */}
				<div style={{flex: 1, padding: '22px 26px', borderRight: `1.5px solid ${LINE}`}}>
					<Label text="EDITOR" style={{marginBottom: 16}} />
					{CODE.map(([w, c], i) => (
						<div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, height: 30}}>
							<span style={{fontFamily: fonts.mono, fontSize: 16, color: 'rgba(255,255,255,0.3)', width: 18, textAlign: 'right'}}>{i + 1}</span>
							<Bar w={`${w * 100}%`} c={c} o={line(i)} style={{marginLeft: (i % 3) * 22}} />
						</div>
					))}
				</div>
				{/* AI assistance panel */}
				<div style={{width: 300, padding: '22px 22px', display: 'flex', flexDirection: 'column', gap: 14}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 10, opacity: aiIn}}>
						<svg width={26} height={26} viewBox="0 0 64 64" fill="none" stroke={palette.neon} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
							<rect x="16" y="16" width="32" height="32" rx="6" />
							<path d="M24 16 V9 M40 16 V9 M24 48 V55 M40 48 V55 M16 24 H9 M16 40 H9 M48 24 H55 M48 40 H55" />
						</svg>
						<Label text="AI ASSIST" style={{color: palette.neon}} />
					</div>
					<div style={{padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 9, opacity: aiIn, transform: `translateY(${(1 - aiIn) * 12}px)`}}>
						<Bar w="85%" c="rgba(255,255,255,0.4)" />
						<Bar w="65%" c="rgba(255,255,255,0.4)" />
						<Bar w="75%" c="rgba(255,255,255,0.4)" />
					</div>
					<div style={{alignSelf: 'flex-start', fontFamily: fonts.subtitle, fontWeight: 700, fontSize: 20, color: palette.neon, padding: '7px 14px', borderRadius: 10, border: `1.5px solid ${palette.neon}66`, opacity: review, transform: `scale(${mix(0.8, 1, review)})`}}>
						✓ Reviewed
					</div>
				</div>
			</div>
			{/* Tests */}
			<div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 26px', borderTop: `1.5px solid ${LINE}`}}>
				<Label text="TESTS" />
				{[0, 1, 2].map((i) => (
					<div key={i} style={{width: 34, height: 34, borderRadius: 17, border: `2.5px solid ${tick(i) > 0.5 ? palette.neon : 'rgba(255,255,255,0.25)'}`, background: tick(i) > 0.5 ? 'rgba(0,230,118,0.16)' : 'transparent', color: palette.neon, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, transform: `scale(${mix(0.8, 1, tick(i))})`}}>
						{tick(i) > 0.5 ? '✓' : ''}
					</div>
				))}
				<span style={{fontFamily: fonts.subtitle, fontWeight: 700, fontSize: 22, color: passed === 3 ? palette.neon : 'rgba(255,255,255,0.5)'}}>{passed}/3 passing</span>
			</div>
		</div>
	);
};

// ─── Headlines ───────────────────────────────────────────────────────────────
const GRAD: React.CSSProperties = {backgroundImage: 'linear-gradient(180deg, #FFFFFF 30%, #B9F3D4 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

const ACCENT: React.CSSProperties = {backgroundImage: 'linear-gradient(90deg, #00E676 0%, #7CFFC4 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

/** The spoken sentence, one line per phrase, each revealed when it is spoken. `[text, at, accent]`. */
const Spoken: React.FC<{lines: [string, number, boolean?][]; outAt: number; t: number}> = ({lines, outAt, t}) => {
	const o = prog(t, outAt, 0.3);
	if (t < lines[0][1] - 0.1 || o >= 1) return null;
	return (
		<div style={{position: 'absolute', left: 130, top: 330, opacity: 1 - o, transform: `translateY(${-o * 30}px)`}}>
			{lines.map(([l, at, accent]) => {
				const p = prog(t, at - 0.08, 0.5);
				return (
					<div key={l} style={{overflow: 'hidden', paddingBottom: 10}}>
						<h1 style={{...H, ...(accent ? ACCENT : GRAD), fontSize: 74, letterSpacing: '-0.02em', whiteSpace: 'nowrap', transform: `translateY(${(1 - p) * 110}%)`}}>{l}</h1>
					</div>
				);
			})}
		</div>
	);
};

/** Scene background: green-black, an emerald light that follows the focus, a receding floor grid. */
const Stage: React.FC<{t: number; lx: number; ly: number; glow: number}> = ({t, lx, ly, glow}) => (
	<AbsoluteFill style={{background: palette.dark, overflow: 'hidden'}}>
		<AbsoluteFill style={{background: `radial-gradient(900px 620px at ${lx}% ${ly}%, rgba(0,230,118,${0.16 * glow}) 0%, rgba(11,58,38,${0.55 * glow}) 35%, transparent 72%)`}} />
		<AbsoluteFill style={{background: 'radial-gradient(1400px 900px at 50% 120%, rgba(16,120,70,0.20) 0%, transparent 60%)'}} />
		{/* Floor grid in perspective, drifting slowly toward the viewer. */}
		<div style={{position: 'absolute', left: -600, right: -600, top: 640, height: 900, transform: 'perspective(900px) rotateX(68deg)', transformOrigin: 'top center', opacity: 0.55, maskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 60%, transparent 100%)'}}>
			<div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(110,231,183,0.16) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(110,231,183,0.16) 1.5px, transparent 1.5px)', backgroundSize: '90px 90px', backgroundPosition: `0 ${(t * 40) % 90}px`}} />
		</div>
		<AbsoluteFill style={{background: 'radial-gradient(1600px 1000px at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
	</AbsoluteFill>
);

export const Problem: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const {t, scene, beat} = ctx;
	const resumes = beat('Resumes');
	const done = beat("what they've done");
	const interviews = beat('Interviews');
	const present = beat('how they present');
	const neither = beat('But neither');
	const perform = beat('how they perform');
	const real = beat('when the work gets real');

	const settle = prog(t, scene.end - 0.5, 0.45); // card returns to TASK_RECT, flat, for the match-cut into scene 2
	const float = (k: number) => Math.sin(t * 1.3 + k) * 8 * (1 - settle);

	// Beat 1 → 2: the resume swings in on a 3D turn, then flips away and recedes.
	const resumeIn = prog(t, scene.start, 0.9);
	const flip = prog(t, interviews - 0.3, 0.8);
	const r3 = prog(t, neither - 0.2, 0.7);
	// Beat 2 → 3: the interview cards recede.
	const iIn = prog(t, interviews - 0.25, 0.7);
	const i3 = prog(t, neither - 0.2, 0.7);
	// Beat 3: task card rises from a tilt; climax.
	const task = prog(t, neither - 0.1, 0.8);
	const climax = prog(t, real - 0.15, 0.6) * (1 - settle);
	const push = mix(1, 1.04, prog(t, real - 0.15, scene.end - real)) * (1 - settle) + settle;
	const headOut = 1 - settle;

	// The light follows the current focus.
	const lx = mix(mix(mix(70, 66, flip), 50, task), 50, 0);
	const ly = mix(mix(40, 42, flip), 62, task);
	const spin = (t * 120) % 360; // rotating light around the task card at the climax
	return (
		<AbsoluteFill>
			<Stage t={t} lx={lx} ly={ly} glow={mix(0.8, 1.25, climax)} />
			<AbsoluteFill style={{perspective: 1800, transform: `scale(${push})`, transformOrigin: '50% 60%'}}>
				{/* Resume */}
				<Card
					style={{
						left: mix(1080, 120, r3),
						top: mix(170, 560, r3),
						width: 500,
						height: 680,
						opacity: resumeIn * mix(1, 0.22, flip) * mix(1, 0.6, r3),
						transform: `translateY(${float(0)}px) rotateY(${mix(-38, -12, resumeIn) + 70 * flip}deg) rotateX(${mix(10, 4, resumeIn)}deg) translateZ(${-260 * flip}px) scale(${mix(1, 0.75, r3)})`,
						filter: `blur(${2.5 * flip}px)`,
					}}
				>
					<Resume t={t} at={scene.start + 0.2} />
				</Card>
				{/* Interview */}
				{t > interviews - 0.4 ? (
					<div style={{position: 'absolute', left: mix(880, 1440, i3), top: mix(250, 600, i3), opacity: iIn * mix(1, 0.2, i3), transform: `translateY(${float(1.5) + (1 - iIn) * 50}px) rotateY(${mix(-24, -10, iIn)}deg) rotateX(4deg) scale(${mix(1, 0.6, i3)})`, transformOrigin: 'left top', filter: `blur(${3 * i3}px)`}}>
						<Interview t={t} at={interviews - 0.15} end={neither} />
					</div>
				) : null}
				{/* Task card, with a rotating light border at the climax */}
				{task > 0 ? (
					<div
						style={{
							position: 'absolute',
							left: TASK_RECT.x - 2,
							top: TASK_RECT.y - 2,
							width: TASK_RECT.w + 4,
							height: TASK_RECT.h + 4,
							borderRadius: 30,
							padding: 2,
							opacity: task,
							background: `conic-gradient(from ${spin}deg, rgba(0,230,118,${0.15 + 0.85 * climax}) 0deg, transparent 70deg, transparent 180deg, rgba(94,234,212,${0.6 * climax}) 250deg, transparent 320deg)`,
							boxShadow: `0 0 ${80 * climax}px rgba(0,230,118,${0.3 * climax})`,
							transform: `translateY(${(1 - task) * 80}px) rotateX(${mix(24, 0, task)}deg) scale(${mix(0.92, 1, task) * mix(1, 1.03, climax)})`,
						}}
					>
						<Card style={{position: 'relative', width: TASK_RECT.w, height: TASK_RECT.h, border: 'none'}}>
							<TaskCard t={t} at={neither} ai={perform - 0.3} tests={real + 0.1} />
						</Card>
					</div>
				) : null}
			</AbsoluteFill>

			{/* The voiceover, as text. Phrase times come from the Whisper word timings of this line. */}
			<Spoken t={t} outAt={interviews - 0.2} lines={[['Resumes tell you', resumes], ['what candidates', done], ['have done.', done + 0.6, true]]} />
			<Spoken t={t} outAt={neither - 0.25} lines={[['Interviews tell you', interviews], ['how well they', present], ['present themselves.', present + 0.75, true]]} />

			{/* Climax: the last sentence, centred above the task card */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 58, textAlign: 'center', opacity: headOut}}>
				<div style={{display: 'flex', justifyContent: 'center', gap: 18}}>
					{([['But neither necessarily shows', neither], ['how they perform', perform - 0.3]] as const).map(([w, at]) => {
						const p = prog(t, at - 0.08, 0.45);
						return (
							<span key={w} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: 6}}>
								<span style={{...H, ...GRAD, fontSize: 62, letterSpacing: '-0.02em', display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`}}>{w}</span>
							</span>
						);
					})}
				</div>
				<div style={{...H, fontSize: mix(100, 118, climax), marginTop: 18, opacity: prog(t, real - 0.15, 0.3), transform: `scale(${mix(1.2, 1, climax)})`, backgroundImage: `linear-gradient(90deg, #00E676 0%, #7CFFC4 ${mix(-20, 120, prog(t, real + 0.2, 1.2))}%, #00E676 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 ${30 * climax}px rgba(0,230,118,0.45))`}}>
					WHEN THE WORK GETS REAL.
				</div>
			</div>
		</AbsoluteFill>
	);
};
