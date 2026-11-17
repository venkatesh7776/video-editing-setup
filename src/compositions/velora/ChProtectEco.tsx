// Master script Scenes 05 (Velora Protect), 06 (the complete ecosystem) and 07 (final brand message).
// Protect guardrails: insurance provided/underwritten by the authorised insurer; coverage depends on issuance,
// eligibility, exclusions and conditions; no guaranteed recovery, no automatic claim approval.
import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {Arjun} from './Arjun';
import {Spinner} from './ChOpenFlex';
import {AppBar, Btn, type ChapterProps, Desk, Headline, Illustrative, Lockup, PRODUCTS, type ProductKey, Screens, StepList, Tap, TitleCard} from './filmkit';
import {Aurora, BODY, C, Card, Eyebrow, Footnote, GRADIENT, H, Icon, IconTile, IN_OUT, inter, life, Mark, mix, NUM, Phone, Pill, prog, Row, SHADOW, SHADOW_SM, SPRINGY, Wordmark, Words} from './kit';
import {Manager, Sharma} from './People';

const PRO = PRODUCTS.protect;

const Shield: React.FC<{size: number; draw: number; fill: number}> = ({size, draw, fill}) => (
	<svg width={size} height={size} viewBox="0 0 120 120" style={{overflow: 'visible'}}>
		<defs>
			<linearGradient id="shieldg" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor="#3FD19A" />
				<stop offset="1" stopColor="#1EA672" />
			</linearGradient>
		</defs>
		<path d="M60 8 L102 24 V56 C102 84 84 102 60 112 C36 102 18 84 18 56 V24 Z" fill="url(#shieldg)" opacity={fill} />
		<path d="M60 8 L102 24 V56 C102 84 84 102 60 112 C36 102 18 84 18 56 V24 Z" fill="none" stroke={PRO.accent} strokeWidth="4" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
		<path d="M42 60 L55 73 L80 46" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog(fill, 0.4, 0.6)} />
	</svg>
);

const OptionsScreen: React.FC<{t: number; at: number}> = ({t, at}) => (
	<>
		<AppBar product="protect" title="Protection options" />
		<div style={{padding: '14px 26px', fontFamily: inter}}>
			{[
				['Rent default cover', 'Partner insurer A'],
				['Rent protection plan', 'Partner insurer B'],
			].map(([n, by], i) => (
				<div key={n} style={{padding: 18, borderRadius: 14, border: `1.5px solid ${i === 0 ? PRO.accent : C.line}`, marginTop: 14, opacity: prog(t, at + 0.2 + i * 0.2, 0.5)}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
						<IconTile name="shield" size={40} bg={PRO.soft} color={PRO.accent} />
						<div>
							<div style={{fontWeight: 600, fontSize: 19, color: C.navy}}>{n}</div>
							<div style={{fontSize: 15, color: C.muted}}>{by} · authorised insurer</div>
						</div>
					</div>
					<div style={{fontSize: 16, color: PRO.accent, fontWeight: 600, marginTop: 12}}>View coverage →</div>
				</div>
			))}
			<Illustrative style={{display: 'block', marginTop: 16}} />
		</div>
	</>
);

const CoverageScreen: React.FC<{t: number; at: number}> = ({t, at}) => (
	<>
		<AppBar product="protect" title="Coverage details" />
		<div style={{padding: '8px 26px', fontFamily: inter}}>
			{['Coverage', 'Eligibility', 'Exclusions', 'Limits', 'Policy conditions'].map((l, i) => (
				<div key={l} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: `1px solid ${C.line}`, fontSize: 19, color: C.navy, opacity: prog(t, at + 0.2 + i * 0.2, 0.5)}}>
					{l}
					<Icon name="arrow" size={20} color={C.muted} />
				</div>
			))}
			<Btn label="Proceed with partner" color={PRO.accent} style={{marginTop: 24}} />
		</div>
	</>
);

