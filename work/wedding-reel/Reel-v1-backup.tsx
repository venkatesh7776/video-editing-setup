// Wedding-website showcase reel (9:16, ~32 s) for Instagram ads.
// Screen recordings of two real sites play inside a phone mockup; timing comes from the
// voiceover (props.timing, built by projects/wedding-reel/build.mjs).
import {loadFont as loadManrope} from '@remotion/google-fonts/Manrope';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';

const serif = loadPlayfair('normal', {weights: ['500', '600', '700'], subsets: ['latin']}).fontFamily;
const serifItalic = loadPlayfair('italic', {weights: ['500', '600'], subsets: ['latin']}).fontFamily;
const sans = loadManrope('normal', {weights: ['500', '600', '700', '800'], subsets: ['latin']}).fontFamily;

const FPS = 30;
const C = {
	night: '#0E0A09',
	ink: '#1A1311',
	ivory: '#FBF4E8',
	gold: '#D9B26A',
	goldLight: '#F3DDA8',
	goldDeep: '#A87E3A',
	muted: 'rgba(251,244,232,0.62)',
};

export type Word = {w: string; s: number; e: number};
export type Line = {id: string; start: number; dur: number; words: Word[]};
export type ReelProps = {
	lines: Line[];
	duration: number;
	/** Seconds into the music track at t = 0 (puts the track's swell on the first site reveal). */
	musicOffset: number;
	captionLines: string[]; // line ids that get karaoke captions
};

export const calculateReelMetadata: CalculateMetadataFunction<ReelProps> = ({props}) => ({
	fps: FPS,
	width: 1080,
	height: 1920,
	durationInFrames: Math.max(30, Math.ceil(props.duration * FPS)),
});

