// VibeLevel Screening — product demo v3 (projects/vibelevel-v3): the user's script with their corrections:
// on-screen text follows the voiceover word by word (so no separate captions), bigger headings, persistent top-left
// logo (except the logo scenes), motion graphics on text-only screens, clean logo reveal that then docks at the top,
// framed report crops (no cut info), and the report "layers" stack with a name beside every layer.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction} from 'remotion';
import {type Cue, makeCue, type Part} from '../velora/filmkit';
import {Sfx} from '../velora/Velora';
import {CODE, mono, PixelPerson, WorkCard} from '../vl2/Demo';
import {Chip, Cursor, IN_OUT, K, life, Line, Logo, mix, Pixels, prog, RectScreen, sans, Screen, serif} from '../vl2/kit';

export type Demo3Props = {parts: Part[]; duration: number; segments: {s: number; e: number}[]; fps?: number; musicOffset: number};
export const calculateDemo3Metadata: CalculateMetadataFunction<Demo3Props> = ({props}) => {
	const fps = props.fps ?? 30;
	return {fps, width: 1920, height: 1080, durationInFrames: Math.max(fps, Math.ceil(props.duration * fps))};
};
export type Say = (id: string, text: string, after?: string) => number[];
type S = {t: number; c: Cue; a: number; b: number; end: number; say: Say};
const H_BIG = 92; // text-only statements
const H_MED = 66; // headings with visuals

/** On-screen words timed to the voiceover: each word of `text` appears as it is spoken in part `id` (fuzzy match on
 *  the transcript; words the transcript spells differently are interpolated). `after` starts the search later. */
const nrm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
export const makeSay = (parts: Part[]): Say => (id, text, after) => {
	const part = parts.find((x) => x.id === id);
	const words = text.split(' ');
	if (!part) return words.map(() => 0);
	const toks = part.words.map((w) => ({k: nrm(w.w), s: w.s}));
	const like = (a: string, b: string) => !!a && !!b && (a.startsWith(b.slice(0, 3)) || b.startsWith(a.slice(0, 3)));
	let j = 0;
	if (after) {
		const i = toks.findIndex((x) => x.k === nrm(after));
		j = i < 0 ? 0 : i;
	}
	const first = toks.findIndex((x, i) => i >= j && like(x.k, nrm(words[0])));
	if (first >= 0) j = first;
	const out: (number | null)[] = [];
	for (const w of words) {
		let hit = -1;
		for (let d = 0; d < 4 && j + d < toks.length; d++) if (like(toks[j + d].k, nrm(w))) { hit = j + d; break; }
		if (hit >= 0) { out.push(toks[hit].s); j = hit + 1; } else out.push(null);
	}
	for (let i = 0; i < out.length; i++) if (out[i] === null) {
		let a = i - 1; while (a >= 0 && out[a] === null) a--;
		let b = i + 1; while (b < out.length && out[b] === null) b++;
		const ta = a >= 0 ? (out[a] as number) : part.start;
		const tb = b < out.length ? (out[b] as number) : ta + 0.35 * (i - a + 1);
		out[i] = ta + ((tb - ta) * (i - a)) / (b - a);
	}
	return out as number[];
};

/** Persistent brand mark, top-left (crisp pre-downscaled logo). */
export const Corner: React.FC<{o: number}> = ({o}) => (o > 0 ? <Img src={staticFile('vl2/img/logo-240.png')} style={{position: 'absolute', left: 60, top: 46, height: 54, width: (54 * 1010) / 240, opacity: o}} /> : null);

/** Clean logo reveal: soft blur-in + a thin green sweep under it; "Screening" tucked close beneath. */
export const LogoLockup: React.FC<{t: number; at: number; scrAt: number; h?: number}> = ({t, at, scrAt, h = 124}) => {
	const p = prog(t, at, 0.9);
	const sweep = prog(t, at + 0.2, 1.0, IN_OUT);
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			<div style={{transform: `scale(${mix(0.94, 1, p)})`}}>
				<Logo h={h} p={p} />
			</div>
			<div style={{width: 520 * sweep, height: 2, background: `linear-gradient(90deg, transparent, ${K.green}, transparent)`, marginTop: 10, opacity: 1 - prog(t, at + 1.4, 0.6)}} />
			{/* "Screening" sits a touch right of the image centre, under the wordmark (the star sits left) */}
			<div style={{fontFamily: sans, fontWeight: 300, fontSize: h * 0.5, letterSpacing: '0.02em', color: K.text, marginTop: -2, transform: `translateX(${h * 0.1}px)`, opacity: prog(t, scrAt - 0.1, 0.7)}}>Screening</div>
		</div>
	);
};