const UnderwritingScreen: React.FC<{t: number; at: number}> = ({t, at}) => (
	<>
		<AppBar product="protect" title="Application" />
		<div style={{padding: '24px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: inter}}>
			<Spinner t={t} color={PRO.accent} size={96} />
			<div style={{fontWeight: 600, fontSize: 21, color: C.navy, marginTop: 24}}>Underwriting by the insurer</div>
			<div style={{fontSize: 16, color: C.slate, marginTop: 8, textAlign: 'center', lineHeight: 1.45}}>The authorised insurer reviews eligibility under its requirements.</div>
			<div style={{marginTop: 26, width: '100%', padding: 16, borderRadius: 14, background: C.soft, display: 'flex', gap: 12, alignItems: 'center', opacity: prog(t, at + 0.8, 0.5)}}>
				<IconTile name="shield" size={40} bg={PRO.soft} color={PRO.accent} />
				<span style={{fontSize: 17, color: C.navy}}>Partner insurer A</span>
			</div>
		</div>
	</>
);

const PolicyScreen: React.FC<{t: number; at: number}> = ({t, at}) => (
	<>
		<AppBar product="protect" title="Policy documents" />
		<div style={{padding: '14px 26px', fontFamily: inter}}>
			<div style={{transform: `scale(${prog(t, at + 0.2, 0.5, SPRINGY)})`, transformOrigin: 'left center'}}>
				<Pill bg={PRO.soft} color={PRO.accent}>
					<Icon name="check" size={18} color={PRO.accent} sw={2.6} /> Policy issued by insurer
				</Pill>
			</div>
			{['Policy schedule.pdf', 'Coverage summary.pdf', 'Claims guide.pdf'].map((f, i) => (
				<div key={f} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '15px 0', borderBottom: `1px solid ${C.line}`, fontSize: 18, color: C.navy, opacity: prog(t, at + 0.5 + i * 0.2, 0.5)}}>
					<Icon name="receipt" size={24} color={PRO.accent} /> {f}
				</div>
			))}
			<Illustrative style={{display: 'block', marginTop: 16}} />
		</div>
	</>
);

