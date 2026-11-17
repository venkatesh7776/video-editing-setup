// Master script Scene 01 (the story continues) and Scene 02 (Velora Flex).
import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {Arjun} from './Arjun';
import {AppBar, Btn, Calendar, type ChapterProps, Desk, Headline, Illustrative, Legend, Lockup, PRODUCTS, Screens, StepList, Tap, TitleCard, Toast} from './filmkit';
import {BODY, C, Card, Eyebrow, Footnote, GRADIENT, H, Icon, IconTile, IN_OUT, inter, life, Mark, mix, NUM, Phone, Pill, prog, Row, SHADOW, SHADOW_SM, SPRINGY, Wordmark, Words} from './kit';
import {Manager, Sharma} from './People';

// ─── window onto the city (reused by the finale) ─────────────────────────────
export const CityWindow: React.FC<{t: number; w: number; h: number; reflect?: React.ReactNode}> = ({t, w, h, reflect}) => (
	<div style={{position: 'relative', width: w, height: h, borderRadius: 18, overflow: 'hidden', boxShadow: 'inset 0 0 0 12px #fff', background: '#EAF0F8'}}>
		<div style={{position: 'absolute', inset: 12, borderRadius: 8, background: GRADIENT, opacity: 0.55, backgroundSize: '180% 180%', backgroundPosition: `${50 + Math.sin(t * 0.2) * 30}% 40%`}} />
		{/* skyline silhouettes */}
		<svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
			{[
				[0.05, 0.55, 0.1],
				[0.17, 0.42, 0.08],
				[0.27, 0.62, 0.12],
				[0.41, 0.36, 0.07],
				[0.5, 0.5, 0.11],
				[0.63, 0.3, 0.09],
				[0.74, 0.58, 0.1],
				[0.86, 0.45, 0.09],
			].map(([x, y, bw], i) => (
				<rect key={i} x={x * w} y={y * h} width={bw * w} height={h} fill="#fff" opacity={0.55} rx={4} />
			))}
		</svg>
		<div style={{position: 'absolute', left: w / 2 - 6, top: 0, bottom: 0, width: 12, background: '#fff'}} />
		{reflect ? <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{reflect}</div> : null}
	</div>
);

// ─── Scene 01 — the story continues ──────────────────────────────────────────
const TASKS: [string, string, string][] = [
	['managing', 'repeat', 'Managing rent every month'],
	['planning', 'wallet', 'Planning your finances'],
	['staying', 'chat', 'Staying connected with your landlord'],
	['keeping', 'receipt', 'Keeping track of rental information'],
];
const CLUTTER = ['chat', 'receipt', 'calendar', 'wallet', 'key', 'building', 'clock', 'chat', 'receipt', 'user', 'repeat', 'calendar', 'chat', 'wallet', 'receipt', 'clock', 'key', 'chat', 'receipt', 'calendar', 'building', 'wallet'];