// ─── helpers ─────────────────────────────────────────────────────────────────
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const prog = (t: number, from: number, dur: number, e = ease) => interpolate(t, [from, from + dur], [0, 1], {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const spring01 = (t: number, from: number) => {
	// critically-damped-ish overshoot for "landing" moves
	const x = Math.max(0, t - from);
	return x <= 0 ? 0 : 1 - Math.exp(-x * 9) * Math.cos(x * 11);
};

const line = (lines: Line[], id: string) => {
	const l = lines.find((x) => x.id === id);
	if (!l) throw new Error(`line ${id}`);
	return l;
};
/** Absolute time of the n-th word of a line whose letters start with `prefix`. */
const wordAt = (l: Line, prefix: string) => {
	const w = l.words.find((x) => x.w.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(prefix));
	return l.start + (w ? w.s : 0);
};

// ─── phone mockup ────────────────────────────────────────────────────────────
const SCREEN = {w: 600, h: Math.round((600 * 1490) / 886)}; // matches the 886×1490 cropped recordings
const BEZEL = 18;
export const PHONE = {w: SCREEN.w + BEZEL * 2, h: SCREEN.h + BEZEL * 2};

/** A clip of one site recording: plays from `src` seconds at `rate`, starting at reel time `at`. */
type Clip = {site: 'A' | 'B'; at: number; to: number; src: number; rate?: number};

const Screen: React.FC<{t: number; clips: Clip[]}> = ({t, clips}) => {
	return (
		<>
			{clips.map((c, i) => {
				if (t < c.at - 0.25 || t > c.to + 0.3) return null;
				const fade = i === 0 ? 1 : prog(t, c.at - 0.2, 0.3);
				const fromFrame = Math.round(c.at * FPS);
				return (
					<AbsoluteFill key={i} style={{opacity: fade}}>
						<Sequence from={fromFrame} layout="none">
							<OffthreadVideo
								src={staticFile(`wedding/site-${c.site}.mp4`)}
								startFrom={Math.round(c.src * FPS)} // composition frames (30 fps), not source frames
								playbackRate={c.rate ?? 1}
								muted
								style={{width: SCREEN.w, height: SCREEN.h, objectFit: 'cover'}}
							/>
						</Sequence>
					</AbsoluteFill>
				);
			})}
		</>
	);
};

const Phone: React.FC<{t: number; clips: Clip[]; style?: React.CSSProperties}> = ({t, clips, style}) => (
	<div
		style={{
			position: 'absolute',
			width: PHONE.w,
			height: PHONE.h,
			borderRadius: 78,
			padding: BEZEL,
			background: 'linear-gradient(145deg, #3A302A 0%, #15100E 40%, #2B231F 70%, #0B0807 100%)',
			boxShadow: `0 0 0 2px rgba(217,178,106,0.55), 0 0 0 5px rgba(20,14,12,0.9), 0 60px 120px rgba(0,0,0,0.65), 0 0 120px rgba(217,178,106,0.18)`,
			...style,
		}}
	>
		<div style={{position: 'relative', width: SCREEN.w, height: SCREEN.h, borderRadius: 60, overflow: 'hidden', background: '#000'}}>
			<Screen t={t} clips={clips} />
			{/* glass highlight */}
			<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(125deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 32%)', pointerEvents: 'none'}} />
		</div>
	</div>
);

// ─── background ──────────────────────────────────────────────────────────────
const Backdrop: React.FC<{t: number; warm: number}> = ({t, warm}) => (
	<AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
		<AbsoluteFill style={{background: `radial-gradient(900px 900px at 50% ${mix(62, 55, warm)}%, rgba(217,178,106,${0.10 + 0.16 * warm}) 0%, rgba(120,70,40,${0.10 + 0.08 * warm}) 40%, transparent 72%)`}} />
		{/* slow drifting soft light orbs (bokeh) */}
		{[
			[18, 22, 260, 0.0],
			[82, 30, 200, 1.7],
			[75, 82, 320, 3.1],
			[12, 78, 240, 4.6],
		].map(([x, y, r, ph], i) => (
			<div key={i} style={{position: 'absolute', left: `${x + Math.sin(t * 0.35 + ph) * 3}%`, top: `${y + Math.cos(t * 0.3 + ph) * 2}%`, width: r, height: r, marginLeft: -r / 2, marginTop: -r / 2, borderRadius: '50%', background: `radial-gradient(circle, rgba(243,221,168,${0.10 + 0.06 * warm}) 0%, transparent 70%)`, filter: 'blur(8px)'}} />
		))}
		<AbsoluteFill style={{background: 'radial-gradient(1200px 1700px at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 100%)'}} />
	</AbsoluteFill>
);

// ─── typography ──────────────────────────────────────────────────────────────
const GOLD_TEXT: React.CSSProperties = {backgroundImage: `linear-gradient(180deg, ${C.goldLight} 0%, ${C.gold} 55%, ${C.goldDeep} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

/** Words revealed as they are spoken (masked rise). `gold` words get the gold gradient. */
/** `instant`: how many leading words are already on screen at frame 0 (scroll-stopping first frame). */
const Kinetic: React.FC<{t: number; l: Line; text: string; size: number; gold?: string[]; italic?: string[]; top: number; out?: number; width?: number; instant?: number}> = ({t, l, text, size, gold = [], italic = [], top, out = Infinity, width = 940, instant = 0}) => {
	const words = text.split(' ');
	const o = Number.isFinite(out) ? 1 - prog(t, out, 0.3) : 1;
	if (o <= 0) return null;
	// spoken times for the displayed words, by order (falls back to evenly spread)
	const times = words.map((_, i) => l.start + (l.words[Math.min(i, l.words.length - 1)]?.s ?? (i * l.dur) / words.length));
	return (
		<div style={{position: 'absolute', left: (1080 - width) / 2, width, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: size * 0.26, rowGap: 0, opacity: o, lineHeight: 1.08}}>
			{words.map((w, i) => {
				const p = i < instant ? 1 : prog(t, times[i] - 0.06, 0.42);
				const key = w.toLowerCase().replace(/[^a-z]/g, '');
				const isGold = gold.includes(key);
				return (
					<span key={i} style={{display: 'inline-block', overflow: 'hidden', padding: '0 0.04em 0.1em'}}>
						<span style={{display: 'inline-block', fontFamily: italic.includes(key) || isGold ? serifItalic : serif, fontWeight: 600, fontSize: size, letterSpacing: '-0.01em', color: C.ivory, ...(isGold ? GOLD_TEXT : {}), transform: `translateY(${(1 - p) * 105}%)`, textShadow: isGold ? 'none' : '0 4px 30px rgba(0,0,0,0.45)'}}>{w}</span>
					</span>
				);
			})}
		</div>
	);
};

/** Karaoke caption for narration lines (words light up gold as spoken). */
const Caption: React.FC<{t: number; l: Line; top: number}> = ({t, l, top}) => {
	const vis = prog(t, l.start - 0.12, 0.2) * (1 - prog(t, l.start + l.dur + 0.15, 0.2));
	if (vis <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 80, width: 920, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 16, opacity: vis, transform: `translateY(${(1 - vis) * 12}px)`}}>
			{l.words.map((w, i) => {
				const on = t >= l.start + w.s - 0.03;
				return (
					<span key={i} style={{fontFamily: sans, fontWeight: 800, fontSize: 56, lineHeight: 1.25, color: on ? C.goldLight : 'rgba(251,244,232,0.42)', textShadow: '0 3px 18px rgba(0,0,0,0.6)'}}>
						{w.w}
					</span>
				);
			})}
		</div>
	);
};

/** Gold callout chip pinned beside the phone. */
const Chip: React.FC<{t: number; at: number; to: number; text: string; side: 'l' | 'r' | 'c'; y: number}> = ({t, at, to, text, side, y}) => {
	const p = prog(t, at, 0.45) * (1 - prog(t, to, 0.3));
	if (p <= 0) return null;
	return (
		<div
			style={{
				position: 'absolute',
				top: y,
				...(side === 'c' ? {left: '50%'} : {[side === 'l' ? 'left' : 'right']: 70}),
				padding: '18px 30px',
				borderRadius: 999,
				background: 'linear-gradient(135deg, rgba(40,30,24,0.92), rgba(18,13,11,0.92))',
				border: `1.5px solid ${C.gold}`,
				boxShadow: '0 18px 40px rgba(0,0,0,0.55), 0 0 30px rgba(217,178,106,0.25)',
				fontFamily: sans,
				fontWeight: 800,
				fontSize: 36,
				letterSpacing: '0.02em',
				color: C.goldLight,
				opacity: p,
				transform: side === 'c' ? `translateX(-50%) translateY(${(1 - p) * 16}px) scale(${mix(0.9, 1, p)})` : `translateX(${(1 - p) * (side === 'l' ? -40 : 40)}px) scale(${mix(0.9, 1, p)})`,
				display: 'flex',
				alignItems: 'center',
				gap: 14,
				whiteSpace: 'nowrap',
			}}
		>
			<span style={{width: 12, height: 12, borderRadius: 6, background: C.gold, boxShadow: `0 0 12px ${C.gold}`}} />
			{text}
		</div>
	);
};

// ─── hook: the PDF-on-a-chat moment ──────────────────────────────────────────
const PdfBubble: React.FC<{t: number; inAt: number; outAt: number}> = ({t, inAt, outAt}) => {
	const p = prog(t, inAt, 0.5);
	const o = prog(t, outAt, 0.45, Easing.in(Easing.cubic));
	if (o >= 1) return null;
	return (
		<div style={{position: 'absolute', left: 110, top: 760, width: 860, opacity: p * (1 - o), transform: `translateY(${(1 - p) * 60 + o * 120}px) scale(${mix(0.92, 1, p) * mix(1, 0.7, o)}) rotate(${o * -8}deg)`, filter: `blur(${o * 6}px) grayscale(${0.2 + o * 0.8})`}}>
			<div style={{background: '#202C33', borderRadius: '28px 28px 8px 28px', padding: 22, boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: '22px 24px'}}>
					<div style={{width: 96, height: 120, borderRadius: 12, background: '#E5534B', color: '#fff', fontFamily: sans, fontWeight: 800, fontSize: 30, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 12}}>PDF</div>
					<div>
						<div style={{fontFamily: sans, fontWeight: 700, fontSize: 42, color: '#E9EDEF'}}>Wedding_Invite_Final.pdf</div>
						<div style={{fontFamily: sans, fontWeight: 500, fontSize: 30, color: 'rgba(233,237,239,0.55)', marginTop: 10}}>1 page · 2.4 MB</div>
					</div>
				</div>
				<div style={{textAlign: 'right', fontFamily: sans, fontSize: 28, color: 'rgba(233,237,239,0.5)', marginTop: 14}}>
					9:41 PM <span style={{color: 'rgba(233,237,239,0.45)'}}>✓✓</span>
				</div>
			</div>
			{/* the reaction that sells the hook */}
			<div style={{position: 'absolute', left: 0, top: 300, background: '#202C33', borderRadius: '28px 28px 28px 8px', padding: '24px 32px', fontFamily: sans, fontWeight: 600, fontSize: 38, color: '#E9EDEF', opacity: prog(t, inAt + 1.2, 0.4), transform: `translateY(${(1 - prog(t, inAt + 1.2, 0.4)) * 20}px)`}}>
				Seen · didn&apos;t open 🙃
			</div>
		</div>
	);
};

// ─── the reel ────────────────────────────────────────────────────────────────
export const WeddingReel: React.FC<ReelProps> = ({lines, duration, musicOffset, captionLines}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (!lines.length) return <AbsoluteFill style={{background: C.night}} />;
	const L = (id: string) => line(lines, id);
	const l1 = L('l1-hook'), l2 = L('l2-reveal'), l3 = L('l3-story'), l4 = L('l4-countdown'), l5 = L('l5-ceremonies'), l6 = L('l6-rsvp'), l7 = L('l7-any'), l8 = L('l8-detail'), l9 = L('l9-cta');
	const reveal = wordAt(l2, 'this'); // music swell + phone lands here
	const tTheme = wordAt(l7, 'any');
	const tTradition = l7.start + (l7.words.find((w, i) => i > 0 && w.w.toLowerCase().startsWith('any'))?.s ?? 1.2);
	const tStory = l7.start + (l7.words.filter((w) => w.w.toLowerCase().startsWith('any'))[2]?.s ?? 2.4);
	const ctaAt = l9.start;
	const dmAt = wordAt(l9, 'dm');

	// Phone A: rises on the reveal, centred; slides left for "Any theme", exits for B.
	const rise = spring01(t, reveal - 0.55);
	const split = prog(t, tTheme - 0.15, 0.7);
	const aExit = prog(t, tTradition - 0.2, 0.6);
	// CTA: both phones return side by side, smaller.
	const cta = prog(t, ctaAt - 0.1, 0.8);
	const center = {x: (1080 - PHONE.w) / 2, y: 560};

	const clipsA: Clip[] = [
		{site: 'A', at: reveal - 0.6, to: l4.start - 0.05, src: 1.6, rate: 1.25}, // monogram → hero → gallery
		{site: 'A', at: l4.start - 0.05, to: l5.start - 0.05, src: 13.15}, // live countdown + RSVP
		{site: 'A', at: l5.start - 0.05, to: l6.start - 0.05, src: 22.2, rate: 1.4}, // schedule of ceremonies
		{site: 'A', at: l6.start - 0.05, to: l7.start + 2, src: 26.6, rate: 0.85}, // closing photo + Submit RSVP
	];
	const clipsB: Clip[] = [
		{site: 'B', at: tTheme - 0.2, to: tTradition - 0.15, src: 2.2}, // verse intro (teal theme)
		{site: 'B', at: tTradition - 0.15, to: tStory - 0.15, src: 5.3, rate: 1.3}, // mosque reveal
		{site: 'B', at: tStory - 0.15, to: l8.start - 0.05, src: 8.3}, // couple's names
		{site: 'B', at: l8.start - 0.05, to: l9.start + 0.2, src: 16.1, rate: 1.35}, // celebrations → venues & directions
	];
	const ctaA: Clip[] = [{site: 'A', at: ctaAt - 0.4, to: duration + 1, src: 4.4, rate: 0.6}];
	const ctaB: Clip[] = [{site: 'B', at: ctaAt - 0.4, to: duration + 1, src: 7.6, rate: 0.5}]; // stops before the family-name cards

	const showMain = t < ctaAt + 0.3;
	const phoneAx = mix(center.x, 40, split) - aExit * 900;
	const phoneAy = mix(1920 + 80, center.y, rise);
	const bIn = prog(t, tTheme - 0.2, 0.7);
	const bCenter = prog(t, tTradition - 0.2, 0.6);
	const phoneBx = mix(mix(1080 + 40, 1080 - PHONE.w - 40, bIn), center.x, bCenter);
	const sideScale = mix(1, 0.86, split * (1 - aExit));

	return (
		<AbsoluteFill style={{background: C.night}}>
			<Backdrop t={t} warm={prog(t, reveal - 0.3, 1.2)} />

			{/* ── Hook (no captions: the headline is the voiceover) ── */}
			<Kinetic t={t} l={l1} text="Still sending wedding invites as a PDF on WhatsApp?" size={92} gold={['pdf']} top={300} instant={2} out={l2.start - 0.25} />
			<PdfBubble t={t} inAt={-1} outAt={l2.start - 0.15} />
			<Kinetic t={t} l={l2} text="What if your guests got this instead?" size={84} gold={['this', 'instead']} top={300} out={l3.start - 0.15} />

			{/* ── Main phones ── */}
			{showMain && t > reveal - 0.7 ? (
				<Phone t={t} clips={clipsA} style={{left: phoneAx, top: phoneAy, transform: `scale(${sideScale}) rotate(${split * (1 - aExit) * -4}deg)`, transformOrigin: 'center'}} />
			) : null}
			{showMain && t > tTheme - 0.3 ? (
				<Phone t={t} clips={clipsB} style={{left: phoneBx, top: center.y, transform: `scale(${mix(0.86, 1, bCenter)}) rotate(${(1 - bCenter) * 4}deg)`, transformOrigin: 'center', opacity: bIn}} />
			) : null}

			{/* ── Feature beats (captions + gold chips) ── */}
			{[l3, l4, l5, l6, l8].map((l) => (captionLines.includes(l.id) ? <Caption key={l.id} t={t} l={l} top={300} /> : null))}
			<Chip t={t} at={l3.start + 0.2} to={l4.start - 0.1} text="Your love story" side="c" y={462} />
			<Chip t={t} at={l4.start} to={l5.start - 0.1} text="Live countdown" side="c" y={462} />
			<Chip t={t} at={l5.start} to={l6.start - 0.1} text="Every ceremony" side="c" y={462} />
			<Chip t={t} at={l6.start + 0.3} to={l7.start - 0.1} text="One-tap RSVP" side="c" y={462} />
			<Chip t={t} at={l8.start + 0.2} to={l9.start - 0.1} text="Venues & directions" side="c" y={462} />

			{/* ── Any theme. Any tradition. Any love story. ── */}
			{t > l7.start - 0.3 && t < l8.start + 0.2 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', opacity: 1 - prog(t, l8.start - 0.15, 0.3)}}>
					{([
						['Any theme.', tTheme],
						['Any tradition.', tTradition],
						['Any love story.', tStory],
					] as const).map(([w, at], i) => {
						const p = prog(t, at - 0.06, 0.45);
						const active = (i === 2 && t >= at - 0.06) || (t >= at - 0.06 && t < [tTradition, tStory, Infinity][i] - 0.06);
						return (
							<div key={w} style={{overflow: 'hidden', height: i === 2 ? 108 : 84}}>
								<div style={{fontFamily: i === 2 ? serifItalic : serif, fontWeight: 600, fontSize: i === 2 ? 92 : 70, lineHeight: 1.15, transform: `translateY(${(1 - p) * 105}%)`, opacity: active ? 1 : 0.45, ...(i === 2 ? GOLD_TEXT : {color: C.ivory})}}>{w}</div>
							</div>
						);
					})}
				</div>
			) : null}

			{/* ── CTA ── */}
			{t > ctaAt - 0.5 ? (
				<>
					<Phone t={t} clips={ctaA} style={{left: mix(-700, 70, cta), top: 820, transform: 'scale(0.66) rotate(-6deg)', transformOrigin: 'top left'}} />
					<Phone t={t} clips={ctaB} style={{left: mix(1780, 1080 - 70 - PHONE.w * 0.66, cta), top: 820, transform: 'scale(0.66) rotate(6deg)', transformOrigin: 'top left'}} />
					<Kinetic t={t} l={l9} text="Want one for your wedding?" size={86} gold={['your', 'wedding']} top={300} width={960} />
					{(() => {
						const p = prog(t, dmAt - 0.1, 0.5);
						const pulse = 1 + 0.035 * Math.max(0, Math.sin((t - dmAt) * 5)) * prog(t, dmAt + 0.6, 0.3);
						return (
							<div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${pulse})`}}>
								<div style={{padding: '28px 58px', borderRadius: 999, background: `linear-gradient(135deg, ${C.goldLight}, ${C.gold} 50%, ${C.goldDeep})`, boxShadow: '0 22px 50px rgba(217,178,106,0.35)', fontFamily: sans, fontWeight: 800, fontSize: 50, color: C.ink, letterSpacing: '0.01em'}}>
									DM me “WEDDING”
								</div>
								<div style={{fontFamily: serifItalic, fontWeight: 500, fontSize: 40, color: C.muted, marginTop: 26, opacity: prog(t, dmAt + 0.9, 0.5)}}>and let&apos;s build yours</div>
							</div>
						);
					})()}
				</>
			) : null}

			<Soundtrack lines={lines} musicOffset={musicOffset} duration={duration} reveal={reveal} beats={[tTheme, tTradition, tStory, ctaAt]} />
		</AbsoluteFill>
	);
};

