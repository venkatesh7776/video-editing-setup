// Branded motion-graphic scenes for the VibeLevel Aura guide.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, LogoMark, Wordmark} from './brand';
import {spokenAt, type SceneTiming} from './timing';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const useSpring = (delay: number, damping = 16) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: frame - delay, fps, config: {damping, stiffness: 120}});
};

/** Fade + rise entrance. */
const Rise: React.FC<{delay: number; children: React.ReactNode; style?: React.CSSProperties; distance?: number}> = ({delay, children, style, distance = 40}) => {
	const p = useSpring(delay, 200);
	return <div style={{opacity: p, transform: `translateY(${(1 - p) * distance}px)`, ...style}}>{children}</div>;
};

const LightBg: React.FC<{children: React.ReactNode}> = ({children}) => {
	const frame = useCurrentFrame();
	const drift = Math.sin(frame / 60) * 30;
	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(900px 600px at ${20 + drift / 10}% 15%, #D9F2E3 0%, transparent 60%), radial-gradient(900px 600px at 85% 90%, #ECE6FD 0%, transparent 55%), ${colors.page}`,
				fontFamily: fonts.body,
				color: colors.ink,
			}}
		>
			<AbsoluteFill style={{backgroundImage: `linear-gradient(${colors.line}55 1px, transparent 1px), linear-gradient(90deg, ${colors.line}55 1px, transparent 1px)`, backgroundSize: '64px 64px', maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 75%)'}} />
			{children}
		</AbsoluteFill>
	);
};

const DarkBg: React.FC<{children: React.ReactNode}> = ({children}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(1100px 700px at 50% ${40 + Math.sin(frame / 50) * 4}%, #145C40 0%, ${colors.greenDeep} 55%, #07241A 100%)`,
				fontFamily: fonts.body,
				color: colors.white,
			}}
		>
			<AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(circle at 50% 45%, black, transparent 70%)'}} />
			{children}
		</AbsoluteFill>
	);
};

export const StepChip: React.FC<{step: number; label: string; dark?: boolean}> = ({step, label, dark}) => {
	const p = useSpring(4, 18);
	return (
		<div style={{position: 'absolute', top: 70, left: 110, display: 'flex', alignItems: 'center', gap: 16, opacity: p, transform: `translateX(${(1 - p) * -40}px)`}}>
			<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: dark ? colors.greenDeep : colors.neon, background: dark ? colors.neon : colors.greenDeep, padding: '8px 16px', borderRadius: 10}}>
				STEP {step}
			</div>
			<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 30, color: dark ? colors.white : colors.ink}}>{label}</div>
		</div>
	);
};

const Title: React.FC<{children: React.ReactNode; delay?: number; top?: number; size?: number}> = ({children, delay = 8, top = 150, size = 64}) => (
	<Rise delay={delay} style={{position: 'absolute', top, left: 110, right: 110, fontFamily: fonts.heading, fontWeight: 700, fontSize: size, letterSpacing: -1.5, lineHeight: 1.05}}>
		{children}
	</Rise>
);

const G: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: colors.green}}>{children}</span>;

// ───────────────────────────── Intro ─────────────────────────────

export const Intro: React.FC<{scene: SceneTiming}> = () => {
	const frame = useCurrentFrame();
	const logo = useSpring(2, 11);
	const glow = 0.5 + 0.5 * Math.sin(frame / 12);
	return (
		<DarkBg>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
				<div style={{transform: `scale(${logo}) rotate(${(1 - logo) * -90}deg)`, filter: `drop-shadow(0 0 ${30 + glow * 30}px rgba(0,230,118,0.55))`}}>
					<LogoMark size={190} />
				</div>
				<Rise delay={14} style={{marginTop: 40}}>
					<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 120, letterSpacing: -3}}>
						Vibe<span style={{color: colors.neon}}>Level</span>
					</div>
				</Rise>
				<Rise delay={24} style={{marginTop: 18}}>
					<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: colors.neon, border: `2px solid rgba(0,230,118,0.45)`, background: 'rgba(0,230,118,0.08)', padding: '10px 26px', borderRadius: 40}}>
						✦ AURA · YOUR AI STYLE INSIGHTS
					</div>
				</Rise>
				<Rise delay={40} style={{marginTop: 40}}>
					<div style={{fontSize: 46, fontWeight: 500, color: 'rgba(255,255,255,0.86)'}}>
						Discover your <span style={{color: colors.mint, fontWeight: 700}}>AI Style</span> from your AI Sessions.
					</div>
				</Rise>
			</AbsoluteFill>
		</DarkBg>
	);
};

