// Scenes 5–8 (brief §2): how financing works → more than financing → the resolution → brand ending.
// Compliance (brief §8): the regulated lending partner makes the credit decision; no EMI amounts are invented;
// protection is "options through insurance partners"; figures are illustrative.
import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {Arjun} from './Arjun';
import {Aurora, BODY, C, Card, Eyebrow, Footnote, GRADIENT, H, Icon, IconTile, IN_OUT, inter, life, Mark, mix, NUM, Pill, prog, Row, SHADOW, SHADOW_SM, SPRINGY, Wordmark, Words, useBrand} from './kit';
import {RoomArt, type SceneProps} from './ScenesStory';

// ─── Scene 5 — how financing works ───────────────────────────────────────────
const STEPS = ['Find your home', 'Apply', 'Lender assessment', 'Manage repayments'];

const Field: React.FC<{t: number; at: number; label: string; value: React.ReactNode; done?: boolean}> = ({t, at, label, value, done}) => {
	const p = prog(t, at, 0.6);
	const focus = life(t, at, at + 0.9, 0.2, 0.3);
	return (
		<div style={{opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 16}px)`, marginBottom: 22}}>
			<div style={{fontFamily: inter, fontWeight: 500, fontSize: 19, color: C.slate, marginBottom: 8}}>{label}</div>
			<div style={{height: 64, borderRadius: 12, border: `1.5px solid ${focus > 0.1 ? C.indigo : C.line}`, boxShadow: focus > 0.1 ? `0 0 0 ${4 * focus}px rgba(99,91,255,0.15)` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', fontFamily: inter, fontSize: 24, color: C.navy}}>
				<span style={{...NUM}}>{value}</span>
				{done ? (
					<span style={{transform: `scale(${prog(t, at + 0.5, 0.5, SPRINGY)})`}}>
						<Pill>
							<Icon name="check" size={18} color={C.green} sw={2.6} /> Verified
						</Pill>
					</span>
				) : null}
			</div>
		</div>
	);
};

/** Types `text` out over `dur`. */
const typed = (t: number, at: number, text: string, dur = 0.6) => text.slice(0, Math.round(text.length * prog(t, at, dur, Easing.linear)));

export const S5: React.FC<SceneProps> = ({t, T}) => {
	const s = T(103) - 0.02; // after the push through the phone
	const st = [T(103), T(108), T(114), T(117)];
	const end = T(136);
	const out = end - 0.6;
	const enter = prog(t, s, 1.0);
	const active = st.filter((x) => t >= x - 0.2).length - 1;
	const panel = (i: number) => life(t, st[i] - 0.2, i < 3 ? st[i + 1] : out + 0.5, 0.6, 0.35);
	const slide = (i: number) => (1 - prog(t, st[i] - 0.2, 0.7)) * 50 + prog(t, i < 3 ? st[i + 1] - 0.35 : out, 0.35, IN_OUT) * -50;
	const spin = prog(t, st[2] + 0.2, 1.9, Easing.bezier(0.4, 0, 0.2, 1));
	const tSplit = T(126);
	const split = prog(t, tSplit, 1.4, IN_OUT);
	return (
		<AbsoluteFill style={{opacity: Math.min(1, enter * 1.5) * (1 - prog(t, out, 0.5, IN_OUT)), transform: `scale(${mix(0.7, 1, enter)})`}}>
			{/* stepper */}
			<div style={{position: 'absolute', left: 160, right: 160, top: 110, height: 90}}>
				<div style={{position: 'absolute', left: 30, right: 30, top: 29, height: 3, background: C.line, borderRadius: 2}} />
				<div style={{position: 'absolute', left: 30, top: 29, height: 3, borderRadius: 2, background: GRADIENT, width: `${mix(0, 1, Math.max(0, (active + prog(t, st[Math.max(0, active)] - 0.2, 0.7) - 1) / 3)) * 100 * 0.968}%`}} />
				<div style={{display: 'flex', justifyContent: 'space-between'}}>
					{STEPS.map((l, i) => {
						const on = prog(t, st[i] - 0.2, 0.5);
						return (
							<div key={l} style={{display: 'flex', flexDirection: 'column', alignItems: i === 0 ? 'flex-start' : i === 3 ? 'flex-end' : 'center', width: 300}}>
								<div style={{width: 62, height: 62, borderRadius: 31, background: on > 0.5 ? C.indigo : C.white, border: `2px solid ${on > 0.5 ? C.indigo : C.line}`, color: on > 0.5 ? '#fff' : C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: inter, fontWeight: 600, fontSize: 24, transform: `scale(${1 + 0.12 * Math.sin(Math.PI * Math.min(1, Math.max(0, on)))})`, boxShadow: i === active ? '0 0 0 8px rgba(99,91,255,0.14)' : undefined}}>
									{i < active ? <Icon name="check" size={28} color="#fff" sw={2.6} /> : i + 1}
								</div>
								<div style={{fontFamily: inter, fontWeight: i === active ? 600 : 500, fontSize: 24, color: i <= active ? C.navy : C.muted, marginTop: 14, whiteSpace: 'nowrap'}}>{l}</div>
							</div>
						);
					})}
				</div>
			</div>
			{/* main panel */}
			<div style={{position: 'absolute', left: 310, top: 290, width: 1300, height: 620, background: C.white, borderRadius: 22, boxShadow: SHADOW, overflow: 'hidden'}}>
				{/* 1 — find your home */}
				<div style={{position: 'absolute', inset: 0, padding: 50, display: 'flex', gap: 50, opacity: panel(0), transform: `translateX(${slide(0)}px)`}}>
					<RoomArt w={520} h={520} t={t} radius={16} />
					<div style={{flex: 1, paddingTop: 10}}>
						<Eyebrow>Your new home</Eyebrow>
						<div style={{fontFamily: inter, fontWeight: 600, fontSize: 44, color: C.navy, marginTop: 12, letterSpacing: '-0.025em'}}>2 BHK apartment</div>
						<div style={{display: 'flex', alignItems: 'center', gap: 8, ...BODY, fontSize: 24, marginTop: 10}}>
							<Icon name="pin" size={24} color={C.muted} /> Indiranagar, Bengaluru
						</div>
						<div style={{marginTop: 34}}>
							<Row label="Monthly rent" value="₹25,000" />
							<Row label="Security deposit" value="₹1,00,000" />
						</div>
						<div style={{marginTop: 30, transform: `scale(${prog(t, T(105), 0.6, SPRINGY)})`, transformOrigin: 'left center'}}>
							<Pill bg={C.indigoSoft} color={C.indigo}>
								<Icon name="user" size={20} color={C.indigo} sw={2.2} /> Eligible tenants can apply
							</Pill>
						</div>
					</div>
				</div>
				{/* 2 — apply */}
				<div style={{position: 'absolute', inset: 0, padding: '50px 70px', opacity: panel(1), transform: `translateX(${slide(1)}px)`}}>
					<Eyebrow>Deposit financing</Eyebrow>
					<div style={{fontFamily: inter, fontWeight: 600, fontSize: 40, color: C.navy, margin: '10px 0 34px', letterSpacing: '-0.025em'}}>Application</div>
					<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 40}}>
						<Field t={t} at={st[1] + 0.1} label="Monthly rent" value={'₹' + typed(t, st[1] + 0.25, '25,000')} />
						<Field t={t} at={st[1] + 0.6} label="Security deposit" value={'₹' + typed(t, st[1] + 0.75, '1,00,000')} />
						<Field t={t} at={T(110)} label="Identity verification" value="KYC documents" done />
						<Field t={t} at={T(111)} label="Income details" value="Employment verified" done />
					</div>
					{(() => {
						const press = life(t, T(112) + 0.3, T(112) + 0.6, 0.08, 0.2);
						return <div style={{marginTop: 14, height: 66, borderRadius: 12, background: C.indigo, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: inter, fontWeight: 600, fontSize: 24, transform: `scale(${1 - press * 0.03})`, opacity: prog(t, T(111) + 0.2, 0.5)}}>Submit application</div>;
					})()}
				</div>
				{/* 3 — lender assessment */}
				<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: panel(2), transform: `translateX(${slide(2)}px)`}}>
					<div style={{position: 'relative', width: 180, height: 180}}>
						<svg width={180} height={180} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
							<circle cx={90} cy={90} r={82} fill="none" stroke={C.soft} strokeWidth={8} />
							<circle cx={90} cy={90} r={82} fill="none" stroke={C.indigo} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - spin} />
						</svg>
						<div style={{position: 'absolute', inset: 40}}>
							<IconTile name="bank" size={100} />
						</div>
					</div>
					<div style={{fontFamily: inter, fontWeight: 600, fontSize: 44, color: C.navy, marginTop: 34, letterSpacing: '-0.025em'}}>Regulated lending partner</div>
					<div style={{...BODY, fontSize: 26, marginTop: 12, height: 34}}>{spin < 1 ? 'Assessing eligibility…' : 'Makes the credit decision'}</div>
					<div style={{marginTop: 26, opacity: prog(t, st[2] + 1.6, 0.5)}}>
						<Pill bg={C.soft} color={C.slate}>
							<Icon name="shield" size={20} color={C.slate} sw={2} /> Subject to approval and applicable terms
						</Pill>
					</div>
				</div>
				{/* 4 — manage repayments: one upfront lump → a structured schedule */}
				<div style={{position: 'absolute', inset: 0, padding: '56px 70px', opacity: panel(3), transform: `translateX(${slide(3)}px)`}}>
					<Eyebrow>{split < 0.5 ? 'Without financing' : 'With a repayment plan'}</Eyebrow>
					<div style={{fontFamily: inter, fontWeight: 600, fontSize: 40, color: C.navy, margin: '10px 0 0', letterSpacing: '-0.025em'}}>{split < 0.5 ? '₹1,00,000 due upfront' : 'A structured repayment schedule'}</div>
					<div style={{position: 'relative', height: 330, marginTop: 44}}>
						{Array.from({length: 10}, (_, k) => {
							const x0 = (k * 1160) / 10;
							const x1 = k * 116 + 4;
							const p = prog(split, k * 0.04, 0.6);
							const done = k < 3 ? prog(t, T(130) + k * 0.18, 0.4) : 0;
							return (
								<div key={k} style={{position: 'absolute', left: mix(x0, x1, p), top: 20, width: mix(116, 96, p), height: mix(150, 120, p), borderRadius: mix(k === 0 ? 14 : 0, 14, p), background: done > 0.5 ? C.indigo : p > 0.5 ? C.indigoSoft : 'linear-gradient(90deg, #FFB46A, #F2733C) no-repeat', backgroundSize: p > 0.5 ? undefined : '1160px 100%', backgroundPosition: p > 0.5 ? undefined : `${-x0}px 0`, borderTopRightRadius: k === 9 || p > 0.5 ? 14 : 0, borderBottomRightRadius: k === 9 || p > 0.5 ? 14 : 0, borderTopLeftRadius: k === 0 || p > 0.5 ? 14 : 0, borderBottomLeftRadius: k === 0 || p > 0.5 ? 14 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									{done > 0 ? (
										<div style={{transform: `scale(${done})`}}>
											<Icon name="check" size={34} color="#fff" sw={2.6} />
										</div>
									) : null}
								</div>
							);
						})}
						{/* timeline axis */}
						<div style={{position: 'absolute', left: 0, top: 200, height: 2, background: C.line, width: `${100 * split}%`}} />
						<div style={{position: 'absolute', left: 0, right: 0, top: 218, display: 'flex', opacity: split}}>
							{['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map((m) => (
								<div key={m} style={{width: 116, textAlign: 'center', fontFamily: inter, fontSize: 22, color: C.muted}}>
									{m}
								</div>
							))}
						</div>
					</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, T(130), 0.6)}}>
						<Pill bg={C.indigoSoft} color={C.indigo}>
							<Icon name="calendar" size={20} color={C.indigo} sw={2.2} /> Fits your financial situation
						</Pill>
						<span style={{...BODY, fontSize: 20, color: C.muted}}>Schedule set by the lending partner, if approved</span>
					</div>
				</div>
			</div>
			<Footnote t={t} at={s + 0.6} out={out + 0.5}>
				Credit is subject to the lending partner&apos;s assessment, approval and terms.
			</Footnote>
		</AbsoluteFill>
	);
};

// ─── Scene 6 — more than financing ───────────────────────────────────────────
const NODES = [
	{label: 'Tenant', icon: 'user', x: 330, y: 360},
	{label: 'Landlord', icon: 'key', x: 860, y: 360},
	{label: 'Property manager', icon: 'building', x: 595, y: 820},
];
const HUB = {x: 595, y: 540};

const Feature: React.FC<{t: number; at: number; out: number; y: number; icon: string; title: string; children: React.ReactNode}> = ({t, at, out, y, icon, title, children}) => (
	<Card t={t} at={at} out={out} style={{left: 1180, top: y, width: 620}} pad={30} from={40}>
		<div style={{display: 'flex', alignItems: 'center', gap: 20}}>
			<IconTile name={icon} size={60} />
			<div style={{flex: 1}}>
				<div style={{fontFamily: inter, fontWeight: 600, fontSize: 30, color: C.navy, letterSpacing: '-0.02em'}}>{title}</div>
				<div style={{marginTop: 10}}>{children}</div>
			</div>
		</div>
	</Card>
);

export const S6: React.FC<SceneProps> = ({t, T}) => {
	const brand = useBrand();
	const s = T(136) - 0.3;
	const end = T(157);
	const dive = prog(t, end - 1.0, 0.75, Easing.bezier(0.7, 0, 0.84, 0)); // into the tenant → Arjun
	const out = end - 1.0;
	const tiltX = 14 - prog(t, s, end - s, Easing.linear) * 6;
	const toggle = prog(t, T(143), 0.4);
	return (
		<AbsoluteFill style={{opacity: prog(t, s, 0.5) * (1 - prog(t, end - 0.55, 0.3, Easing.linear)), transform: `scale(${mix(1, 5, dive)})`, transformOrigin: `${NODES[0].x}px ${NODES[0].y + 40}px`}}>
			<div style={{position: 'absolute', left: 120, top: 100, ...H, fontSize: 60, opacity: 1 - prog(t, out, 0.4)}}>
				<Words t={t} text="And it doesn't stop there." at={T(136)} times={[T(136), T(137), T(138), T(139), T(140)]} />
			</div>
			{/* ecosystem diagram on a gently tilted plane */}
			<div style={{position: 'absolute', inset: 0, perspective: 1800}}>
				<div style={{position: 'absolute', inset: 0, transform: `rotateX(${tiltX}deg)`, transformOrigin: '595px 600px', opacity: 1 - dive}}>
					<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
						{NODES.map((n, i) => {
							const p = prog(t, T(136) + 0.4 + i * 0.25, 0.9, IN_OUT);
							return <line key={i} x1={HUB.x} y1={HUB.y} x2={mix(HUB.x, n.x, p)} y2={mix(HUB.y, n.y, p)} stroke={C.line} strokeWidth={3} strokeLinecap="round" />;
						})}
						{NODES.map((n, i) => {
							if (t < T(136) + 1.3) return null;
							return [0, 0.5].map((o) => {
								const f = ((t * 0.55 + o + i * 0.2) % 1);
								const inward = i === 0;
								const k = inward ? 1 - f : f;
								return <circle key={`${i}-${o}`} cx={mix(HUB.x, n.x, k)} cy={mix(HUB.y, n.y, k)} r={7} fill={i === 2 ? C.orange : C.indigo} opacity={Math.sin(Math.PI * f)} />;
							});
						})}
					</svg>
					{/* hub */}
					{(() => {
						const p = prog(t, T(136) + 0.1, 0.8, SPRINGY);
						return (
							<div style={{position: 'absolute', left: HUB.x - 110, top: HUB.y - 110, width: 220, height: 220, borderRadius: 60, background: C.white, boxShadow: SHADOW, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`}}>
								<Mark size={96} />
								<div style={{fontFamily: inter, fontWeight: 600, fontSize: 24, color: C.navy, marginTop: 12}}>{brand.name}</div>
							</div>
						);
					})()}
					{NODES.map((n, i) => {
						const p = prog(t, T(136) + 0.9 + i * 0.25, 0.7, SPRINGY);
						return (
							<div key={n.label} style={{position: 'absolute', left: n.x, top: n.y, transform: `translate(-50%, -50%) scale(${p})`, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px 14px 14px', background: C.white, borderRadius: 999, boxShadow: SHADOW_SM, whiteSpace: 'nowrap'}}>
								<div style={{width: 52, height: 52, borderRadius: 26, background: i === 0 ? C.indigo : C.indigoSoft, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Icon name={n.icon} size={26} color={i === 0 ? '#fff' : C.indigo} />
								</div>
								<span style={{fontFamily: inter, fontWeight: 600, fontSize: 24, color: C.navy}}>{n.label}</span>
							</div>
						);
					})}
				</div>
			</div>
			{/* product labels, one by one */}
			<Feature t={t} at={T(141) - 0.15} out={out} y={290} icon="repeat" title="Recurring rent payments">
				<div style={{display: 'flex', alignItems: 'center', gap: 14, ...BODY, fontSize: 21}}>
					<div style={{width: 52, height: 30, borderRadius: 15, background: toggle > 0.5 ? C.green : C.line, position: 'relative'}}>
						<div style={{position: 'absolute', top: 3, left: mix(3, 25, toggle), width: 24, height: 24, borderRadius: 12, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)'}} />
					</div>
					Auto-pay on the 1st of every month
				</div>
			</Feature>
			<Feature t={t} at={T(145) - 0.15} out={out} y={510} icon="receipt" title="Digital payment records">
				<div style={{display: 'flex', gap: 10}}>
					{['Jul', 'Aug', 'Sep'].map((m, k) => {
						const p = prog(t, T(147) + k * 0.2, 0.5, SPRINGY);
						return (
							<span key={m} style={{transform: `scale(${p})`, display: 'inline-block'}}>
								<Pill bg={C.soft} color={C.slate} style={{fontSize: 17, padding: '5px 12px'}}>
									<Icon name="check" size={16} color={C.green} sw={2.6} /> {m} rent
								</Pill>
							</span>
						);
					})}
				</div>
			</Feature>
			<Feature t={t} at={T(150) - 0.15} out={out} y={730} icon="shield" title="Rent protection options">
				<div style={{...BODY, fontSize: 21}}>For landlords, through insurance partners</div>
			</Feature>
			<Footnote t={t} at={T(152)} out={out + 0.4}>
				Protection is subject to the insurer&apos;s policy terms, eligibility and exclusions.
			</Footnote>
		</AbsoluteFill>
	);
};

// ─── Scene 7 — the resolution ────────────────────────────────────────────────
export const S7: React.FC<SceneProps> = ({t, T}) => {
	const s = T(157) - 0.3;
	const end = T(177);
	const walk = prog(t, s + 0.2, 2.4, Easing.bezier(0.33, 0, 0.3, 1));
	const walking = t < s + 2.4 ? 1 - prog(t, s + 2.0, 0.4) : 0;
	const tDrop = s + 2.6; // puts the suitcase down
	const drop = prog(t, tDrop, 0.5);
	const open = prog(t, T(173) - 0.2, 1.6, IN_OUT); // curtains open, sunlight fills the room
	const out = prog(t, end - 0.55, 0.55, IN_OUT);
	const ax = mix(-340, 300, walk);
	return (
		<AbsoluteFill style={{opacity: prog(t, s, 0.6) * (1 - out), transform: `scale(${mix(1.06, 1, prog(t, s, 3))})`}}>
			{/* warm light */}
			<AbsoluteFill style={{background: `radial-gradient(900px 700px at 1000px 380px, rgba(255,190,120,${0.28 * open}), transparent 70%)`}} />
			{/* window with curtains */}
			<div style={{position: 'absolute', left: 760, top: 200, width: 500, height: 560, borderRadius: 18, overflow: 'hidden', background: '#DDE5F0', boxShadow: 'inset 0 0 0 10px #fff'}}>
				<div style={{position: 'absolute', inset: 10, borderRadius: 10, background: GRADIENT, opacity: mix(0.25, 0.85, open)}} />
				<div style={{position: 'absolute', left: 245, top: 0, bottom: 0, width: 10, background: '#fff'}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 275, height: 10, background: '#fff'}} />
				<div style={{position: 'absolute', top: 0, bottom: 0, left: 0, width: 250 * (1 - open * 0.78), background: 'linear-gradient(90deg, #C9C3FF, #DCD8FF)', borderRight: '2px solid #B9B2FF'}} />
				<div style={{position: 'absolute', top: 0, bottom: 0, right: 0, width: 250 * (1 - open * 0.78), background: 'linear-gradient(270deg, #C9C3FF, #DCD8FF)', borderLeft: '2px solid #B9B2FF'}} />
			</div>
			{/* sunbeam on the floor */}
			<div style={{position: 'absolute', left: 640, top: 760, width: 780, height: 224, background: 'linear-gradient(180deg, rgba(255,190,120,0.35), rgba(255,190,120,0))', clipPath: 'polygon(18% 0, 82% 0, 100% 100%, 0 100%)', opacity: open}} />
			{/* plant */}
			<div style={{position: 'absolute', left: 1300, top: 780}}>
				<div style={{position: 'absolute', left: 30, top: 120, width: 80, height: 84, borderRadius: '8px 8px 18px 18px', background: '#F2733C'}} />
				<div style={{position: 'absolute', left: 0, top: 0, width: 140, height: 140, borderRadius: '50%', background: C.green, opacity: 0.85, transform: `rotate(${Math.sin(t * 0.8) * 2}deg)`}} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 984, height: 2, background: C.line}} />
			{/* the suitcase, set down */}
			{drop > 0 ? (
				<svg width={90} height={200} style={{position: 'absolute', left: ax + 0.78 * 210 - 45, top: 984 - 0.78 * 200 + mix(-6, 0, drop), overflow: 'visible'}} viewBox="-45 -40 90 200">
					<defs>
						<linearGradient id="case2" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0" stopColor="#FFB46A" />
							<stop offset="1" stopColor="#F2733C" />
						</linearGradient>
					</defs>
					<g transform="scale(0.78)">
						<rect x="-6" y="-38" width="12" height="44" rx="4" fill="#2B2B3A" />
						<rect x="-34" y="0" width="68" height="150" rx="16" fill="url(#case2)" />
						<circle cx="-22" cy="160" r="9" fill="#2B2B3A" />
						<circle cx="22" cy="160" r="9" fill="#2B2B3A" />
					</g>
				</svg>
			) : null}
			<Arjun t={t} walk={walking} suitcase={drop > 0 ? 0 : 1} look={mix(0, 0.6, open)} scale={0.78} style={{left: ax - (drop > 0 ? 40 * drop : 0), top: 984 - 560 * 0.78}} />
			{/* headline */}
			<div style={{position: 'absolute', left: 120, top: 100, ...H, fontSize: 56}}>
				<div>
					<Words t={t} text="Less financial friction." at={T(158)} />
				</div>
				<div style={{color: C.slate}}>
					<Words t={t} text="More room to move forward." at={T(166)} grad={['forward']} />
				</div>
			</div>
			{/* overview on his phone */}
			<Card t={t} at={T(167) - 0.2} style={{left: 1400, top: 300, width: 400}} pad={28}>
				<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
					<Mark size={30} />
					<span style={{fontFamily: inter, fontWeight: 600, fontSize: 20, color: C.navy}}>Overview</span>
				</div>
				<div style={{marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: prog(t, T(168), 0.5)}}>
					<div>
						<div style={{fontFamily: inter, fontSize: 17, color: C.muted}}>July rent</div>
						<div style={{...NUM, fontFamily: inter, fontWeight: 600, fontSize: 30, color: C.navy}}>₹25,000</div>
					</div>
					<span style={{transform: `scale(${prog(t, T(169), 0.5, SPRINGY)})`}}>
						<Pill>
							<Icon name="check" size={18} color={C.green} sw={2.6} /> Paid
						</Pill>
					</span>
				</div>
				<div style={{height: 1, background: C.line, margin: '20px 0'}} />
				<div style={{opacity: prog(t, T(170), 0.5)}}>
					<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: inter, fontSize: 18}}>
						<span style={{color: C.slate}}>Deposit financing</span>
						<span style={{color: C.green, fontWeight: 600}}>On track</span>
					</div>
					<div style={{display: 'flex', gap: 5, marginTop: 12}}>
						{Array.from({length: 10}, (_, k) => (
							<div key={k} style={{flex: 1, height: 10, borderRadius: 5, background: k < 3 * prog(t, T(171), 0.9) + 0.01 ? C.indigo : C.indigoSoft}} />
						))}
					</div>
				</div>
			</Card>
		</AbsoluteFill>
	);
};

