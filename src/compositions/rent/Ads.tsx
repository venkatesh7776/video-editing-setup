// The six Rent campaign videos (projects/rent-ads/scripts.md, ONERENT → "Rent"). video1 is 16:9; video2–6 are 9:16.
// Same design system, characters, voice, music library and SFX as the Velora film. Every scene cues off the voiceover
// (c.W(part, word)); parts are v<n>a, v<n>b, … in script order.
import React from 'react';
import {AbsoluteFill, Audio, Easing, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction} from 'remotion';
import {Arjun} from '../velora/Arjun';
import {CityWindow} from '../velora/ChOpenFlex';
import {Calendar, type Cue, Legend, makeCue, type Part, Toast} from '../velora/filmkit';
import {BODY, C, Card, Eyebrow, GRADIENT, H, Icon, IconTile, IN_OUT, inter, life, mix, NUM, Phone, Pill, prog, Row, Rupees, SHADOW, SHADOW_SM, SPRINGY, Words} from '../velora/kit';
import {Creator, Founder, Sharma} from '../velora/People';
import {Building, RoomArt, Skyline} from '../velora/ScenesStory';
import {Sfx} from '../velora/Velora';
import {BLUE_PURPLE, BlueAurora, Captions, CostCard, DepositOverview, EndCard, Journey, Note, RLockup, RMark, talkAt} from './adkit';

export type AdProps = {video: number; vertical: boolean; parts: Part[]; duration: number; segments: {s: number; e: number}[]; music: {file: string; offset: number}; fps?: number};
export const calculateAdMetadata: CalculateMetadataFunction<AdProps> = ({props}) => {
	const fps = props.fps ?? 30;
	return {fps, width: props.vertical ? 1080 : 1920, height: props.vertical ? 1920 : 1080, durationInFrames: Math.max(fps, Math.ceil(props.duration * fps))};
};
type V = {t: number; c: Cue; p: AdProps};

// ─── shared scenery ──────────────────────────────────────────────────────────
/** Bright apartment interior: big window with gradient light, plant, floor line. */
const Room: React.FC<{t: number; w: number; h: number; win: {x: number; y: number; w: number; h: number}; floor: number; light?: number}> = ({t, w, h, win, floor, light = 1}) => (
	<div style={{position: 'absolute', left: 0, top: 0, width: w, height: h}}>
		<div style={{position: 'absolute', inset: 0, background: `radial-gradient(${win.w * 1.6}px ${win.h * 1.4}px at ${win.x + win.w / 2}px ${win.y + win.h / 2}px, rgba(255,190,120,${0.22 * light}), transparent 70%)`}} />
		<div style={{position: 'absolute', left: win.x, top: win.y, width: win.w, height: win.h, borderRadius: 18, overflow: 'hidden', background: '#DDE5F0', boxShadow: 'inset 0 0 0 12px #fff'}}>
			<div style={{position: 'absolute', inset: 12, borderRadius: 8, background: GRADIENT, opacity: 0.75, backgroundSize: '170% 170%', backgroundPosition: `${50 + Math.sin(t * 0.3) * 30}% 50%`}} />
			<div style={{position: 'absolute', left: win.w / 2 - 6, top: 0, bottom: 0, width: 12, background: '#fff'}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: win.h * 0.5 - 6, height: 12, background: '#fff'}} />
		</div>
		<div style={{position: 'absolute', left: win.x - 20, top: floor - 70 - win.w * 0.04, width: win.w + 40, height: 70 + win.w * 0.04, background: 'linear-gradient(180deg, rgba(255,190,120,0.25), transparent)', clipPath: 'polygon(15% 0, 85% 0, 100% 100%, 0 100%)', opacity: light}} />
		<div style={{position: 'absolute', left: win.x + win.w + 40, top: floor - 220}}>
			<div style={{position: 'absolute', left: 30, top: 120, width: 80, height: 100, borderRadius: '8px 8px 18px 18px', background: C.orange}} />
			<div style={{position: 'absolute', left: 0, top: 0, width: 140, height: 140, borderRadius: '50%', background: C.green, opacity: 0.85, transform: `rotate(${Math.sin(t * 0.8) * 2}deg)`}} />
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: floor, height: 2, background: C.line}} />
	</div>
);