// ─── Scene 1 ─────────────────────────────────────────────────────────────────
const GLYPHS = ['</>', '{ }', '▤', '◫', '⌘', '↗', '✓', '#'];
const Scene1: React.FC<S> = ({t, c, a, say}) => {
	const tCand = c.W('s1', 'candidates');
	const tBut = c.W('s1', 'but');
	const cardsOut = prog(t, tBut - 0.3, 0.7, IN_OUT); // the three cards leave entirely before the person appears
	const typed = (at: number) => Math.floor(prog(t, at, 2.0, Easing.linear) * CODE.join('\n').length);
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.6 * prog(t, a, 1.2)}} />
			{/* opening statement + floating work glyphs */}
			{t < tCand + 0.1 ? (
				<AbsoluteFill style={{opacity: 1 - prog(t, tCand - 0.35, 0.3)}}>
					{GLYPHS.map((g, i) => {
						const x = 300 + ((i * 211) % 1320);
						const y = mix(900 + (i % 3) * 60, 200 + (i % 4) * 60, prog(t, i * 0.25, 7, Easing.linear));
						return (
							<div key={i} style={{position: 'absolute', left: x, top: y, width: 86, height: 86, borderRadius: 14, background: K.bg2, boxShadow: '0 0 0 1px #2A2D33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: 30, color: i % 3 === 0 ? K.green : '#5C616B', opacity: 0.55 * prog(t, 0.3 + i * 0.2, 0.8), transform: `scale(${0.8 + (i % 3) * 0.12})`}}>
								{g}
							</div>
						);
					})}
					<div style={{position: 'absolute', left: 120, right: 120, top: 340}}>
						<Line t={t} text="AI is changing" at={0} times={say('s1', 'AI is changing')} hl={['ai']} size={H_BIG + 8} weight={400} />
						<div style={{height: 10}} />
						<Line t={t} text="the way work gets done." at={0} times={say('s1', 'the way work gets done.')} size={H_BIG + 8} weight={400} />
					</div>
				</AbsoluteFill>
			) : null}
			{t > tCand - 0.2 && cardsOut < 1 ? (
				<AbsoluteFill style={{opacity: 1 - cardsOut}}>
					<div style={{position: 'absolute', left: 260, right: 260, top: 120}}>
						<Line t={t} text="Candidates can now build more, solve faster, and deliver impressive results with AI." at={0} times={say('s1', 'Candidates can now build more, solve faster, and deliver impressive results with AI.')} size={58} weight={400} hl={['build', 'solve', 'deliver']} />
					</div>
					<WorkCard t={t} at={tCand + 0.1} title="agent/handler.ts" x={150} dim={0}>
						<pre style={{margin: 0, fontFamily: mono, fontSize: 19, lineHeight: 1.6, color: '#C9CDD4', whiteSpace: 'pre'}}>
							{CODE.join('\n').slice(0, typed(c.W('s1', 'build')))}
							<span style={{color: K.green}}>▍</span>
						</pre>
					</WorkCard>
					<WorkCard t={t} at={Math.min(c.W('s1', 'solve'), tCand + 0.5)} title="tests" x={710} dim={0}>
						{['plan()', 'step.run()', 'verify()', 'report()'].map((n, i) => {
							const ok = prog(t, c.W('s1', 'solve') + 0.2 + i * 0.2, 0.2);
							return (
								<div key={n} style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: mono, fontSize: 20, color: '#C9CDD4', marginBottom: 16, opacity: 0.4 + ok * 0.6}}>
									<span style={{color: ok > 0.5 ? K.green : K.dim}}>{ok > 0.5 ? '✓' : '○'}</span> {n}
								</div>
							);
						})}
						<div style={{fontFamily: sans, fontSize: 22, color: K.green, marginTop: 18, opacity: prog(t, c.W('s1', 'solve') + 1.0, 0.4)}}>24 passed · 0.8s</div>
					</WorkCard>
					<WorkCard t={t} at={Math.min(c.W('s1', 'deliver'), tCand + 0.9)} title="deploy" x={1270} dim={0}>
						<div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: sans, fontSize: 24, color: K.text}}>
							<span style={{width: 12, height: 12, borderRadius: 6, background: K.green, boxShadow: `0 0 12px ${K.green}`}} /> Shipped to production
						</div>
						<svg width={456} height={170} style={{marginTop: 20}}>
							<polyline fill="none" stroke={K.green} strokeWidth={3} strokeLinejoin="round" points={Array.from({length: 12}, (_, i) => `${i * 40},${150 - (i * 11 + ((i * 37) % 5) * 9) * prog(t, c.W('s1', 'deliver') + 0.2, 1.2)}`).join(' ')} />
						</svg>
					</WorkCard>
				</AbsoluteFill>
			) : null}
			{t > tBut ? (
				<>
					<PixelPerson t={t} p={prog(t, c.W('s1', 'person') - 0.3, 1.4)} x={960 - 216} y={520} />
					<div style={{position: 'absolute', left: 120, right: 120, top: 120}}>
						<Line t={t} text="For hiring teams," at={0} times={say('s1', 'for hiring teams,', 'but')} size={44} weight={400} color={K.dim} />
						<div style={{height: 10}} />
						<Line t={t} text="evaluating the person behind that work" at={0} times={say('s1', 'evaluating the person behind that work')} size={74} weight={400} it={['person']} />
						<div style={{height: 4}} />
						<Line t={t} text="has become a whole new challenge." at={0} times={say('s1', 'has become a whole new challenge.')} size={74} weight={400} color={K.dim} />
					</div>
				</>
			) : null}
		</AbsoluteFill>
	);
};

