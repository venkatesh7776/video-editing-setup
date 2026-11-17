// The Digital Moments — Telugu storytelling reel: "why just a video invitation? get a wedding website" (9:16).
// Talking scenes (Sravya / Divya, Veo 3.1 + ElevenLabs voice changer) with 3D props popping above their heads →
// the WhatsApp link + website screen recordings under Divya's narration with timed callouts → Divya's CTA with the
// contact card → gold end card. Built by projects/telugu-reel/build.mjs.
import {loadFont as loadManrope} from '@remotion/google-fonts/Manrope';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';

const manrope = loadManrope('normal', {weights: ['500', '600', '700', '800'], subsets: ['latin']}).fontFamily;
const FPS = 30;
type Seg = {id: string; kind: 'talk' | 'narr'; start: number; dur: number; src?: string; in?: number};
export type TeluguProps = {seq: Seg[]; duration: number; end: number};
export const calculateTeluguMetadata: CalculateMetadataFunction<TeluguProps> = ({props}) => ({fps: FPS, durationInFrames: Math.max(1, Math.ceil(props.duration * FPS))});

const EASE = Easing.bezier(0.22, 1, 0.36, 1);
const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);
const prog = (t: number, a: number, d: number, e = EASE) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const GOLD = '#E9A92B';
const INK = '#120B06';
const LOGO_AR = 1334 / 753;

// ── 3D props above the speaker's head: they pop in on their cue, bob gently, and clear at the end of the line ──
// cue times are in the source clip's own time (the clip's in-point is subtracted below)
const PROPS: Record<string, [string, number][]> = {
	l1: [['g-cal', 0.35], ['g-venue', 3.15], ['g-invite', 4.6]],
	l2: [['g-question', 3.45]],
	l3: [['g-video', 1.5], ['g-chat', 3.65]],
	l4: [['g-2026', 1.45], ['g-bulb', 5.75]],
};
const Prop: React.FC<{t: number; src: string; at: number; out: number; x: number; y: number; s: number; i: number}> = ({t, src, at, out, x, y, s, i}) => {
	const p = prog(t, at, 0.55, BACK);
	const o = prog(t, out - 0.25, 0.25, IN_OUT);
	if (p <= 0 || o >= 1) return null;
	const bob = Math.sin((t - at) * 2.4 + i) * 8;
	return (
		<div style={{position: 'absolute', left: x - s / 2, top: y - s / 2 + bob, width: s, height: s, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: Math.min(1, p * 1.6) * (1 - o), transform: `scale(${mix(0.4, 1, p) * (1 - o * 0.3)}) rotate(${(1 - p) * -14 + Math.sin((t - at) * 1.7 + i) * 2}deg)`, filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.35))'}}>
			<Img src={staticFile(`tel/g/${src}.png`)} style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
		</div>
	);
};

// ── screen recordings (720×1570): full height (nothing cropped), blurred fill at the sides, time-mapped to the narration ──
type K = [number, number]; // [reel time, recording time]
const Rec: React.FC<{src: string; keys: K[]}> = ({src, keys}) => (
	<AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
		{keys.slice(0, -1).map(([r0, s0], i) => {
			const [r1, s1] = keys[i + 1];
			const rate = Math.max(0.05, (s1 - s0) / Math.max(0.01, r1 - r0));
			return (
				<Sequence key={i} from={Math.round(r0 * FPS)} durationInFrames={Math.max(1, Math.round(r1 * FPS) - Math.round(r0 * FPS))} layout="none">
					<>
						<OffthreadVideo src={staticFile(`tel/v/${src}`)} startFrom={Math.round(s0 * FPS)} playbackRate={rate} muted style={{position: 'absolute', left: -60, top: -560, width: 1200, height: 2617, filter: 'blur(40px) brightness(0.55)'}} />
						<OffthreadVideo src={staticFile(`tel/v/${src}`)} startFrom={Math.round(s0 * FPS)} playbackRate={rate} muted style={{position: 'absolute', left: (1080 - 880) / 2, top: 0, width: 880, height: 1920}} />
					</>
				</Sequence>
			);
		})}
	</AbsoluteFill>
);

