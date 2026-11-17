// Wedding-website showcase reel (9:16, ~32 s) for Instagram ads.
// Screen recordings of two real sites play inside a phone mockup whose screen matches the
// cropped recordings exactly (886×1490). Timing comes from the voiceover (props, built by
// projects/wedding-reel/build.mjs). All on-screen headline text is the voiceover itself.
import {loadFont as loadInter} from '@remotion/google-fonts/InterTight';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';

const sans = loadInter('normal', {weights: ['500', '600', '700', '800', '900'], subsets: ['latin']}).fontFamily;

const FPS = 30;
const C = {
	night: '#0D0907',
	ivory: '#FFF8EC',
	gold: '#E2B865',
	goldLight: '#F8E3AE',
	goldDeep: '#B3843D',
	coral: '#FF6B5B',
	chatIn: '#26333A',
};

export type Word = {w: string; s: number; e: number};
export type Line = {id: string; start: number; dur: number; words: Word[]};
export type ReelProps = {lines: Line[]; duration: number; musicOffset: number; captionLines?: string[]};

export const calculateReelMetadata: CalculateMetadataFunction<ReelProps> = ({props}) => ({
	fps: FPS,
	width: 1080,
	height: 1920,
	durationInFrames: Math.max(30, Math.ceil(props.duration * FPS)),
});