export const Protect: React.FC<ChapterProps> = ({t, c}) => {
	const s = c.P('protecta');
	const end = c.P('eco');
	const tB = c.P('protectb');
	const tC = c.P('protectc');
	const tD = c.P('protectd');
	const tE = c.P('protecte');
	const enter = prog(t, s - 1.3, 1.0);
	const aOut = prog(t, tB - 0.5, 0.8, IN_OUT);
	const st = [c.W('protectc', 'exploring'), c.W('protectc', 'review'), c.W('protectc', 'proceed'), c.W('protectc', 'if')];
	const shieldDraw = prog(t, tB - 0.1, 1.2, Easing.bezier(0.45, 0, 0.2, 1));
	const shieldFill = prog(t, tB + 0.9, 0.6);
	const shieldUp = prog(t, tB + 1.6, 1.0, IN_OUT);
	const mood = prog(t, c.W('protecta', 'uncertain'), 1.2);
	const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const sections: [string, string][] = [
		['Coverage', 'every'],
		['Coverage limits', 'limits'],
		['Eligibility', 'eligibility'],
		['Exclusions', 'exclusions'],
		['Policy duration', 'conditions'],
		['Claims process', 'claims'],
	];
	const claim = ['Potential covered event', 'Notify the insurer', 'Submit documents', 'Insurer assesses the claim', 'Decision under policy terms'];
	const claimAt = [c.W('protectd', 'covered'), c.W('protectd', 'follow'), c.W('protectd', 'claims') + 0.4, c.W('protectd', 'evaluates'), c.W('protectd', 'policy', 1)];
	return (
		<AbsoluteFill style={{opacity: enter * (1 - prog(t, end - 0.6, 0.5))}}>
			<AbsoluteFill style={{background: C.bg}} />
			{/* Part A: the landlord's concern */}
			<AbsoluteFill style={{opacity: 1 - aOut}}>
				<Headline t={t} at={s + 0.2} text="Rental income matters." sub="Protection matters too." subAt={c.W('protecta', 'landlords') + 0.4} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 984, height: 2, background: C.line}} />
				<Sharma t={t} mood={mood} look={-0.2} scale={0.86} style={{left: 400, top: 984 - 560 * 0.86 + 40}} />
				<Desk left={110} top={760} w={620} laptopX={150} screen={<div style={{padding: 16, fontFamily: inter, fontSize: 14, color: C.slate}}>Property expenses</div>} />
				<Card t={t} at={c.W('protecta', 'loan') - 0.3} style={{left: 820, top: 270, width: 440}} pad={26}>
					<Eyebrow>Monthly commitments</Eyebrow>
					{(
						[
							['Home loan EMI', 'loan', '₹18,000'],
							['Maintenance', 'maintenance', '₹2,500'],
							['Society charges', 'maintenance', '₹3,000'],
							['Other obligations', 'obligations', '₹2,000'],
						] as const
					).map(([l, w, v], i) => (
						<div key={l} style={{opacity: prog(t, c.W('protecta', w) + i * 0.12, 0.5)}}>
							<Row label={l} value={v} size={20} style={{padding: '12px 0'}} />
						</div>
					))}
					<Illustrative style={{display: 'block', marginTop: 10}} />
				</Card>
				<Card t={t} at={c.W('protecta', 'uncertain') - 0.4} style={{left: 1300, top: 270, width: 500}} pad={26}>
					<Eyebrow>Rental income · Flat 4B</Eyebrow>
					<div style={{display: 'flex', alignItems: 'flex-end', gap: 16, height: 220, marginTop: 20}}>
						{months.map((m, i) => {
							const risky = i === 4;
							const p = prog(t, c.W('protecta', 'uncertain') + i * 0.1, 0.6);
							const flag = prog(t, c.W('protecta', 'delayed') - 0.1, 0.6);
							return (
								<div key={m} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
									<div style={{width: '100%', height: 170 * p, borderRadius: 8, background: risky && flag > 0.5 ? 'transparent' : C.green, border: risky && flag > 0.5 ? `2px dashed ${C.orange}` : undefined, opacity: risky ? mix(1, 0.9, flag) : 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
										{risky && flag > 0.5 ? <span style={{fontFamily: inter, fontWeight: 700, fontSize: 30, color: C.orange}}>?</span> : null}
									</div>
									<span style={{fontFamily: inter, fontSize: 16, color: C.muted}}>{m}</span>
								</div>
							);
						})}
					</div>
					<div style={{marginTop: 14, opacity: prog(t, c.W('protecta', 'delayed'), 0.5)}}>
						<Pill bg={C.peach} color={C.orange} style={{fontSize: 17}}>
							<Icon name="clock" size={18} color={C.orange} sw={2.2} /> Delayed or unpaid rent
						</Pill>
					</div>
				</Card>
			</AbsoluteFill>
			{/* Parts B–E: Velora Protect */}
			{(() => {
				const o = life(t, tB - 0.2, end - 0.5, 0.6, 0.5);
				if (o <= 0) return null;
				const ph = prog(t, tB + 2.0, 1.1);
				const steps = life(t, tC - 0.4, tD, 0.7, 0.4);
				const policy = life(t, tD - 0.2, tE + 0.4, 0.7, 0.4);
				const outcome = prog(t, tE - 0.2, 0.9, IN_OUT);
				return (
					<AbsoluteFill style={{opacity: o}}>
						<div style={{position: 'absolute', left: mix(960 - 90, 120, shieldUp), top: mix(330, 92, shieldUp), transform: `scale(${mix(1, 0.42, shieldUp)})`, transformOrigin: 'left top', opacity: 1 - outcome}}>
							<Shield size={180} draw={shieldDraw} fill={shieldFill} />
						</div>
						<Lockup t={t} at={tB + 0.6} product="protect" size={mix(72, 50, shieldUp)} style={{position: 'absolute', left: mix(960 - 300, 210, shieldUp), top: mix(560, 104, shieldUp), opacity: 1 - outcome}} />
						{/* B: what it is */}
						<div style={{position: 'absolute', left: 120, top: 320, width: 900, opacity: life(t, c.W('protectb', 'way'), tC - 0.2, 0.6, 0.4)}}>
							<div style={{...H, fontSize: 62}}>
								<Words t={t} text="Insurance-backed rent protection options." at={c.W('protectb', 'explore')} grad={['protection']} />
							</div>
							<div style={{marginTop: 34, transform: `scale(${prog(t, c.W('protectb', 'authoris*'), 0.6, SPRINGY)})`, transformOrigin: 'left center'}}>
								<Pill bg={C.white} color={C.navy} style={{boxShadow: SHADOW_SM, fontSize: 22, padding: '12px 20px'}}>
									<Icon name="shield" size={24} color={PRO.accent} /> Through authorised insurance partners
								</Pill>
							</div>
							<div style={{...BODY, fontSize: 28, marginTop: 30, lineHeight: 1.45, opacity: prog(t, c.W('protectb', 'understand'), 0.7)}}>Understand available coverage and make informed decisions.</div>
						</div>
						{/* C: how it works */}
						{steps > 0 ? <StepList t={t} at={st} steps={['Explore protection options', 'Review coverage', 'Apply via the authorised partner', 'Policy and documentation']} subs={['See the options available.', 'Eligibility, exclusions, limits, conditions.', 'The insurer underwrites and assesses.', 'If issued, details and documents follow.']} accent={PRO.accent} show={steps} style={{left: 160, top: 280}} /> : null}
						{/* D: understanding protection — policy overview + claims flow */}
						{policy > 0 ? (
							<div style={{opacity: policy}}>
								<div style={{position: 'absolute', left: 120, top: 250, width: 1040, ...H, fontSize: 50}}>
									<Words t={t} text="Know what is actually covered." at={tD + 0.2} grad={['covered']} />
								</div>
								<div style={{position: 'absolute', left: 120, top: 350, display: 'grid', gridTemplateColumns: 'repeat(3, 330px)', gap: 18}}>
									{sections.map(([l, w], i) => {
										const at = c.W('protectd', w) - 0.1;
										const on = life(t, at, at + 1.6, 0.3, 0.4);
										const p = prog(t, tD + 0.4 + i * 0.12, 0.6);
										return (
											<div key={l} style={{padding: '20px 22px', borderRadius: 14, background: C.white, boxShadow: on > 0.5 ? `0 0 0 3px ${PRO.accent}, ${SHADOW_SM}` : SHADOW_SM, opacity: p, transform: `translateY(${(1 - p) * 20}px) scale(${1 + on * 0.03})`, display: 'flex', alignItems: 'center', gap: 14, fontFamily: inter}}>
												<IconTile name={['shield', 'wallet', 'user', 'receipt', 'clock', 'repeat'][i]} size={44} bg={PRO.soft} color={PRO.accent} />
												<span style={{fontWeight: 600, fontSize: 21, color: C.navy}}>{l}</span>
											</div>
										);
									})}
								</div>
								{/* claims process */}
								<div style={{position: 'absolute', left: 120, top: 640, width: 1680}}>
									<Eyebrow style={{opacity: prog(t, claimAt[0] - 0.3, 0.5)}}>Claims process</Eyebrow>
									<div style={{display: 'flex', alignItems: 'center', marginTop: 20}}>
										{claim.map((l, i) => {
											const p = prog(t, claimAt[i] - 0.1, 0.6, SPRINGY);
											return (
												<React.Fragment key={l}>
													<div style={{width: 290, padding: '20px 18px', borderRadius: 14, background: i === 4 ? PRO.soft : C.white, boxShadow: SHADOW_SM, transform: `scale(${p})`, fontFamily: inter, fontWeight: 600, fontSize: 20, color: C.navy, textAlign: 'center', lineHeight: 1.3}}>{l}</div>
													{i < 4 ? (
														<div style={{width: 50, display: 'flex', justifyContent: 'center', opacity: prog(t, claimAt[i + 1] - 0.3, 0.4)}}>
															<Icon name="arrow" size={30} color={C.muted} />
														</div>
													) : null}
												</React.Fragment>
											);
										})}
									</div>
								</div>
							</div>
						) : null}
						{/* the phone (B–C) */}
						{(() => {
							const show = life(t, tB + 2.0, tD + 0.1, 0.9, 0.5);
							if (show <= 0) return null;
							return (
								<div style={{position: 'absolute', left: 1240, top: 110, transform: `translateY(${(1 - ph) * 700}px)`, opacity: show}}>
									<Phone w={420} style={{position: 'relative'}}>
										<Screens
											t={t}
											list={[
												[tB + 2.1, st[1], <OptionsScreen key="o" t={t} at={tB + 2.2} />],
												[st[1], st[2], <CoverageScreen key="c" t={t} at={st[1]} />],
												[st[2], st[3], <UnderwritingScreen key="u" t={t} at={st[2]} />],
												[st[3], tD + 0.4, <PolicyScreen key="p" t={t} at={st[3]} />],
											]}
										/>
										<Tap t={t} at={st[1] - 0.3} x={210} y={300} color={PRO.accent} />
										<Tap t={t} at={st[2] - 0.3} x={210} y={612} color={PRO.accent} />
									</Phone>
								</div>
							);
						})()}
						{/* E: back to the landlord's dashboard, now with protection documents */}
						{outcome > 0 ? (
							<div style={{opacity: outcome}}>
								<div style={{position: 'absolute', left: 0, right: 0, top: 984, height: 2, background: C.line}} />
								<Sharma t={t} look={0.2} scale={0.86} style={{left: 300, top: 984 - 560 * 0.86 + 40}} />
								<Card t={t} at={tE} style={{left: 900, top: 250, width: 820}} pad={32}>
									<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
										<IconTile name="key" size={52} />
										<div>
											<div style={{fontFamily: inter, fontWeight: 600, fontSize: 26, color: C.navy}}>Flat 4B · Indiranagar</div>
											<div style={{fontFamily: inter, fontSize: 17, color: C.muted}}>Landlord dashboard</div>
										</div>
									</div>
									<Row label="Tenant" value="Arjun" />
									<Row label="Rent records" value="Up to date" />
									<Row label={<span style={{display: 'inline-flex', alignItems: 'center', gap: 10}}><Icon name="shield" size={22} color={PRO.accent} /> Protection documents</span>} value={<span style={{color: PRO.accent}}>3 files</span>} style={{borderBottom: 'none'}} />
								</Card>
							</div>
						) : null}
						<Footnote t={t} at={tB + 1} out={end - 0.6}>
							Insurance provided and underwritten by the authorised insurer. Coverage is subject to policy issuance, eligibility, exclusions and conditions.
						</Footnote>
					</AbsoluteFill>
				);
			})()}
			<TitleCard t={t} at={c.W('protecte', 'because') + 0.2} out={end - 0.5} product="protect" />
		</AbsoluteFill>
	);
};