// ─── Scene 8 — brand ending ──────────────────────────────────────────────────
export const S8: React.FC<SceneProps & {url?: string; cta?: string}> = ({t, T, url, cta}) => {
	const s = T(177) - 0.45;
	const line = prog(t, T(178), 1.2, IN_OUT);
	const sheen = ((t - T(178)) * 0.45) % 1;
	return (
		<AbsoluteFill style={{opacity: prog(t, s, 0.6), background: C.bg}}>
			<Aurora t={t} o={0.45 * prog(t, s, 1.5)} y={930} h={220} angle={-6} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${mix(1.04, 1, prog(t, s, 4, Easing.linear))})`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 34, marginTop: -60}}>
					<Mark size={128} draw={prog(t, s, 1.0, Easing.bezier(0.45, 0, 0.2, 1))} fill={prog(t, s + 0.8, 0.5)} />
					<Wordmark t={t} at={s + 0.3} size={128} />
				</div>
				<div style={{position: 'relative', width: 560, height: 4, marginTop: 40, borderRadius: 2, overflow: 'hidden'}}>
					<div style={{position: 'absolute', left: `${(1 - line) * 50}%`, right: `${(1 - line) * 50}%`, top: 0, bottom: 0, background: GRADIENT}} />
					{line >= 1 ? <div style={{position: 'absolute', top: 0, bottom: 0, width: 120, left: `${sheen * 140 - 20}%`, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)'}} /> : null}
				</div>
				<div style={{...H, fontSize: 48, marginTop: 40, fontWeight: 400}}>
					<Words t={t} text="Move forward with confidence." at={T(178) + 0.1} />
				</div>
				<div style={{...BODY, fontSize: 28, marginTop: 18, color: C.muted, opacity: prog(t, T(181), 0.8)}}>Making the financial side of renting simpler.</div>
				{url ? <div style={{position: 'absolute', bottom: 70, fontFamily: inter, fontWeight: 500, fontSize: 26, color: C.slate, opacity: prog(t, T(184), 0.8)}}>{url}</div> : null}
				{cta ? (
					<div style={{position: 'relative', overflow: 'hidden', marginTop: 46, padding: '24px 52px', borderRadius: 999, background: C.indigo, color: '#fff', fontFamily: inter, fontWeight: 600, fontSize: 34, boxShadow: '0 24px 50px -12px rgba(99,91,255,0.55)', display: 'flex', alignItems: 'center', gap: 16, transform: `scale(${prog(t, T(184) + 0.5, 0.7, SPRINGY)})`}}>
						{cta}
						<Icon name="arrow" size={30} color="#fff" sw={2.4} />
						<div style={{position: 'absolute', top: 0, bottom: 0, width: '30%', left: `${((t - T(184) - 1.3) * 0.5 % 1) * 160 - 40}%`, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)'}} />
					</div>
				) : null}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