// ─── helpers ─────────────────────────────────────────────────────────────────
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const prog = (t: number, from: number, dur: number, e = ease) => interpolate(t, [from, from + dur], [0, 1], {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** Spring-like 0→1 with a small overshoot. */
const pop = (t: number, from: number, k = 10) => {
	const x = Math.max(0, t - from);
	return x === 0 ? 0 : 1 - Math.exp(-x * k) * Math.cos(x * k * 1.15);
};
const getLine = (lines: Line[], id: string) => {
	const l = lines.find((x) => x.id === id);
	if (!l) throw new Error(`line ${id}`);
	return l;
};
const key = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
/** Absolute time of the k-th (0-based) word in a line whose letters start with `prefix`. */
const wordAt = (l: Line, prefix: string, k = 0) => {
	const hits = l.words.filter((x) => key(x.w).startsWith(prefix));
	return l.start + (hits[k] ? hits[k].s : 0);
};

// ─── layout ──────────────────────────────────────────────────────────────────
const TEXT_TOP = 250; // headline zone 250–540, clear of Instagram's top bar and above the phone
// iPhone 15: the recordings are full iPhone screens (886×1920 = 19.5:9), shown uncropped.
const SCREEN = {w: 566, h: Math.round((566 * 1920) / 886)}; // 566×1227
const BEZEL = 13; // thin, uniform black border
const FRAME = 5; // aluminium band around it
const PHONE = {w: SCREEN.w + (BEZEL + FRAME) * 2, h: SCREEN.h + (BEZEL + FRAME) * 2};
const SCREEN_R = Math.round(SCREEN.w * 0.142); // iPhone 15 display corner radius (55 pt of 393 pt)
/** Focal points / taps were measured on the old crop (rows 250–1740 of the recording). The rebuilt
 * proxies (clean_chrome.py) show a collapsed-bar page (rows 176+) between the fixed Chrome bars, from row 245. */
const CY = (y: number) => (245 + (250 + y * 1490 - 176)) / 1920;
const PHONE_TOP = 572;
const PHONE_X = (1080 - PHONE.w) / 2;

// ─── phone ───────────────────────────────────────────────────────────────────
/** Recording clip: plays `site` from `src` s at `rate`, during reel time [at, to]. */
type Clip = {site: 'A' | 'B'; at: number; to: number; src: number; rate?: number};
/** Camera inside the screen: zoom about a focal point (fractions of the screen). */
type Cam = {t: number; z: number; x: number; y: number};

const camAt = (keys: Cam[], t: number) => {
	if (!keys.length) return {z: 1, x: 0.5, y: 0.5};
	if (t <= keys[0].t) return keys[0];
	for (let i = 0; i < keys.length - 1; i++) {
		const a = keys[i];
		const b = keys[i + 1];
		if (t <= b.t) {
			const p = inOut((t - a.t) / Math.max(0.001, b.t - a.t));
			return {z: mix(a.z, b.z, p), x: mix(a.x, b.x, p), y: mix(a.y, b.y, p)};
		}
	}
	return keys[keys.length - 1];
};

const Screen: React.FC<{t: number; clips: Clip[]; cam?: Cam[]; children?: React.ReactNode}> = ({t, clips, cam = [], children}) => {
	const c = camAt(cam, t);
	const vis = clips.map((clip, i) => (t < clip.at - 0.3 || t > clip.to + 0.3 ? 0 : i === 0 ? 1 : prog(t, clip.at - 0.22, 0.32, Easing.linear)));
	return (
		<AbsoluteFill>
			{/* the page (the camera zooms only this) */}
			<div style={{position: 'absolute', inset: 0, transform: `scale(${c.z})`, transformOrigin: `${c.x * 100}% ${CY(c.y) * 100}%`}}>
				{clips.map((clip, i) =>
					vis[i] <= 0 ? null : (
						<AbsoluteFill key={i} style={{opacity: vis[i]}}>
							<Sequence from={Math.round(clip.at * FPS)} layout="none">
								{/* startFrom counts composition frames (30 fps) */}
								<OffthreadVideo src={staticFile(`wedding/site-${clip.site}-clean.mp4`)} startFrom={Math.round(clip.src * FPS)} playbackRate={clip.rate ?? 1} muted style={{width: SCREEN.w, height: SCREEN.h, objectFit: 'fill'}} />
							</Sequence>
						</AbsoluteFill>
					),
				)}
				{children}
			</div>
			{/* real Chrome bars from the recording, fixed in place over the zoomed page */}
			{c.z > 1.001
				? clips.map((clip, i) =>
						vis[i] <= 0 ? null : (
							<AbsoluteFill key={`bars${i}`} style={{opacity: vis[i]}}>
								<Img src={staticFile(`wedding/chrome-top-${clip.site}.png`)} style={{position: 'absolute', left: 0, top: 0, width: SCREEN.w, height: (SCREEN.w * 245) / 886}} />
								<Img src={staticFile(`wedding/chrome-bot-${clip.site}.png`)} style={{position: 'absolute', left: 0, bottom: 0, width: SCREEN.w, height: (SCREEN.w * 175) / 886}} />
							</AbsoluteFill>
						),
					)
				: null}
		</AbsoluteFill>
	);
};

/** iOS status bar: drawn white with a difference blend so it reads on light and dark pages. */
const StatusBar: React.FC = () => (
	<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: Math.round(SCREEN.w * 0.13), display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${Math.round(SCREEN.w * 0.085)}px`, mixBlendMode: 'difference', color: '#fff', fontFamily: sans, fontWeight: 700, fontSize: Math.round(SCREEN.w * 0.042), letterSpacing: '-0.01em'}}>
		<span>9:41</span>
		<span style={{display: 'flex', alignItems: 'center', gap: 7}}>
			<span style={{display: 'flex', alignItems: 'flex-end', gap: 2, height: 14}}>{[5, 8, 11, 14].map((h) => <span key={h} style={{width: 4, height: h, borderRadius: 1, background: '#fff'}} />)}</span>
			<svg width="20" height="14" viewBox="0 0 20 14"><path d="M10 13.2 7.6 10.6a3.4 3.4 0 0 1 4.8 0Z M4.8 7.8a7.4 7.4 0 0 1 10.4 0l-1.5 1.5a5.3 5.3 0 0 0-7.4 0Z M2 5a11.4 11.4 0 0 1 16 0l-1.5 1.5a9.3 9.3 0 0 0-13 0Z" fill="#fff" /></svg>
			<span style={{width: 27, height: 13, borderRadius: 4, border: '1.5px solid rgba(255,255,255,0.55)', padding: 1.5, display: 'inline-flex', position: 'relative'}}>
				<span style={{flex: 1, borderRadius: 2, background: '#fff'}} />
			</span>
		</span>
	</div>
);

/** iPhone 15 mockup: graphite band, thin black bezel, Dynamic Island, action/volume/power buttons. */
const Phone: React.FC<{style?: React.CSSProperties; children: React.ReactNode; glow?: number}> = ({style, children, glow = 1}) => {
	const outerR = SCREEN_R + BEZEL + FRAME;
	const btn = (side: 'l' | 'r', top: number, h: number) => (
		<div style={{position: 'absolute', [side === 'l' ? 'left' : 'right']: -3, top, width: 5, height: h, borderRadius: 3, background: 'linear-gradient(90deg, #1E1E21, #4A4A4F 50%, #1E1E21)'}} />
	);
	return (
		<div style={{position: 'absolute', width: PHONE.w, height: PHONE.h, ...style}}>
			{btn('l', 150, 34)}
			{btn('l', 222, 66)}
			{btn('l', 302, 66)}
			{btn('r', 250, 104)}
			{/* graphite band */}
			<div style={{position: 'absolute', inset: 0, borderRadius: outerR, background: 'linear-gradient(145deg, #5A5A60 0%, #222225 14%, #161618 50%, #26262A 86%, #5E5E64 100%)', boxShadow: `0 60px 120px rgba(0,0,0,0.65), 0 0 ${110 * glow}px rgba(226,184,101,${0.14 * glow})`}} />
			{/* black glass bezel */}
			<div style={{position: 'absolute', inset: FRAME, borderRadius: outerR - FRAME, background: '#000', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)'}} />
			<div style={{position: 'absolute', left: FRAME + BEZEL, top: FRAME + BEZEL, width: SCREEN.w, height: SCREEN.h, borderRadius: SCREEN_R, overflow: 'hidden', background: '#000'}}>
				{children}
				{/* Dynamic Island */}
				<div style={{position: 'absolute', left: '50%', top: Math.round(SCREEN.w * 0.03), width: Math.round(SCREEN.w * 0.32), height: Math.round(SCREEN.w * 0.094), marginLeft: -Math.round(SCREEN.w * 0.16), borderRadius: 999, background: '#000'}}>
					<div style={{position: 'absolute', right: Math.round(SCREEN.w * 0.03), top: '50%', width: 12, height: 12, marginTop: -6, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #2B3A55 0%, #0B0F18 60%)'}} />
				</div>
				<div style={{position: 'absolute', inset: 0, borderRadius: SCREEN_R, background: 'linear-gradient(118deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 26%)', pointerEvents: 'none'}} />
			</div>
		</div>
	);
};

// ─── background ──────────────────────────────────────────────────────────────
const Backdrop: React.FC<{t: number; warm: number}> = ({t, warm}) => {
	const sweep = mix(-30, 130, (t * 0.06) % 1);
	return (
		<AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
			<AbsoluteFill style={{background: `radial-gradient(1000px 1100px at 50% 66%, rgba(226,184,101,${0.08 + 0.17 * warm}) 0%, rgba(140,80,40,${0.08 + 0.08 * warm}) 38%, transparent 70%)`}} />
			<AbsoluteFill style={{background: `radial-gradient(900px 500px at 50% 18%, rgba(255,214,150,${0.05 + 0.05 * warm}) 0%, transparent 70%)`}} />
			<AbsoluteFill style={{background: `linear-gradient(105deg, transparent ${sweep - 12}%, rgba(255,230,180,0.05) ${sweep}%, transparent ${sweep + 12}%)`}} />
			<AbsoluteFill style={{background: 'radial-gradient(1300px 1900px at 50% 52%, transparent 50%, rgba(0,0,0,0.7) 100%)'}} />
		</AbsoluteFill>
	);
};

// ─── headline: the voiceover, revealed word by word ──────────────────────────
const GOLD: React.CSSProperties = {backgroundImage: `linear-gradient(180deg, ${C.goldLight} 10%, ${C.gold} 60%, ${C.goldDeep} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

/** `instant`: leading words already on screen at their first frame (the scroll-stopping frame 0). */
const Headline: React.FC<{t: number; l: Line; text?: string; size?: number; gold?: string[]; coral?: string[]; out?: number; instant?: number; top?: number; strike?: {word: string; at: number}}> = ({t, l, text, size = 82, gold = [], coral = [], out, instant = 0, top = TEXT_TOP, strike}) => {
	const words = (text ?? l.words.map((w) => w.w).join(' ')).split(' ');
	const outP = out === undefined ? 0 : prog(t, out, 0.35, Easing.in(Easing.cubic));
	if (outP >= 1 || t < l.start - 0.6) return null;
	const times = words.map((_, i) => l.start + (l.words[Math.min(i, l.words.length - 1)]?.s ?? 0));
	return (
		<div style={{position: 'absolute', left: 70, width: 940, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: size * 0.24, rowGap: size * 0.08, opacity: 1 - outP, transform: `translateY(${-outP * 40}px)`, filter: `blur(${outP * 10}px)`}}>
			{words.map((w, i) => {
				const p = i < instant ? 1 : prog(t, times[i] - 0.1, 0.5);
				const k = key(w);
				const isGold = gold.includes(k);
				const isCoral = coral.includes(k);
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							fontFamily: sans,
							fontWeight: 800,
							fontSize: size,
							lineHeight: 1.04,
							letterSpacing: '-0.035em',
							color: isCoral ? C.coral : C.ivory,
							...(isGold ? GOLD : {}),
							opacity: p,
							filter: `blur(${(1 - p) * 14}px)`,
							transform: `translateY(${(1 - p) * 42}px) scale(${mix(1.18, 1, p)})`,
							textShadow: isGold || isCoral ? 'none' : '0 6px 30px rgba(0,0,0,0.5)',
							position: 'relative',
						}}
					>
						{w}
						{strike && key(strike.word) === k ? (
							<span style={{position: 'absolute', left: '-6%', top: '52%', width: '112%', height: size * 0.09, borderRadius: size * 0.05, background: C.coral, boxShadow: '0 0 18px rgba(255,107,91,0.6)', transformOrigin: 'left center', transform: `translateY(-50%) rotate(-6deg) scaleX(${prog(t, strike.at, 0.32)})`}} />
						) : null}
					</span>
				);
			})}
		</div>
	);
};

// ─── hook: a guest group chat drowning in PDFs ───────────────────────────────
const PdfMsg: React.FC<{name: string; size: string; time: string; p: number; dim?: number}> = ({name, size, time, p, dim = 0}) => (
	<div style={{alignSelf: 'flex-end', width: 480, opacity: Math.min(1, p * 1.4) * (1 - dim * 0.55), transform: `translateY(${(1 - p) * 40}px) scale(${mix(0.6, 1, p)})`, transformOrigin: 'right bottom'}}>
		<div style={{background: '#1E4D3B', borderRadius: '26px 26px 6px 26px', padding: 12, boxShadow: '0 10px 24px rgba(0,0,0,0.35)'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(0,0,0,0.22)', borderRadius: 16, padding: '16px 18px'}}>
				<div style={{width: 58, height: 72, flex: 'none', borderRadius: 8, background: '#E5534B', position: 'relative', boxShadow: 'inset 0 -16px 0 rgba(0,0,0,0.15)'}}>
					<div style={{position: 'absolute', right: 0, top: 0, width: 18, height: 18, background: 'rgba(255,255,255,0.35)', borderBottomLeftRadius: 6}} />
					<div style={{position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontFamily: sans, fontWeight: 900, fontSize: 17, color: '#fff'}}>PDF</div>
				</div>
				<div style={{minWidth: 0}}>
					<div style={{fontFamily: sans, fontWeight: 700, fontSize: 25, color: '#E9EDEF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 360}}>{name}</div>
					<div style={{fontFamily: sans, fontWeight: 500, fontSize: 20, color: 'rgba(233,237,239,0.55)', marginTop: 6}}>{size}</div>
				</div>
			</div>
			<div style={{textAlign: 'right', fontFamily: sans, fontSize: 18, color: 'rgba(233,237,239,0.5)', marginTop: 8, marginRight: 6}}>{time} ✓✓</div>
		</div>
	</div>
);

const TextMsg: React.FC<{text: string; who: string; color: string; p: number}> = ({text, who, color, p}) => (
	<div style={{alignSelf: 'flex-start', maxWidth: 470, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 30}px) scale(${mix(0.6, 1, p)})`, transformOrigin: 'left bottom'}}>
		<div style={{background: C.chatIn, borderRadius: '24px 24px 24px 6px', padding: '14px 20px', boxShadow: '0 10px 24px rgba(0,0,0,0.35)'}}>
			<div style={{fontFamily: sans, fontWeight: 700, fontSize: 19, color}}>{who}</div>
			<div style={{fontFamily: sans, fontWeight: 500, fontSize: 26, color: '#E9EDEF', marginTop: 4}}>{text}</div>
		</div>
	</div>
);

/** When each chat bubble lands: fractions of the hook line, so bubbles keep coming while it is spoken. */
const HOOK_FRACS = [0, 0.2, 0.42, 0.66, 0.96];
const hookMsgs = (l: Line) => HOOK_FRACS.map((f) => (f === 0 ? 0 : l.start + f * l.dur));

/** Generic group-chat screen (not any specific app's UI). The first bubble is already in at frame 0. */
const ChatScreen: React.FC<{t: number; end: number; msgs: number[]}> = ({t, end, msgs: times}) => {
	const [m0, m1, m2, m3, m4] = times;
	const msgs = [
		<PdfMsg key="a" name="Wedding_Invite.pdf" size="1 page · 2.4 MB" time="9:41 PM" p={pop(t, m0 - 0.4)} dim={prog(t, m2, 0.4)} />,
		<PdfMsg key="b" name="Wedding_Invite_FINAL.pdf" size="1 page · 2.6 MB" time="9:43 PM" p={pop(t, m1)} dim={prog(t, m3, 0.4)} />,
		<TextMsg key="c" who="Aunty Meera" color="#F2A65A" text="Which one is the latest? 😅" p={pop(t, m2)} />,
		<PdfMsg key="d" name="Invite_FINAL_final_v3.pdf" size="1 page · 2.9 MB" time="9:48 PM" p={pop(t, m3)} />,
		<TextMsg key="e" who="Rahul" color="#7FD1AE" text="Can't open it on my phone 😕" p={pop(t, m4)} />,
	];
	const scroll = mix(0, -150, prog(t, m3 - 0.1, 0.8)) + mix(0, -120, prog(t, m4 - 0.1, 0.6));
	const shake = t > end - 0.6 && t < end ? Math.sin(t * 70) * 4 * (1 - prog(t, end - 0.6, 0.6)) : 0;
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #0F1A1F 0%, #0B1418 100%)', transform: `translateX(${shake}px)`}}>
			<div style={{position: 'absolute', left: 22, right: 22, top: 330, display: 'flex', flexDirection: 'column', gap: 18, transform: `translateY(${scroll}px)`}}>{msgs}</div>
			{/* header (drawn after the messages so they scroll under it) */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 66, background: '#17252C'}} />
			<StatusBar />
			<div style={{position: 'absolute', left: 0, right: 0, top: 66, height: 112, background: '#17252C', display: 'flex', alignItems: 'center', gap: 18, padding: '0 26px'}}>
				<div style={{width: 64, height: 64, borderRadius: 32, background: 'linear-gradient(135deg, #E2B865, #B3843D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34}}>💍</div>
				<div>
					<div style={{fontFamily: sans, fontWeight: 700, fontSize: 30, color: '#E9EDEF'}}>Wedding Guests</div>
					<div style={{fontFamily: sans, fontWeight: 500, fontSize: 21, color: 'rgba(233,237,239,0.55)', marginTop: 4}}>Mom, Aunty Meera, Rahul +124</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** Glowing wipe that turns the chat screen into the website. */
const Wipe: React.FC<{t: number; at: number}> = ({t, at}) => {
	const p = prog(t, at, 0.75, inOut);
	if (p <= 0 || p >= 1) return null;
	const y = mix(110, -10, p);
	return <AbsoluteFill style={{background: `linear-gradient(180deg, transparent ${y - 14}%, rgba(255,232,180,0.95) ${y - 2}%, rgba(226,184,101,0.6) ${y}%, transparent ${y + 6}%)`, mixBlendMode: 'screen'}} />;
};

/** Tap ripple on an on-screen element (fractions of the screen). */
const Tap: React.FC<{t: number; at: number; x: number; y: number}> = ({t, at, x, y: yCrop}) => {
	const y = CY(yCrop);
	if (t < at - 0.5 || t > at + 1.6) return null;
	const finger = prog(t, at - 0.5, 0.45) * (1 - prog(t, at + 0.9, 0.4));
	const press = t > at && t < at + 0.18 ? 0.86 : 1;
	return (
		<>
			{[0, 0.18].map((d, i) => {
				const r = prog(t, at + d, 0.9, Easing.out(Easing.cubic));
				if (r <= 0 || r >= 1) return null;
				return <div key={i} style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: 260, height: 260, marginLeft: -130, marginTop: -130, borderRadius: '50%', border: `5px solid ${C.gold}`, opacity: 1 - r, transform: `scale(${mix(0.15, 1, r)})`}} />;
			})}
			<div style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: 92, height: 92, marginLeft: -46, marginTop: -46, borderRadius: '50%', background: 'rgba(255,248,236,0.85)', boxShadow: '0 10px 30px rgba(0,0,0,0.35)', opacity: finger * 0.9, transform: `scale(${press * mix(1.4, 1, finger)})`}} />
		</>
	);
};

// ─── the reel ────────────────────────────────────────────────────────────────
export const WeddingReel: React.FC<ReelProps> = ({lines, duration, musicOffset}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (!lines.length) return <AbsoluteFill style={{background: C.night}} />;
	const L = (id: string) => getLine(lines, id);
	const l1 = L('l1-hook'), l2 = L('l2-reveal'), l3 = L('l3-story'), l4 = L('l4-countdown'), l5 = L('l5-ceremonies'), l6 = L('l6-rsvp'), l7 = L('l7-any'), l8 = L('l8-detail'), l9 = L('l9-cta');

	const reveal = wordAt(l2, 'this'); // the chat turns into the website here (and the music swells)
	const tTheme = wordAt(l7, 'any', 0);
	const tTradition = wordAt(l7, 'any', 1);
	const tStory = wordAt(l7, 'any', 2);
	const tTap = wordAt(l6, 'one');
	const dmAt = wordAt(l9, 'dm');
	const cta = l9.start;

	// Site A clips: each feature shows its own section of the site.
	const clipsA: Clip[] = [
		{site: 'A', at: reveal - 0.1, to: reveal + 2.1, src: 2.5, rate: 1.0}, // monogram → hero, revealed completely
		{site: 'A', at: reveal + 2.1, to: l3.start - 0.1, src: 4.7, rate: 0.12}, // hold the finished hero
		{site: 'A', at: l3.start - 0.1, to: l4.start - 0.1, src: 15.0, rate: 1.55}, // "Here's our story" timeline
		{site: 'A', at: l4.start - 0.1, to: l5.start - 0.1, src: 13.75, rate: 0.35}, // live countdown
		{site: 'A', at: l5.start - 0.1, to: l6.start - 0.1, src: 21.7, rate: 1.6}, // the wedding-day schedule
		{site: 'B', at: l6.start - 0.1, to: l6.start + 0.6, src: 21.3, rate: 1.0}, // site 2: scroll into the RSVP section
		{site: 'B', at: l6.start + 0.6, to: tTheme - 0.2, src: 22.0, rate: 0.01}, // hold on RSVP + Submit RSVP (near-frozen so the tap stays on the button)
		// "Any theme / tradition / love story": sections not shown earlier in the reel
		{site: 'A', at: tTheme - 0.2, to: tTradition - 0.1, src: 8.7, rate: 0.6}, // photo-gallery collage
		{site: 'A', at: tTradition - 0.1, to: tStory - 0.1, src: 10.7, rate: 0.45}, // jewellery & mandap photos
		{site: 'A', at: tStory - 0.1, to: l8.start + 0.4, src: 27.4, rate: 0.3}, // "Can't wait to spend the rest of my life with you"
	];
	// Camera inside the phone: push in on the countdown and the RSVP button.
	const camA: Cam[] = [
		{t: l4.start - 0.1, z: 1, x: 0.5, y: 0.55},
		{t: l4.start + 0.5, z: 1.18, x: 0.5, y: 0.62},
		{t: l5.start - 0.2, z: 1.22, x: 0.5, y: 0.62},
		{t: l5.start - 0.05, z: 1, x: 0.5, y: 0.5},
		{t: l6.start, z: 1, x: 0.5, y: 0.5},
		{t: l6.start + 0.7, z: 1.07, x: 0.5, y: 0.66},
		{t: tTheme - 0.3, z: 1.09, x: 0.5, y: 0.66},
		{t: tTheme + 0.2, z: 1, x: 0.5, y: 0.5},
	];
	const clipsB: Clip[] = [
		{site: 'B', at: tTheme - 0.2, to: tTradition - 0.1, src: 10.0, rate: 0.6}, // "Meet the Bride & Groom"
		{site: 'B', at: tTradition - 0.1, to: tStory - 0.1, src: 11.5, rate: 0.35}, // arched bride card (stops before the family names)
		{site: 'B', at: tStory - 0.1, to: l8.start - 0.05, src: 2.2, rate: 0.5}, // "And We created you in pairs"
		{site: 'B', at: l8.start - 0.05, to: cta + 0.3, src: 16.1, rate: 1.3}, // celebrations → venues & directions
	];
	const ctaA: Clip[] = [
		{site: 'A', at: cta - 0.5, to: cta + 1.7, src: 2.5, rate: 1.0}, // hero reveal
		{site: 'A', at: cta + 1.7, to: duration + 1, src: 4.7, rate: 0.08},
	];
	const ctaB: Clip[] = [
		{site: 'B', at: cta - 0.5, to: cta + 2.9, src: 5.0, rate: 1.0}, // mosque → names reveal
		{site: 'B', at: cta + 2.9, to: duration + 1, src: 8.4, rate: 0.05}, // holds before the family-name cards
	];

	// Hook phone: already in place at frame 0, settling with a small rise.
	const hookIn = pop(t, -0.25, 7);
	const msgs = hookMsgs(l1);
	// Hook phone: a single entrance at the start (rise, scale-in, tilt straightening), then steady.
	const enter = prog(t, 0, 1.0);
	const live = 1 - enter; // > 0 only during the entrance
	// "Any theme": phone A slides left & shrinks, phone B joins on the right; "Any tradition"
	// turns both phones in 3D; B then takes centre for the next line.
	const pair = prog(t, tTheme - 0.25, 0.75) * (1 - prog(t, l8.start - 0.35, 0.6));
	const swap = prog(t, tTradition - 0.2, 0.7) - prog(t, tStory - 0.2, 0.7);
	const bSolo = prog(t, l8.start - 0.35, 0.6);
	const S = 0.66; // pair scale
	const pairScale = mix(1, S, pair);
	const aX = mix(PHONE_X, 40 - (PHONE.w * (1 - S)) / 2, pair) - bSolo * 1000;
	const bX = mix(1080 + 60, 1080 - 40 - PHONE.w + (PHONE.w * (1 - S)) / 2, prog(t, tTheme - 0.25, 0.75));
	const bXsolo = mix(bX, PHONE_X, bSolo);
	const pairY = PHONE_TOP + mix(0, 90, pair);
	const ctaIn = prog(t, cta - 0.2, 0.9);
	const mainOut = prog(t, cta - 0.3, 0.4);

	return (
		<AbsoluteFill style={{background: C.night}}>
			<Backdrop t={t} warm={prog(t, reveal - 0.3, 1.2)} />

			{/* ── headlines (all = the voiceover) ── */}
			<Headline t={t} l={l1} text="Still sending wedding invites as a PDF on WhatsApp?" size={86} coral={['pdf']} out={l2.start - 0.3} instant={2} />
			<Headline t={t} l={l2} text="What if your guests got this instead?" size={88} gold={['this', 'instead']} out={l3.start - 0.25} />
			<Headline t={t} l={l3} size={78} gold={['love', 'story']} out={l4.start - 0.2} />
			<Headline t={t} l={l4} size={84} gold={['big', 'day']} out={l5.start - 0.2} />
			<Headline t={t} l={l5} size={84} gold={['every', 'ceremony']} out={l6.start - 0.2} />
			<Headline t={t} l={l6} size={84} gold={['rsvp', 'one', 'tap']} out={l7.start - 0.25} />
			{/* Any theme. Any tradition. Any love story. — one line per beat */}
			{t > l7.start - 0.4 && t < l8.start + 0.2
				? ([
						['Any theme.', tTheme],
						['Any tradition.', tTradition],
						['Any love story.', tStory],
					] as const).map(([w, at], i) => {
						const p = prog(t, at - 0.08, 0.5);
						const o = 1 - prog(t, l8.start - 0.3, 0.3);
						const past = i < 2 && t > [tTradition, tStory][i] ? 0.5 : 1;
						return (
							<div key={w} style={{position: 'absolute', left: 0, right: 0, top: TEXT_TOP - 10 + i * 96, textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: i === 2 ? 92 : 80, letterSpacing: '-0.035em', lineHeight: 1, opacity: p * o * past, filter: `blur(${(1 - p) * 14}px)`, transform: `translateY(${(1 - p) * 40}px) scale(${mix(1.15, 1, p)})`, ...(i === 2 ? GOLD : {color: C.ivory})}}>
								{w}
							</div>
						);
					})
				: null}
			<Headline t={t} l={l8} size={80} gold={['two', 'you']} out={l9.start - 0.25} />

			{/* ── phone A (chat → website → features) ── */}
			{mainOut < 1 && t < l8.start + 0.4 ? (
				<Phone glow={mix(0.4, 1, prog(t, reveal, 0.8))} style={{left: aX, top: mix(PHONE_TOP + 260, pairY, hookIn), opacity: Math.min(1, hookIn * 1.6), transform: `perspective(1600px) translateY(${mix(90, 0, enter)}px) scale(${pairScale * mix(0.88, 1, enter)}) rotate(${mix(-5, 0, enter)}deg) rotateY(${swap * 18 - pair * 6}deg)`, transformOrigin: live > 0.001 ? 'center center' : 'center top' /* scale is 1 when this switches */}}>
					<Screen t={t} clips={clipsA} cam={camA}>
						<Tap t={t} at={tTap} x={0.5} y={0.703} /> {/* site 2's Submit RSVP button */}
					</Screen>
					{t < reveal + 0.8 ? (
						<AbsoluteFill style={{clipPath: `inset(0 0 ${prog(t, reveal - 0.1, 0.75, inOut) * 100}% 0)`}}>
							<ChatScreen t={t} end={reveal} msgs={msgs} />
						</AbsoluteFill>
					) : null}
					<Wipe t={t} at={reveal - 0.1} />
				</Phone>
			) : null}
			{/* ── phone B ── */}
			{mainOut < 1 && t > tTheme - 0.4 ? (
				<Phone style={{left: bXsolo, top: mix(pairY, PHONE_TOP, bSolo), opacity: 1 - mainOut, transform: `perspective(1600px) scale(${mix(pairScale, 1, bSolo)}) rotateY(${-swap * 18 + pair * 6 * (1 - bSolo)}deg)`, transformOrigin: 'center top'}}>
					<Screen t={t} clips={clipsB} />
				</Phone>
			) : null}

			{/* ── CTA ── */}
			{t > cta - 0.6 ? (
				<>
					<Phone style={{left: mix(-800, 60, ctaIn), top: 900, transform: 'scale(0.58) rotate(-7deg)', transformOrigin: 'top left'}}>
						<Screen t={t} clips={ctaA} />
					</Phone>
					<Phone style={{left: mix(1880, 1080 - 60 - PHONE.w * 0.58, ctaIn), top: 900, transform: 'scale(0.58) rotate(7deg)', transformOrigin: 'top left'}}>
						<Screen t={t} clips={ctaB} />
					</Phone>
					<Headline t={t} l={l9} text="Want one for your wedding?" size={92} gold={['your', 'wedding']} />
					{(() => {
						const p = pop(t, dmAt - 0.12, 8);
						const glow = 0.5 + 0.5 * Math.sin((t - dmAt) * 4.5);
						const sh = mix(-40, 140, (Math.max(0, t - dmAt) * 0.6) % 1);
						return (
							<div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(1, p * 1.5), transform: `scale(${mix(0.7, 1, p)})`}}>
								<div style={{position: 'relative', overflow: 'hidden', padding: '30px 66px', borderRadius: 999, background: `linear-gradient(135deg, ${C.goldLight}, ${C.gold} 50%, ${C.goldDeep})`, boxShadow: `0 24px 60px rgba(226,184,101,${0.3 + 0.2 * glow})`, fontFamily: sans, fontWeight: 900, fontSize: 54, letterSpacing: '-0.02em', color: '#1A120C'}}>
									DM “WEDDING”
									<div style={{position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent ${sh - 14}%, rgba(255,255,255,0.55) ${sh}%, transparent ${sh + 14}%)`}} />
								</div>
								<div style={{fontFamily: sans, fontWeight: 600, fontSize: 38, color: 'rgba(255,248,236,0.7)', marginTop: 26, opacity: prog(t, dmAt + 0.8, 0.5)}}>and let&apos;s build yours</div>
							</div>
						);
					})()}
				</>
			) : null}

			<Soundtrack lines={lines} musicOffset={musicOffset} duration={duration} cues={{reveal, beats: [tTheme, tTradition, tStory], tap: tTap, dm: dmAt, msgs}} />
		</AbsoluteFill>
	);
};