const ContactCard: React.FC<{p: number}> = ({p}) =>
	p > 0.01 ? (
		<div style={{position: 'absolute', left: 60, right: 60, bottom: 150, borderRadius: 36, background: 'rgba(255,250,242,0.96)', boxShadow: `0 0 0 3px ${GOLD}, 0 30px 70px -20px rgba(0,0,0,0.6)`, padding: '30px 40px', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 80}px) scale(${mix(0.92, 1, p)})`, fontFamily: manrope}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
				<div style={{width: 76, height: 76, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<svg viewBox="0 0 24 24" width={42} height={42} fill="#fff">
						<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
					</svg>
				</div>
				<div>
					<div style={{fontSize: 26, fontWeight: 700, color: '#6B5A48', letterSpacing: '0.04em'}}>WHATSAPP</div>
					<div style={{fontSize: 64, fontWeight: 800, color: INK, letterSpacing: '0.01em', lineHeight: 1}}>73308 28654</div>
				</div>
			</div>
			<div style={{height: 2, background: 'rgba(18,11,6,0.08)', margin: '22px 0'}} />
			<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
				<div style={{width: 76, height: 76, borderRadius: 22, background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<svg viewBox="0 0 24 24" width={44} height={44} fill="none" stroke="#fff" strokeWidth={2}>
						<rect x="3" y="3" width="18" height="18" rx="5" />
						<circle cx="12" cy="12" r="4.2" />
						<circle cx="17.4" cy="6.6" r="1" fill="#fff" />
					</svg>
				</div>
				<div>
					<div style={{fontSize: 26, fontWeight: 700, color: '#6B5A48', letterSpacing: '0.04em'}}>INSTAGRAM</div>
					<div style={{fontSize: 54, fontWeight: 800, color: INK, lineHeight: 1.05}}>@the_digital.moments</div>
				</div>
			</div>
		</div>
	) : null;

export const TeluguReel: React.FC<TeluguProps> = ({seq, duration, end}) => {
	const t = useCurrentFrame() / FPS;
	const S = (id: string) => seq.find((s) => s.id === id)!;
	const n1 = S('n1');
	const n6 = S('n6');
	const narrA = n1.start - 0.35;
	const narrB = n6.start + n6.dur + 0.2;
	const waEnd = n1.start + 3.1;
	const siteKeys: K[] = [
		[waEnd, 0],
		[S('n2').start, 2.6],
		[S('n3').start, 6.0],
		[S('n4').start, 12.0],
		[S('n5').start, 20.2],
		[n6.start, 24.6],
		[narrB + 0.4, 39.0],
	];
	const cta2 = S('cta2');
	const endA = end + 0.05;
	// zoom-in from Divya's phone into the recordings, and a soft fade back out to the CTA
	const into = prog(t, narrA, 0.45, IN_OUT);
	const outOf = prog(t, narrB, 0.4, IN_OUT);
	const card = prog(t, cta2.start + 0.35, 0.6, BACK) * (1 - prog(t, endA, 0.3));
	const endCard = prog(t, endA, 0.6, IN_OUT);
	const vol = (f: number) => {
		const tt = f / FPS;
		const talking = seq.some((s) => tt > s.start - 0.15 && tt < s.start + s.dur + 0.1);
		const base = talking ? 0.1 : 0.22;
		return (tt > endA ? 0.32 : base) * prog(tt, 0, 0.6, Easing.linear) * (1 - prog(tt, duration - 1.8, 1.8, Easing.linear));
	};
	return (
		<AbsoluteFill style={{background: '#000', fontFamily: manrope}}>
			{/* talking scenes */}
			{seq
				.filter((s) => s.kind === 'talk')
				.map((s) => (
					<Sequence key={s.id} from={Math.round(s.start * FPS)} durationInFrames={Math.round((s.dur + (s.id === 'l4' ? 0.4 : s.id === 'cta2' ? 0.45 : 0.06)) * FPS)} layout="none">
						<AbsoluteFill>
							<OffthreadVideo src={staticFile(`tel/v/${s.src}.mp4`)} startFrom={Math.round((s.in ?? 0) * FPS)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
						</AbsoluteFill>
					</Sequence>
				))}
			{Object.entries(PROPS).map(([id, items]) => {
				const s = S(id);
				const n = items.length;
				return items.map(([src, at], i) => {
					const x = n === 1 ? 540 : n === 2 ? (i ? 760 : 320) : [200, 540, 880][i];
					return <Prop key={`${id}${i}`} t={t} src={src} at={s.start + at - (s.in ?? 0)} out={s.start + s.dur + 0.05} x={x} y={265} s={n === 3 ? 320 : 370} i={i} />;
				});
			})}
			{/* WhatsApp + website */}
			{t > narrA - 0.05 && t < narrB + 0.45 ? (
				<AbsoluteFill style={{opacity: Math.min(1, into * 1.3) * (1 - outOf), transform: `scale(${mix(1.25, 1, into)})`, filter: into < 1 ? `blur(${(1 - into) * 14}px)` : undefined}}>
					{t < waEnd + 0.4 ? <Rec src="wa.mp4" keys={[[narrA, 0], [waEnd + 0.4, 3.1 + 0.4 + 0.35]]} /> : null}
					{t - narrA < 1.92 ? (
						// the recording's link preview belongs to another demo couple: show it as Ananya & Arjun (matches the site), blur the URLs
						<>
							<div style={{position: 'absolute', left: 219, top: 1176, width: 627, height: 364, borderRadius: 11, background: '#F2F2F2', padding: '17px 21px', boxSizing: 'border-box', fontFamily: 'Roboto, Helvetica, Arial, sans-serif'}}>
								<div style={{fontSize: 33, fontWeight: 600, lineHeight: 1.3, color: '#111B21'}}>Ananya &amp; Arjun · Wedding Invitation</div>
								<div style={{marginTop: 10, fontSize: 26.5, lineHeight: 1.45, color: '#54656F'}}>With the blessings of our elders, we cordially invite you and your family to join us in celebrating the wedding of Ananya and Arjun. Your gracious presence and blessings will make our special occasion even more memorable.</div>
							</div>
							<div style={{position: 'absolute', left: 221, top: 1541, width: 624, height: 51, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', background: 'rgba(242,242,242,0.4)'}} />
							<div style={{position: 'absolute', left: 225, top: 1617, width: 599, height: 103, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', background: 'rgba(255,255,255,0.35)'}} />
						</>
					) : null}
					{t - narrA >= 1.85 && t < waEnd + 0.4 ? <div style={{position: 'absolute', left: 173, top: 67, width: 587, height: 116, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)'}} /> : null}
					<AbsoluteFill style={{opacity: prog(t, waEnd, 0.4, IN_OUT)}}>
						<Rec src="site.mp4" keys={siteKeys} />
					</AbsoluteFill>
				</AbsoluteFill>
			) : null}
			<ContactCard p={card} />
			{/* end card */}
			{endCard > 0 ? (
				<AbsoluteFill style={{background: INK, opacity: endCard}}>
					<AbsoluteFill style={{background: 'radial-gradient(110% 60% at 50% 40%, rgba(233,169,43,0.18), rgba(18,11,6,0) 70%)'}} />
					<div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
						<Img src={staticFile('tel/tdm-logo.png')} style={{height: 210, width: 210 * LOGO_AR, transform: `scale(${mix(0.85, 1, prog(t, endA + 0.1, 0.8, BACK))})`}} />
						<div style={{marginTop: 30, fontWeight: 800, fontSize: 80, letterSpacing: '-0.03em', color: '#FFFFFF', opacity: prog(t, endA + 0.3, 0.6)}}>The Digital Moments</div>
						<div style={{marginTop: 18, fontWeight: 600, fontSize: 40, color: GOLD, opacity: prog(t, endA + 0.6, 0.6)}}>We turn moments into digital experiences.</div>
						<div style={{marginTop: 90, display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center', opacity: prog(t, endA + 0.9, 0.6)}}>
							<div style={{fontWeight: 700, fontSize: 48, color: '#FFFFFF'}}>
								WhatsApp: <span style={{color: GOLD}}>73308 28654</span>
							</div>
							<div style={{fontWeight: 700, fontSize: 48, color: '#FFFFFF'}}>
								Instagram: <span style={{color: GOLD}}>@the_digital.moments</span>
							</div>
						</div>
					</div>
				</AbsoluteFill>
			) : null}
			{/* sound */}
			<Audio src={staticFile('tel/a/bgm.wav')} volume={vol} />
			{seq.map((s) => (
				<Sequence key={`a${s.id}`} from={Math.round(s.start * FPS)} layout="none">
					<Audio src={staticFile(`tel/a/${s.id}.wav`)} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
