// Scenes 1–4 (brief §2): a new beginning → the financial shock → the hidden problem → Velora appears.
// Every scene receives absolute time `t` and `T(i)` = start time of spoken word i (see build.mjs).
import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {Arjun} from './Arjun';
import {Aurora, BODY, C, Card, Eyebrow, Footnote, GRADIENT, H, Icon, IconTile, IN_OUT, life, Mark, mix, NUM, Phone, Pill, prog, Row, Rupees, SHADOW, SHADOW_SM, SPRINGY, useBrand, Wordmark, Words, inter} from './kit';

export type SceneProps = {t: number; T: (i: number) => number};
const times = (T: (i: number) => number, from: number, n: number) => Array.from({length: n}, (_, k) => T(from + k));

// ─── shared illustrations ────────────────────────────────────────────────────
/** Minimal Bengaluru skyline, line-drawn (stroke-dash) — towers, a domed civic building, trees. */
export const Skyline: React.FC<{draw: number; w: number}> = ({draw, w}) => {
	const paths = [
		'M0 300 H1000',
		'M40 300 V170 H120 V300',
		'M140 300 V110 H210 V300 M160 130 V290 M190 130 V290',
		'M240 300 V200 H300 V300',
		'M330 300 V230 Q330 200 360 196 H520 Q550 200 550 230 V300 M360 196 V170 H520 V196 M400 170 Q440 90 480 170 M440 104 V80',
		'M580 300 V140 H660 V300 M600 160 H640 M600 190 H640 M600 220 H640 M600 250 H640',
		'M690 300 V190 H760 V300',
		'M790 300 V80 H850 V300 M790 80 L820 56 L850 80',
		'M880 300 V210 H960 V300',
		'M20 300 V262 M20 262 m-16 0 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0',
		'M310 300 V268 M310 268 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0',
		'M975 300 V258 M975 258 m-18 0 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0',
	];
	return (
		<svg width={w} height={w * 0.31} viewBox="0 0 1000 310" style={{display: 'block', overflow: 'visible'}}>
			{paths.map((d, i) => {
				const p = prog(draw, i * 0.05, 0.55, Easing.linear);
				return <path key={i} d={d} fill="none" stroke="#AFBCCD" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />;
			})}
		</svg>
	);
};