// ─── Scene 2 ─────────────────────────────────────────────────────────────────
export const TECH = ['Software Engineer', 'Data Scientist', 'ML Engineer', 'DevOps', 'Backend', 'Frontend', 'QA Automation'];
export const NONTECH = ['Product Manager', 'Designer', 'Business Analyst', 'Marketing', 'Customer Success', 'Operations', 'Sales'];
export const Marquee: React.FC<{t: number; items: string[]; dir: 1 | -1; y: number; label: string; at: number}> = ({t, items, dir, y, label, at}) => {
	const p = prog(t, at, 0.7);
	const shift = ((t * 70 * dir) % 2400) - (dir > 0 ? 2400 : 0);
	const row = [...items, ...items, ...items];
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: y, height: 90, opacity: p, WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)', maskImage: 'linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)'}}>
			<div style={{position: 'absolute', left: 0, top: 18, fontFamily: sans}} />
			<div style={{display: 'flex', gap: 22, transform: `translateX(${shift}px)`, whiteSpace: 'nowrap'}}>
				{row.map((r, i) => (
					<div key={i} style={{padding: '18px 30px', borderRadius: 999, border: `1.5px solid ${i % 4 === 0 ? K.green : K.line}`, background: K.bg2, fontFamily: sans, fontSize: 30, color: i % 4 === 0 ? K.green : K.text}}>
						{r}
					</div>
				))}
			</div>
			<div style={{position: 'absolute', left: 140, top: -38, fontFamily: sans, fontWeight: 500, fontSize: 22, letterSpacing: '0.12em', textTransform: 'uppercase', color: K.dim}}>{label}</div>
		</div>
	);
};

export const ThinkArt: React.FC<{t: number; on: number}> = ({t, on}) => {
	const pts = [[40, 120], [120, 50], [200, 130], [130, 190], [250, 60], [290, 170]];
	const edges = [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [2, 5], [0, 3]];
	return (
		<svg width={330} height={230}>
			{edges.map(([a, b], i) => {
				const p = prog(on, i * 0.1, 0.4);
				return <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={mix(pts[a][0], pts[b][0], p)} y2={mix(pts[a][1], pts[b][1], p)} stroke={K.green} strokeWidth={2.5} opacity={0.75} />;
			})}
			{pts.map(([x, y], i) => (
				<rect key={i} x={x - 9} y={y - 9} width={18} height={18} fill={i % 2 ? K.green : '#9EF5C4'} opacity={0.4 + 0.6 * prog(on, i * 0.08, 0.3)} transform={`rotate(${Math.sin(t + i) * 8} ${x} ${y})`} />
			))}
		</svg>
	);
};
export const AIArt: React.FC<{t: number; on: number}> = ({on}) => {
	const reply = 'Here is a plan with 3 steps…';
	return (
		<div style={{width: 330, fontFamily: sans}}>
			<div style={{marginLeft: 60, padding: '14px 18px', borderRadius: '16px 16px 4px 16px', background: K.green, color: K.ink, fontSize: 20, opacity: prog(on, 0, 0.3)}}>Plan the retrieval step</div>
			<div style={{marginTop: 14, marginRight: 50, padding: '14px 18px', borderRadius: '16px 16px 16px 4px', background: K.panel, color: K.text, fontSize: 20, minHeight: 56, opacity: prog(on, 0.25, 0.3)}}>
				{reply.slice(0, Math.round(reply.length * prog(on, 0.35, 0.6, Easing.linear)))}
			</div>
		</div>
	);
};
export const ContributeArt: React.FC<{t: number; on: number}> = ({on}) => (
	<div style={{width: 330, fontFamily: sans}}>
		<div style={{display: 'flex', height: 26, borderRadius: 6, overflow: 'hidden', marginTop: 50}}>
			{['#2F3238', '#3A3E45', '#4B7A5D', K.green].map((col, i) => (
				<div key={i} style={{flex: 1, background: col, opacity: 0.4 + 0.6 * prog(on, i * 0.12, 0.3)}} />
			))}
		</div>
		<div style={{position: 'relative', height: 50}}>
			<div style={{position: 'absolute', left: `${mix(5, 88, prog(on, 0.2, 0.7, IN_OUT))}%`, top: 8, transform: 'translateX(-50%)', padding: '6px 12px', borderRadius: 6, background: K.text, color: K.ink, fontSize: 18, fontWeight: 600}}>You</div>
		</div>
		<div style={{fontSize: 18, color: K.dim, marginTop: 10}}>Beyond AI-generated work</div>
	</div>
);

