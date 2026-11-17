// VibeLevel Screening — product demo v2 (projects/vibelevel-v2). Seven scenes + end card, cut with pixel wipes.
// Cues come from the voiceover (c.W(part, word)); parts s1 … s7b follow the user's script.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction} from 'remotion';
import {type Cue, makeCue, type Part} from '../velora/filmkit';
import {Sfx} from '../velora/Velora';
import {Captions, Chip, Cursor, IN_OUT, K, life, Line, Logo, mix, Pixels, prog, sans, Screen, serif} from './kit';

export type DemoProps = {parts: Part[]; duration: number; segments: {s: number; e: number}[]; fps?: number; musicOffset: number};
export const calculateDemoMetadata: CalculateMetadataFunction<DemoProps> = ({props}) => {
	const fps = props.fps ?? 30;
	return {fps, width: 1920, height: 1080, durationInFrames: Math.max(fps, Math.ceil(props.duration * fps))};
};
type S = {t: number; c: Cue; a: number; b: number};
export const mono = '"SF Mono", "JetBrains Mono", Menlo, monospace';

// ─── Scene 1 — the changing landscape ────────────────────────────────────────
export const CODE = ['export async function handler(req) {', '  const plan = await agent.plan(spec)', '  for (const step of plan.steps) {', '    await step.run({ verify: true })', '  }', '  return report(plan)', '}'];
export const WorkCard: React.FC<{t: number; at: number; title: string; x: number; dim: number; children: React.ReactNode}> = ({t, at, title, x, dim, children}) => {
	const p = prog(t, at - 0.1, 0.8);
	return (
		<div style={{position: 'absolute', left: x, top: 330, width: 500, height: 330, borderRadius: 14, background: K.bg2, boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px #2A2D33', opacity: Math.min(1, p * 1.6) * mix(1, 0.22, dim), transform: `perspective(1600px) translateY(${(1 - p) * 60}px) rotateX(${(1 - p) * 18}deg) scale(${mix(1, 0.92, dim)})`, filter: dim > 0.05 ? `blur(${dim * 3}px)` : undefined, overflow: 'hidden'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', borderBottom: `1px solid ${K.line}`}}>
				{[0, 1, 2].map((i) => (
					<div key={i} style={{width: 11, height: 11, borderRadius: 6, background: '#33363D'}} />
				))}
				<span style={{marginLeft: 10, fontFamily: sans, fontSize: 18, color: K.dim}}>{title}</span>
			</div>
			<div style={{padding: 22}}>{children}</div>
		</div>
	);
};

/** A person rendered in pixels: "the person behind that work". */
export const PixelPerson: React.FC<{t: number; p: number; x: number; y: number; cell?: number}> = ({t, p, x, y, cell = 18}) => {
	const cells: React.ReactNode[] = [];
	for (let r = 0; r < 26; r++)
		for (let q = 0; q < 24; q++) {
			const cx = q - 11.5;
			const cy = r;
			const head = (cx * cx) / 22 + ((cy - 6) * (cy - 6)) / 30 < 1;
			const body = cy > 12 && (cx * cx) / 110 + ((cy - 26) * (cy - 26)) / 150 < 1;
			if (!head && !body) continue;
			const n = Math.abs(Math.sin(q * 12.9 + r * 78.2) * 43758.5) % 1;
			if (n > p * 1.15) continue;
			const fl = Math.abs(Math.sin(q * 3.1 + r * 7.7 + Math.floor(t * 6) * 1.3) * 999) % 1;
			const green = n < 0.28 || fl > 0.85;
			cells.push(<div key={`${q}-${r}`} style={{position: 'absolute', left: q * cell, top: r * cell, width: cell - 4, height: cell - 4, background: green ? K.green : '#3A3E45', opacity: green ? 0.85 : 0.65}} />);
		}
	return <div style={{position: 'absolute', left: x, top: y}}>{cells}</div>;
};

const Scene1: React.FC<S> = ({t, c, a}) => {
	const tToday = c.W('s1', 'today');
	const tBut = c.W('s1', 'but');
	const dim = prog(t, tBut - 0.2, 0.9, IN_OUT);
	const typed = (at: number) => Math.floor(prog(t, at, 2.2, Easing.linear) * CODE.join('\n').length);
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.55 * prog(t, a, 1.2)}} />
			<div style={{position: 'absolute', left: 160, right: 160, top: 470}}>
				<Line t={t} text="AI is changing the way work gets done." at={c.W('s1', 'ai')} times={['ai', 'is', 'changing', 'the', 'way', 'work', 'gets', 'done'].map((w) => c.W('s1', w))} hl={['ai']} size={76} out={tToday - 0.5} />
			</div>
			{t > tToday - 0.3 ? (
				<>
					<div style={{position: 'absolute', left: 160, right: 160, top: 150, opacity: 1 - dim}}>
						<Line t={t} text="A candidate can build more, solve faster, and deliver impressive results with AI." at={tToday + 0.1} size={46} hl={['build', 'solve', 'deliver']} stagger={0.05} />
					</div>
					<WorkCard t={t} at={c.W('s1', 'build')} title="agent/handler.ts" x={150} dim={dim}>
						<pre style={{margin: 0, fontFamily: mono, fontSize: 19, lineHeight: 1.6, color: '#C9CDD4', whiteSpace: 'pre'}}>
							{CODE.join('\n').slice(0, typed(c.W('s1', 'build')))}
							<span style={{background: K.green, color: K.green}}>▍</span>
						</pre>
					</WorkCard>
					<WorkCard t={t} at={c.W('s1', 'solve')} title="tests" x={710} dim={dim}>
						{['plan()', 'step.run()', 'verify()', 'report()'].map((n, i) => {
							const ok = prog(t, c.W('s1', 'solve') + 0.2 + i * 0.22, 0.2);
							return (
								<div key={n} style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: mono, fontSize: 20, color: '#C9CDD4', marginBottom: 16, opacity: 0.4 + ok * 0.6}}>
									<span style={{color: ok > 0.5 ? K.green : K.dim}}>{ok > 0.5 ? '✓' : '○'}</span> {n}
								</div>
							);
						})}
						<div style={{fontFamily: sans, fontSize: 22, color: K.green, marginTop: 18, opacity: prog(t, c.W('s1', 'solve') + 1.2, 0.4)}}>24 passed · 0.8s</div>
					</WorkCard>
					<WorkCard t={t} at={c.W('s1', 'deliver')} title="deploy" x={1270} dim={dim}>
						<div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: sans, fontSize: 24, color: K.text}}>
							<span style={{width: 12, height: 12, borderRadius: 6, background: K.green, boxShadow: `0 0 12px ${K.green}`}} /> Shipped to production
						</div>
						<svg width={456} height={170} style={{marginTop: 20}}>
							<polyline fill="none" stroke={K.green} strokeWidth={3} strokeLinejoin="round" points={Array.from({length: 12}, (_, i) => `${i * 40},${150 - (i * 11 + ((i * 37) % 5) * 9) * prog(t, c.W('s1', 'deliver') + 0.2, 1.4)}`).join(' ')} />
						</svg>
					</WorkCard>
				</>
			) : null}
			{/* the person behind the work */}
			{t > tBut - 0.2 ? (
				<>
					<PixelPerson t={t} p={prog(t, c.W('s1', 'person') - 0.4, 1.6)} x={960 - 216} y={420} />
					<div style={{position: 'absolute', left: 160, right: 160, top: 170}}>
						<Line t={t} text="Evaluating the person behind that work" at={c.W('s1', 'evaluating')} size={66} it={['person']} />
						<div style={{height: 10}} />
						<Line t={t} text="is a whole new challenge." at={c.W('s1', 'whole')} size={66} color={K.dim} />
					</div>
				</>
			) : null}
		</AbsoluteFill>
	);
};