// ─── audio ───────────────────────────────────────────────────────────────────
const Soundtrack: React.FC<{lines: Line[]; musicOffset: number; duration: number; reveal: number; beats: number[]}> = ({lines, musicOffset, duration, reveal, beats}) => {
	const spans = lines.map((l) => [l.start, l.start + l.dur] as const);
	const vol = (f: number) => {
		const t = f / FPS;
		const speaking = Math.max(0, ...spans.map(([a, b]) => Math.min(prog(t, a - 0.25, 0.25, Easing.linear), 1 - prog(t, b, 0.35, Easing.linear))));
		const level = mix(0.34, 0.09, speaking); // music sits under the voice, swells in gaps
		const hookQuiet = mix(0.55, 1, prog(t, reveal - 0.4, 0.4)); // softer under the hook so the question lands
		return level * hookQuiet * Math.min(prog(t, 0, 0.3, Easing.linear), 1 - prog(t, duration - 2.2, 2.2, Easing.linear));
	};
	const sfx: [number, string, number][] = [
		[reveal - 0.65, 'whoosh-air', 0.3],
		[reveal - 0.1, 'logo-sweep', 0.18],
		...beats.slice(0, 3).map((b): [number, string, number] => [b - 0.12, 'tech-slide', 0.16]),
		[beats[3] - 0.3, 'whoosh-air', 0.22],
	];
	return (
		<>
			<Audio src={staticFile('wedding/music.mp3')} startFrom={Math.round(musicOffset * FPS)} volume={vol} />
			{lines.map((l) => (
				<Sequence key={l.id} from={Math.round(l.start * FPS)} durationInFrames={Math.ceil(l.dur * FPS) + 8}>
					<Audio src={staticFile(`wedding/vo/${l.id}.wav`)} volume={1.5} />
				</Sequence>
			))}
			{sfx.map(([at, name, v], i) => (
				<Sequence key={i} from={Math.max(0, Math.round(at * FPS))} durationInFrames={Math.round(3 * FPS)}>
					<Audio src={staticFile(`wedding/sfx/${name}.mp3`)} volume={(f) => v * interpolate(f, [70, 90], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
				</Sequence>
			))}
		</>
	);
};