// ─── audio ───────────────────────────────────────────────────────────────────
const Soundtrack: React.FC<{lines: Line[]; musicOffset: number; duration: number; cues: {reveal: number; beats: number[]; tap: number; dm: number; msgs: number[]}}> = ({lines, musicOffset, duration, cues}) => {
	const spans = lines.map((l) => [l.start, l.start + l.dur] as const);
	const vol = (f: number) => {
		const t = f / FPS;
		const speaking = Math.max(0, ...spans.map(([a, b]) => Math.min(prog(t, a - 0.25, 0.25, Easing.linear), 1 - prog(t, b, 0.35, Easing.linear))));
		const level = mix(0.34, 0.085, speaking);
		const hook = mix(0.75, 1, prog(t, cues.reveal - 0.3, 0.3, Easing.linear)); // the track's own build plays under the hook
		return level * hook * Math.min(prog(t, 0, 0.2, Easing.linear), 1 - prog(t, duration - 2.2, 2.2, Easing.linear));
	};
	const sfx: [number, string, number][] = [
		...cues.msgs.slice(1).map((m): [number, string, number] => [m - 0.02, 'msg-pop', 0.26]),
		[cues.reveal - 1.6, 'light-sweep', 0.34], // shimmer rising into the reveal (peaks 1.6 s in)
		[cues.reveal - 0.5, 'deep-impact', 0.28], // warm low impact landing on the reveal (peaks 0.5 s in)
		[cues.reveal - 0.25, 'whoosh-air', 0.2],
		...cues.beats.map((b): [number, string, number] => [b - 0.12, 'tech-slide', 0.15]),
		[cues.tap - 0.02, 'ui-click', 0.3],
		[cues.dm - 0.15, 'logo-sweep', 0.16],
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