export const Open: React.FC<ChapterProps> = ({t, c}) => {
	const s = c.P('s1');
	const a = s - 2.4; // core end card → reflection on Arjun's window
	const roomIn = prog(t, a + 0.9, 1.2, IN_OUT);
	const pull = prog(t, a + 0.6, 4.5, Easing.bezier(0.3, 0, 0.2, 1)); // camera pulls back from the window
	const tHundred = c.W('s1', 'hundred');
	const tTogether = c.W('s1', 'together');
	const tVelora = c.W('s1', 'velora');
	const end = c.P('flexa');
	const scatter = prog(t, tHundred - 0.3, 1.2, Easing.bezier(0.2, 0.7, 0.3, 1));
	const gather = prog(t, tTogether - 0.4, 1.0, IN_OUT);
	const toCal = prog(t, end - 2.0, 1.4, IN_OUT); // push towards the wall calendar
	const roomFade = 1 - prog(t, end - 0.8, 0.6);
	const cast = c.W('s1', 'people');
	return (
		<AbsoluteFill style={{opacity: roomIn * roomFade}}>
			<AbsoluteFill style={{background: C.bg}} />
			<AbsoluteFill style={{transform: `translate(${(960 - 1770) * toCal}px, ${(540 - 318) * toCal}px) scale(${mix(1.45, 1, pull) * mix(1, 2.6, toCal)})`, transformOrigin: `${mix(1270, 1770, toCal)}px ${mix(410, 318, toCal)}px`}}>
				{/* window with the logo's reflection */}
				<div style={{position: 'absolute', left: 980, top: 150}}>
					<CityWindow
						t={t}
						w={580}
						h={520}
						reflect={
							<div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: 0.26 * prog(t, a + 0.9, 1.0) * (1 - prog(t, c.W('s1', 'once'), 1.5)), transform: 'scale(0.62)'}}>
								<Mark size={110} />
								<Wordmark t={t} at={-10} size={110} color={C.navy} />
							</div>
						}
					/>
				</div>
				{/* wall calendar: time has passed */}
				<div style={{position: 'absolute', left: 1640, top: 200, transform: 'scale(0.5)', transformOrigin: 'left top', opacity: prog(t, a + 1.2, 1)}}>
					<Calendar month="August" t={t} at={a + 1.6} marks={{5: {color: PRODUCTS.flex.accent}}} markAt={end - 2.4} />
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 984, height: 2, background: C.line}} />
				<Desk left={920} top={790} w={700} keys screen={<LaptopCode t={t} />} />
				<Arjun t={t} suitcase={0} look={mix(0.5, 0, prog(t, c.W('s1', 'once'), 1))} scale={0.82} style={{left: 680, top: 984 - 560 * 0.82}} />
			</AbsoluteFill>
			<Headline t={t} at={s} out={c.W('s1', 'managing') - 0.4} text="Finding a home is just the beginning." sub="Once you move in, a new journey begins." subAt={c.W('s1', 'once')} />
			{/* the monthly to-do list */}
			{TASKS.map(([w, icon, label], i) => {
				const at = c.W('s1', w) - 0.15;
				const sx = Math.sin(i * 2.3) * 520;
				const sy = Math.cos(i * 1.7) * 300;
				return (
					<Card key={label} t={t} at={at} out={tTogether + 0.4} style={{left: 120, top: 270 + i * 112, width: 540, transform: `translate(${sx * scatter * (1 - gather) + (960 - 440 - 120) * gather}px, ${sy * scatter * (1 - gather) + (540 - 300 - i * 118) * gather}px) rotate(${scatter * (1 - gather) * (i % 2 ? 8 : -6)}deg) scale(${mix(1, 0.5, gather)})`}} pad={24}>
						<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
							<IconTile name={icon} size={52} />
							<span style={{fontFamily: inter, fontWeight: 600, fontSize: 24, color: C.navy}}>{label}</span>
						</div>
					</Card>
				);
			})}
			{/* the people involved */}
			<div style={{position: 'absolute', left: 120, top: 740, display: 'flex', flexWrap: 'wrap', width: 540, gap: 14, opacity: life(t, cast, tHundred, 0.6, 0.4)}}>
				{[
					['user', 'Tenant'],
					['key', 'Landlord'],
					['building', 'Property manager'],
				].map(([ic, l], i) => (
					<div key={l} style={{transform: `scale(${prog(t, cast + i * 0.15, 0.5, SPRINGY)})`}}>
						<Pill bg={C.white} color={C.navy} style={{boxShadow: SHADOW_SM, fontSize: 21, padding: '10px 18px'}}>
							<Icon name={ic} size={22} color={C.indigo} /> {l}
						</Pill>
					</div>
				))}
			</div>
			{/* a hundred separate things → one */}
			{scatter > 0
				? CLUTTER.map((ic, i) => {
						const ang = (i / CLUTTER.length) * Math.PI * 2 + i;
						const r = 280 + ((i * 97) % 380);
						const x = 960 + Math.cos(ang) * r * 1.5;
						const y = 540 + Math.sin(ang) * r * 0.8;
						const p = prog(t, tHundred - 0.3 + i * 0.03, 0.9, Easing.bezier(0.2, 0.7, 0.3, 1));
						const g = prog(t, tTogether - 0.4 + (i % 5) * 0.04, 0.9, IN_OUT);
						return (
							<div key={i} style={{position: 'absolute', left: mix(960, mix(x, 960, g), p) - 34, top: mix(540, mix(y, 540, g), p) - 34, width: 68, height: 68, borderRadius: 18, background: C.white, boxShadow: SHADOW_SM, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p * (1 - g), transform: `rotate(${(1 - g) * ((i % 3) - 1) * 12}deg)`}}>
								<Icon name={ic} size={30} color={i % 4 === 0 ? C.orange : C.slate} />
							</div>
						);
					})
				: null}
			{/* …that's where Velora comes in */}
			{(() => {
				const o = life(t, tTogether + 0.3, end - 2.0, 0.6, 0.5);
				if (o <= 0) return null;
				return (
					<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o, background: `rgba(246,249,252,${0.9 * o})`}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 30, transform: `scale(${mix(0.8, 1, prog(t, tTogether + 0.3, 0.9, SPRINGY))})`}}>
							<Mark size={120} />
							<Wordmark t={t} at={tVelora - 0.2} size={120} />
						</div>
						<div style={{...H, fontWeight: 400, fontSize: 44, color: C.slate, marginTop: 34}}>
							<Words t={t} text="The financial layer of renting." at={tVelora + 0.3} grad={['renting']} />
						</div>
					</AbsoluteFill>
				);
			})()}
		</AbsoluteFill>
	);
};