// ─── Scene 2 — introducing VibeLevel Screening ───────────────────────────────
const Scene2: React.FC<S> = ({t, c, a}) => {
	const tLogo = c.W('s2', 'vibe');
	const gather = prog(t, a + 0.1, 1.8, Easing.linear);
	const up = prog(t, c.W('s2', 'an') - 0.1, 1.0, IN_OUT);
	const tUnd = c.W('s2', 'understand');
	const three = [c.W('s2', 'think'), c.W('s2', 'work'), c.W('s2', 'contribute')];
	const active = three.filter((x) => t >= x - 0.1).length - 1;
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.35}} />
			{gather < 1 ? <Pixels t={t} w={1920} h={1080} cell={20} mode={{kind: 'gather', p: gather, box: [960 - 300, 440, 600, 150]}} /> : null}
			<div style={{position: 'absolute', left: 0, right: 0, top: mix(455, 150, up), display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${mix(1, 0.62, up)})`, transformOrigin: 'center top'}}>
				<Logo h={124} p={prog(t, tLogo - 0.35, 0.8)} />
				<div style={{fontFamily: sans, fontWeight: 300, fontSize: 64, letterSpacing: '0.02em', color: K.text, marginTop: 24, opacity: prog(t, c.W('s2', 'screening') - 0.1, 0.7)}}>Screening</div>
			</div>
			<div style={{position: 'absolute', left: 200, right: 200, top: 520, opacity: life(t, c.W('s2', 'an'), tUnd, 0.6, 0.4)}}>
				<Line t={t} text="An AI-era assessment platform" at={c.W('s2', 'an') + 0.2} size={58} hl={['ai-era']} />
				<div style={{height: 14}} />
				<Line t={t} text="that looks beyond the final result." at={c.W('s2', 'look') - 0.1} size={58} it={['beyond']} color={K.dim} />
			</div>
			{t > tUnd - 0.3 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', opacity: prog(t, tUnd - 0.2, 0.6)}}>
					<div style={{fontFamily: sans, fontWeight: 300, fontSize: 40, color: K.dim}}>Understand how candidates</div>
					<div style={{display: 'flex', justifyContent: 'center', gap: 70, marginTop: 44}}>
						{['Think', 'Work with AI', 'Contribute'].map((l, i) => {
							const on = i === active;
							const p = prog(t, three[i] - 0.15, 0.5);
							return on ? (
								<Chip key={l} p={p} size={50}>
									{l}
								</Chip>
							) : (
								<div key={l} style={{fontFamily: sans, fontWeight: 300, fontSize: 50, color: i < active ? K.text : '#5C616B', padding: '16px 0', opacity: 0.4 + 0.6 * prog(t, tUnd, 0.6)}}>
									{l}
								</div>
							);
						})}
					</div>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ─── Scene 3 — the candidate workspace ───────────────────────────────────────
const Scene3: React.FC<S> = ({t, c, a}) => {
	const P = c.P('s3');
	const tClaude = c.W('s3', 'built') - 0.6;
	const tCollab = c.W('s3', 'collaborate');
	const dark = prog(t, tCollab - 0.3, 0.7, IN_OUT);
	const enter = prog(t, a, 1.2);
	const tilt: [number, number] = [mix(14, 3, enter), mix(-16, -4, enter)];
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.3}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 62, textAlign: 'center'}}>
				<Line t={t} text="Real-world challenges. Real AI tools." at={P + 0.1} size={42} hl={['real', 'ai']} out={c.E('s3') - 0.2} />
			</div>
			<Screen
				t={t}
				src="workspace.png"
				iw={1920}
				ih={991}
				w={1480}
				h={764}
				light
				tilt={tilt}
				style={{left: 220, top: 170, opacity: (1 - dark) * Math.min(1, enter * 1.5), transform: `translateY(${(1 - enter) * 80}px) scale(${mix(0.9, 1, enter)})`}}
				cam={[
					{t: P, x: 0.5, y: 0.5, z: 1},
					{t: c.W('s3', 'realistic'), x: 0.5, y: 0.5, z: 1},
					{t: c.W('s3', 'realistic') + 1.2, x: 0.22, y: 0.3, z: 1.7},
					{t: tClaude, x: 0.22, y: 0.3, z: 1.7},
					{t: tClaude + 1.3, x: 0.78, y: 0.32, z: 1.75},
					{t: c.W('s3', 'explore'), x: 0.78, y: 0.32, z: 1.75},
					{t: c.W('s3', 'explore') + 1.4, x: 0.42, y: 0.4, z: 1.35},
				]}
			/>
			{/* the Claude Code agent terminal */}
			<Screen
				t={t}
				src="ide-dark.png"
				iw={1405}
				ih={985}
				w={1300}
				h={911}
				tilt={[3, 4]}
				style={{left: 310, top: 140, opacity: dark, transform: `translateY(${(1 - dark) * 60}px) scale(${mix(0.95, 1, dark)})`}}
				cam={[
					{t: tCollab - 0.3, x: 0.5, y: 0.5, z: 1},
					{t: tCollab + 2.5, x: 0.55, y: 0.35, z: 1.45},
					{t: c.W('s3', 'today'), x: 0.5, y: 0.45, z: 1.15},
				]}
			/>
			<div style={{position: 'absolute', left: 250, top: 870, display: 'flex', gap: 18}}>
				<Chip p={prog(t, c.W('s3', 'realistic') - 0.1, 0.5)} size={30}>
					Role-specific challenge
				</Chip>
				<Chip p={prog(t, tClaude, 0.5)} size={30}>
					Claude Code built in
				</Chip>
				<Chip dark p={prog(t, tCollab, 0.5)} size={30}>
					How work actually happens
				</Chip>
			</div>
			<Cursor t={t} x={mix(1300, 980, prog(t, c.W('s3', 'explore') - 0.8, 0.8, IN_OUT))} y={mix(700, 520, prog(t, c.W('s3', 'explore') - 0.8, 0.8, IN_OUT))} at={c.W('s3', 'explore') - 0.9} click={c.W('s3', 'explore') + 0.05} out={tCollab - 0.2} />
		</AbsoluteFill>
	);
};

// ─── Scene 4 — four dimensions ───────────────────────────────────────────────
const DIMS: {part: string; name: string; desc: string; img: string; iw: number; ih: number; cam: [number, number, number][]}[] = [
	{part: 's4b', name: 'Core Skills', desc: 'How well they apply their knowledge.', img: 'core-skills.png', iw: 2240, ih: 1410, cam: [[0.5, 0.35, 1.05], [0.47, 0.45, 1.3]]},
	{part: 's4c', name: 'Working with AI', desc: 'How they collaborate with AI and evaluate its output.', img: 'working-with-ai.png', iw: 2240, ih: 1150, cam: [[0.5, 0.3, 1.0], [0.45, 0.55, 1.3]]},
	{part: 's4d', name: 'Ownership', desc: 'How they approach decisions and take responsibility.', img: 'four-aspects.png', iw: 2240, ih: 1050, cam: [[0.5, 0.45, 1.0], [0.42, 0.63, 1.4]]},
	{part: 's4e', name: 'Human Contribution', desc: 'The judgment and value they bring beyond AI-generated work.', img: 'human-contribution.png', iw: 2240, ih: 570, cam: [[0.5, 0.5, 1.0], [0.66, 0.42, 1.35]]},
];
const Scene4: React.FC<S> = ({t, c, a}) => {
	const tFour = c.W('s4a', 'four');
	const tList = c.P('s4b') - 0.3;
	const toList = prog(t, tList, 1.0, IN_OUT);
	const active = DIMS.filter((d) => t >= c.P(d.part) - 0.25).length - 1;
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.3}} />
			{toList < 1 ? (
				<div style={{opacity: 1 - toList}}>
					<div style={{position: 'absolute', left: 200, right: 200, top: 330}}>
						<Line t={t} text="But completing the task is only part of the picture." at={c.P('s4a') + 0.05} size={60} it={['picture']} out={tFour - 0.6} />
					</div>
					{t > tFour - 1.2 ? (
						<div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center'}}>
							<Line t={t} text="Four dimensions." at={tFour - 0.2} size={66} hl={['four']} />
							<div style={{display: 'flex', justifyContent: 'center', gap: 60, marginTop: 56}}>
								{DIMS.map((d, i) => (
									<div key={d.name} style={{fontFamily: sans, fontWeight: 300, fontSize: 40, color: K.text, opacity: prog(t, tFour + 0.2 + i * 0.14, 0.5), transform: `translateY(${(1 - prog(t, tFour + 0.2 + i * 0.14, 0.6)) * 20}px)`}}>
										{d.name}
									</div>
								))}
							</div>
						</div>
					) : null}
				</div>
			) : null}
			{toList > 0 ? (
				<AbsoluteFill style={{opacity: toList}}>
					<div style={{position: 'absolute', left: 120, top: 250, width: 600}}>
						{DIMS.map((d, i) => {
							const on = i === active;
							const p = prog(t, c.P(d.part) - 0.25, 0.5);
							return (
								<div key={d.name} style={{height: on ? 210 : 92}}>
									{on ? (
										<>
											<Chip p={p} size={44}>
												{d.name}
											</Chip>
											<div style={{fontFamily: sans, fontWeight: 300, fontSize: 30, lineHeight: 1.35, color: K.text, marginTop: 20, opacity: prog(t, c.P(d.part) + 0.1, 0.6), maxWidth: 560}}>{d.desc}</div>
										</>
									) : (
										<div style={{fontFamily: sans, fontWeight: 300, fontSize: 40, color: i < active ? '#8E939D' : '#4C5058', paddingTop: 10}}>{d.name}</div>
									)}
								</div>
							);
						})}
					</div>
					{DIMS.map((d, i) => {
						const o = life(t, c.P(d.part) - 0.35, i < 3 ? c.P(DIMS[i + 1].part) - 0.1 : c.E('s4e') + 0.6, 0.5, 0.35);
						if (o <= 0) return null;
						const s0 = c.P(d.part) - 0.3;
						const s1 = i < 3 ? c.P(DIMS[i + 1].part) : c.E('s4e') + 0.5;
						return (
							<Screen
								key={d.img}
								t={t}
								src={d.img}
								iw={d.iw}
								ih={d.ih}
								w={1060}
								h={660}
								light
								fit="contain"
								tilt={[3, -7]}
								style={{left: 760, top: 210, opacity: o, transform: `translateX(${(1 - prog(t, s0, 0.6)) * 60}px)`}}
								cam={[
									{t: s0, x: d.cam[0][0], y: d.cam[0][1], z: d.cam[0][2]},
									{t: s1, x: d.cam[1][0], y: d.cam[1][1], z: d.cam[1][2]},
								]}
							/>
						);
					})}
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};

// ─── Scene 5 — the AI-led interview (conceptual UI) ──────────────────────────
const Scene5: React.FC<S> = ({t, c, a}) => {
	const P = c.P('s5');
	const enter = prog(t, a, 1.1);
	const q = "Walk me through how you verified the agent's output before you submitted.";
	const typed = q.slice(0, Math.round(q.length * prog(t, P + 1.2, 2.6, Easing.linear)));
	const speaking = t > P + 4.2;
	const chips = [c.W('s5', 'reasoning'), c.W('s5', 'knowledge'), c.W('s5', 'explain')];
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.3}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center'}}>
				<Line t={t} text="A short AI-led interview." at={c.W('s5', 'candidates') - 0.1} size={46} hl={['ai-led']} />
			</div>
			<div style={{position: 'absolute', left: 210, top: 170, width: 1500, height: 690, borderRadius: 16, background: K.bg2, boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7), 0 0 0 1px #2A2D33', overflow: 'hidden', opacity: Math.min(1, enter * 1.4), transform: `perspective(2000px) rotateX(${mix(12, 2, enter)}deg) translateY(${(1 - enter) * 70}px)`}}>
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: `1px solid ${K.line}`, fontFamily: sans}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
						<Logo h={26} />
						<span style={{fontSize: 20, color: K.dim}}>· AI-led interview</span>
					</div>
					<div style={{display: 'flex', gap: 24, fontSize: 20, color: K.dim}}>
						<span>Question 2 of 4</span>
						<span style={{display: 'flex', alignItems: 'center', gap: 8, color: K.text}}>
							<span style={{width: 10, height: 10, borderRadius: 5, background: '#FF5A5A', opacity: 0.5 + 0.5 * Math.sin(t * 5)}} /> 0{Math.floor((t - P) / 60) + 2}:{String(14 + Math.floor(Math.max(0, t - P)) % 46).padStart(2, '0')}
						</span>
					</div>
				</div>
				<div style={{display: 'flex', height: 600}}>
					{/* AI interviewer */}
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
								<div style={{fontSize: 24, color: K.text, fontWeight: 500}}>AI interviewer</div>
								<div style={{fontSize: 18, color: K.dim}}>{speaking ? 'Listening…' : 'Asking'}</div>
							</div>
						</div>
						<div style={{fontFamily: sans, fontWeight: 300, fontSize: 38, lineHeight: 1.35, color: K.text, marginTop: 44, minHeight: 160}}>
							{typed}
							{typed.length < q.length ? <span style={{color: K.green}}>▍</span> : null}
						</div>
						<div style={{display: 'flex', gap: 14, marginTop: 40, flexWrap: 'wrap'}}>
							{['Reasoning', 'Knowledge', 'Explaining their work'].map((l, i) => (
								<Chip key={l} p={prog(t, chips[i] - 0.1, 0.5)} size={28} dark={i !== chips.filter((x) => t >= x - 0.1).length - 1}>
									{l}
								</Chip>
							))}
						</div>
					</div>
					{/* candidate */}
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
						<div style={{fontFamily: sans, fontSize: 18, color: K.dim}}>{speaking ? 'Candidate answering' : 'Waiting for answer'}</div>
					</div>
				</div>
			</div>
			<div style={{position: 'absolute', left: 210, top: 880, fontFamily: sans, fontSize: 18, color: '#5C616B', opacity: enter}}>Illustrative interface</div>
		</AbsoluteFill>
	);
};

// ─── Scene 6 — the assessment report (light-grey section, like the reference) ─
const TABS = ['Summary', 'Core Skills', 'Working with AI', 'Human Contribution', 'Video Q&A', 'Code Review', 'Interview Guide'];
const REPORT: {at: (c: Cue) => number; img: string; iw: number; ih: number; tab: number; cam: [number, number, number][]}[] = [
	{at: (c) => c.P('s6a') - 0.3, img: 'report-overview.png', iw: 2240, ih: 1800, tab: 0, cam: [[0.5, 0.2, 1.6], [0.82, 0.07, 3.2]]},
	{at: (c) => c.W('s6a', 'skill') - 0.2, img: 'skill-scores.png', iw: 2240, ih: 730, tab: 1, cam: [[0.5, 0.5, 1.0], [0.35, 0.55, 1.4]]},
	{at: (c) => c.W('s6a', 'collaboration') - 0.5, img: 'working-with-ai.png', iw: 2240, ih: 1150, tab: 2, cam: [[0.45, 0.3, 1.25], [0.45, 0.5, 1.35]]},
	{at: (c) => c.W('s6a', 'code') - 0.2, img: 'code-review.png', iw: 2240, ih: 1570, tab: 5, cam: [[0.5, 0.25, 1.5], [0.5, 0.32, 1.7]]},
	{at: (c) => c.W('s6a', 'video') - 0.2, img: 'video-qa.png', iw: 2240, ih: 1090, tab: 4, cam: [[0.45, 0.3, 1.25], [0.5, 0.42, 1.4]]},
];
const Scene6: React.FC<S> = ({t, c, a}) => {
	const tLayers = c.W('s6a', 'every') - 0.2;
	const tGuide = c.P('s6b') - 0.25;
	const tProbe = c.W('s6b', 'questions') - 0.6;
	const layers = life(t, tLayers, tGuide + 0.2, 0.8, 0.4);
	const shots = 1 - prog(t, tLayers - 0.2, 0.5);
	const tab = t >= tGuide ? 6 : REPORT.filter((r) => t >= r.at(c)).length ? REPORT[REPORT.filter((r) => t >= r.at(c)).length - 1].tab : 0;
	const enter = prog(t, a, 1.1);
	return (
		<AbsoluteFill style={{background: K.light}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.35, light: true}} />
			{/* report tab bar */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 60, display: 'flex', justifyContent: 'center', opacity: enter * (1 - layers)}}>
				<div style={{display: 'flex', gap: 6, padding: 8, borderRadius: 12, background: '#fff', boxShadow: '0 10px 30px -10px rgba(20,24,30,0.2)'}}>
					{TABS.map((l, i) => (
						<div key={l} style={{padding: '12px 20px', borderRadius: 8, fontFamily: sans, fontWeight: 500, fontSize: 21, background: i === tab ? K.ink : 'transparent', color: i === tab ? '#fff' : '#5C616B'}}>
							{l}
						</div>
					))}
				</div>
			</div>
			{REPORT.map((r, i) => {
				const s0 = r.at(c);
				const s1 = i < REPORT.length - 1 ? REPORT[i + 1].at(c) : tLayers;
				const o = life(t, s0, s1 + 0.12, 0.3, 0.25) * shots;
				if (o <= 0) return null;
				return (
					<Screen
						key={r.img}
						t={t}
						src={r.img}
						iw={r.iw}
						ih={r.ih}
						w={1400}
						h={800}
						light
						fit="contain"
						style={{left: 260, top: 175, opacity: o * enter, transform: `translateY(${(1 - prog(t, s0, 0.6)) * 40}px)`}}
						cam={[
							{t: s0, x: r.cam[0][0], y: r.cam[0][1], z: r.cam[0][2]},
							{t: s1, x: r.cam[1][0], y: r.cam[1][1], z: r.cam[1][2]},
						]}
					/>
				);
			})}
			{/* every section adds another layer */}
			{layers > 0 ? (
				<AbsoluteFill style={{opacity: layers}}>
					<div style={{position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center'}}>
						<Line t={t} text="Every section adds another layer of understanding." at={tLayers} size={50} color={K.ink} it={['understanding']} />
					</div>
					<div style={{position: 'absolute', left: 960, top: 620, perspective: 2400}}>
						{REPORT.map((r, i) => {
							const p = prog(t, tLayers + 0.15 * i, 0.9);
							const k = i - 2;
							return (
								<div key={r.img} style={{position: 'absolute', left: -380, top: -230, width: 760, height: 460, borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 60px -20px rgba(20,24,30,0.35)', transform: `rotateX(52deg) rotateZ(-28deg) translate3d(${k * 40}px, ${k * -40}px, ${mix(-200, i * 70, p)}px)`, opacity: p}}>
									<Img src={staticFile(`vl2/img/${r.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />
								</div>
							);
						})}
					</div>
				</AbsoluteFill>
			) : null}
			{/* the Interview Guide */}
			{t > tGuide - 0.3 ? (
				<AbsoluteFill style={{opacity: prog(t, tGuide - 0.2, 0.5)}}>
					<Screen
						t={t}
						src={t < tProbe ? 'interview-guide.png' : 'interview-probes.png'}
						iw={2240}
						ih={t < tProbe ? 1410 : 720}
						w={1180}
						h={760}
						light
						fit="contain"
						style={{left: 640, top: 190}}
						cam={t < tProbe ? [{t: tGuide, x: 0.42, y: 0.2, z: 1.3}, {t: tProbe, x: 0.42, y: 0.45, z: 1.4}] : [{t: tProbe, x: 0.5, y: 0.5, z: 1.0}, {t: tProbe + 4, x: 0.45, y: 0.5, z: 1.3}]}
					/>
					<div style={{position: 'absolute', left: 120, top: 260, width: 470}}>
						<div style={{fontFamily: sans, fontWeight: 300, fontSize: 52, lineHeight: 1.15, color: K.ink, letterSpacing: '-0.02em'}}>
							Interview <span style={{fontFamily: serif, fontStyle: 'italic', color: K.greenDeep}}>Guide</span>
						</div>
						{(
							[
								['Strengths', c.W('s6b', 'strengths')],
								['Gaps', c.W('s6b', 'gaps')],
								['Focused questions', c.W('s6b', 'questions')],
							] as const
						).map(([l, at], i) => (
							<div key={l} style={{marginTop: i ? 16 : 40}}>
								<Chip p={prog(t, at - 0.1, 0.5)} size={30} dark={i < 2}>
									{l}
								</Chip>
							</div>
						))}
					</div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};

// ─── Scene 7 — the outcome + end card ────────────────────────────────────────
const Scene7: React.FC<S & {end: number}> = ({t, c, a, end}) => {
	const tB = c.P('s7b');
	const gather = prog(t, tB - 0.3, 1.6, Easing.linear);
	const toEnd = prog(t, end - 0.2, 0.9, IN_OUT);
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.5}} />
			<div style={{position: 'absolute', left: 160, right: 160, top: 380, opacity: 1 - prog(t, tB - 0.5, 0.4)}}>
				<Line t={t} text="Go beyond what candidates deliver." at={c.P('s7a') + 0.05} size={68} it={['beyond']} />
				<div style={{height: 18}} />
				<Line t={t} text="Understand how they think, work, and contribute." at={c.W('s7a', 'understand') - 0.05} size={68} color={K.dim} hl={['think,', 'work,', 'contribute.', 'think', 'work', 'contribute']} />
			</div>
			{gather > 0 && gather < 1 ? <Pixels t={t} w={1920} h={1080} cell={20} mode={{kind: 'gather', p: gather, box: [960 - 300, 300, 600, 150]}} /> : null}
			{t > tB - 0.3 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: mix(310, 230, toEnd), display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					<Logo h={120} p={prog(t, tB + 0.6, 0.8)} />
					<div style={{fontFamily: sans, fontWeight: 300, fontSize: 60, letterSpacing: '0.02em', color: K.text, marginTop: 22, opacity: prog(t, c.W('s7b', 'screening') - 0.1, 0.7)}}>Screening</div>
					<div style={{marginTop: 60, opacity: 1 - toEnd}}>
						<Line t={t} text="Hire for the skills that matter in the AI era." at={c.W('s7b', 'hire') - 0.1} size={48} hl={['ai']} it={['skills']} />
					</div>
				</div>
			) : null}
			{toEnd > 0 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: toEnd}}>
					<Line t={t} text="See beyond the output." at={end} size={50} />
					<Line t={t} text="Understand the person behind it." at={end + 0.35} size={50} color={K.dim} it={['person']} />
					<div style={{marginTop: 54, padding: '22px 48px', borderRadius: 999, background: K.green, color: K.ink, fontFamily: sans, fontWeight: 600, fontSize: 32, display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${prog(t, end + 0.9, 0.6, Easing.bezier(0.34, 1.4, 0.64, 1))})`, boxShadow: '0 20px 50px -12px rgba(0,215,107,0.45)'}}>
						Book a Demo
						<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={K.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
							<path d="M5 12h14M13 6l6 6-6 6" />
						</svg>
					</div>
					<div style={{fontFamily: sans, fontSize: 24, color: K.dim, marginTop: 28, opacity: prog(t, end + 1.3, 0.6)}}>vibelevel.ai</div>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ─── film ────────────────────────────────────────────────────────────────────
export const VibeLevelDemo: React.FC<DemoProps> = (p) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	if (!p.parts.length) return <AbsoluteFill style={{background: K.bg}} />;
	const c = makeCue(p.parts);
	const cut = (id: string) => c.P(id) - 0.35;
	const end = c.E('s7b') + 0.3;
	const scenes: [React.FC<S & {end: number}>, number, number][] = [
		[Scene1, 0, cut('s2')],
		[Scene2, cut('s2'), cut('s3')],
		[Scene3, cut('s3'), cut('s4a')],
		[Scene4, cut('s4a'), cut('s5')],
		[Scene5, cut('s5'), cut('s6a')],
		[Scene6, cut('s6a'), cut('s7a')],
		[Scene7, cut('s7a'), p.duration + 1],
	];
	const cuts = ['s2', 's3', 's4a', 's5', 's6a', 's7a'].map(cut);
	const wipe = cuts.map((x) => (t > x - 0.55 && t < x + 0.55 ? (t - (x - 0.55)) / 0.55 : null)).find((v) => v !== null);
	const words = p.parts.flatMap((x) => x.words);
	const lightNow = t >= cut('s6a') && t < cut('s7a');
	return (
		<AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
			{scenes.map(([Sc, a, b], i) => (t >= a && t < b ? <Sc key={i} t={t} c={c} a={a} b={b} end={end} /> : null))}
			{wipe !== null && wipe !== undefined ? <Pixels t={t} w={1920} h={1080} cell={30} mode={{kind: 'wipe', p: wipe}} /> : null}
			{t < end ? <Captions t={t} words={words} light={lightNow} /> : null}
			<Sound p={p} c={c} cuts={cuts} end={end} />
		</AbsoluteFill>
	);
};

// ─── sound ───────────────────────────────────────────────────────────────────
const LEVEL = {voice: 0.09, gap: 0.16, end: 0.3};
const Sound: React.FC<{p: DemoProps; c: Cue; cuts: number[]; end: number}> = ({p, c, cuts, end}) => {
	const {fps} = useVideoConfig();
	const voEnd = p.parts[p.parts.length - 1].end;
	const speech = (t: number) => Math.max(0, ...p.segments.map((g) => prog(t, g.s - 0.25, 0.25, Easing.linear) * (1 - prog(t, g.e, 0.4, Easing.linear))));
	const sfx: [number, string, number][] = [
		...cuts.map((x, i): [number, string, number] => [x - 0.45, i % 2 ? 'pixel-2' : 'pixel-1', 0.22]),
		[c.W('s1', 'solve') + 1.2, 'confirm-chime', 0.1],
		[c.W('s2', 'vibe') - 0.4, 'logo-reveal', 0.2],
		...[c.W('s2', 'think'), c.W('s2', 'work'), c.W('s2', 'contribute')].map((x): [number, string, number] => [x - 0.15, 'ui-tap', 0.16]),
		[c.W('s3', 'explore') + 0.05, 'soft-click', 0.3],
		...['s4b', 's4c', 's4d', 's4e'].map((id): [number, string, number] => [c.P(id) - 0.25, 'ui-tap', 0.16]),
		...[c.W('s5', 'reasoning'), c.W('s5', 'knowledge'), c.W('s5', 'explain')].map((x): [number, string, number] => [x - 0.1, 'ui-tap', 0.14]),
		[c.W('s6a', 'every') - 0.2, 'soft-swoosh', 0.16],
		[c.P('s7b') - 0.3, 'pixel-1', 0.2],
		[c.P('s7b') + 0.5, 'logo-reveal', 0.2],
		[end + 0.9, 'confirm-chime', 0.12],
	];
	return (
		<>
			<Audio src={staticFile('vl2/narration.wav')} />
			<Audio
				src={staticFile('vl2/music.mp3')}
				startFrom={Math.round(p.musicOffset * fps)}
				volume={(f) => {
					const t = f / fps;
					const lv = t > voEnd ? mix(LEVEL.gap, LEVEL.end, prog(t, voEnd, 1, Easing.linear)) : mix(LEVEL.gap, LEVEL.voice, speech(t));
					return lv * prog(t, 0, 0.6, Easing.linear) * (1 - prog(t, p.duration - 2.2, 2.2, Easing.linear));
				}}
			/>
			{sfx.map(([at, name, v], i) => (
				<Sfx key={i} at={at} name={name} v={v * 1.4} dir="vl2" />
			))}
		</>
	);
};