const Scene2: React.FC<S> = ({t, c, a, say}) => {
	const tAn = c.W('s2', 'an');
	const tRoles = c.W('s2', 'technical') - 0.5;
	const tLook = c.W('s2', 'looking') - 0.2;
	const three = [c.W('s2', 'think'), c.W('s2', 'work'), c.W('s2', 'contribute')];
	const up = prog(t, tAn - 0.25, 0.9, IN_OUT); // the logo docks at the top instead of leaving
	const roles = life(t, tRoles, tLook + 0.2, 0.6, 0.45);
	const beyond = prog(t, tLook, 0.6);
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.45}} />
			{/* logo reveal — clean, nothing behind the logo */}
			<div style={{position: 'absolute', left: 0, right: 0, top: mix(420, 46, up), display: 'flex', justifyContent: 'center', transform: `scale(${mix(1, 0.58, up)})`, transformOrigin: 'center top'}}>
				<LogoLockup t={t} at={Math.max(c.W('s2', 'vibe') - 0.45, a + 0.5)} scrAt={c.W('s2', 'screening')} h={130} />
			</div>
			{/* AI-era platform for technical and non-technical roles */}
			{t > tAn - 0.3 && t < tLook + 0.4 ? (
				<AbsoluteFill style={{opacity: prog(t, tAn - 0.2, 0.5) * (1 - prog(t, tLook - 0.2, 0.4))}}>
					<div style={{position: 'absolute', left: 120, right: 120, top: 240}}>
						<Line t={t} text="An AI-era assessment platform" at={0} times={say('s2', 'an AI-era assessment platform')} size={80} weight={400} hl={['ai-era']} />
						<div style={{height: 14}} />
						<Line t={t} text="that helps hiring teams evaluate candidates" at={0} times={say('s2', 'that helps hiring teams evaluate candidates')} size={48} weight={300} color={K.dim} />
						<div style={{height: 4}} />
						<Line t={t} text="across both technical and non-technical roles" at={0} times={say('s2', 'across both technical and non-technical roles')} size={48} weight={300} hl={['technical', 'non-technical']} />
					</div>
					{roles > 0 ? (
						<div style={{opacity: roles}}>
							<Marquee t={t} items={TECH} dir={-1} y={640} label="Technical" at={tRoles} />
							<Marquee t={t} items={NONTECH} dir={1} y={820} label="Non-technical" at={tRoles + 0.5} />
						</div>
					) : null}
				</AbsoluteFill>
			) : null}
			{/* beyond the final output: think · work with AI · contribute */}
			{beyond > 0 ? (
				<AbsoluteFill style={{opacity: beyond}}>
					<div style={{position: 'absolute', left: 120, right: 120, top: 230}}>
						<Line t={t} text="Looking beyond the final output" at={0} times={say('s2', 'looking beyond the final output')} size={64} weight={400} it={['beyond']} />
						<div style={{height: 8}} />
						<Line t={t} text="to understand how they think, work with AI, and contribute." at={0} times={say('s2', 'to understand how they think, work with AI, and contribute.')} size={42} weight={300} color={K.dim} />
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
								<div key={l} style={{flex: 1, height: 440, borderRadius: 18, background: K.bg2, boxShadow: active ? `0 0 0 2px ${K.green}, 0 30px 60px -20px rgba(0,215,107,0.35)` : '0 0 0 1px #2A2D33', padding: 34, boxSizing: 'border-box', opacity: 0.35 + 0.65 * p, transform: `translateY(${(1 - p) * 40}px) scale(${active ? 1.03 : 1})`}}>
									{active ? (
										<Chip size={40}>{l}</Chip>
									) : (
										<div style={{fontFamily: sans, fontWeight: 400, fontSize: 40, color: K.text, padding: '12px 0'}}>{l}</div>
									)}
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

// ─── Scene 3 ─────────────────────────────────────────────────────────────────
const Scene3: React.FC<S> = ({t, c, a, say}) => {
	const P = c.P('s3');
	const tClaude = c.W('s3', 'claude') - 0.3;
	const tCopilot = c.W('s3', 'copilot') - 0.3;
	const tCollab = c.W('s3', 'collaborate');
	const dark = prog(t, tCollab - 0.4, 0.7, IN_OUT);
	const enter = prog(t, a, 1.1);
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.3}} />
			{/* the heading follows the voiceover, one phrase at a time */}
			<div style={{position: 'absolute', left: 330, right: 330, top: 60}}>
				{t < c.W('s3', 'in') ? <Line t={t} text="Candidates tackle realistic, role-specific challenges" at={0} times={say('s3', 'candidates tackle realistic, role-specific challenges')} size={50} weight={400} hl={['realistic', 'role-specific']} out={c.W('s3', 'in') - 0.3} /> : null}
				{t >= c.W('s3', 'in') - 0.05 && t < c.W('s3', 'allowing') ? <Line t={t} text="in a dedicated workspace with AI coding tools like Claude Code and GitHub Copilot" at={0} times={say('s3', 'in a dedicated workspace with AI coding tools like Claude Code and GitHub Copilot')} size={46} weight={400} hl={['claude', 'code', 'github', 'copilot']} out={c.W('s3', 'allowing') - 0.3} /> : null}
				{t >= c.W('s3', 'allowing') - 0.05 ? <Line t={t} text="allowing them to solve problems and collaborate with AI along the way." at={0} times={say('s3', 'allowing them to solve problems and collaborate with AI along the way.')} size={50} weight={400} hl={['ai']} /> : null}
			</div>
			<Screen
				t={t}
				src="workspace.png"
				iw={1920}
				ih={991}
				w={1480}
				h={764}
				light
				style={{left: 220, top: 220, opacity: (1 - dark) * Math.min(1, enter * 1.5), transform: `translateY(${(1 - enter) * 70}px) scale(${mix(0.92, 1, enter)})`}}
				cam={[
					{t: P, x: 0.5, y: 0.5, z: 1},
					{t: c.W('s3', 'realistic'), x: 0.5, y: 0.5, z: 1},
					{t: c.W('s3', 'realistic') + 1.1, x: 0.22, y: 0.3, z: 1.6},
					{t: tClaude, x: 0.22, y: 0.3, z: 1.6},
					{t: tClaude + 1.1, x: 0.78, y: 0.32, z: 1.7},
					{t: tCollab - 0.6, x: 0.6, y: 0.4, z: 1.3},
				]}
			/>
			<Screen
				t={t}
				src="ide-dark.png"
				iw={1405}
				ih={985}
				w={1200}
				h={841}
				style={{left: 360, top: 215, opacity: dark, transform: `translateY(${(1 - dark) * 60}px) scale(${mix(0.95, 1, dark)})`}}
				cam={[
					{t: tCollab - 0.3, x: 0.5, y: 0.5, z: 1},
					{t: tCollab + 2.2, x: 0.55, y: 0.35, z: 1.4},
				]}
			/>
			<div style={{position: 'absolute', left: 250, top: 935, display: 'flex', gap: 18}}>
				<Chip p={prog(t, c.W('s3', 'realistic') - 0.1, 0.5)} size={32}>
					Role-specific challenge
				</Chip>
				<Chip p={prog(t, tClaude, 0.5)} size={32} dark={t > tCopilot + 0.3}>
					Claude Code
				</Chip>
				<Chip p={prog(t, tCopilot, 0.5)} size={32} dark={t < tCopilot || t > tCollab}>
					GitHub Copilot
				</Chip>
			</div>
			<Cursor t={t} x={mix(1300, 980, prog(t, c.W('s3', 'solve') - 0.8, 0.8, IN_OUT))} y={mix(700, 520, prog(t, c.W('s3', 'solve') - 0.8, 0.8, IN_OUT))} at={c.W('s3', 'solve') - 0.9} click={c.W('s3', 'solve') + 0.05} out={tCollab - 0.3} />
		</AbsoluteFill>
	);
};