export const LaptopCode: React.FC<{t: number}> = ({t}) => (
	<div style={{position: 'absolute', inset: 14}}>
		{Array.from({length: 9}, (_, i) => (
			<div key={i} style={{height: 8, borderRadius: 4, marginBottom: 11, width: `${30 + ((i * 37 + Math.floor(t * 2) * 13) % 60)}%`, marginLeft: (i % 3) * 14, background: i % 4 === 0 ? '#C9C3FF' : '#E3E8EE'}} />
		))}
	</div>
);

// ─── Scene 02 — Velora Flex ──────────────────────────────────────────────────
const FLEX = PRODUCTS.flex;

const FlexOverview: React.FC<{t: number; at: number}> = ({t, at}) => (
	<>
		<AppBar product="flex" title="Rent financing" />
		<div style={{padding: '18px 26px', fontFamily: inter}}>
			<div style={{padding: 20, borderRadius: 16, background: FLEX.soft}}>
				<div style={{fontSize: 16, color: C.slate}}>Upcoming rent · due 5 Aug</div>
				<div style={{...NUM, fontWeight: 600, fontSize: 36, color: C.navy, marginTop: 4}}>₹25,000</div>
				<div style={{fontSize: 16, color: FLEX.accent, fontWeight: 600, marginTop: 6}}>Explore a financing option</div>
			</div>
			<Eyebrow style={{marginTop: 22, fontSize: 14}}>Basic eligibility</Eyebrow>
			{['Valid ID and KYC', 'Income details', "Lending partner's criteria"].map((l, i) => (
				<div key={l} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, fontSize: 19, color: C.navy, opacity: prog(t, at + 0.3 + i * 0.15, 0.5)}}>
					<Icon name="check" size={20} color={C.green} sw={2.4} /> {l}
				</div>
			))}
			<Btn label="Check options" color={FLEX.accent} style={{marginTop: 26}} />
			<Illustrative style={{display: 'block', marginTop: 14, textAlign: 'center'}} />
		</div>
	</>
);