// ─── Scene 06 — the complete ecosystem ───────────────────────────────────────
const PANELS: {k: ProductKey; x: number; y: number; need: string; withAt: [string, number]}[] = [
	{k: 'flex', x: 160, y: 250, need: 'flexibility', withAt: ['flex', 0]},
	{k: 'pay', x: 1240, y: 250, need: 'simpler', withAt: ['pay', 0]},
	{k: 'hub', x: 160, y: 640, need: 'access', withAt: ['hub', 0]},
	{k: 'protect', x: 1240, y: 640, need: 'protection', withAt: ['protect', 0]},
];
const MiniArt: React.FC<{k: ProductKey; t: number}> = ({k, t}) => {
	const a = PRODUCTS[k].accent;
	if (k === 'flex')
		return (
			<div style={{display: 'flex', gap: 8, alignItems: 'flex-end', height: 60}}>
				{[1, 0.66, 0.33].map((h, i) => (
					<div key={i} style={{width: 46, height: 60 * h, borderRadius: 8, background: i === 0 ? a : PRODUCTS.flex.soft}} />
				))}
			</div>
		);
	if (k === 'pay')
		return (
			<div style={{display: 'flex', gap: 8}}>
				{['Sep', 'Oct', 'Nov'].map((m) => (
					<div key={m} style={{width: 58, padding: '6px 0', borderRadius: 10, border: `1.5px solid ${C.line}`, textAlign: 'center', fontFamily: inter}}>
						<div style={{fontSize: 12, color: C.muted}}>{m}</div>
						<div style={{fontWeight: 600, fontSize: 19, color: a}}>5</div>
					</div>
				))}
			</div>
		);
	if (k === 'hub')
		return (
			<div style={{display: 'flex', gap: 8}}>
				{['user', 'key', 'building'].map((ic) => (
					<div key={ic} style={{width: 54, height: 54, borderRadius: 27, background: PRODUCTS.hub.soft, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name={ic} size={26} color={a} />
					</div>
				))}
			</div>
		);
	return <Shield size={64} draw={1} fill={1} />;
};

export const Eco: React.FC<ChapterProps> = ({t, c}) => {
	const s = c.P('eco');
	const end = c.P('final');
	const enter = prog(t, s - 1.3, 1.0);
	const tTogether = c.W('eco', 'together');
	const link = prog(t, tTogether - 0.3, 1.2, IN_OUT);
	const hub = {x: 960, y: 560};
	return (
		<AbsoluteFill style={{opacity: enter * (1 - prog(t, end - 0.7, 0.6))}}>
			<AbsoluteFill style={{background: C.bg}} />
			<Aurora t={t} o={0.35 * link} y={980} h={200} angle={-4} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', ...H, fontSize: 58}}>
				{t < tTogether - 0.2 ? <Words t={t} text="Every rental journey is different." at={s} out={tTogether - 0.6} /> : <Words t={t} text="One ecosystem. Four core products." at={tTogether} grad={['four']} />}
			</div>
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
				{PANELS.map((p, i) => {
					const px = p.x + 260;
					const py = p.y + 110;
					return <line key={p.k} x1={hub.x} y1={hub.y} x2={mix(hub.x, px, prog(link, i * 0.1, 0.7))} y2={mix(hub.y, py, prog(link, i * 0.1, 0.7))} stroke={PRODUCTS[p.k].accent} strokeWidth={3} strokeDasharray="3 10" strokeLinecap="round" opacity={0.8} />;
				})}
				{link >= 1
					? PANELS.map((p, i) =>
							[0, 0.5].map((o) => {
								const f = (t * 0.45 + o + i * 0.17) % 1;
								return <circle key={`${p.k}${o}`} cx={mix(hub.x, p.x + 260, f)} cy={mix(hub.y, p.y + 110, f)} r={6} fill={PRODUCTS[p.k].accent} opacity={Math.sin(Math.PI * f)} />;
							}),
						)
					: null}
			</svg>
			{/* centre: Velora */}
			{(() => {
				const p = prog(t, tTogether - 0.4, 0.9, SPRINGY);
				return (
					<div style={{position: 'absolute', left: hub.x - 120, top: hub.y - 120, width: 240, height: 240, borderRadius: 64, background: C.white, boxShadow: SHADOW, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`}}>
						<Mark size={110} />
						<div style={{fontFamily: inter, fontWeight: 600, fontSize: 28, color: C.navy, marginTop: 12}}>Velora</div>
					</div>
				);
			})()}
			{PANELS.map((p) => {
				const pr = PRODUCTS[p.k];
				const at = c.W('eco', p.need) - 0.3;
				const hl = life(t, c.W('eco', ...p.withAt) - 0.2, c.W('eco', ...p.withAt) + 2.6, 0.3, 0.5);
				const a = prog(t, at, 0.8, SPRINGY);
				return (
					<div key={p.k} style={{position: 'absolute', left: p.x, top: p.y, width: 520, height: 220, borderRadius: 20, background: C.white, boxShadow: hl > 0.3 ? `0 0 0 3px ${pr.accent}, ${SHADOW}` : SHADOW_SM, padding: 26, boxSizing: 'border-box', transform: `scale(${a * (1 + hl * 0.04)})`, opacity: Math.min(1, a * 1.5)}}>
						<Lockup t={t} at={at} product={p.k} size={34} />
						<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20}}>
							<div style={{fontFamily: inter, fontSize: 19, color: C.slate, width: 250, lineHeight: 1.35}}>{pr.line}</div>
							<MiniArt k={p.k} t={t} />
						</div>
					</div>
				);
			})}
			{/* the people it serves */}
			<div style={{position: 'absolute', left: 780, top: 830, display: 'flex', gap: 30, opacity: prog(t, tTogether + 0.6, 0.8)}}>
				<Arjun t={t} suitcase={0} scale={0.3} style={{position: 'relative'}} />
				<Sharma t={t} scale={0.3} style={{position: 'relative'}} />
				<Manager t={t} scale={0.3} style={{position: 'relative'}} />
			</div>
			<Footnote t={t} at={c.W('eco', 'flex', 1) - 0.5} out={end - 0.6}>
				Financing via regulated lending partners; protection via authorised insurers; all subject to their terms.
			</Footnote>
		</AbsoluteFill>
	);
};

// ─── Scene 07 — final brand message ──────────────────────────────────────────
export const Final: React.FC<ChapterProps & {duration: number}> = ({t, c}) => {
	const s = c.P('final');
	const tFrom = c.W('final', 'from');
	const tBuilding = c.W('final', 'velora');
	const tEnd = c.W('final', 'velora', 1);
	const enter = prog(t, s - 1.2, 1.0);
	const net = prog(t, tFrom - 0.2, 1.6, IN_OUT);
	const toLogo = prog(t, tBuilding - 0.6, 1.2, IN_OUT);
	const BUILD = [
		[200, 330, 120], [360, 250, 100], [500, 380, 140], [700, 210, 110], [860, 300, 130], [1040, 240, 120], [1200, 340, 150], [1400, 200, 110], [1560, 290, 130], [1700, 360, 110],
	];
	const ground = 860;
	return (
		<AbsoluteFill style={{opacity: enter}}>
			<AbsoluteFill style={{background: C.bg}} />
			{/* the city of renters */}
			<AbsoluteFill style={{opacity: 1 - toLogo, transform: `scale(${mix(1.08, 1, prog(t, s, 6))})`}}>
				<div style={{position: 'absolute', left: 120, top: 96, ...H, fontSize: 54, width: 1300}}>
					<Words t={t} text="Renting is one of life's most important financial commitments." at={s + 0.1} grad={['important']} out={tFrom - 0.6} />
				</div>
				{BUILD.map(([x, h, w], i) => {
					const p = prog(t, s - 0.4 + i * 0.08, 0.9, SPRINGY);
					return (
						<div key={i} style={{position: 'absolute', left: x, top: ground - h * p, width: w, height: h * p, background: C.white, border: `2px solid ${C.line}`, borderBottom: 'none', borderRadius: '10px 10px 0 0', overflow: 'hidden'}}>
							{Array.from({length: Math.floor(h / 46)}, (_, r) => (
								<div key={r} style={{display: 'flex', justifyContent: 'space-around', marginTop: 16}}>
									{[0, 1].map((k) => (
										<div key={k} style={{width: w * 0.28, height: 18, borderRadius: 4, background: (r + k + i) % 3 === 0 ? 'linear-gradient(135deg, #FFB46A, #F47FB6)' : C.indigoSoft, opacity: 0.9}} />
									))}
								</div>
							))}
						</div>
					);
				})}
				<div style={{position: 'absolute', left: 0, right: 0, top: ground, height: 2, background: C.line}} />
				{/* glimpses of people */}
				<Arjun t={t} suitcase={0} walk={1} scale={0.3} style={{left: mix(240, 520, prog(t, s, 8, Easing.linear)), top: ground - 168}} />
				<Sharma t={t} scale={0.3} style={{left: 1120, top: ground - 168}} />
				<Manager t={t} walk={1} scale={0.3} style={{left: mix(1620, 1380, prog(t, s, 8, Easing.linear)), top: ground - 168}} />
				{/* the city becomes a connected network */}
				<svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: net}}>
					{BUILD.slice(0, -1).map(([x, h, w], i) => {
						const [x2, h2, w2] = BUILD[i + 1];
						const p = prog(net, i * 0.06, 0.5);
						const ax = x + w / 2;
						const ay = ground - h - 30;
						const bx = x2 + w2 / 2;
						const by = ground - h2 - 30;
						return (
							<g key={i}>
								<line x1={ax} y1={ay} x2={mix(ax, bx, p)} y2={mix(ay, by, p)} stroke={C.indigo} strokeWidth={2.5} opacity={0.6} />
								<circle cx={ax} cy={ay} r={8} fill={C.indigo} opacity={p} />
							</g>
						);
					})}
					{BUILD.map(([x, h, w], i) => (
						<line key={`v${i}`} x1={x + w / 2} y1={ground - h - 30} x2={960} y2={140} stroke={C.violet} strokeWidth={1.5} opacity={0.35 * prog(net, 0.5, 0.5)} strokeDasharray="3 9" />
					))}
				</svg>
				<div style={{position: 'absolute', left: 0, right: 0, top: 930, textAlign: 'center', ...BODY, fontSize: 30, opacity: life(t, tFrom, tBuilding - 0.4, 0.6, 0.4)}}>
					Flexibility · Monthly payments · Rental management · Protection options
				</div>
			</AbsoluteFill>
			{/* end card */}
			{toLogo > 0 ? (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: toLogo}}>
					<Aurora t={t} o={0.45} y={930} h={220} angle={-6} />
					<div style={{display: 'flex', alignItems: 'center', gap: 34, marginTop: -60, transform: `scale(${mix(0.9, 1, toLogo)})`}}>
						<Mark size={130} draw={prog(t, tBuilding - 0.5, 1.0, Easing.bezier(0.45, 0, 0.2, 1))} fill={prog(t, tBuilding + 0.4, 0.5)} />
						<Wordmark t={t} at={tBuilding - 0.2} size={130} />
					</div>
					<div style={{width: 560 * prog(t, tBuilding + 0.6, 1.0, IN_OUT), height: 4, borderRadius: 2, background: GRADIENT, marginTop: 40}} />
					<div style={{fontFamily: inter, fontWeight: 600, fontSize: 30, letterSpacing: '0.16em', color: C.navy, marginTop: 38, opacity: prog(t, tBuilding + 0.4, 0.8)}}>THE FINANCIAL LAYER OF RENTING.</div>
					<div style={{...H, fontWeight: 400, fontSize: 46, color: C.slate, marginTop: 22}}>
						<Words t={t} text="Move forward with confidence." at={tEnd + 0.3} grad={['confidence']} />
					</div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};