/** Floating key ring (the keys moment). */
const Keys: React.FC<{t: number; at: number; x: number; y: number; size?: number}> = ({t, at, x, y, size = 96}) => {
	const p = prog(t, at, 0.7, SPRINGY);
	if (p <= 0) return null;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size / 2, background: C.white, boxShadow: SHADOW_SM, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p}) rotate(${Math.sin(t * 3) * 10 * prog(t, at, 2)}deg)`}}>
			<Icon name="key" size={size * 0.5} color={C.orange} sw={2} />
		</div>
	);
};

/** Big on-screen text block (the scripts' ON-SCREEN TEXT), top of frame. */
const OnScreen: React.FC<{t: number; at: number; out?: number; text: string; v: boolean; grad?: string[]; size?: number; top?: number; center?: boolean}> = ({t, at, out, text, v, grad, size, top, center}) => {
	const o = out === undefined ? 1 : 1 - prog(t, out - 0.3, 0.3, IN_OUT);
	if (t < at - 0.1 || o <= 0) return null;
	return (
		<div style={{position: 'absolute', left: v ? 70 : 120, right: v ? 70 : undefined, top: top ?? (v ? 250 : 96), width: v ? undefined : 1100, textAlign: center || v ? (v ? 'center' : 'left') : 'left', ...H, fontWeight: 600, fontSize: size ?? (v ? 82 : 64), opacity: o}}>
			<Words t={t} text={text} at={at} stagger={0.05} grad={grad} />
		</div>
	);
};

/** Rental terms card (landlord shares terms; deposit illustrative). */
const Terms: React.FC<{t: number; at: number; depAt: number; w: number; style?: React.CSSProperties; out?: number}> = ({t, at, depAt, w, style, out}) => (
	<Card t={t} at={at} out={out} style={{width: w, ...style}} pad={34}>
		<Eyebrow>Rental terms</Eyebrow>
		<Row label="Monthly rent" value="₹25,000" size={30} />
		<div style={{opacity: prog(t, depAt - 0.1, 0.5)}}>
			<Row label="Security deposit" value={<Rupees t={t} at={depAt} dur={1.3} value={100000} style={{color: C.orange}} />} size={30} style={{borderBottom: 'none'}} />
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4}}>
				<span style={{transform: `scale(${prog(t, depAt + 0.4, 0.5, SPRINGY)})`, display: 'inline-block'}}>
					<Pill bg={C.peach} color={C.orange} style={{fontSize: 20}}>
						<Icon name="clock" size={20} color={C.orange} sw={2.2} /> Due upfront
					</Pill>
				</span>
				<span style={{fontFamily: inter, fontSize: 16, fontWeight: 600, letterSpacing: '0.06em', color: C.muted}}>ILLUSTRATIVE EXAMPLE</span>
			</div>
		</div>
	</Card>
);

/** Savings vs moving costs on a phone (illustrative). */
const Budget: React.FC<{t: number; at: number; items: [string, number][]; start: number}> = ({t, at, items, start}) => {
	const spent = items.reduce((s, [, v], i) => s + v * prog(t, at + 0.5 + i * 0.45, 0.4), 0);
	const left = start - spent;
	return (
		<div style={{padding: '74px 26px 0', fontFamily: inter}}>
			<div style={{fontWeight: 600, fontSize: 28, color: C.navy}}>Moving budget</div>
			<div style={{fontSize: 16, color: C.muted, marginTop: 14}}>Savings</div>
			<div style={{...NUM, fontWeight: 600, fontSize: 40, color: left < 0 ? C.orange : C.navy}}>{left < 0 ? '−' : ''}₹{Math.abs(Math.round(left)).toLocaleString('en-IN')}</div>
			<div style={{height: 12, borderRadius: 6, background: C.soft, marginTop: 12, overflow: 'hidden'}}>
				<div style={{height: '100%', width: `${Math.max(0, left / start) * 100}%`, background: left / start < 0.3 ? C.orange : C.green, borderRadius: 6}} />
			</div>
			{items.map(([l, v], i) => (
				<div key={l} style={{opacity: prog(t, at + 0.5 + i * 0.45, 0.4)}}>
					<Row label={l} value={`−₹${v.toLocaleString('en-IN')}`} size={19} style={{padding: '13px 0'}} />
				</div>
			))}
			<div style={{fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', color: C.muted, marginTop: 12}}>ILLUSTRATIVE</div>
		</div>
	);
};

const Floor: React.FC<{y: number}> = ({y}) => <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 2, background: C.line}} />;

// ─── sound ───────────────────────────────────────────────────────────────────
const LEVEL = {voice: 0.084, gap: 0.15, end: 0.3};
const TRIM: Record<string, number> = {'piano-reflections': 1, skyline: 0.67, discover: 1.15, 'drawing-the-sky': 1.03, 'river-flow': 0.79};
const AdSound: React.FC<{p: AdProps; sfx: [number, string, number][]}> = ({p, sfx}) => {
	const {fps} = useVideoConfig();
	const voEnd = p.parts[p.parts.length - 1].end;
	const speech = (t: number) => Math.max(0, ...p.segments.map((g) => prog(t, g.s - 0.25, 0.25, Easing.linear) * (1 - prog(t, g.e, 0.4, Easing.linear))));
	return (
		<>
			<Audio src={staticFile(`rent-ads/v${p.video}-narration.wav`)} />
			<Audio
				src={staticFile(`rent-ads/${p.music.file}.mp3`)}
				startFrom={Math.max(0, Math.round(p.music.offset * fps))}
				volume={(f) => {
					const t = f / fps;
					const lv = t > voEnd ? mix(LEVEL.gap, LEVEL.end, prog(t, voEnd, 1, Easing.linear)) : mix(LEVEL.gap, LEVEL.voice, speech(t));
					return lv * (TRIM[p.music.file] ?? 1) * prog(t, 0, 0.3, Easing.linear) * (1 - prog(t, p.duration - 2, 2, Easing.linear));
				}}
			/>
			{sfx.map(([at, name, v], i) => (
				<Sfx key={i} at={at} name={name} v={v * 1.4} dir="rent-ads" />
			))}
		</>
	);
};

// ─── VIDEO 1 — master explainer (16:9) ───────────────────────────────────────
const Video1: React.FC<V> = ({t, c, p}) => {
	const [A, B, Cc, D, E, F] = ['v1a', 'v1b', 'v1c', 'v1d', 'v1e', 'v1f'];
	const tReveal = c.P(D);
	const tEnd = c.W(F, 'join') - 0.3;
	const story = 1 - prog(t, tReveal - 0.6, 0.7, IN_OUT);
	const back = prog(t, c.P(F) - 0.4, 0.8, IN_OUT) * (1 - prog(t, tEnd - 0.4, 0.4));
	const walk = prog(t, 0, 1.8, Easing.bezier(0.33, 0, 0.3, 1));
	const walk2 = prog(t, c.P(F) - 0.3, 2.2, Easing.bezier(0.33, 0, 0.3, 1));
	const toCorner = prog(t, c.W(D, 'building') - 0.2, 1.0, IN_OUT);
	const ex = [c.W(E, 'explore'), c.W(E, 'explore') + 0.7, c.W(E, 'understand'), c.W(E, 'plan')];
	return (
		<>
			{/* story: apartment, landlord, budget */}
			{story > 0 ? (
				<AbsoluteFill style={{opacity: story, transform: `scale(${mix(1.04, 1, prog(t, 0, 6))})`}}>
					<Room t={t} w={1920} h={1080} win={{x: 760, y: 170, w: 520, h: 560}} floor={984} />
					<Arjun t={t} walk={t < 1.8 ? 1 - prog(t, 1.4, 0.4) : 0} suitcase={0} mood={prog(t, c.W(B, 'holding') - 0.3, 1.0) * (1 - prog(t, c.P(Cc) + 2.5, 1)) + prog(t, c.P(Cc) + 2.5, 1) * 0.7} look={0.3 - prog(t, c.P(B), 1) * 0.5} scale={0.86} style={{left: mix(60, 300, walk), top: 984 - 560 * 0.86 + 6}} />
					<Keys t={t} at={0.9} x={mix(60, 300, walk) + 210} y={600} />
					{/* landlord shares the terms */}
					{t > c.P(B) - 0.6 ? <Sharma t={t} walk={1 - prog(t, c.P(B) + 0.4, 0.4)} look={0.1} scale={0.86} style={{left: mix(1900, 1450, prog(t, c.P(B) - 0.6, 1.2, IN_OUT)) + prog(t, c.P(Cc), 1.0, IN_OUT) * 500, top: 984 - 560 * 0.86 + 6}} /> : null}
					<Terms t={t} at={c.P(B) + 0.3} depAt={c.W(B, 'deposit')} w={560} out={c.P(Cc) + 0.2} style={{left: 760, top: 300}} />
					{/* savings under pressure */}
					{(() => {
						const ph = prog(t, c.P(Cc) - 0.2, 0.9);
						return ph > 0 ? (
							<Phone w={400} style={{left: 1300, top: 140, transform: `translateY(${(1 - ph) * 600}px)`, opacity: Math.min(1, ph * 2)}}>
								<Budget t={t} at={c.P(Cc)} start={140000} items={[['Packers & movers', 18000], ['Brokerage', 25000], ['Essentials', 12000], ['Security deposit', 100000]]} />
							</Phone>
						) : null;
					})()}
					<OnScreen t={t} at={0.05} out={c.P(B)} text="Found your perfect home?" v={false} grad={['home']} />
					<OnScreen t={t} at={c.P(B) + 0.1} out={c.P(Cc)} text="The upfront deposit." v={false} grad={['upfront']} />
					<OnScreen t={t} at={c.P(Cc) + 0.1} out={tReveal} text="Moving comes with enough expenses." v={false} size={56} />
				</AbsoluteFill>
			) : null}
			{/* product: Introducing Rent */}
			{t > tReveal - 0.7 && t < c.P(F) + 0.4 ? (
				<AbsoluteFill style={{opacity: prog(t, tReveal - 0.6, 0.6) * (1 - prog(t, c.P(F) - 0.3, 0.5))}}>
					<BlueAurora t={t} o={0.6} />
					<div style={{position: 'absolute', left: mix(960 - 330, 120, toCorner), top: mix(400, 100, toCorner), transform: `scale(${mix(1, 0.5, toCorner)})`, transformOrigin: 'left top'}}>
						<Eyebrow style={{fontSize: 26, marginBottom: 22, opacity: 1 - toCorner}}>Introducing</Eyebrow>
						<RLockup t={t} at={tReveal + 0.05} size={150} />
					</div>
					<div style={{position: 'absolute', left: 120, top: 300, width: 900, opacity: life(t, c.W(D, 'building'), c.P(E), 0.6, 0.4)}}>
						<div style={{...H, fontSize: 62}}>
							<Words t={t} text="A smarter way to explore rental security deposit financing." at={c.W(D, 'smarter')} grad={['smarter', 'way']} stagger={0.05} />
						</div>
						<div style={{marginTop: 34, transform: `scale(${prog(t, c.W(D, 'regulated'), 0.6, SPRINGY)})`, transformOrigin: 'left center'}}>
							<Pill bg={C.white} color={C.navy} style={{boxShadow: SHADOW_SM, fontSize: 24, padding: '12px 22px'}}>
								<Icon name="bank" size={26} color={C.indigo} /> Through regulated lending partners
							</Pill>
						</div>
					</div>
					{t > c.P(E) - 0.3 ? (
						<>
							<div style={{position: 'absolute', left: 120, top: 270, ...H, fontWeight: 600, fontSize: 64}}>
								<Words t={t} text="Explore. Understand. Plan." at={c.W(E, 'explore')} times={[c.W(E, 'explore'), c.W(E, 'understand'), c.W(E, 'plan')]} grad={['plan']} />
							</div>
							<Journey t={t} at={ex} steps={['Explore options', 'Apply', 'Lender assessment', 'Review terms if approved']} vertical style={{left: 120, top: 400, width: 620}} />
						</>
					) : null}
					{(() => {
						const ph = prog(t, c.W(D, 'building'), 1.1);
						return ph > 0 ? (
							<div style={{position: 'absolute', left: 1220, top: 100, perspective: 1600}}>
								<div style={{transform: `translateY(${(1 - ph) * 700}px) rotateY(${mix(-20, -6, ph)}deg)`}}>
									<Phone w={420} style={{position: 'relative'}}>
										<DepositOverview t={t} at={c.W(D, 'building') + 0.2} />
									</Phone>
								</div>
							</div>
						) : null;
					})()}
					<Note t={t} at={c.W(D, 'building')} out={c.P(F)} text="Conceptual interface, for illustration. Financing is being explored with regulated lending partners." />
				</AbsoluteFill>
			) : null}
			{/* the renter enters the new home */}
			{back > 0 ? (
				<AbsoluteFill style={{opacity: back}}>
					<Room t={t} w={1920} h={1080} win={{x: 760, y: 170, w: 520, h: 560}} floor={984} />
					<Arjun t={t} walk={1 - prog(t, c.P(F) + 1.6, 0.4)} suitcase={1 - prog(t, c.P(F) + 2.0, 0.1)} look={0.4} scale={0.86} style={{left: mix(-200, 420, walk2), top: 984 - 560 * 0.86 + 6}} />
					<OnScreen t={t} at={c.P(F)} text="Your next move starts here." v={false} grad={['move']} />
				</AbsoluteFill>
			) : null}
			<EndCard t={t} at={tEnd} vertical={false} cta="Join the early-access waitlist" />
			<AdSound
				p={p}
				sfx={[
					[0.9, 'phone-notify', 0.1],
					[0.2, 'suitcase-roll', 0.18],
					[c.W(B, 'deposit') - 0.1, 'counter-tick', 0.16],
					[c.W(B, 'holding') - 0.1, 'tension-pulse', 0.14],
					[c.P(Cc) - 0.2, 'soft-swoosh', 0.14],
					[c.P(Cc) + 0.5, 'counter-tick', 0.12],
					[tReveal - 0.5, 'soft-swoosh', 0.16],
					[tReveal - 0.1, 'logo-reveal', 0.2],
					[c.W(D, 'building'), 'soft-swoosh', 0.12],
					...ex.map((x): [number, string, number] => [x - 0.1, 'ui-tap', 0.16]),
					[c.P(F) - 0.3, 'suitcase-roll', 0.16],
					[tEnd, 'sonic-logo', 0.26],
				]}
			/>
		</>
	);
};

// ─── VIDEO 2 — the deposit problem (9:16) ────────────────────────────────────
const COSTS: [string, string, string][] = [
	['box', 'Moving boxes', '₹6,000'],
	['key', 'Brokerage', '₹25,000'],
	['truck', 'Transport', '₹12,000'],
	['bolt', 'Utility setup', '₹5,000'],
];
const Video2: React.FC<V> = ({t, c, p}) => {
	const [A, B, Cc, D, E] = ['v2a', 'v2b', 'v2c', 'v2d', 'v2e'];
	const tEnd = c.P(E) - 0.2;
	const cutT = [c.W(Cc, 'moving'), c.W(Cc, 'costs') + 0.25, c.W(Cc, 'everyday'), c.W(Cc, 'expenses') + 0.2, c.W(Cc, 'arranging')];
	const room = 1 - prog(t, c.P(Cc) - 0.4, 0.5);
	return (
		<>
			{room > 0 ? (
				<AbsoluteFill style={{opacity: room}}>
					<Room t={t} w={1080} h={1920} win={{x: 200, y: 560, w: 520, h: 640}} floor={1600} />
					<Arjun t={t} suitcase={0} mood={prog(t, c.P(B) + 0.3, 1)} look={0.3 - prog(t, c.P(B), 0.6) * 0.6} scale={1.05} style={{left: 600, top: 1600 - 560 * 1.05 + 6}} />
					<Toast t={t} at={c.P(B) - 0.05} icon="chat" title="Security deposit due before move-in" body="From Mr. Sharma (landlord)" accent={C.orange} app="Messages" style={{left: 70, top: 560, width: 940}} />
					<Card t={t} at={c.W(B, 'deposit') - 0.2} style={{left: 70, top: 760, width: 560}} pad={30}>
						<Eyebrow>Bank balance</Eyebrow>
						<div style={{...NUM, fontFamily: inter, fontWeight: 600, fontSize: 56, color: C.navy, marginTop: 6}}>₹62,400</div>
						<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 12, fontFamily: inter, fontSize: 22}}>
							<span style={{color: C.slate}}>Deposit due</span>
							<span style={{...NUM, color: C.orange, fontWeight: 600}}>₹1,00,000</span>
						</div>
						<div style={{fontFamily: inter, fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', color: C.muted, marginTop: 12}}>ILLUSTRATIVE</div>
					</Card>
				</AbsoluteFill>
			) : null}
			<OnScreen t={t} at={0} out={c.P(B)} text="Found your dream home?" v grad={['home']} />
			<OnScreen t={t} at={c.P(B)} out={c.P(Cc)} text="Now comes the deposit." v grad={['deposit']} />
			{/* quick cuts: moving costs */}
			{t > c.P(Cc) - 0.5 && t < c.P(D) + 0.3 ? (
				<AbsoluteFill style={{opacity: prog(t, c.P(Cc) - 0.4, 0.4) * (1 - prog(t, c.P(D) - 0.3, 0.4))}}>
					<OnScreen t={t} at={c.P(Cc)} text="Moving has enough upfront costs." v size={74} />
					{COSTS.map(([ic, l, v], i) => (
						<CostCard key={l} t={t} at={cutT[i]} icon={ic} label={l} value={v} w={940} style={{left: 70, top: 640 + i * 190}} />
					))}
					<Card t={t} at={cutT[4]} style={{left: 70, top: 1420, width: 940}} pad={30}>
						<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: inter}}>
							<span style={{fontWeight: 600, fontSize: 34, color: C.navy}}>Savings left</span>
							<Rupees t={t} at={cutT[4]} dur={1.0} from={62400} value={14400} style={{fontFamily: inter, fontWeight: 600, fontSize: 44, color: C.orange}} />
						</div>
						<div style={{fontFamily: inter, fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', color: C.muted, marginTop: 6}}>ILLUSTRATIVE · BEFORE THE DEPOSIT</div>
					</Card>
				</AbsoluteFill>
			) : null}
			{/* Rent */}
			{t > c.P(D) - 0.4 ? (
				<AbsoluteFill style={{opacity: prog(t, c.P(D) - 0.3, 0.5)}}>
					<BlueAurora t={t} o={0.55} vertical />
					<RLockup t={t} at={c.P(D)} size={120} style={{position: 'absolute', left: 300, top: 260}} />
					<OnScreen t={t} at={c.W(D, 'smarter')} text="A new way to plan your deposit." v size={70} top={450} />
					{(() => {
						const ph = prog(t, c.P(D) + 0.4, 1.0);
						return <Phone w={460} style={{left: 310, top: 700, transform: `translateY(${(1 - ph) * 900}px)`}}><DepositOverview t={t} at={c.P(D) + 0.6} /></Phone>;
					})()}
				</AbsoluteFill>
			) : null}
			<EndCard t={t} at={tEnd} vertical cta="Join Rent's waitlist" />
			<AdSound
				p={p}
				sfx={[
					[c.P(B) - 0.05, 'phone-notify', 0.18],
					[c.W(B, 'deposit'), 'tension-pulse', 0.14],
					...cutT.map((x): [number, string, number] => [x - 0.08, 'ui-tap', 0.18]),
					[c.P(D) - 0.3, 'soft-swoosh', 0.16],
					[c.P(D), 'logo-reveal', 0.18],
					[tEnd, 'sonic-logo', 0.26],
				]}
			/>
		</>
	);
};

// ─── VIDEO 3 — the moving experience (9:16) ──────────────────────────────────
const Video3: React.FC<V> = ({t, c, p}) => {
	const [A, B, Cc, D, E] = ['v3a', 'v3b', 'v3c', 'v3d', 'v3e'];
	const tEnd = c.W(E, 'join') - 0.3;
	const sA = 1 - prog(t, c.P(B) - 0.3, 0.5);
	const sB = life(t, c.P(B) - 0.3, c.P(Cc) + 0.1, 0.5, 0.4);
	const sC = life(t, c.P(Cc) - 0.2, c.P(D) + 0.1, 0.5, 0.4);
	const sD = life(t, c.P(D) - 0.3, c.P(E) + 0.2, 0.5, 0.4);
	const sE = prog(t, c.P(E) - 0.3, 0.6);
	return (
		<>
			{/* A: the offer, packing */}
			{sA > 0 ? (
				<AbsoluteFill style={{opacity: sA}}>
					<Floor y={1600} />
					<Toast t={t} at={0.15} icon="briefcase" title="Offer letter received" body="Software engineer · Bengaluru" accent={C.indigo} app="Mail" style={{left: 70, top: 560, width: 940}} />
					<Arjun t={t} suitcase={prog(t, c.W(A, 'city'), 0.3)} look={-0.2} scale={1.05} style={{left: 380, top: 1600 - 560 * 1.05 + 6}} />
					{[0, 1, 2].map((i) => {
						const pp = prog(t, c.W(A, 'city') + i * 0.18, 0.6, SPRINGY);
						return (
							<div key={i} style={{position: 'absolute', left: [130, 720, 800][i], top: 1600 - [150, 150, 290][i], width: [150, 160, 120][i], height: [150, 150, 140][i], borderRadius: 10, background: '#E9C9A0', boxShadow: SHADOW_SM, transform: `scale(${pp})`, transformOrigin: 'bottom center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<div style={{width: '70%', height: 10, background: '#D6AF7F', borderRadius: 4}} />
							</div>
						);
					})}
					<OnScreen t={t} at={c.W(A, 'new')} text="New job. New city." v />
				</AbsoluteFill>
			) : null}
			{/* B: arrival, finding a home */}
			{sB > 0 ? (
				<AbsoluteFill style={{opacity: sB}}>
					<div style={{position: 'absolute', left: 40, top: 1180, transform: 'scale(1)'}}>
						<Skyline draw={prog(t, c.P(B) - 0.3, 1.6, Easing.linear)} w={1000} />
					</div>
					<div style={{position: 'absolute', left: 390, top: 1490 - (7 * 64 + 110)}}>
						<Building t={t} at={c.P(B)} glow={prog(t, c.W(B, 'right'), 1.0, Easing.linear)} />
					</div>
					<Floor y={1490} />
					<div style={{position: 'absolute', left: 640, top: 760, transform: `scale(${prog(t, c.P(B) + 0.3, 0.7, SPRINGY)})`}}>
						<Pill bg={C.white} color={C.navy} style={{boxShadow: SHADOW_SM, fontSize: 28, padding: '14px 24px'}}>
							<Icon name="pin" size={30} color={C.indigo} /> Bengaluru
						</Pill>
					</div>
					<Card t={t} at={c.W(B, 'feels') - 0.2} style={{left: 70, top: 560, width: 520}} pad={0}>
						<RoomArt w={520} h={240} t={t} radius={18} />
						<div style={{padding: '20px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
							<span style={{fontFamily: inter, fontWeight: 600, fontSize: 28, color: C.navy}}>2 BHK · Indiranagar</span>
							<IconTile name="check" size={44} bg={C.greenSoft} color={C.green} />
						</div>
					</Card>
					<OnScreen t={t} at={c.P(B)} text="New home." v grad={['home']} />
				</AbsoluteFill>
			) : null}
			{/* C: the deposit + moving budget */}
			{sC > 0 ? (
				<AbsoluteFill style={{opacity: sC}}>
					<OnScreen t={t} at={c.P(Cc)} text="The upfront deposit." v grad={['upfront']} />
					<Terms t={t} at={c.P(Cc)} depAt={c.W(Cc, 'deposit')} w={940} style={{left: 70, top: 560}} />
					<Card t={t} at={c.W(Cc, 'one') - 0.3} style={{left: 70, top: 1060, width: 940}} pad={34}>
						<Eyebrow>Moving budget</Eyebrow>
						{(
							[
								['Flight & transport', 0.18],
								['First month rent', 0.42],
								['Security deposit', 1],
							] as const
						).map(([l, w], i) => (
							<div key={l} style={{marginTop: 18}}>
								<div style={{fontFamily: inter, fontSize: 24, color: C.slate}}>{l}</div>
								<div style={{height: 18, borderRadius: 9, background: C.soft, marginTop: 8, overflow: 'hidden'}}>
									<div style={{height: '100%', width: `${w * 100 * prog(t, c.W(Cc, 'one') + i * 0.25, 0.8)}%`, borderRadius: 9, background: i === 2 ? 'linear-gradient(90deg, #FFB46A, #F2733C)' : C.indigoSoft}} />
								</div>
							</div>
						))}
					</Card>
				</AbsoluteFill>
			) : null}
			{/* D: Rent — a different way to plan */}
			{sD > 0 ? (
				<AbsoluteFill style={{opacity: sD}}>
					<BlueAurora t={t} o={0.55} vertical />
					<RLockup t={t} at={c.P(D)} size={120} style={{position: 'absolute', left: 300, top: 260}} />
					<OnScreen t={t} at={c.W(D, 'smarter')} text="Explore a different way to plan." v size={72} top={450} />
					<Journey t={t} at={[c.W(D, 'explore') - 0.2, c.W(D, 'explore') + 0.4, c.W(D, 'financing')]} steps={['Explore options', 'Apply', 'Lender assessment']} vertical style={{left: 140, right: 140, top: 760}} />
					<Note t={t} at={c.P(D) + 0.5} out={c.P(E)} text="Being explored with regulated lending partners." vertical />
				</AbsoluteFill>
			) : null}
			{/* E: looking out from the new apartment */}
			{sE > 0 && t < tEnd + 0.4 ? (
				<AbsoluteFill style={{opacity: sE}}>
					<div style={{position: 'absolute', left: 140, top: 520}}>
						<CityWindow t={t} w={800} h={760} />
					</div>
					<Floor y={1600} />
					<Arjun t={t} suitcase={0} look={0.6} scale={1.0} style={{left: 600, top: 1600 - 560 + 6}} />
					<OnScreen t={t} at={c.P(E)} text="Be among the first." v grad={['first']} />
				</AbsoluteFill>
			) : null}
			<EndCard t={t} at={tEnd} vertical cta="Join the Rent waitlist" />
			<AdSound
				p={p}
				sfx={[
					[0.15, 'phone-notify', 0.16],
					[c.W(A, 'city'), 'soft-swoosh', 0.12],
					[c.P(B) - 0.3, 'line-draw', 0.14],
					[c.W(B, 'feels') - 0.2, 'confirm-chime', 0.12],
					[c.W(Cc, 'deposit') - 0.1, 'counter-tick', 0.14],
					[c.P(D) - 0.2, 'logo-reveal', 0.18],
					[c.P(E) - 0.3, 'soft-swoosh', 0.12],
					[tEnd, 'sonic-logo', 0.26],
				]}
			/>
		</>
	);
};

// ─── VIDEO 4 — financial flexibility (9:16) ──────────────────────────────────
const Video4: React.FC<V> = ({t, c, p}) => {
	const [A, B, Cc, D, E] = ['v4a', 'v4b', 'v4c', 'v4d', 'v4e'];
	const tEnd = c.P(E) - 0.2;
	const reorg = prog(t, c.P(Cc) - 0.2, 1.0, IN_OUT);
	const pulse = life(t, c.P(B), c.P(Cc), 0.4, 0.4) * (0.5 + 0.5 * Math.sin(t * 6));
	return (
		<>
			<OnScreen t={t} at={0} out={c.P(B)} text="It's not always about finding a home." v size={72} />
			<OnScreen t={t} at={c.P(B)} out={c.P(Cc)} text="It's the upfront deposit." v grad={['deposit']} />
			<OnScreen t={t} at={c.P(Cc) + 0.2} out={c.P(D)} text="A more informed way to plan." v size={74} />
			<OnScreen t={t} at={c.P(D)} out={tEnd} text="Know your options." v grad={['options']} />
			{/* the month: salary, rent, moving, deposit */}
			{reorg < 1 ? (
				<div style={{position: 'absolute', left: 90, top: 560, opacity: 1 - reorg, transform: `scale(${mix(1, 0.85, reorg)})`, transformOrigin: 'center top'}}>
					<Calendar month="July" t={t} at={0.2} w={900} markAt={0.3} marks={{1: {color: C.green}, 5: {color: C.indigo}, 8: {color: '#F5A35C'}, 9: {color: '#F5A35C'}, 10: {color: C.orange}}} />
					<div style={{position: 'absolute', left: (900 - 48) / 7 * 2 + 24 + ((900 - 48) / 7) * 0.11, top: 24 + 40 + 40 + ((900 - 48) / 7) * 0.82 + 6 + 6, width: ((900 - 48) / 7) * 0.78 + 12, height: ((900 - 48) / 7) * 0.78 + 12, borderRadius: '50%', border: `4px solid ${C.orange}`, opacity: pulse, transform: 'translate(-6px,-6px)'}} />
					<div style={{display: 'flex', flexWrap: 'wrap', gap: '14px 30px', marginTop: 26, opacity: prog(t, 1.0, 0.6)}}>
						<Legend color={C.green} label="Salary" />
						<Legend color={C.indigo} label="Rent" />
						<Legend color="#F5A35C" label="Moving costs" />
						<Legend color={C.orange} label="Deposit due" />
					</div>
					<Card t={t} at={c.W(B, 'large') - 0.2} style={{left: 0, top: 1000, width: 900}} pad={30}>
						<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: inter}}>
							<div>
								<div style={{fontSize: 22, color: C.muted}}>Available balance</div>
								<div style={{...NUM, fontWeight: 600, fontSize: 52, color: C.navy}}>₹48,000</div>
							</div>
							<div style={{textAlign: 'right'}}>
								<div style={{fontSize: 22, color: C.muted}}>Deposit due · 10th</div>
								<div style={{...NUM, fontWeight: 600, fontSize: 52, color: C.orange}}>₹1,00,000</div>
							</div>
						</div>
						<div style={{fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', color: C.muted, marginTop: 10, fontFamily: inter}}>ILLUSTRATIVE</div>
					</Card>
				</div>
			) : null}
			{/* the calendar reorganises into a simple planning view */}
			{t > c.P(Cc) - 0.2 && t < tEnd + 0.4 ? (
				<AbsoluteFill style={{opacity: reorg * (1 - prog(t, tEnd - 0.3, 0.4))}}>
					<RLockup t={t} at={c.W(Cc, 'rent')} size={84} style={{position: 'absolute', left: 70, top: 470}} />
					<Card t={t} at={c.P(Cc) + 0.2} style={{left: 70, top: 620, width: 940}} pad={34}>
						<Eyebrow>Plan your move</Eyebrow>
						{(
							[
								['calendar', 'Monthly rent', 'Planned'],
								['truck', 'Moving costs', 'Planned'],
								['shield', 'Security deposit', 'Explore options'],
							] as const
						).map(([ic, l, s], i) => (
							<div key={l} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '20px 0', borderBottom: i < 2 ? `1px solid ${C.line}` : undefined, opacity: prog(t, c.P(Cc) + 0.5 + i * 0.3, 0.5)}}>
								<IconTile name={ic} size={60} bg={i === 2 ? C.indigoSoft : C.soft} color={i === 2 ? C.indigo : C.slate} />
								<span style={{flex: 1, fontFamily: inter, fontWeight: 600, fontSize: 32, color: C.navy}}>{l}</span>
								<Pill bg={i === 2 ? C.indigoSoft : C.greenSoft} color={i === 2 ? C.indigo : C.green} style={{fontSize: 22}}>
									{s}
								</Pill>
							</div>
						))}
					</Card>
					<Journey t={t} at={[c.W(D, 'understand') - 0.1, c.W(D, 'repayment') - 0.1, c.W(D, 'proceeding') - 0.2]} steps={['Explore options', 'Review terms', 'Lender assessment']} vertical style={{left: 140, right: 140, top: 1090}} />
					<Note t={t} at={c.W(Cc, 'eligible')} out={tEnd} text="For eligible renters, via regulated lending partners." vertical />
				</AbsoluteFill>
			) : null}
			<EndCard t={t} at={tEnd} vertical cta="Join the waitlist" />
			<AdSound
				p={p}
				sfx={[
					[0.3, 'line-draw', 0.12],
					[c.P(B), 'tension-pulse', 0.12],
					[c.W(B, 'large') - 0.2, 'counter-tick', 0.12],
					[c.P(Cc) - 0.2, 'soft-swoosh', 0.16],
					[c.W(Cc, 'rent'), 'logo-reveal', 0.16],
					[c.W(D, 'understand') - 0.1, 'ui-tap', 0.16],
					[c.W(D, 'repayment') - 0.1, 'ui-tap', 0.16],
					[c.W(D, 'proceeding') - 0.2, 'ui-tap', 0.16],
					[tEnd, 'sonic-logo', 0.26],
				]}
			/>
		</>
	);
};

// ─── talking head (videos 5 and 6) ───────────────────────────────────────────
/** A person framed chest-up; `pip` 0 = full frame … 1 = small circle top-right. */
const TalkingHead: React.FC<{t: number; talk: number; pip: number; who: 'founder' | 'creator'; selfie?: boolean}> = ({t, talk, pip, who, selfie}) => {
	const size = mix(1080, 300, pip);
	const x = mix(0, 1080 - 70 - 300, pip);
	const y = mix(selfie ? 250 : 380, 250, pip);
	const h = mix(selfie ? 1300 : 1100, 300, pip);
	const sway = selfie ? Math.sin(t * 1.3) * 6 + Math.sin(t * 2.9) * 3 : 0;
	const P = who === 'founder' ? Founder : Creator;
	const sc = mix(selfie ? 3.2 : 2.6, 1.0, pip);
	return (
		<div style={{position: 'absolute', left: x, top: y, width: size, height: h, borderRadius: mix(selfie ? 40 : 0, 150, pip), overflow: 'hidden', background: who === 'founder' ? 'linear-gradient(180deg, #EEF2F8, #E4EAF3)' : 'linear-gradient(180deg, #F3EEFB, #EAE3F8)', boxShadow: pip > 0.1 ? SHADOW : undefined, transform: `rotate(${sway * 0.1}deg)`}}>
			{/* background: a calm room */}
			<div style={{position: 'absolute', left: size * 0.08, top: h * 0.08, width: size * 0.34, height: h * 0.36, borderRadius: 14, background: GRADIENT, opacity: 0.35}} />
			<div style={{position: 'absolute', right: size * 0.1, top: h * 0.12, width: size * 0.12, height: size * 0.12, borderRadius: '50%', background: C.green, opacity: 0.5}} />
			<P t={t} talk={talk} gesture={who === 'founder' ? 0.25 * life(t, 6, 14, 1, 1) : 0} scale={sc} style={{left: size / 2 - 130 * sc + sway, top: mix(selfie ? 120 : 170, 40, pip) - 40 * sc * 0.3}} />
		</div>
	);
};

// ─── VIDEO 5 — founder / brand introduction (9:16) ───────────────────────────
const Video5: React.FC<V> = ({t, c, p}) => {
	const [A, B, Cc, D, E] = ['v5a', 'v5b', 'v5c', 'v5d', 'v5e'];
	const tEnd = c.E(E) + 0.3;
	const pip = prog(t, c.W(A, 'finding') - 0.3, 0.7, IN_OUT) * (1 - prog(t, c.P(E) - 0.2, 0.7, IN_OUT));
	const talk = talkAt(t, p.parts);
	const vis = (a: number, b: number) => life(t, a, b, 0.6, 0.4);
	return (
		<>
			<AbsoluteFill style={{background: C.bg}} />
			{/* supporting visuals behind the PiP */}
			{vis(c.W(A, 'finding') - 0.1, c.P(B)) > 0 ? (
				<AbsoluteFill style={{opacity: vis(c.W(A, 'finding') - 0.1, c.P(B))}}>
					<Card t={t} at={c.W(A, 'finding')} style={{left: 70, top: 600, width: 940}} pad={0}>
						<RoomArt w={940} h={420} t={t} radius={18} />
						<div style={{padding: '24px 30px', fontFamily: inter, fontWeight: 600, fontSize: 34, color: C.navy}}>Apartment search · 2 BHK</div>
					</Card>
					<Keys t={t} at={c.W(A, 'beginning') - 0.3} x={820} y={560} size={150} />
				</AbsoluteFill>
			) : null}
			{vis(c.P(B) - 0.2, c.P(Cc)) > 0 ? (
				<AbsoluteFill style={{opacity: vis(c.P(B) - 0.2, c.P(Cc))}}>
					<Terms t={t} at={c.P(B)} depAt={c.W(B, 'large')} w={940} style={{left: 70, top: 600}} />
					<CostCard t={t} at={c.W(B, 'upfront')} icon="wallet" label="Moving budget" value="₹60,000" accent={C.indigo} w={940} style={{left: 70, top: 1000}} />
				</AbsoluteFill>
			) : null}
			{vis(c.P(Cc) - 0.2, c.P(D)) > 0 ? (
				<AbsoluteFill style={{opacity: vis(c.P(Cc) - 0.2, c.P(D))}}>
					<BlueAurora t={t} o={0.5} vertical />
					<RLockup t={t} at={c.W(Cc, 'rent')} size={110} style={{position: 'absolute', left: 70, top: 600}} />
					<Phone w={430} style={{left: 325, top: 780, transform: `translateY(${(1 - prog(t, c.W(Cc, 'rent') + 0.3, 1.0)) * 900}px)`}}>
						<DepositOverview t={t} at={c.W(Cc, 'rent') + 0.5} />
					</Phone>
				</AbsoluteFill>
			) : null}
			{vis(c.P(D) - 0.2, c.P(E) + 0.2) > 0 ? (
				<AbsoluteFill style={{opacity: vis(c.P(D) - 0.2, c.P(E) + 0.2)}}>
					<Card t={t} at={c.P(D)} style={{left: 70, top: 600, width: 940}} pad={44}>
						<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
							<RMark size={52} />
							<span style={{fontFamily: inter, fontWeight: 600, fontSize: 32, color: C.navy}}>Rent</span>
							<span style={{marginLeft: 'auto'}}>
								<Pill bg={C.indigoSoft} color={C.indigo} style={{fontSize: 20}}>
									Early access
								</Pill>
							</span>
						</div>
						<div style={{...H, fontSize: 52, marginTop: 34}}>Planning your next move?</div>
						<div style={{...BODY, fontSize: 28, marginTop: 14}}>Join the early-access waitlist.</div>
						<div style={{marginTop: 34, height: 86, borderRadius: 14, border: `2px solid ${C.indigo}`, display: 'flex', alignItems: 'center', padding: '0 24px', fontFamily: inter, fontSize: 30, color: C.navy, boxShadow: '0 0 0 6px rgba(99,91,255,0.12)'}}>
							{'you@email.com'.slice(0, Math.round(13 * prog(t, c.W(D, 'inviting'), 1.2, Easing.linear)))}
							<span style={{width: 3, height: 40, background: C.indigo, marginLeft: 4, opacity: Math.sin(t * 8) > 0 ? 1 : 0}} />
						</div>
						<div style={{marginTop: 22, height: 86, borderRadius: 14, background: C.indigo, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: inter, fontWeight: 600, fontSize: 32}}>Join the waitlist</div>
						<div style={{fontFamily: inter, fontSize: 18, color: C.muted, marginTop: 18}}>Not a loan application or approval.</div>
					</Card>
				</AbsoluteFill>
			) : null}
			<TalkingHead t={t} talk={talk} pip={pip} who="founder" />
			{/* name tag */}
			<div style={{position: 'absolute', left: 70, top: 1340, opacity: life(t, 0.3, c.W(A, 'finding') - 0.3, 0.5, 0.3)}}>
				<Pill bg={C.white} color={C.navy} style={{boxShadow: SHADOW_SM, fontSize: 28, padding: '14px 24px'}}>
					<RMark size={34} /> Founder, Rent
				</Pill>
			</div>
			<Captions t={t} parts={p.parts} top={1460} />
			<EndCard t={t} at={tEnd} vertical cta="Join the early-access waitlist" tagline="We're building a better rental-finance experience." />
			<AdSound
				p={p}
				sfx={[
					[c.W(A, 'finding') - 0.3, 'soft-swoosh', 0.1],
					[c.W(Cc, 'rent') - 0.2, 'logo-reveal', 0.14],
					[c.W(D, 'inviting'), 'ui-tap', 0.12],
					[c.P(E) - 0.2, 'soft-swoosh', 0.1],
					[tEnd, 'sonic-logo', 0.24],
				]}
			/>
		</>
	);
};

// ─── VIDEO 6 — UGC-style renter scenario (9:16) ──────────────────────────────
const Video6: React.FC<V> = ({t, c, p}) => {
	const [A, B, Cc, D, E, F] = ['v6a', 'v6b', 'v6c', 'v6d', 'v6e', 'v6f'];
	const tEnd = c.E(F) + 0.2;
	const talk = talkAt(t, p.parts);
	const paper = life(t, c.W(Cc, 'suddenly') - 0.3, c.P(D) + 0.1, 0.5, 0.4);
	const product = life(t, c.P(D) - 0.2, c.P(F) + 0.1, 0.6, 0.4);
	const pip = Math.max(paper, product);
	return (
		<>
			<AbsoluteFill style={{background: C.bg}} />
			{/* B-roll: rental paperwork */}
			{paper > 0 ? (
				<AbsoluteFill style={{opacity: paper}}>
					<Terms t={t} at={c.W(Cc, 'suddenly') - 0.2} depAt={c.W(Cc, 'bigger')} w={940} style={{left: 70, top: 640}} />
					<Card t={t} at={c.W(Cc, 'arrange') - 0.2} style={{left: 70, top: 1080, width: 940}} pad={30}>
						<div style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: inter}}>
							<IconTile name="receipt" size={64} bg={C.peach} color={C.orange} />
							<span style={{fontWeight: 600, fontSize: 32, color: C.navy}}>Rental agreement · page 3</span>
						</div>
					</Card>
				</AbsoluteFill>
			) : null}
			{product > 0 ? (
				<AbsoluteFill style={{opacity: product}}>
					<BlueAurora t={t} o={0.5} vertical />
					<RLockup t={t} at={c.W(D, 'rent')} size={110} style={{position: 'absolute', left: 70, top: 600}} />
					<Phone w={430} style={{left: 325, top: 780, transform: `translateY(${(1 - prog(t, c.P(E) - 0.2, 1.0)) * 900}px)`}}>
						<DepositOverview t={t} at={c.P(E)} />
					</Phone>
				</AbsoluteFill>
			) : null}
			<TalkingHead t={t} talk={talk} pip={pip} who="creator" selfie />
			{/* moving boxes around the creator */}
			{pip < 0.5
				? (
						[
							['rent', 'calendar', 'Rent'],
							['transport', 'truck', 'Transport'],
							['moving', 'box', 'Moving'],
						] as const
					).map(([w, ic, l], i) => {
						const pp = prog(t, c.W(B, w) - 0.1, 0.5, SPRINGY) * (1 - prog(t, c.W(Cc, 'deposit') - 0.2, 0.4));
						return pp > 0 ? (
							<div key={l} style={{position: 'absolute', left: [80, 640, 360][i], top: [760, 820, 1180][i], transform: `scale(${pp}) rotate(${(i - 1) * 5}deg)`}}>
								<Pill bg={C.white} color={C.navy} style={{boxShadow: SHADOW_SM, fontSize: 34, padding: '16px 26px'}}>
									<Icon name={ic} size={36} color={C.indigo} /> {l}
								</Pill>
							</div>
						) : null;
					})
				: null}
			{(() => {
				const pp = prog(t, c.W(Cc, 'deposit') - 0.1, 0.6, SPRINGY) * (1 - prog(t, c.W(Cc, 'suddenly') - 0.3, 0.3));
				return pp > 0 ? (
					<div style={{position: 'absolute', left: 140, top: 900, width: 800, padding: 34, borderRadius: 24, background: C.white, boxShadow: SHADOW, transform: `scale(${pp}) rotate(-3deg)`, textAlign: 'center', fontFamily: inter}}>
						<div style={{fontSize: 26, fontWeight: 600, color: C.orange, letterSpacing: '0.06em'}}>SECURITY DEPOSIT</div>
						<div style={{...NUM, fontWeight: 600, fontSize: 110, color: C.navy}}>₹1,00,000</div>
						<div style={{fontSize: 16, fontWeight: 600, color: C.muted, letterSpacing: '0.06em'}}>ILLUSTRATIVE</div>
					</div>
				) : null;
			})()}
			{/* honest framing: a dramatised scenario */}
			<div style={{position: 'absolute', left: 70, top: 160, opacity: prog(t, 0.2, 0.5) * (1 - prog(t, tEnd - 0.3, 0.3))}}>
				<Pill bg="rgba(255,255,255,0.9)" color={C.slate} style={{fontSize: 20}}>
					Dramatised scenario
				</Pill>
			</div>
			<Captions t={t} parts={p.parts} top={1460} size={56} />
			<EndCard t={t} at={tEnd} vertical cta="Join the early-access waitlist" />
			<AdSound
				p={p}
				sfx={[
					...(['rent', 'transport', 'moving'] as const).map((w): [number, string, number] => [c.W(B, w) - 0.1, 'ui-tap', 0.14]),
					[c.W(Cc, 'deposit') - 0.1, 'tension-pulse', 0.12],
					[c.W(Cc, 'suddenly') - 0.3, 'soft-swoosh', 0.12],
					[c.W(D, 'rent') - 0.2, 'logo-reveal', 0.14],
					[tEnd, 'sonic-logo', 0.24],
				]}
			/>
		</>
	);
};

// ─── entry ───────────────────────────────────────────────────────────────────
const VIDEOS: Record<number, React.FC<V>> = {1: Video1, 2: Video2, 3: Video3, 4: Video4, 5: Video5, 6: Video6};

export const RentAd: React.FC<AdProps> = (p) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	if (!p.parts.length) return <AbsoluteFill style={{background: C.bg}} />;
	const c = makeCue(p.parts);
	const Video = VIDEOS[p.video] ?? Video1;
	return (
		<AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
			<Video t={t} c={c} p={p} />
		</AbsoluteFill>
	);
};

export {BLUE_PURPLE};