/** Apartment building: floors stack up; windows warm up with the brand gradient (`glow`). */
export const Building: React.FC<{t: number; at: number; glow: number}> = ({t, at, glow}) => {
	const floors = 7;
	return (
		<div style={{position: 'relative', width: 300, height: floors * 64 + 110}}>
			{Array.from({length: floors}, (_, k) => {
				const p = prog(t, at + k * 0.09, 0.7, SPRINGY);
				return (
					<div key={k} style={{position: 'absolute', left: 0, bottom: 110 + k * 64, width: 300, height: 64, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 40}px)`, display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: C.white, borderLeft: `2px solid ${C.line}`, borderRight: `2px solid ${C.line}`, borderTop: k === floors - 1 ? `2px solid ${C.line}` : undefined, borderRadius: k === floors - 1 ? '14px 14px 0 0' : 0}}>
						{[0, 1, 2, 3].map((j) => {
							const lit = prog(glow, ((k * 4 + j) * 37) % 100 / 140, 0.3);
							return <div key={j} style={{width: 44, height: 34, borderRadius: 6, background: lit > 0 ? `linear-gradient(135deg, rgba(255,180,106,${lit}), rgba(244,127,182,${lit * 0.9}), rgba(124,123,255,${lit * 0.8}))` : C.indigoSoft, boxShadow: lit > 0.5 ? `0 0 18px rgba(255,160,120,${lit * 0.5})` : undefined}} />;
						})}
					</div>
				);
			})}
			{/* lobby + door */}
			{(() => {
				const p = prog(t, at, 0.7);
				return (
					<div style={{position: 'absolute', left: 0, bottom: 0, width: 300, height: 110, background: C.white, border: `2px solid ${C.line}`, borderTop: 'none', opacity: p}}>
						<div style={{position: 'absolute', left: 118, bottom: 0, width: 64, height: 86, borderRadius: '10px 10px 0 0', background: C.indigo}} />
					</div>
				);
			})()}
		</div>
	);
};

/** Flat interior thumbnail used for the listing (window light, sofa, plant). */
export const RoomArt: React.FC<{w: number; h: number; t: number; radius?: number}> = ({w, h, t, radius = 0}) => (
	<div style={{position: 'relative', width: w, height: h, overflow: 'hidden', borderRadius: radius, background: '#EEF2F8'}}>
		<div style={{position: 'absolute', left: w * 0.12, top: h * 0.1, width: w * 0.46, height: h * 0.56, borderRadius: 12, background: GRADIENT, opacity: 0.55, backgroundSize: '160% 160%', backgroundPosition: `${50 + Math.sin(t * 0.4) * 30}% 50%`}} />
		<div style={{position: 'absolute', left: w * 0.12, top: h * 0.1, width: w * 0.46, height: h * 0.56, borderRadius: 12, border: '6px solid #fff', boxSizing: 'border-box'}} />
		<div style={{position: 'absolute', left: w * 0.35 - 3, top: h * 0.1, width: 6, height: h * 0.56, background: '#fff'}} />
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: h * 0.24, background: '#E2E8F1'}} />
		<div style={{position: 'absolute', left: w * 0.18, bottom: h * 0.16, width: w * 0.5, height: h * 0.2, borderRadius: 18, background: C.indigo}} />
		<div style={{position: 'absolute', left: w * 0.15, bottom: h * 0.28, width: w * 0.56, height: h * 0.14, borderRadius: 16, background: '#7A73FF'}} />
		<div style={{position: 'absolute', right: w * 0.12, bottom: h * 0.16, width: w * 0.08, height: h * 0.16, borderRadius: '4px 4px 10px 10px', background: '#F2733C'}} />
		<div style={{position: 'absolute', right: w * 0.075, bottom: h * 0.3, width: w * 0.17, height: w * 0.17, borderRadius: '50%', background: '#1EA672', opacity: 0.85}} />
	</div>
);

// ─── Scene 1 — a new beginning ───────────────────────────────────────────────
export const S1: React.FC<SceneProps> = ({t, T}) => {
	const tFor = T(11);
	const end = T(22);
	const shift = prog(t, tFor - 0.4, 1.6, IN_OUT); // stage slides so the building sits centre-right
	const push = mix(1, 1.05, prog(t, 0, end - 1, Easing.linear));
	const dive = prog(t, end - 0.85, 0.85, Easing.bezier(0.7, 0, 0.84, 0)); // into the door
	const walkIn = prog(t, tFor + 0.1, 2.6, Easing.bezier(0.33, 0, 0.3, 1));
	const walking = t > tFor && t < tFor + 2.5 ? 1 - prog(t, tFor + 2.0, 0.5) : 0;
	const lineOut = tFor - 0.5;
	return (
		<AbsoluteFill style={{transform: `scale(${push * mix(1, 9, dive)})`, transformOrigin: `${mix(1500, 1023, shift)}px 975px`}}>
			<Aurora t={t} o={0.5 * prog(t, 0, 2)} y={760} h={240} angle={-16} x0={30} />
			{/* kinetic opening lines */}
			<div style={{position: 'absolute', left: 140, top: 300, width: 900, ...H, fontSize: 92}}>
				{(
					[
						['A new job.', 0, T(3)],
						['A new city.', 3, T(6)],
						['A place to call home.', 6, 1e9],
					] as const
				).map(([text, i, next]) => (
					<div key={text} style={{height: 112}}>
						<Words t={t} text={text} at={T(i)} times={times(T, i, text.split(' ').length)} out={lineOut} dim={prog(t, next - 0.1, 0.4)} grad={i === 6 ? ['home'] : []} />
					</div>
				))}
			</div>
			<div style={{position: 'absolute', left: 120, top: 110, ...H, fontSize: 58, opacity: life(t, tFor + 0.3, end, 0.8, 0.4)}}>
				<Words t={t} text="A new city." at={tFor + 0.3} />
				<span style={{color: C.slate}}>
					<Words t={t} text="A new beginning." at={tFor + 0.6} />
				</span>
			</div>
			{/* stage: offer card, skyline, building */}
			<div style={{position: 'absolute', inset: 0, transform: `translateX(${-480 * shift}px)`}}>
				<Card t={t} at={T(0) + 0.15} out={T(3) + 1.6} style={{left: 1150, top: 230, width: 520}} pad={28}>
					<div style={{display: 'flex', gap: 22, alignItems: 'center'}}>
						<IconTile name="briefcase" />
						<div style={{flex: 1}}>
							<div style={{fontFamily: inter, fontWeight: 600, fontSize: 28, color: C.navy}}>Offer accepted</div>
							<div style={{...BODY, fontSize: 21, marginTop: 4}}>Software engineer · Bengaluru</div>
						</div>
						<div style={{transform: `scale(${prog(t, T(0) + 0.7, 0.5, SPRINGY)})`}}>
							<IconTile name="check" bg={C.greenSoft} color={C.green} size={48} />
						</div>
					</div>
				</Card>
				<div style={{position: 'absolute', left: 860, top: 690}}>
					<Skyline draw={prog(t, T(3) - 0.1, 2.2, Easing.linear)} w={1000} />
				</div>
				{/* location pin */}
				{(() => {
					const p = prog(t, T(3) + 0.35, 0.8, SPRINGY);
					const o = 1 - prog(t, tFor + 1.5, 0.5);
					return p > 0 ? (
						<div style={{position: 'absolute', left: 1700, top: 560, opacity: Math.min(1, p * 2) * o, transform: `translateY(${(1 - p) * -60}px)`}}>
							<div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: C.white, borderRadius: 999, boxShadow: SHADOW_SM, fontFamily: inter, fontWeight: 600, fontSize: 22, color: C.navy}}>
								<Icon name="pin" size={24} color={C.indigo} /> Bengaluru
							</div>
						</div>
					) : null;
				})()}
				<div style={{position: 'absolute', left: 1350, top: 984 - (7 * 64 + 110)}}>
					<Building t={t} at={T(6) - 0.05} glow={prog(t, T(18) - 0.3, 1.6, Easing.linear)} />
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 984, height: 2, background: C.line, opacity: prog(t, 0.2, 1)}} />
			</div>
			{/* Arjun walks in with his suitcase, stops, looks up at the building */}
			{walkIn > 0 ? <Arjun t={t} walk={walking} look={prog(t, T(16), 0.8)} scale={0.78} style={{left: mix(-320, 610, walkIn), top: 984 - 560 * 0.78 + 4}} /> : null}
			<AbsoluteFill style={{background: C.bg, opacity: prog(t, end - 0.3, 0.3, Easing.linear)}} />
		</AbsoluteFill>
	);
};

// ─── Scene 2 — the financial shock ───────────────────────────────────────────
export const S2: React.FC<SceneProps> = ({t, T}) => {
	const s = T(22) - 0.02; // after scene 1 has dived through the door
	const tAgreement = T(27);
	const tProblem = T(35);
	const tDeposit = T(39);
	const tLakh = T(44);
	const tUp = T(49);
	const end = T(51);
	const zoom = prog(t, tUp - 0.25, 0.9, IN_OUT); // extreme close-up on the deposit
	const back = prog(t, tAgreement - 0.3, 0.9, IN_OUT); // listing steps back as the agreement arrives
	const mood = prog(t, tProblem, 1.6, IN_OUT);
	const enter = prog(t, s, 0.8);
	return (
		<AbsoluteFill style={{opacity: Math.min(1, enter * 1.6) * (1 - prog(t, end - 0.55, 0.45))}}>
			<AbsoluteFill style={{transform: `scale(${mix(1.08, 1, enter) * mix(1, 1.5, zoom)})`, transformOrigin: '960px 560px', filter: zoom > 0.01 ? `blur(${zoom * 14}px)` : undefined, opacity: 1 - zoom * 0.75}}>
				{/* listing */}
				<Card t={t} at={s + 0.1} style={{left: 160, top: 170, width: 700, transform: `translateX(${-back * 60}px) scale(${mix(1, 0.86, back)})`, transformOrigin: 'left center', opacity: mix(1, 0.45, back)}} pad={0}>
					<RoomArt w={700} h={400} t={t} radius={18} />
					<div style={{padding: '28px 34px 34px'}}>
						<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
							<div style={{fontFamily: inter, fontWeight: 600, fontSize: 34, color: C.navy, letterSpacing: '-0.02em'}}>2 BHK apartment</div>
							<div style={{transform: `scale(${prog(t, T(25), 0.6, SPRINGY)})`}}>
								<Pill>
									<Icon name="check" size={20} color={C.green} sw={2.4} /> Perfect match
								</Pill>
							</div>
						</div>
						<div style={{display: 'flex', alignItems: 'center', gap: 8, ...BODY, fontSize: 23, marginTop: 10}}>
							<Icon name="pin" size={22} color={C.muted} /> Indiranagar, Bengaluru
						</div>
					</div>
				</Card>
				{/* the rental agreement on his phone */}
				{(() => {
					const p = prog(t, tAgreement - 0.2, 1.0);
					if (p <= 0) return null;
					const hl = prog(t, tLakh + 1.1, 0.6);
					return (
						<Phone w={420} style={{left: 790, top: 120, transform: `translateY(${(1 - p) * 500}px) rotate(${(1 - p) * 6}deg)`, opacity: Math.min(1, p * 2)}}>
							<div style={{padding: '78px 30px 0'}}>
								<Eyebrow>Rental agreement</Eyebrow>
								<div style={{fontFamily: inter, fontWeight: 600, fontSize: 30, color: C.navy, marginTop: 8, letterSpacing: '-0.02em'}}>Flat 4B · Indiranagar</div>
								<div style={{height: 1, background: C.line, margin: '24px 0 4px'}} />
								<Row label="Monthly rent" value={<Rupees t={t} at={T(30) - 0.1} dur={1.3} value={25000} />} size={24} />
								<div style={{opacity: prog(t, tDeposit - 0.1, 0.6), background: `rgba(253,230,218,${hl})`, margin: '0 -14px', padding: '0 14px', borderRadius: 12}}>
									<Row label="Security deposit" value={<Rupees t={t} at={tLakh - 0.1} dur={1.6} value={100000} style={{color: hl > 0.5 ? C.orange : C.navy}} />} size={24} style={{borderBottom: 'none'}} />
									<div style={{paddingBottom: 14, transform: `scale(${prog(t, tDeposit + 0.4, 0.5, SPRINGY)})`, transformOrigin: 'left center'}}>
										<Pill bg={C.peach} color={C.orange}>
											<Icon name="clock" size={18} color={C.orange} sw={2.2} /> Due upfront
										</Pill>
									</div>
								</div>
								<div style={{marginTop: 40, height: 56, borderRadius: 12, background: C.peach, color: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: inter, fontWeight: 600, fontSize: 22}}>Continue</div>
							</div>
						</Phone>
					);
				})()}
				<Arjun t={t} mood={mood} look={mix(0, -0.4, prog(t, tAgreement, 1))} scale={0.82} style={{left: 1400, top: 984 - 560 * 0.82}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 984, height: 2, background: C.line}} />
			</AbsoluteFill>
			{/* extreme close-up: ₹1,00,000 */}
			{zoom > 0 ? (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: zoom * (1 - prog(t, end - 0.55, 0.45))}}>
					<div style={{textAlign: 'center', transform: `scale(${mix(0.6, 1, zoom)})`}}>
						<Eyebrow color={C.orange} style={{fontSize: 22}}>Security deposit · due upfront</Eyebrow>
						<div style={{...NUM, fontFamily: inter, fontWeight: 600, fontSize: 250, color: C.navy, lineHeight: 1.1, marginTop: 10}}>₹1,00,000</div>
						<div style={{height: 8, width: 980 * prog(t, tUp + 0.15, 0.8), margin: '6px auto 0', borderRadius: 8, background: GRADIENT}} />
						<div style={{...H, fontSize: 52, marginTop: 44}}>
							<Words t={t} text="The upfront cost is the problem." at={tUp + 0.35} grad={['upfront']} />
						</div>
					</div>
				</AbsoluteFill>
			) : null}
			<Footnote t={t} at={tAgreement + 0.5} out={end + 0.2}>
				Illustrative figures, not market averages.
			</Footnote>
		</AbsoluteFill>
	);
};

// ─── Scene 3 — the hidden problem ────────────────────────────────────────────
const OptionCard: React.FC<{t: number; at: number; out: number; x: number; icon: string; title: string; children: React.ReactNode}> = ({t, at, out, x, icon, title, children}) => (
	<Card t={t} at={at} out={out} style={{left: x, top: 560, width: 520, height: 330}} pad={34}>
		<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
			<IconTile name={icon} bg={C.peach} color={C.orange} size={58} />
			<div style={{fontFamily: inter, fontWeight: 600, fontSize: 30, color: C.navy, letterSpacing: '-0.02em'}}>{title}</div>
		</div>
		<div style={{marginTop: 30}}>{children}</div>
	</Card>
);

export const S3: React.FC<SceneProps> = ({t, T}) => {
	const s = T(51) - 0.08;
	const end = T(77);
	const out = end - 0.75; // clutter clears before "What if…"
	const tOpts = T(62);
	const zoomOut = mix(1.06, 1, prog(t, s, end - s, Easing.linear));
	const up = prog(t, tOpts - 0.2, 0.9, IN_OUT);
	const months = ['June', 'July', 'August'];
	const flip = prog(t, T(69) + 0.3, 1.6, Easing.linear) * 2;
	const mi = Math.min(2, Math.floor(flip));
	const fp = flip - Math.floor(flip);
	return (
		<AbsoluteFill style={{transform: `scale(${zoomOut})`, opacity: prog(t, s, 0.5)}}>
			<div style={{position: 'absolute', left: 120, top: 100, ...H, fontSize: 60, opacity: 1 - prog(t, out, 0.5, IN_OUT)}}>
				<div>
					<Words t={t} text="Affordable monthly rent." at={T(51)} times={[T(53), T(55), T(56)]} />
				</div>
				<div style={{color: C.slate}}>
					<Words t={t} text="Unaffordable upfront deposit." at={T(57)} times={[T(57) + 0.1, T(60), T(61)]} grad={['unaffordable']} />
				</div>
			</div>
			{/* rent vs deposit */}
			<div style={{position: 'absolute', inset: 0, transform: `translateY(${-up * 40}px)`, opacity: mix(1, 0.5, up)}}>
				<Card t={t} at={T(51)} out={out} style={{left: 120, top: 300, width: 800}} pad={34}>
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
						<div>
							<Eyebrow>Monthly rent</Eyebrow>
							<div style={{...NUM, fontFamily: inter, fontWeight: 600, fontSize: 64, color: C.navy, marginTop: 6}}>₹25,000</div>
						</div>
						<div style={{transform: `scale(${prog(t, T(53), 0.6, SPRINGY)})`}}>
							<Pill>
								<Icon name="check" size={20} color={C.green} sw={2.4} /> Manageable monthly
							</Pill>
						</div>
					</div>
				</Card>
				<Card t={t} at={T(57)} out={out} style={{left: 1000, top: 300, width: 800}} pad={34}>
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
						<div>
							<Eyebrow>Security deposit</Eyebrow>
							<div style={{...NUM, fontFamily: inter, fontWeight: 600, fontSize: 64, color: C.orange, marginTop: 6}}>₹1,00,000</div>
						</div>
						<div style={{transform: `scale(${prog(t, T(62), 0.6, SPRINGY)})`}}>
							<Pill bg={C.peach} color={C.orange}>
								<Icon name="clock" size={20} color={C.orange} sw={2.2} /> All at once
							</Pill>
						</div>
					</div>
				</Card>
			</div>
			{/* three hard options */}
			<OptionCard t={t} at={T(66) - 0.2} out={out} x={120} icon="wallet" title="Drain savings">
				<div style={{display: 'flex', justifyContent: 'space-between', ...BODY, fontSize: 22}}>
					<span>Savings balance</span>
					<Rupees t={t} at={T(67)} dur={1.8} from={140000} value={40000} style={{color: C.navy, fontWeight: 600}} />
				</div>
				<div style={{height: 14, borderRadius: 8, background: C.soft, marginTop: 18, overflow: 'hidden'}}>
					<div style={{height: '100%', width: `${mix(100, 28, prog(t, T(67), 1.8, Easing.bezier(0.16, 1, 0.3, 1)))}%`, borderRadius: 8, background: 'linear-gradient(90deg, #FFB46A, #F2733C)'}} />
				</div>
			</OptionCard>
			<OptionCard t={t} at={T(69) - 0.2} out={out} x={700} icon="calendar" title="Delay the move">
				<div style={{display: 'flex', alignItems: 'center', gap: 24}}>
					<div style={{perspective: 600}}>
						<div style={{width: 150, height: 120, borderRadius: 14, border: `2px solid ${C.line}`, overflow: 'hidden', textAlign: 'center', transform: `rotateX(${fp < 0.5 && flip < 2 ? -fp * 160 : 0}deg)`, transformOrigin: 'top center'}}>
							<div style={{background: C.orange, color: '#fff', fontFamily: inter, fontWeight: 600, fontSize: 18, padding: '6px 0'}}>{months[mi]}</div>
							<div style={{...NUM, fontFamily: inter, fontWeight: 600, fontSize: 52, color: C.navy, marginTop: 8}}>1</div>
						</div>
					</div>
					<div style={{...BODY, fontSize: 22, lineHeight: 1.4}}>
						Move-in date
						<br />
						<span style={{color: C.orange, fontWeight: 600}}>pushed back</span>
					</div>
				</div>
			</OptionCard>
			<OptionCard t={t} at={T(73) - 0.2} out={out} x={1280} icon="chat" title="Borrow from someone">
				{(() => {
					const typing = t > T(73) && t < T(73) + 0.9;
					const sent = prog(t, T(73) + 0.9, 0.5, SPRINGY);
					return typing ? (
						<div style={{display: 'flex', gap: 8, padding: '18px 22px', background: C.soft, borderRadius: 18, width: 96}}>
							{[0, 1, 2].map((k) => (
								<div key={k} style={{width: 12, height: 12, borderRadius: 6, background: C.muted, opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 6 + k))}} />
							))}
						</div>
					) : sent > 0 ? (
						<div style={{display: 'inline-block', padding: '16px 22px', background: C.indigo, color: '#fff', borderRadius: '18px 18px 4px 18px', fontFamily: inter, fontSize: 22, transform: `scale(${sent})`, transformOrigin: 'left bottom'}}>Could you lend me ₹1 lakh?</div>
					) : null;
				})()}
			</OptionCard>
			<Footnote t={t} at={s} out={out + 0.3}>
				Illustrative figures, not market averages.
			</Footnote>
		</AbsoluteFill>
	);
};

// ─── Scene 4 — Velora appears ────────────────────────────────────────────────
export const AppHome: React.FC<{t: number; at: number}> = ({t, at}) => {
	const brand = useBrand();
	const r = (k: number) => prog(t, at + 0.25 + k * 0.12, 0.7);
	const rs = (k: number): React.CSSProperties => ({opacity: r(k), transform: `translateY(${(1 - r(k)) * 24}px)`});
	return (
		<div style={{padding: '74px 24px 0', fontFamily: inter}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 10, ...rs(0)}}>
				<Mark size={34} />
				<span style={{fontWeight: 600, fontSize: 22, color: C.navy}}>{brand.name}</span>
			</div>
			<div style={{fontWeight: 500, fontSize: 30, color: C.navy, marginTop: 22, letterSpacing: '-0.02em', ...rs(1)}}>Hi Arjun</div>
			<div style={{marginTop: 18, padding: 20, borderRadius: 16, border: `1px solid ${C.line}`, ...rs(2)}}>
				<div style={{fontSize: 17, color: C.muted}}>Rent due · 1 July</div>
				<div style={{...NUM, fontWeight: 600, fontSize: 34, color: C.navy, marginTop: 4}}>₹25,000</div>
				<div style={{marginTop: 14, height: 46, borderRadius: 10, background: C.indigo, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 18}}>Pay rent</div>
			</div>
			<div style={{marginTop: 14, padding: 20, borderRadius: 16, background: C.soft, position: 'relative', overflow: 'hidden', ...rs(3)}}>
				<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: GRADIENT}} />
				<div style={{fontWeight: 600, fontSize: 20, color: C.navy}}>Deposit financing</div>
				<div style={{fontSize: 16, color: C.slate, marginTop: 4}}>Explore options with our partners</div>
			</div>
			<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 22, ...rs(4)}}>
				{[
					['repeat', 'Auto-pay'],
					['receipt', 'Records'],
					['shield', 'Protection'],
				].map(([ic, l]) => (
					<div key={l} style={{textAlign: 'center', width: 100}}>
						<div style={{margin: '0 auto', width: 56, height: 56, borderRadius: 16, background: C.indigoSoft, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name={ic} size={26} color={C.indigo} />
						</div>
						<div style={{fontSize: 15, color: C.slate, marginTop: 8}}>{l}</div>
					</div>
				))}
			</div>
		</div>
	);
};

export const S4: React.FC<SceneProps> = ({t, T}) => {
	const brand = useBrand();
	const s = T(77) - 0.5;
	const tIntro = T(93);
	const tVelora = T(94);
	const tPlatform = T(95);
	const end = T(103);
	const toCorner = prog(t, tPlatform - 0.1, 1.1, IN_OUT);
	const through = prog(t, end - 0.7, 0.7, Easing.bezier(0.7, 0, 0.84, 0)); // push through the phone
	const q = T(77);
	return (
		<AbsoluteFill style={{opacity: prog(t, s, 0.5)}}>
			<Aurora t={t} o={mix(0.3, 0.75, prog(t, tIntro - 0.2, 1.2)) * (1 - through)} y={840} h={260} angle={-10} />
			{/* the question */}
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{width: 1380, textAlign: 'center', ...H, fontSize: 80, marginTop: -60}}>
					<Words t={t} text="What if renting a home came with a smarter way to manage the money behind it?" at={q} times={times(T, 77, 16)} grad={['smarter', 'way']} out={tIntro - 0.45} />
				</div>
			</AbsoluteFill>
			{/* logo: lines assemble the mark, wordmark slides in, then the lockup moves to the corner */}
			{t > tIntro - 0.3 ? (
				<div
					style={{
						position: 'absolute',
						left: mix(960 - (150 + 40 + 150 * 0.58 * brand.name.length) / 2, 120, toCorner),
						top: mix(390, 96, toCorner),
						display: 'flex',
						alignItems: 'center',
						gap: mix(40, 18, toCorner),
						transform: `scale(${mix(1, 0.42, toCorner)})`,
						transformOrigin: 'left top',
						opacity: 1 - through,
					}}
				>
					<Mark size={150} draw={prog(t, tIntro - 0.2, 1.1, Easing.bezier(0.45, 0, 0.2, 1))} fill={prog(t, tIntro + 0.8, 0.5)} />
					<Wordmark t={t} at={tVelora - 0.05} size={150} />
				</div>
			) : null}
			<div style={{position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', ...BODY, fontSize: 42, opacity: life(t, tVelora + 0.35, tPlatform + 0.4, 0.7, 0.5)}}>
				<Words t={t} text="Move forward with confidence." at={tVelora + 0.35} />
			</div>
			{/* platform: headline left, app on a phone right */}
			<div style={{position: 'absolute', left: 120, top: 330, width: 820, ...H, fontSize: 84, opacity: 1 - through}}>
				<Words t={t} text="The financial layer of renting." at={tPlatform + 0.3} grad={['renting']} />
				<div style={{...BODY, fontSize: 32, marginTop: 34, lineHeight: 1.4, opacity: prog(t, T(98), 0.8)}}>A financial platform built around the renting experience.</div>
			</div>
			{(() => {
				const p = prog(t, tPlatform + 0.1, 1.3);
				if (p <= 0) return null;
				return (
					<div style={{position: 'absolute', left: 1180, top: 90, perspective: 1600, opacity: Math.min(1, p * 2)}}>
						<div style={{transform: `translateY(${(1 - p) * 700}px) rotateY(${mix(-24, -8, p) + through * 8}deg) rotateX(${mix(10, 3, p)}deg) scale(${mix(1, 3.2, through)})`, transformOrigin: '210px 430px'}}>
							<Phone w={420} style={{position: 'relative'}}>
								<AppHome t={t} at={tPlatform + 0.3} />
							</Phone>
						</div>
					</div>
				);
			})()}
			<AbsoluteFill style={{background: C.bg, opacity: prog(t, end - 0.3, 0.3, Easing.linear)}} />
		</AbsoluteFill>
	);
};