// ───────────────────────────── Connect ─────────────────────────────

const TOOLS = [
	{name: 'Claude Code', color: '#D97757', glyph: '✳'},
	{name: 'Cursor', color: '#1A1A1A', glyph: '▲'},
	{name: 'VS Code', color: '#007ACC', glyph: '◆'},
	{name: 'Codex', color: '#10A37F', glyph: '◎'},
	{name: 'Claude Desktop', color: '#C96442', glyph: '✳'},
];

export const Connect: React.FC<{scene: SceneTiming}> = ({scene}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const toolAt = TOOLS.map((t, i) => spokenAt(scene, t.name, 0.25 + i * 0.07));
	const mcpAt = spokenAt(scene, 'single MCP', 0.75) - 6;
	const hub = spring({frame: frame - mcpAt, fps, config: {damping: 13}});
	const auraIn = spring({frame: frame - mcpAt - 10, fps, config: {damping: 14}});
	const rowY = (i: number) => 330 + i * 128;
	const hubX = 1060;
	const hubY = 586;

	return (
		<LightBg>
			<StepChip step={1} label="Connect your tools" />
			<Title delay={6}>
				One connector. <G>All your AI tools.</G>
			</Title>
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
				{TOOLS.map((t, i) => {
					const y = rowY(i) + 42;
					const d = `M 560 ${y} C 800 ${y}, 820 ${hubY}, ${hubX - 150} ${hubY}`;
					const draw = interpolate(frame, [toolAt[i] + 4, toolAt[i] + 22], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
					const pulse = ((frame - toolAt[i]) % 40) / 40;
					return (
						<g key={t.name}>
							<path d={d} stroke={colors.green} strokeOpacity={0.35} strokeWidth={4} fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={draw} />
							{frame > toolAt[i] + 22 ? (
								<path d={d} stroke={colors.neon} strokeWidth={6} fill="none" pathLength={1} strokeDasharray="0.06 0.94" strokeDashoffset={-pulse} strokeLinecap="round" />
							) : null}
						</g>
					);
				})}
				<path d={`M ${hubX + 150} ${hubY} L ${1390} ${hubY}`} stroke={colors.green} strokeWidth={4} strokeOpacity={0.35 * auraIn} strokeDasharray="10 10" strokeDashoffset={-frame} />
			</svg>
			{TOOLS.map((t, i) => {
				const p = spring({frame: frame - toolAt[i] + 4, fps, config: {damping: 14}});
				return (
					<div key={t.name} style={{position: 'absolute', left: 150, top: rowY(i), width: 410, height: 84, display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px', background: colors.white, borderRadius: 18, border: `1px solid ${colors.line}`, boxShadow: '0 10px 30px rgba(14,59,43,0.08)', opacity: p, transform: `translateX(${(1 - p) * -60}px)`}}>
						<div style={{width: 48, height: 48, borderRadius: 12, background: t.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26}}>{t.glyph}</div>
						<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 32}}>{t.name}</div>
					</div>
				);
			})}
			<div style={{position: 'absolute', left: hubX - 150, top: hubY - 120, width: 300, height: 240, borderRadius: 28, background: colors.greenDeep, color: colors.white, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, transform: `scale(${hub})`, boxShadow: `0 0 0 ${8 + 6 * Math.sin(frame / 8)}px rgba(0,230,118,0.15), 0 30px 60px rgba(14,59,43,0.35)`}}>
				<div style={{fontSize: 64}}>🔌</div>
				<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 40, color: colors.neon}}>MCP</div>
				<div style={{fontSize: 24, opacity: 0.8}}>one connector</div>
			</div>
			<div style={{position: 'absolute', left: 1390, top: hubY - 130, width: 380, height: 260, borderRadius: 28, background: colors.white, border: `2px solid ${colors.green}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: auraIn, transform: `translateX(${(1 - auraIn) * 50}px)`, boxShadow: '0 20px 50px rgba(14,59,43,0.15)'}}>
				<LogoMark size={86} />
				<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 40}}>VibeLevel Aura</div>
				<div style={{fontSize: 22, color: colors.muted}}>No test. No new IDE.</div>
			</div>
		</LightBg>
	);
};

// ───────────────────────────── Observe ─────────────────────────────

const SIGNALS = [
	{label: 'Prompt quality', phrase: 'prompt quality', icon: '✍️', value: 0.84},
	{label: 'Steering the AI', phrase: 'steer', icon: '🧭', value: 0.88},
	{label: 'Problem breakdown', phrase: 'break problems', icon: '🧩', value: 0.76},
	{label: 'When you step in', phrase: 'step in', icon: '✋', value: 0.7},
	{label: 'Original value you add', phrase: 'original value', icon: '💡', value: 0.84},
];

const CHAT = [
	{who: 'You', text: 'Add rate limiting to the API. Plan first, then implement.'},
	{who: 'AI', text: 'Plan: token bucket per user, Redis store, 429 responses…'},
	{who: 'You', text: 'Use a sliding window instead, and write the tests first.'},
	{who: 'AI', text: 'Updated. 12 tests added — all passing ✓'},
];

export const Observe: React.FC<{scene: SceneTiming}> = ({scene}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<LightBg>
			<StepChip step={2} label="Work as usual" />
			<Title delay={6}>
				Aura learns <G>how you work with AI.</G>
			</Title>
			{/* Session card */}
			<Rise delay={10} style={{position: 'absolute', left: 110, top: 330, width: 760, height: 560, borderRadius: 22, background: colors.navy, padding: 34, boxShadow: '0 30px 70px rgba(8,17,31,0.3)'}}>
				<div style={{display: 'flex', gap: 9, marginBottom: 26}}>
					{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />)}
					<div style={{marginLeft: 16, fontFamily: fonts.mono, fontSize: 18, color: 'rgba(255,255,255,0.5)'}}>claude-code · session</div>
				</div>
				{CHAT.map((m, i) => {
					const start = 18 + i * 40;
					const chars = Math.floor(interpolate(frame, [start, start + 30], [0, m.text.length], clamp));
					if (frame < start) return null;
					return (
						<div key={i} style={{marginBottom: 22, fontFamily: fonts.mono, fontSize: 22, lineHeight: 1.45}}>
							<span style={{color: m.who === 'You' ? colors.neon : colors.mint, fontWeight: 700}}>{m.who === 'You' ? '› you' : '◆ ai '}</span>{' '}
							<span style={{color: m.who === 'You' ? 'white' : 'rgba(255,255,255,0.72)'}}>{m.text.slice(0, chars)}</span>
						</div>
					);
				})}
			</Rise>
			{/* Signals */}
			{SIGNALS.map((s, i) => {
				const at = spokenAt(scene, s.phrase, 0.35 + i * 0.1) - 4;
				const p = spring({frame: frame - at, fps, config: {damping: 15}});
				const fill = interpolate(frame, [at + 6, at + 30], [0, s.value], {...clamp, easing: Easing.out(Easing.cubic)});
				return (
					<div key={s.label} style={{position: 'absolute', left: 930, top: 330 + i * 112, width: 880, height: 94, borderRadius: 18, background: colors.white, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px', opacity: p, transform: `translateX(${(1 - p) * 60}px)`, boxShadow: '0 10px 30px rgba(14,59,43,0.07)'}}>
						<div style={{fontSize: 36}}>{s.icon}</div>
						<div style={{width: 360, fontFamily: fonts.heading, fontWeight: 700, fontSize: 30}}>{s.label}</div>
						<div style={{flex: 1, height: 14, borderRadius: 7, background: colors.mintBg, overflow: 'hidden'}}>
							<div style={{width: `${fill * 100}%`, height: '100%', borderRadius: 7, background: `linear-gradient(90deg, ${colors.green}, ${colors.neon})`}} />
						</div>
					</div>
				);
			})}
		</LightBg>
	);
};

// ───────────────────────────── Privacy ─────────────────────────────

const RAW_LINES = [
	'prompt: "refactor billing.ts for acme-corp…"',
	'file: /Users/sam/acme/secrets/.env',
	'api_key = sk-live-9f2c…',
	'email: sam.lee@acme.com',
	'terminal: npm run deploy --prod',
];

export const Privacy: React.FC<{scene: SceneTiming}> = ({scene}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const redactAt = spokenAt(scene, 'redacted', 0.45) - 10;
	const sendAt = spokenAt(scene, 'sent', 0.8) - 6;
	const shield = spring({frame: frame - redactAt - 20, fps, config: {damping: 12}});
	const send = spring({frame: frame - sendAt, fps, config: {damping: 16}});
	return (
		<DarkBg>
			<Rise delay={4} style={{position: 'absolute', top: 90, left: 0, right: 0, textAlign: 'center', fontFamily: fonts.heading, fontWeight: 700, fontSize: 66, letterSpacing: -1.5}}>
				Privacy-first. <span style={{color: colors.neon}}>Redacted on your machine.</span>
			</Rise>
			<Rise delay={10} style={{position: 'absolute', left: 170, top: 300, width: 840, height: 520, borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', padding: 40}}>
				<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 26, color: colors.mint, letterSpacing: 2, marginBottom: 30}}>💻 ON YOUR MACHINE</div>
				{RAW_LINES.map((l, i) => {
					const t = redactAt + i * 6;
					const r = interpolate(frame, [t, t + 12], [0, 1], clamp);
					return (
						<div key={i} style={{position: 'relative', fontFamily: fonts.mono, fontSize: 25, marginBottom: 26, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap'}}>
							<span style={{opacity: 1 - r * 0.85}}>{l}</span>
							<div style={{position: 'absolute', left: 0, top: -2, height: 34, width: `${r * 100}%`, maxWidth: 720, borderRadius: 6, background: `linear-gradient(90deg, ${colors.green}, ${colors.neon})`, opacity: 0.85}} />
						</div>
					);
				})}
			</Rise>
			<div style={{position: 'absolute', left: 1005, top: 480, width: 150, height: 150, borderRadius: 75, background: colors.neon, color: colors.greenDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, transform: `scale(${shield})`, boxShadow: '0 0 60px rgba(0,230,118,0.6)'}}>🛡️</div>
			<div style={{position: 'absolute', left: 1180, top: 330, width: 580, height: 460, borderRadius: 24, background: colors.white, color: colors.ink, padding: 40, opacity: send, transform: `translateX(${(1 - send) * 80}px)`}}>
				<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 26, color: colors.green, letterSpacing: 2, marginBottom: 28}}>SENT TO AURA</div>
				{['Collaboration signals', 'Skill signals', 'Truncated excerpts'].map((t) => (
					<div key={t} style={{display: 'flex', alignItems: 'center', gap: 16, fontSize: 32, fontWeight: 500, marginBottom: 24}}>
						<span style={{color: colors.green, fontSize: 34}}>✓</span>
						{t}
					</div>
				))}
				<div style={{marginTop: 20, fontSize: 22, color: colors.muted}}>Never your full prompts, files, or transcripts.</div>
			</div>
		</DarkBg>
	);
};

// ───────────────────────────── Score ─────────────────────────────

const DIMENSIONS = [
	{name: 'Prompting', score: 8.4, color: colors.blue},
	{name: 'AI Collaboration', score: 8.8, color: colors.green},
	{name: 'Product Thinking', score: 7.6, color: colors.purple},
	{name: 'Design Sense', score: 8.1, color: '#DB2777'},
	{name: 'You vs AI', score: 8.4, color: colors.amber, spoken: 'You versus'},
];

export const Score: React.FC<{scene: SceneTiming}> = ({scene}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const gaugeAt = spokenAt(scene, 'Aura Score', 0.25) - 6;
	const value = interpolate(frame, [gaugeAt, gaugeAt + 45], [0, 8.1], {...clamp, easing: Easing.out(Easing.cubic)});
	const R = 190;
	const C = 2 * Math.PI * R;
	const arc = 0.75; // gauge covers 270°
	const gIn = spring({frame: frame - gaugeAt, fps, config: {damping: 15}});
	return (
		<LightBg>
			<StepChip step={3} label="Get your Aura" />
			<Title delay={6}>
				Your Aura Score <G>+ five skill dimensions</G>
			</Title>
			<div style={{position: 'absolute', left: 150, top: 330, width: 520, height: 520, opacity: gIn, transform: `scale(${0.85 + 0.15 * gIn})`}}>
				<svg width={520} height={520} viewBox="0 0 520 520">
					<g transform="rotate(135 260 260)">
						<circle cx={260} cy={260} r={R} fill="none" stroke={colors.mintBg} strokeWidth={34} strokeDasharray={`${C * arc} ${C}`} strokeLinecap="round" />
						<circle cx={260} cy={260} r={R} fill="none" stroke="url(#g)" strokeWidth={34} strokeDasharray={`${C * arc * (value / 10)} ${C}`} strokeLinecap="round" />
					</g>
					<defs>
						<linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
							<stop offset="0" stopColor={colors.green} />
							<stop offset="1" stopColor={colors.neon} />
						</linearGradient>
					</defs>
					<text x={130} y={460} fontFamily={fonts.heading} fontSize={26} fill={colors.muted}>0</text>
					<text x={370} y={460} fontFamily={fonts.heading} fontSize={26} fill={colors.muted}>10</text>
				</svg>
				<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
					<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 150, color: colors.green, letterSpacing: -4, lineHeight: 1}}>{value.toFixed(1)}</div>
					<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: colors.muted, marginTop: 6}}>AURA SCORE</div>
					<div style={{marginTop: 18, fontSize: 24, fontWeight: 700, color: colors.green, background: colors.mintBg, padding: '6px 18px', borderRadius: 20}}>STRONG</div>
				</div>
			</div>
			{DIMENSIONS.map((d, i) => {
				const at = spokenAt(scene, d.spoken ?? d.name, 0.5 + i * 0.08) - 4;
				const p = spring({frame: frame - at, fps, config: {damping: 15}});
				const fill = interpolate(frame, [at + 4, at + 28], [0, d.score / 10], {...clamp, easing: Easing.out(Easing.cubic)});
				return (
					<div key={d.name} style={{position: 'absolute', left: 800, top: 340 + i * 108, width: 980, opacity: p, transform: `translateX(${(1 - p) * 60}px)`}}>
						<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12}}>
							<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 36}}>{d.name}</div>
							<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 34, color: d.color}}>{(fill * 10).toFixed(1)}</div>
						</div>
						<div style={{height: 16, borderRadius: 8, background: '#E3E9E5', overflow: 'hidden'}}>
							<div style={{width: `${fill * 100}%`, height: '100%', borderRadius: 8, background: d.color}} />
						</div>
					</div>
				);
			})}
		</LightBg>
	);
};

// ───────────────────────────── Two ways / Badges / Outro ─────────────────────────────

export const TwoWays: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cards = [
		{tag: 'AI LABS', title: 'Learn by building', body: 'Real projects with an AI Mentor + Coding Agent', icon: '🧪', color: colors.green},
		{tag: 'PRACTICE', title: 'Prove & improve', body: 'AI-native challenges + verified badges', icon: '🏋️', color: colors.purple},
	];
	return (
		<LightBg>
			<Rise delay={2} style={{position: 'absolute', top: 160, left: 0, right: 0, textAlign: 'center', fontFamily: fonts.heading, fontWeight: 700, fontSize: 76, letterSpacing: -2}}>
				Two ways to <G>level up</G>
			</Rise>
			<div style={{position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 60}}>
				{cards.map((c, i) => {
					const p = spring({frame: frame - 8 - i * 8, fps, config: {damping: 14}});
					return (
						<div key={c.tag} style={{width: 640, height: 400, borderRadius: 28, background: colors.white, border: `2px solid ${c.color}33`, padding: 50, boxShadow: '0 24px 60px rgba(14,59,43,0.12)', opacity: p, transform: `translateY(${(1 - p) * 60}px)`}}>
							<div style={{fontSize: 78}}>{c.icon}</div>
							<div style={{marginTop: 20, fontFamily: fonts.heading, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: c.color}}>{c.tag}</div>
							<div style={{marginTop: 8, fontFamily: fonts.heading, fontWeight: 700, fontSize: 54}}>{c.title}</div>
							<div style={{marginTop: 12, fontSize: 30, color: colors.muted}}>{c.body}</div>
						</div>
					);
				})}
			</div>
		</LightBg>
	);
};

/** Slide-in panel of verified badges, layered over a screenshot. */
export const BadgesPanel: React.FC<{from: number}> = ({from}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: frame - from, fps, config: {damping: 16}});
	const levels = [
		{name: 'Novice', color: '#94A3B8'},
		{name: 'Intermediate', color: colors.blue},
		{name: 'Advanced', color: colors.green},
	];
	return (
		<div style={{position: 'absolute', right: 120, top: 200, width: 560, borderRadius: 26, background: colors.greenDeep, color: colors.white, padding: 40, opacity: p, transform: `translateX(${(1 - p) * 120}px)`, boxShadow: '0 30px 80px rgba(7,36,26,0.45)', fontFamily: fonts.body}}>
			<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: colors.neon}}>VERIFIED SKILL BADGES</div>
			<div style={{marginTop: 26, display: 'flex', flexDirection: 'column', gap: 18}}>
				{levels.map((l, i) => {
					const q = spring({frame: frame - from - 8 - i * 8, fps, config: {damping: 13}});
					return (
						<div key={l.name} style={{display: 'flex', alignItems: 'center', gap: 20, opacity: q, transform: `scale(${0.8 + 0.2 * q})`, transformOrigin: 'left center'}}>
							<div style={{width: 70, height: 70, borderRadius: 35, background: l.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, boxShadow: `0 0 0 6px ${l.color}44`}}>★</div>
							<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 36}}>{l.name}</div>
							<div style={{marginLeft: 'auto', color: colors.neon, fontSize: 24, fontWeight: 700}}>✓ verified</div>
						</div>
					);
				})}
			</div>
			<div style={{marginTop: 28, fontSize: 24, color: 'rgba(255,255,255,0.75)'}}>Shareable to LinkedIn · Track progress over time</div>
		</div>
	);
};

/** Floating labels layered over a screenshot. */
export const FloatingChips: React.FC<{from: number; chips: string[]; top?: number}> = ({from, chips, top = 860}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 24}}>
			{chips.map((c, i) => {
				const p = spring({frame: frame - from - i * 6, fps, config: {damping: 13}});
				return (
					<div key={c} style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 30, color: colors.neon, background: colors.greenDeep, padding: '14px 28px', borderRadius: 40, opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${0.9 + 0.1 * p})`, boxShadow: '0 16px 40px rgba(7,36,26,0.4)'}}>
						{c}
					</div>
				);
			})}
		</div>
	);
};