// ─── Scene 4 ─────────────────────────────────────────────────────────────────
type Dim = {part: string; name: string; desc: string; img: string; iw: number; ih: number; rect: [number, number, number, number]; hl: [number, number, number, number]};
// one complete, self-contained region per dimension (whole rows/columns only) + a highlight on the key element
const DIMS: Dim[] = [
	{part: 's4b', name: 'Core Skills', desc: 'Their ability to apply knowledge.', img: 'core-skills.png', iw: 2240, ih: 1410, rect: [0, 0.07, 0.66, 0.37], hl: [0.02, 0.24, 0.65, 0.36]},
	{part: 's4c', name: 'Working with AI', desc: 'How effectively they collaborate with and evaluate AI.', img: 'working-with-ai.png', iw: 2240, ih: 1150, rect: [0, 0.098, 1, 0.6], hl: [0.02, 0.2, 0.99, 0.385]},
	{part: 's4d', name: 'Ownership', desc: 'Their decision-making and responsibility.', img: 'four-aspects.png', iw: 2240, ih: 1050, rect: [0, 0.105, 1, 0.78], hl: [0.02, 0.585, 0.99, 0.675]},
	{part: 's4e', name: 'Human Contribution', desc: 'The judgment and value they bring beyond AI-generated work.', img: 'human-contribution.png', iw: 2240, ih: 570, rect: [0, 0.06, 1, 0.95], hl: [0.02, 0.43, 0.99, 0.56]},
];
const Scene4: React.FC<S> = ({t, c, say}) => {
	const tFour = c.W('s4a', 'four');
	const tList = c.P('s4b') - 0.3;
	const toList = prog(t, tList, 0.9, IN_OUT);
	const active = DIMS.filter((d) => t >= c.P(d.part) - 0.25).length - 1;
	const fill = prog(t, tFour - 0.2, 1.0);
	return (
		<AbsoluteFill style={{background: K.bg}}>
			{/* "only part of the picture": the output is one tile of four */}
			{toList < 1 ? (
				<AbsoluteFill style={{opacity: 1 - toList}}>
					<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.35}} />
					<div style={{position: 'absolute', left: 120, right: 120, top: 130}}>
						{t < c.W('s4a', 'vibe') - 0.05 ? <Line t={t} text="But the final output is only part of the picture." at={0} times={say('s4a', 'but the final output is only part of the picture.')} size={74} weight={400} it={['picture']} out={c.W('s4a', 'vibe') - 0.35} /> : <Line t={t} text="VibeLevel evaluates candidates across four dimensions." at={0} times={say('s4a', 'VibeLevel evaluates candidates across four dimensions.')} size={74} weight={400} hl={['four']} />}
					</div>
					<div style={{position: 'absolute', left: 960 - 430, top: 360, width: 860, height: 560, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 22}}>
						{['Final output', ...DIMS.slice(1).map((d) => d.name)].map((l, i) => {
							const first = i === 0;
							const appear = prog(t, c.P('s4a') + 0.3 + i * 0.15, 0.6);
							const lit = first ? 1 : prog(fill, (i - 1) * 0.2, 0.5);
							const label = fill > 0.3 ? DIMS[i].name : first ? 'Final output' : '';
							return (
								<div key={i} style={{borderRadius: 16, border: lit > 0.5 ? 'none' : `2px dashed #3A3E45`, background: lit > 0.5 ? (first && fill < 0.3 ? K.panel : 'rgba(0,215,107,0.12)') : 'transparent', boxShadow: lit > 0.5 && fill > 0.3 ? `inset 0 0 0 2px ${K.green}` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: appear, fontFamily: sans, fontSize: 40, color: fill > 0.3 ? K.text : K.dim, transform: `scale(${mix(0.94, 1, appear)})`}}>
									{label}
								</div>
							);
						})}
					</div>
				</AbsoluteFill>
			) : null}
			{toList > 0 ? (
				<AbsoluteFill style={{opacity: toList}}>
					<div style={{position: 'absolute', left: 100, top: 200, width: 500}}>
						{DIMS.map((d, i) => {
							const on = i === active;
							const p = prog(t, c.P(d.part) - 0.25, 0.5);
							return (
								<div key={d.name} style={{height: on ? 250 : 100}}>
									{on ? (
										<>
											<Chip p={p} size={48}>
												{d.name}
											</Chip>
											<div style={{fontFamily: sans, fontWeight: 300, fontSize: 34, lineHeight: 1.3, color: K.text, marginTop: 22, opacity: prog(t, c.P(d.part) + 0.1, 0.5)}}>{d.desc}</div>
										</>
									) : (
										<div style={{fontFamily: sans, fontWeight: 300, fontSize: 46, color: i < active ? '#8E939D' : '#4C5058', paddingTop: 12}}>{d.name}</div>
									)}
								</div>
							);
						})}
					</div>
					{DIMS.map((d, i) => {
						const s0 = c.P(d.part) - 0.3;
						const s1 = i < 3 ? c.P(DIMS[i + 1].part) - 0.3 : c.E('s4e') + 0.4;
						const o = life(t, s0, s1 + 0.15, 0.3, 0.25);
						if (o <= 0) return null;
						return <RectScreen key={d.img} t={t} src={d.img} iw={d.iw} ih={d.ih} w={1240} h={760} pad={22} style={{left: 640, top: 180, opacity: o, transform: `translateX(${(1 - prog(t, s0, 0.5)) * 40}px)`}} keys={[{t: s0, r: d.rect}]} hl={d.hl} hlAt={s0 + 0.9} push={prog(t, s0, s1 - s0, Easing.linear) * 0.03} />;
					})}
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};

// ─── Scene 5 — AI-led interview (conceptual UI) ──────────────────────────────
const Scene5: React.FC<S> = ({t, c, a, say}) => {
	const P = c.P('s5');
	const enter = prog(t, a, 1.0);
	const q = "Walk me through how you verified the agent's output before you submitted.";
	const typed = q.slice(0, Math.round(q.length * prog(t, P + 0.6, 2.0, Easing.linear)));
	const speaking = t > P + 2.9;
	const chips = [c.W('s5', 'understanding'), c.W('s5', 'reasoning')];
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.3}} />
			<div style={{position: 'absolute', left: 320, right: 320, top: 50}}>
				<Line t={t} text="After the assessment," at={0} times={say('s5', 'after the assessment,')} size={40} weight={300} color={K.dim} />
				<div style={{height: 6}} />
				<Line t={t} text="candidates complete a short AI-led interview" at={0} times={say('s5', 'candidates complete a short AI-led interview')} size={56} weight={400} hl={['ai-led']} />
			</div>
			<div style={{position: 'absolute', left: 210, top: 250, width: 1500, height: 690, borderRadius: 16, background: K.bg2, boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7), 0 0 0 1px #2A2D33', overflow: 'hidden', opacity: Math.min(1, enter * 1.4), transform: `translateY(${(1 - enter) * 60}px)`}}>
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: `1px solid ${K.line}`, fontFamily: sans}}>
					<span style={{fontSize: 22, color: K.dim}}>AI-led interview</span>
					<div style={{display: 'flex', gap: 24, fontSize: 20, color: K.dim}}>
						<span>Question 2 of 4</span>
						<span style={{display: 'flex', alignItems: 'center', gap: 8, color: K.text}}>
							<span style={{width: 10, height: 10, borderRadius: 5, background: '#FF5A5A', opacity: 0.5 + 0.5 * Math.sin(t * 5)}} /> 02:{String(14 + (Math.floor(Math.max(0, t - P)) % 46)).padStart(2, '0')}
						</span>
					</div>
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
							{['Understanding', 'Reasoning'].map((l, i) => (
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
						<div style={{fontFamily: sans, fontSize: 18, color: K.dim}}>{speaking ? 'Candidate answering' : 'Waiting for answer'}</div>
					</div>
				</div>
			</div>
			<div style={{position: 'absolute', left: 210, top: 955, fontFamily: sans, fontSize: 18, color: '#5C616B', opacity: enter}}>Illustrative interface</div>
		</AbsoluteFill>
	);
};

// ─── Scene 6 — the report, as labelled layers ────────────────────────────────
type Layer = {label: string; img: string; at: (c: Cue) => number};
const LAYERS: Layer[] = [
	{label: 'Performance scores', img: 'report-overview.png', at: (c) => c.W('s6', 'detailed') - 0.1},
	{label: 'AI insights', img: 'working-with-ai.png', at: (c) => c.W('s6', 'insights') - 0.4},
	{label: 'Code Review', img: 'code-review.png', at: (c) => c.W('s6', 'code') - 0.15},
	{label: 'Video Q&A', img: 'video-qa.png', at: (c) => c.W('s6', 'video') - 0.15},
	{label: 'Interview Guide', img: 'interview-guide.png', at: (c) => c.W('s6', 'interview') - 0.15},
];
const Scene6: React.FC<S> = ({t, c, a, say}) => {
	const enter = prog(t, a, 0.9);
	const tGuide = c.W('s6', 'explore') - 0.3;
	const toGuide = prog(t, tGuide, 0.9, IN_OUT);
	const n = LAYERS.length;
	return (
		<AbsoluteFill style={{background: K.light}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.35, light: true}} />
			<div style={{position: 'absolute', left: 320, right: 320, top: 70, opacity: enter * (1 - toGuide)}}>
				<Line t={t} text="Recruiters get a detailed report" at={0} times={say('s6', 'recruiters get a detailed report')} size={62} weight={400} color={K.ink} it={['report']} />
			</div>
			{/* stacked layers, each named */}
			{toGuide < 1 ? (
				<AbsoluteFill style={{opacity: 1 - toGuide}}>
					<div style={{position: 'absolute', left: 760, top: 640, perspective: 2400}}>
						{LAYERS.map((l, i) => {
							const p = prog(t, l.at(c), 0.8);
							const k = i - 2;
							return (
								<div key={l.img} style={{position: 'absolute', left: -380, top: -230, width: 760, height: 460, borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 60px -20px rgba(20,24,30,0.35)', transform: `rotateX(52deg) rotateZ(-28deg) translate3d(${k * 40}px, ${k * -40}px, ${mix(-260, (n - 1 - i) * -1 + i * 70, p)}px)`, opacity: p}}>
									<Img src={staticFile(`vl2/img/${l.img}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />
								</div>
							);
						})}
					</div>
					{/* the layer names, top layer first, each with a leader line */}
					<div style={{position: 'absolute', left: 1260, top: 250}}>
						{[...LAYERS].reverse().map((l, ri) => {
							const i = n - 1 - ri;
							const p = prog(t, l.at(c) + 0.15, 0.5);
							const latest = LAYERS.filter((x) => t >= x.at(c)).length - 1 === i;
							return (
								<div key={l.label} style={{display: 'flex', alignItems: 'center', gap: 18, height: 112, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}>
									<div style={{width: 70, height: 2, background: latest ? K.greenDeep : '#B9BEC6'}} />
									<div style={{fontFamily: sans, fontWeight: 500, fontSize: 22, color: '#8E939D', width: 70}}>Layer {i + 1}</div>
									{latest ? (
										<Chip size={34}>{l.label}</Chip>
									) : (
										<span style={{fontFamily: sans, fontWeight: 400, fontSize: 34, color: K.ink}}>{l.label}</span>
									)}
								</div>
							);
						})}
					</div>
				</AbsoluteFill>
			) : null}
			{/* Interview Guide close-up: strengths and gaps */}
			{toGuide > 0 ? (
				<AbsoluteFill style={{opacity: toGuide}}>
					<RectScreen t={t} src="interview-guide.png" iw={2240} ih={1410} w={1160} h={760} style={{left: 640, top: 160}} keys={[{t: tGuide + 0.3, r: [0, 0.08, 1, 0.42]}, {t: tGuide + 2.4, r: [0, 0.3, 1, 0.72]}]} />
					<div style={{position: 'absolute', left: 120, top: 260, width: 470}}>
						<div style={{fontFamily: sans, fontWeight: 400, fontSize: 64, lineHeight: 1.12, color: K.ink, letterSpacing: '-0.02em'}}>
							Interview <span style={{fontFamily: serif, fontStyle: 'italic', color: K.greenDeep}}>Guide</span>
						</div>
						<div style={{marginTop: 18}}>
							<Line t={t} text="to explore candidate strengths and gaps" at={0} times={say('s6', 'to explore candidate strengths and gaps')} size={36} weight={300} color="#4C5058" align="left" />
						</div>
						{(
							[
								['Strengths', c.W('s6', 'strengths')],
								['Gaps', c.W('s6', 'gaps')],
							] as const
						).map(([l, at], i) => (
							<div key={l} style={{marginTop: i ? 18 : 44}}>
								<Chip p={prog(t, at - 0.15, 0.5)} size={38}>
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

// ─── Scene 7 + end card ──────────────────────────────────────────────────────
const Scene7: React.FC<S> = ({t, c, end}) => {
	const tB = c.P('s7b');
	const out1 = prog(t, tB - 0.45, 0.4);
	const toEnd = prog(t, end - 0.3, 0.8, IN_OUT);
	const reveal = prog(t, c.W('s7a', 'understand') - 0.2, 1.0, IN_OUT); // the output card slides away → the person
	return (
		<AbsoluteFill style={{background: K.bg}}>
			<Pixels t={t} w={1920} h={1080} mode={{kind: 'ambient', strength: 0.5}} />
			{out1 < 1 ? (
				<AbsoluteFill style={{opacity: 1 - out1}}>
					<div style={{position: 'absolute', left: 120, right: 120, top: 130}}>
						<Line t={t} text="Go beyond the output." at={c.P('s7a') + 0.05} size={H_BIG} weight={400} it={['beyond']} />
						<div style={{height: 6}} />
						<Line t={t} text="Understand the person behind it." at={c.W('s7a', 'understand') - 0.05} size={H_BIG} weight={400} color={K.dim} it={['person']} />
					</div>
					<PixelPerson t={t} p={prog(t, c.W('s7a', 'understand'), 1.0)} x={960 - 216} y={520} />
					<div style={{position: 'absolute', left: 960 - 260 + reveal * 620, top: 560, width: 520, height: 360, borderRadius: 16, background: K.bg2, boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px #2A2D33', padding: 28, boxSizing: 'border-box', opacity: prog(t, c.P('s7a'), 0.5) * (1 - reveal * 0.7), transform: `rotate(${reveal * 8}deg)`}}>
						<div style={{fontFamily: sans, fontSize: 22, color: K.dim}}>Final output</div>
						<pre style={{fontFamily: mono, fontSize: 18, lineHeight: 1.6, color: '#C9CDD4', marginTop: 18}}>{CODE.slice(0, 6).join('\n')}</pre>
					</div>
				</AbsoluteFill>
			) : null}
			{t > tB - 0.5 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: mix(330, 300, toEnd), display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					<LogoLockup t={t} at={tB - 0.3} scrAt={c.W('s7b', 'screening')} h={124} />
					<div style={{marginTop: 50, opacity: 1 - toEnd}}>
						<Line t={t} text="Hire for what matters in the AI era." at={c.W('s7b', 'for') - 0.25} size={64} weight={400} hl={['ai']} it={['matters']} />
					</div>
				</div>
			) : null}
			{toEnd > 0 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: toEnd}}>
					<div style={{marginTop: 0, padding: '24px 54px', borderRadius: 999, background: K.green, color: K.ink, fontFamily: sans, fontWeight: 600, fontSize: 36, display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${prog(t, end + 0.2, 0.6, Easing.bezier(0.34, 1.4, 0.64, 1))})`, boxShadow: '0 20px 50px -12px rgba(0,215,107,0.45)'}}>
						Book a Demo
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={K.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
							<path d="M5 12h14M13 6l6 6-6 6" />
						</svg>
					</div>
					<div style={{fontFamily: sans, fontSize: 26, color: K.dim, marginTop: 28, opacity: prog(t, end + 0.6, 0.6)}}>vibelevel.ai</div>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ─── film ────────────────────────────────────────────────────────────────────
export const VibeLevelDemo3: React.FC<Demo3Props> = (p) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	if (!p.parts.length) return <AbsoluteFill style={{background: K.bg}} />;
	const c = makeCue(p.parts);
	const say = makeSay(p.parts);
	const cut = (id: string) => c.P(id) - 0.3;
	const end = c.E('s7b') - 0.2;
	const scenes: [React.FC<S>, number, number][] = [
		[Scene1, 0, cut('s2')],
		[Scene2, cut('s2'), cut('s3')],
		[Scene3, cut('s3'), cut('s4a')],
		[Scene4, cut('s4a'), cut('s5')],
		[Scene5, cut('s5'), cut('s6')],
		[Scene6, cut('s6'), cut('s7a')],
		[Scene7, cut('s7a'), p.duration + 1],
	];
	const cuts = ['s2', 's3', 's4a', 's5', 's6', 's7a'].map(cut);
	const wipe = cuts.map((x) => (t > x - 0.45 && t < x + 0.45 ? (t - (x - 0.45)) / 0.45 : null)).find((v) => v !== null);
	// brand mark top-left, except while the logo itself is on screen (scene 2 reveal, the finale)
	const corner = (t > 0.4 ? 1 : 0) * (1 - life(t, cut('s2') - 0.2, cut('s3') + 0.3, 0.3, 0.3)) * (1 - prog(t, cut('s7a') - 0.2, 0.3));
	return (
		<AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
			{scenes.map(([Sc, a, b], i) => (t >= a && t < b ? <Sc key={i} t={t} c={c} a={a} b={b} end={end} say={say} /> : null))}
			{wipe !== null && wipe !== undefined ? <Pixels t={t} w={1920} h={1080} cell={30} mode={{kind: 'wipe', p: wipe}} /> : null}
			<Corner o={Math.max(0, corner)} />
			<Sound p={p} c={c} cuts={cuts} end={end} />
		</AbsoluteFill>
	);
};

const LEVEL = {voice: 0.09, gap: 0.16, end: 0.3};
const Sound: React.FC<{p: Demo3Props; c: Cue; cuts: number[]; end: number}> = ({p, c, cuts, end}) => {
	const {fps} = useVideoConfig();
	const voEnd = p.parts[p.parts.length - 1].end;
	const speech = (t: number) => Math.max(0, ...p.segments.map((g) => prog(t, g.s - 0.25, 0.25, Easing.linear) * (1 - prog(t, g.e, 0.4, Easing.linear))));
	const sfx: [number, string, number][] = [
		...cuts.map((x, i): [number, string, number] => [x - 0.4, i % 2 ? 'pixel-2' : 'pixel-1', 0.2]),
		[c.W('s1', 'solve') + 1.0, 'confirm-chime', 0.1],
		[c.W('s2', 'vibe') - 0.45, 'logo-reveal', 0.2],
		...[c.W('s2', 'think'), c.W('s2', 'work'), c.W('s2', 'contribute')].map((x): [number, string, number] => [x - 0.2, 'ui-tap', 0.15]),
		[c.W('s3', 'solve') + 0.05, 'soft-click', 0.3],
		[c.W('s4a', 'four') - 0.2, 'line-draw', 0.14],
		...['s4b', 's4c', 's4d', 's4e'].map((id): [number, string, number] => [c.P(id) - 0.25, 'ui-tap', 0.15]),
		...LAYERS.map((l): [number, string, number] => [l.at(c), 'soft-swoosh', 0.1]),
		[c.P('s7b') - 0.3, 'logo-reveal', 0.2],
		[end + 0.7, 'confirm-chime', 0.12],
	];
	return (
		<>
			<Audio src={staticFile('vl2/narration-v3.wav')} />
			<Audio
				src={staticFile('vl2/music.mp3')}
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