const FlexApply: React.FC<{t: number; at: number}> = ({t, at}) => (
	<>
		<AppBar product="flex" title="Application" />
		<div style={{padding: '14px 26px', fontFamily: inter}}>
			{[
				['Amount', '₹25,000'],
				['Purpose', 'August rent'],
				['Employment', 'Salaried'],
				['Monthly income', '₹ ••,•••'],
			].map(([l, v], i) => {
				const p = prog(t, at + 0.2 + i * 0.35, 0.5);
				return (
					<div key={l} style={{marginTop: 12, opacity: p}}>
						<div style={{fontSize: 15, color: C.muted}}>{l}</div>
						<div style={{height: 50, borderRadius: 10, border: `1.5px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 19, color: C.navy, marginTop: 4, ...NUM}}>{v}</div>
					</div>
				);
			})}
			<div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, fontSize: 18, color: C.navy, opacity: prog(t, at + 1.8, 0.5)}}>
				<IconTile name="user" size={36} bg={C.greenSoft} color={C.green} /> Identity verified
			</div>
			<Btn label="Submit application" color={FLEX.accent} press={life(t, at + 2.5, at + 2.8, 0.08, 0.2)} style={{marginTop: 18}} />
		</div>
	</>
);

const FlexAssess: React.FC<{t: number; at: number}> = ({t, at}) => (
	<>
		<AppBar product="flex" title="Assessment" />
		<div style={{padding: '18px 26px', fontFamily: inter}}>
			{['Identity verification', 'Eligibility checks', 'Credit assessment'].map((l, i) => {
				const done = prog(t, at + 0.8 + i * 0.9, 0.3);
				return (
					<div key={l} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderBottom: `1px solid ${C.line}`, fontSize: 20, color: C.navy}}>
						{done >= 1 ? <IconTile name="check" size={36} bg={C.greenSoft} color={C.green} /> : <Spinner t={t} color={FLEX.accent} />}
						{l}
					</div>
				);
			})}
			<div style={{marginTop: 22, padding: 18, borderRadius: 14, background: C.soft, display: 'flex', gap: 14, alignItems: 'center'}}>
				<IconTile name="bank" size={48} />
				<div>
					<div style={{fontWeight: 600, fontSize: 19, color: C.navy}}>Regulated lending partner</div>
					<div style={{fontSize: 16, color: C.slate}}>Makes the credit decision</div>
				</div>
			</div>
		</div>
	</>
);

export const Spinner: React.FC<{t: number; color: string; size?: number}> = ({t, color, size = 36}) => (
	<svg width={size} height={size} viewBox="0 0 36 36" style={{transform: `rotate(${t * 360}deg)`, flexShrink: 0}}>
		<circle cx="18" cy="18" r="14" fill="none" stroke={C.line} strokeWidth="4" />
		<path d="M18 4 A14 14 0 0 1 32 18" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
	</svg>
);

const FlexDecision: React.FC<{t: number; at: number}> = ({t, at}) => (
	<>
		<AppBar product="flex" title="Application decision" />
		<div style={{padding: '14px 26px', fontFamily: inter}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 10, transform: `scale(${prog(t, at + 0.2, 0.5, SPRINGY)})`, transformOrigin: 'left center'}}>
				<Pill>
					<Icon name="check" size={18} color={C.green} sw={2.6} /> Approved by lending partner
				</Pill>
			</div>
			<div style={{fontSize: 16, color: C.slate, marginTop: 10, lineHeight: 1.4}}>Disbursed per the lender&apos;s process, after applicable conditions.</div>
			<Eyebrow style={{marginTop: 20, fontSize: 14}}>Repayment schedule</Eyebrow>
			{[
				['10 Aug', '₹8,600'],
				['10 Sep', '₹8,600'],
				['10 Oct', '₹8,600'],
			].map(([d, v], i) => (
				<div key={d} style={{opacity: prog(t, at + 1.0 + i * 0.25, 0.5)}}>
					<Row label={d} value={v} size={20} style={{padding: '13px 0'}} />
				</div>
			))}
			<div style={{fontSize: 15, color: C.muted, marginTop: 12}}>All costs shown before you accept.</div>
			<Illustrative style={{display: 'block', marginTop: 8}} />
		</div>
	</>
);

export const Flex: React.FC<ChapterProps> = ({t, c}) => {
	const s = c.P('flexa');
	const end = c.P('paya');
	const tImagine = c.W('flexa', 'imagine');
	const tIntro = c.P('flexb');
	const tSteps = c.P('flexc');
	const tOutcome = c.P('flexd');
	const st = [c.W('flexc', 'first'), c.W('flexc', 'next'), c.W('flexc', 'regulated'), c.W('flexc', 'if')];
	const deskOut = prog(t, tImagine - 0.4, 0.7, IN_OUT);
	const tl = life(t, tImagine - 0.1, tIntro + 1.4, 0.8, 0.6);
	const freeze = prog(t, tIntro - 0.2, 0.8);
	const mood = prog(t, c.W('flexa', 'money'), 1.2);
	const phoneX = mix(1180, 1240, prog(t, tSteps - 0.4, 0.8, IN_OUT));
	const outcome = prog(t, tOutcome - 0.3, 0.9, IN_OUT);
	const enter = prog(t, s - 1.2, 1.0);
	const days = 15;
	const X = (d: number) => 200 + ((d - 1) / (days - 1)) * 1520;
	return (
		<AbsoluteFill style={{opacity: enter * (1 - prog(t, end - 0.6, 0.5))}}>
			<AbsoluteFill style={{background: C.bg}} />
			{/* Part A: Arjun working; rent reminder; balance check */}
			<AbsoluteFill style={{opacity: 1 - deskOut, transform: `scale(${mix(1, 0.94, deskOut)})`}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 984, height: 2, background: C.line}} />
				<Arjun t={t} suitcase={0} mood={mood} look={-0.3} scale={0.86} style={{left: 590, top: 984 - 560 * 0.86 + 40}} />
				<Desk left={340} top={760} w={620} laptopX={160} keys screen={<LaptopCode t={t} />} />
				<Toast t={t} at={c.W('flexa', 'sometimes') + 0.2} icon="clock" title="Rent due in 3 days" body="₹25,000 · Flat 4B, Indiranagar" accent={FLEX.accent} style={{left: 1220, top: 120}} />
				{(() => {
					const p = prog(t, c.W('flexa', 'when') - 0.2, 1.0);
					return p > 0 ? (
						<Phone w={360} style={{left: 1300, top: 270, transform: `translateY(${(1 - p) * 600}px)`, opacity: Math.min(1, p * 2)}}>
							<div style={{padding: '70px 24px', fontFamily: inter}}>
								<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
									<IconTile name="bank" size={38} bg={C.soft} color={C.slate} />
									<span style={{fontWeight: 600, fontSize: 19, color: C.navy}}>My bank</span>
								</div>
								<div style={{fontSize: 16, color: C.muted, marginTop: 24}}>Available balance</div>
								<div style={{...NUM, fontWeight: 600, fontSize: 40, color: C.navy}}>₹9,850</div>
								<div style={{marginTop: 20, padding: 14, borderRadius: 12, background: C.greenSoft, fontSize: 16, color: C.green, fontWeight: 600}}>Salary expected · 10 Aug</div>
								<Illustrative style={{display: 'block', marginTop: 16}} />
							</div>
						</Phone>
					) : null;
				})()}
			</AbsoluteFill>
			<Headline t={t} at={tImagine} out={tIntro - 0.3} text="When rent comes before payday." grad={['payday']} />
			{/* the cash-flow timeline */}
			{tl > 0 ? (
				<AbsoluteFill style={{opacity: tl * mix(1, 0.25, freeze), transform: `scale(${mix(1, 0.95, freeze)})`, filter: freeze > 0.05 ? `grayscale(${freeze})` : undefined}}>
					<div style={{position: 'absolute', left: X(1), top: 600, width: (X(days) - X(1)) * prog(t, tImagine, 1.2, IN_OUT), height: 4, borderRadius: 2, background: C.line}} />
					{Array.from({length: days}, (_, i) => (
						<div key={i} style={{position: 'absolute', left: X(i + 1) - 30, top: 624, width: 60, textAlign: 'center', fontFamily: inter, fontSize: 22, color: C.muted, opacity: prog(t, tImagine + i * 0.05, 0.4), ...NUM}}>
							{i + 1}
						</div>
					))}
					{/* cash-flow gap */}
					{(() => {
						const p = prog(t, c.W('flexa', 'timing') - 0.1, 1.0, IN_OUT);
						const pulse = 0.5 + 0.5 * Math.sin(t * 4);
						return (
							<div style={{position: 'absolute', left: X(5), top: 470, width: (X(10) - X(5)) * p, height: 110, borderRadius: 14, background: `repeating-linear-gradient(135deg, rgba(242,115,60,${0.1 + 0.06 * pulse}) 0 14px, rgba(242,115,60,0.03) 14px 28px)`, border: p > 0 ? `2px dashed ${FLEX.accent}` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
								<span style={{fontFamily: inter, fontWeight: 600, fontSize: 26, color: FLEX.accent, opacity: prog(t, c.W('flexa', 'cash*') - 0.1, 0.5), whiteSpace: 'nowrap'}}>Cash-flow gap</span>
							</div>
						);
					})()}
					{(
						[
							[5, FLEX.accent, 'Rent due · 5th', c.W('flexa', 'rent', 1), 'home'],
							[10, C.green, 'Salary expected · 10th', c.W('flexa', 'salary'), 'wallet'],
						] as const
					).map(([d, col, label, at, ic]) => {
						const p = prog(t, at - 0.1, 0.7, SPRINGY);
						return (
							<div key={label} style={{position: 'absolute', left: X(d) - 30, top: 572, transform: `scale(${p})`}}>
								<div style={{width: 60, height: 60, borderRadius: 30, background: col, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 10px ${col}22`}}>
									<Icon name={ic} size={28} color="#fff" />
								</div>
								<div style={{position: 'absolute', top: 104, left: 30, transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
									<Pill bg={C.white} color={C.navy} style={{boxShadow: SHADOW_SM, fontSize: 22}}>
										{label}
									</Pill>
								</div>
							</div>
						);
					})}
					{/* ongoing expenses */}
					{[2, 3, 7, 8, 12, 14].map((d, i) => (
						<div key={d} style={{position: 'absolute', left: X(d) - 7, top: 595, width: 14, height: 14, borderRadius: 7, background: C.slate, opacity: prog(t, c.W('flexa', 'manage') + i * 0.08, 0.4)}} />
					))}
					<div style={{position: 'absolute', left: 200, top: 760, display: 'flex', gap: 34, opacity: prog(t, c.W('flexa', 'manage'), 0.6)}}>
						<Legend color={FLEX.accent} label="Rent due" />
						<Legend color={C.green} label="Salary" />
						<Legend color={C.slate} label="Other monthly expenses" />
					</div>
				</AbsoluteFill>
			) : null}
			{/* Part B: Velora Flex */}
			{(() => {
				const o = life(t, tIntro - 0.1, tOutcome + 0.2, 0.7, 0.6);
				if (o <= 0) return null;
				const intro = prog(t, tIntro, 1.0, IN_OUT);
				const toSteps = prog(t, tSteps - 0.5, 0.9, IN_OUT);
				return (
					<AbsoluteFill style={{opacity: o}}>
						<Lockup t={t} at={tIntro - 0.05} product="flex" size={72} style={{position: 'absolute', left: mix(660, 120, prog(t, tIntro + 1.4, 1.0, IN_OUT)), top: mix(470, 110, prog(t, tIntro + 1.4, 1.0, IN_OUT)), transform: `scale(${mix(1, 0.7, prog(t, tIntro + 1.4, 1.0, IN_OUT))})`, transformOrigin: 'left top'}} />
						<div style={{position: 'absolute', left: 120, top: 300, width: 860, opacity: 1 - toSteps}}>
							<div style={{...H, fontSize: 64}}>
								<Words t={t} text="Rent financing for eligible tenants." at={c.W('flexb', 'rent')} grad={['eligible', 'tenants']} />
							</div>
							<div style={{...BODY, fontSize: 30, marginTop: 26, lineHeight: 1.45, opacity: prog(t, c.W('flexb', 'temporary'), 0.8)}}>Help with temporary cash-flow gaps, without relying entirely on your immediate balance.</div>
							<div style={{marginTop: 34, transform: `scale(${prog(t, c.W('flexb', 'regulated'), 0.6, SPRINGY)})`, transformOrigin: 'left center'}}>
								<Pill bg={C.white} color={C.navy} style={{boxShadow: SHADOW_SM, fontSize: 22, padding: '12px 20px'}}>
									<Icon name="bank" size={24} color={FLEX.accent} /> Through regulated lending partners
								</Pill>
							</div>
						</div>
						<StepList
							t={t}
							at={st}
							steps={['Explore', 'Apply', 'Assessment', 'Decision']}
							subs={['Explore the available financing option.', 'Submit the required information.', 'The lending partner verifies and assesses.', "If approved, provided on the lender's terms."]}
							accent={FLEX.accent}
							show={toSteps}
							style={{left: 160, top: 300}}
						/>
						<div style={{position: 'absolute', left: phoneX, top: 110, transform: `translateY(${(1 - intro) * 700}px) rotate(${(1 - intro) * 5}deg)`}}>
							<Phone w={420} style={{position: 'relative'}}>
								<Screens
									t={t}
									list={[
										[tIntro + 0.4, st[1], <FlexOverview key="o" t={t} at={tIntro + 0.6} />],
										[st[1], st[2], <FlexApply key="a" t={t} at={st[1]} />],
										[st[2], st[3], <FlexAssess key="s" t={t} at={st[2]} />],
										[st[3], tOutcome + 0.5, <FlexDecision key="d" t={t} at={st[3]} />],
									]}
								/>
								<Tap t={t} at={st[1] - 0.3} x={210} y={600} color={FLEX.accent} />
								<Tap t={t} at={st[1] + 2.5} x={210} y={720} color={FLEX.accent} />
							</Phone>
						</div>
						<Footnote t={t} at={tIntro + 1} out={tOutcome + 0.3}>
							Financing through regulated lending partners. Approval subject to the lender&apos;s assessment and eligibility.
						</Footnote>
					</AbsoluteFill>
				);
			})()}
			{/* Part D: the outcome — calendar with rent + repayment dates; laptop closes */}
			{outcome > 0 ? (
				<AbsoluteFill style={{opacity: outcome}}>
					<div style={{position: 'absolute', left: 0, right: 0, top: 984, height: 2, background: C.line}} />
					<div style={{position: 'absolute', left: 180, top: 200, transform: `translateY(${(1 - outcome) * 60}px)`}}>
						<Calendar month="August" t={t} at={tOutcome} w={600} marks={{5: {color: FLEX.accent}, 10: {color: C.green}}} />
						<div style={{display: 'flex', gap: 28, marginTop: 24}}>
							<Legend color={FLEX.accent} label="Rent paid" />
							<Legend color={C.green} label="Salary · first repayment" />
						</div>
					</div>
					<Arjun t={t} suitcase={0} look={-0.2} scale={0.86} style={{left: 1290, top: 984 - 560 * 0.86 + 40}} />
					<Desk left={1010} top={760} w={640} laptopX={170} open={1 - prog(t, c.W('flexd', 'because') - 0.2, 0.8, IN_OUT)} screen={<LaptopCode t={t} />} />
				</AbsoluteFill>
			) : null}
			<TitleCard t={t} at={c.W('flexd', 'because') + 0.3} out={end - 0.7} product="flex" />
		</AbsoluteFill>
	);
};