export const Outro: React.FC<{scene: SceneTiming}> = () => {
	const frame = useCurrentFrame();
	const pulse = 1 + 0.03 * Math.sin(frame / 7);
	return (
		<DarkBg>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
				<Rise delay={2}>
					<Wordmark size={70} color={colors.white} />
				</Rise>
				<Rise delay={10} style={{marginTop: 50, fontFamily: fonts.heading, fontWeight: 700, fontSize: 92, letterSpacing: -2.5, textAlign: 'center', lineHeight: 1.05}}>
					Discover your <span style={{color: colors.neon}}>AI Style.</span>
				</Rise>
				<Rise delay={20} style={{marginTop: 50}}>
					<div style={{transform: `scale(${pulse})`, fontFamily: fonts.heading, fontWeight: 700, fontSize: 40, color: colors.greenDeep, background: colors.neon, padding: '22px 48px', borderRadius: 18, boxShadow: '0 0 50px rgba(0,230,118,0.5)'}}>
						Discover your Aura — free →
					</div>
				</Rise>
				<Rise delay={30} style={{marginTop: 34, fontSize: 38, fontWeight: 500, color: 'rgba(255,255,255,0.85)', letterSpacing: 1}}>
					vibelevel.ai
				</Rise>
			</AbsoluteFill>
		</DarkBg>
	);
};
