// Master script Scene 04 — Velora Hub. Guardrails: role-based views only (no one sees everyone's records);
// show only basic, existing capabilities (overview, tenancy details, records, receipts, updates).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Arjun} from './Arjun';
import {Browser, type ChapterProps, Headline, Lockup, PRODUCTS, TitleCard} from './filmkit';
import {C, Eyebrow, Footnote, Icon, IconTile, IN_OUT, inter, life, mix, NUM, Pill, prog, SHADOW_SM, SPRINGY, Words, H} from './kit';
import {Manager, Sharma} from './People';

const HUB = PRODUCTS.hub;
const ROLES = ['Tenant', 'Landlord', 'Property manager'] as const;

const Side: React.FC<{items: string[]; active: number}> = ({items, active}) => (
	<div style={{width: 250, padding: '26px 16px', borderRight: `1px solid ${C.line}`, height: '100%', boxSizing: 'border-box', fontFamily: inter}}>
		{items.map((l, i) => (
			<div key={l} style={{padding: '13px 16px', borderRadius: 10, marginBottom: 4, fontSize: 19, fontWeight: i === active ? 600 : 500, color: i === active ? HUB.accent : C.slate, background: i === active ? HUB.soft : 'transparent'}}>
				{l}
			</div>
		))}
	</div>
);

const Tabs: React.FC<{active: number; t: number; at: number}> = ({active, t, at}) => (
	<div style={{display: 'flex', gap: 8, padding: '18px 26px 0', borderBottom: `1px solid ${C.line}`, fontFamily: inter, opacity: prog(t, at, 0.5)}}>
		{ROLES.map((r, i) => (
			<div key={r} style={{padding: '12px 20px', fontSize: 19, fontWeight: 600, color: i === active ? C.navy : C.muted, borderBottom: `3px solid ${i === active ? HUB.accent : 'transparent'}`}}>
				{r}
			</div>
		))}
	</div>
);

const Tile: React.FC<{t: number; at: number; label: string; value: React.ReactNode; sub?: string; hl?: number; style?: React.CSSProperties}> = ({t, at, label, value, sub, hl = 0, style}) => {
	const p = prog(t, at, 0.6);
	return (
		<div style={{padding: 22, borderRadius: 14, border: `1.5px solid ${hl > 0.5 ? HUB.accent : C.line}`, background: hl > 0.5 ? HUB.soft : C.white, opacity: p, transform: `translateY(${(1 - p) * 16}px)`, fontFamily: inter, ...style}}>
			<div style={{fontSize: 16, color: C.muted}}>{label}</div>
			<div style={{fontWeight: 600, fontSize: 26, color: C.navy, marginTop: 6, ...NUM}}>{value}</div>
			{sub ? <div style={{fontSize: 16, color: C.slate, marginTop: 4}}>{sub}</div> : null}
		</div>
	);
};

const PaidRow: React.FC<{m: string; t: number; at: number}> = ({m, t, at}) => (
	<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.line}`, fontFamily: inter, fontSize: 19, opacity: prog(t, at, 0.5)}}>
		<span style={{color: C.navy}}>{m} rent</span>
		<span style={{display: 'flex', gap: 14, alignItems: 'center'}}>
			<span style={{...NUM, color: C.slate}}>₹25,000</span>
			<Pill style={{fontSize: 14, padding: '3px 10px'}}>Paid</Pill>
		</span>
	</div>
);

const Who: React.FC<{icon: string; name: string; role: string}> = ({icon, name, role}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: inter}}>
		<div style={{width: 44, height: 44, borderRadius: 22, background: HUB.soft, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Icon name={icon} size={24} color={HUB.accent} />
		</div>
		<div>
			<div style={{fontWeight: 600, fontSize: 19, color: C.navy}}>{name}</div>
			<div style={{fontSize: 15, color: C.muted}}>{role}</div>
		</div>
	</div>
);

const TenantView: React.FC<{t: number; c: ChapterProps['c']}> = ({t, c}) => {
	const at = [c.W('hubc', 'view'), c.W('hubc', 'review'), c.W('hubc', 'access'), c.W('hubc', 'stay')];
	const active = at.filter((a) => t >= a - 0.2).length - 1;
	return (
		<div style={{display: 'flex', height: '100%'}}>
			<Side items={['Overview', 'Tenancy details', 'Payments', 'Receipts', 'Updates']} active={[0, 1, 2, 4][Math.max(0, active)]} />
			<div style={{flex: 1, padding: 30}}>
				<Who icon="user" name="Arjun" role="Tenant · Flat 4B, Indiranagar" />
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginTop: 24}}>
					<Tile t={t} at={at[0]} label="Monthly rent" value="₹25,000" sub="Due on the 5th" hl={active === 0 ? 1 : 0} />
					<Tile t={t} at={at[1]} label="Tenancy" value="11 months" sub="Since July" hl={active === 1 ? 1 : 0} />
					<Tile t={t} at={at[1] + 0.2} label="Landlord" value="Mr. Sharma" sub="Contact via Velora" hl={active === 1 ? 1 : 0} />
				</div>
				<div style={{display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, marginTop: 18}}>
					<div style={{padding: '16px 22px', borderRadius: 14, border: `1.5px solid ${active === 2 ? HUB.accent : C.line}`, opacity: prog(t, at[2], 0.5)}}>
						<Eyebrow style={{fontSize: 14}}>Payment records</Eyebrow>
						{['October', 'September', 'August'].map((m, i) => (
							<PaidRow key={m} m={m} t={t} at={at[2] + 0.15 * i} />
						))}
					</div>
					<div style={{padding: '18px 22px', borderRadius: 14, border: `1.5px solid ${active === 3 ? HUB.accent : C.line}`, background: active === 3 ? HUB.soft : C.white, opacity: prog(t, at[3], 0.5), fontFamily: inter}}>
						<Eyebrow style={{fontSize: 14}}>Tenancy update</Eyebrow>
						<div style={{fontWeight: 600, fontSize: 21, color: C.navy, marginTop: 10}}>Agreement renewal</div>
						<div style={{fontSize: 17, color: C.slate, marginTop: 6, lineHeight: 1.4}}>Your rental agreement is up for renewal in June.</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const LandlordView: React.FC<{t: number; c: ChapterProps['c']}> = ({t, c}) => {
	const at = [c.W('hubd', 'landlords'), c.W('hubd', 'review'), c.W('hubd', 'access'), c.W('hubd', 'maintain')];
	const sel = prog(t, at[1] - 0.2, 0.4);
	return (
		<div style={{display: 'flex', height: '100%'}}>
			<div style={{width: 380, padding: 24, borderRight: `1px solid ${C.line}`, boxSizing: 'border-box'}}>
				<Who icon="key" name="Mr. Sharma" role="Landlord · 2 properties" />
				{[
					['Flat 4B · Indiranagar', 'Tenant: Arjun'],
					['Flat 2A · Koramangala', 'Tenant: Meera'],
				].map(([n, s], i) => (
					<div key={n} style={{marginTop: 18, padding: 18, borderRadius: 12, border: `1.5px solid ${i === 0 && sel > 0.5 ? HUB.accent : C.line}`, background: i === 0 && sel > 0.5 ? HUB.soft : C.white, fontFamily: inter, opacity: prog(t, at[0] + 0.2 + i * 0.2, 0.5)}}>
						<div style={{fontWeight: 600, fontSize: 19, color: C.navy}}>{n}</div>
						<div style={{fontSize: 15, color: C.slate, marginTop: 4}}>{s}</div>
					</div>
				))}
			</div>
			<div style={{flex: 1, padding: 30, opacity: sel}}>
				<div style={{fontFamily: inter, fontWeight: 600, fontSize: 28, color: C.navy}}>Flat 4B · Indiranagar</div>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginTop: 20}}>
					<Tile t={t} at={at[1]} label="Tenant" value="Arjun" sub="Since July" />
					<Tile t={t} at={at[1] + 0.15} label="Monthly rent" value="₹25,000" sub="Due on the 5th" />
					<Tile t={t} at={at[1] + 0.3} label="Agreement" value="11 months" sub="Renewal in June" />
				</div>
				<div style={{padding: '16px 22px', borderRadius: 14, border: `1.5px solid ${C.line}`, marginTop: 18, opacity: prog(t, at[2], 0.5)}}>
					<Eyebrow style={{fontSize: 14}}>Rent received</Eyebrow>
					{['October', 'September', 'August'].map((m, i) => (
						<PaidRow key={m} m={m} t={t} at={at[2] + 0.15 * i} />
					))}
				</div>
			</div>
		</div>
	);
};

const PROPS = ['Indiranagar · 4B', 'Koramangala · 2A', 'HSR Layout · 7C', 'Whitefield · 12B', 'Jayanagar · 3D', 'Hebbal · 5F'];
const ManagerView: React.FC<{t: number; c: ChapterProps['c']}> = ({t, c}) => {
	const at0 = c.P('hube') + 0.3;
	const pick = c.W('hube', 'whether');
	const sel = prog(t, pick, 0.5);
	return (
		<div style={{padding: 30, height: '100%', boxSizing: 'border-box'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
				<Who icon="building" name="Property manager" role="6 properties" />
				<Pill bg={HUB.soft} color={HUB.accent} style={{fontSize: 16}}>
					Multi-property view
				</Pill>
			</div>
			<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 22, opacity: 1 - sel * 0.5}}>
				{PROPS.map((n, i) => {
					const p = prog(t, at0 + i * 0.12, 0.6, SPRINGY);
					return (
						<div key={n} style={{padding: 18, borderRadius: 12, border: `1.5px solid ${i === 2 && sel > 0.5 ? HUB.accent : C.line}`, transform: `scale(${p})`, fontFamily: inter}}>
							<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
								<Icon name="building" size={22} color={HUB.accent} />
								<span style={{fontWeight: 600, fontSize: 18, color: C.navy}}>{n}</span>
							</div>
							<div style={{fontSize: 15, color: C.slate, marginTop: 8}}>{i === 5 ? 'Agreement in renewal' : 'Tenancy active'}</div>
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', right: 30, bottom: 30, width: 520, padding: 22, borderRadius: 14, background: C.white, boxShadow: SHADOW_SM, opacity: sel, transform: `translateY(${(1 - sel) * 30}px)`, fontFamily: inter}}>
				<div style={{fontWeight: 600, fontSize: 21, color: C.navy}}>HSR Layout · 7C</div>
				{[
					['Tenancy', 'Active · since March'],
					['Rent records', 'Up to date'],
					['Updates', '1 new'],
				].map(([l, v], i) => (
					<div key={l} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? `1px solid ${C.line}` : undefined, fontSize: 17, opacity: prog(t, pick + 0.4 + i * 0.2, 0.4)}}>
						<span style={{color: C.slate}}>{l}</span>
						<span style={{color: C.navy, fontWeight: 600}}>{v}</span>
					</div>
				))}
			</div>
		</div>
	);
};

const CLUTTER = [
	['chat', 'Chat · rent screenshot'],
	['receipt', 'Rent_2025.xlsx'],
	['receipt', 'Agreement.pdf'],
	['wallet', 'Payment screenshot'],
	['calendar', 'Notes · due dates'],
	['chat', 'Messages'],
	['receipt', 'Receipts folder'],
];

export const Hub: React.FC<ChapterProps> = ({t, c}) => {
	const s = c.P('huba');
	const end = c.P('protecta');
	const tB = c.P('hubb');
	const tC = c.P('hubc');
	const tD = c.P('hubd');
	const tE = c.P('hube');
	const tF = c.P('hubf');
	const merge = prog(t, tB - 0.4, 1.1, IN_OUT);
	const enter = prog(t, s - 1.3, 1.0);
	const tBut = c.W('huba', 'but');
	const view = t < tD - 0.2 ? 0 : t < tE - 0.2 ? 1 : 2;
	const dash = life(t, tB + 0.4, tF + 0.2, 0.9, 0.6);
	const trio = life(t, tF - 0.2, end - 0.4, 0.9, 0.5);
	return (
		<AbsoluteFill style={{opacity: enter * (1 - prog(t, end - 0.6, 0.5))}}>
			<AbsoluteFill style={{background: C.bg}} />
			{/* Part A: three people, disconnected records */}
			{merge < 1 ? (
				<AbsoluteFill style={{opacity: 1 - merge}}>
					<Headline t={t} at={tBut} text="One rental journey." sub="Too many disconnected records." subAt={tBut + 0.5} />
					{ROLES.map((r, i) => {
						const at = c.W('huba', ['tenants', 'landlords', 'property'][i]) - 0.2;
						const p = prog(t, at, 0.8);
						const x = 120 + i * 580;
						const toC = mix(0, 960 - (x + 270), merge);
						return (
							<div key={r} style={{position: 'absolute', left: x, top: 330, width: 540, height: 650, borderRadius: 22, background: C.white, boxShadow: SHADOW_SM, opacity: p, transform: `translate(${toC}px, ${(1 - p) * 60}px) scale(${mix(1, 0.6, merge)})`, overflow: 'hidden'}}>
								<div style={{padding: '22px 26px', fontFamily: inter, fontWeight: 600, fontSize: 24, color: C.navy}}>{r}</div>
								{/* what each one juggles */}
								<div style={{padding: '0 26px'}}>
									{i === 0 ? (
										<>
											{['Where is the agreement?', 'Sent the rent screenshot?', 'Which month was this?'].map((m, k) => (
												<div key={m} style={{padding: '12px 16px', borderRadius: 14, background: C.soft, marginBottom: 10, fontFamily: inter, fontSize: 18, color: C.navy, opacity: prog(t, at + 0.4 + k * 0.3, 0.4)}}>
													{m}
												</div>
											))}
										</>
									) : i === 1 ? (
										<div style={{padding: 16, borderRadius: 12, border: `1px dashed ${C.line}`, fontFamily: inter, fontSize: 18, color: C.slate, lineHeight: 1.9, opacity: prog(t, at + 0.4, 0.5)}}>
											Jul – paid? <br /> Aug – screenshot <br /> Sep – check bank
										</div>
									) : (
										<div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: `1px solid ${C.line}`, opacity: prog(t, at + 0.4, 0.5)}}>
											{Array.from({length: 20}, (_, k) => (
												<div key={k} style={{height: 30, borderRight: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, background: k < 4 ? C.soft : (k * 7) % 5 === 0 ? '#FFF4D6' : C.white}} />
											))}
										</div>
									)}
								</div>
								<div style={{position: 'absolute', left: 140, top: 330}}>
									{i === 0 ? <Arjun t={t} suitcase={0} mood={0.5} scale={0.62} /> : i === 1 ? <Sharma t={t} mood={0.5} scale={0.62} /> : <Manager t={t} mood={0.3} scale={0.62} />}
								</div>
							</div>
						);
					})}
					{/* scattered records */}
					{CLUTTER.map(([ic, l], i) => {
						const p = prog(t, tBut + 0.6 + i * 0.18, 0.7, SPRINGY);
						const x = [300, 820, 1380, 560, 1100, 1560, 180][i];
						const y = [520, 440, 560, 760, 700, 820, 860][i];
						return (
							<div key={i} style={{position: 'absolute', left: x, top: y, transform: `scale(${p * (1 - merge)}) rotate(${(i % 2 ? 6 : -5)}deg)`}}>
								<Pill bg={C.white} color={C.navy} style={{boxShadow: SHADOW_SM, fontSize: 19, padding: '10px 16px'}}>
									<Icon name={ic} size={20} color={C.orange} /> {l}
								</Pill>
							</div>
						);
					})}
				</AbsoluteFill>
			) : null}
			{/* Parts B–E: one Velora Hub with role-based views */}
			{dash > 0 ? (
				<AbsoluteFill style={{opacity: dash}}>
					<Lockup t={t} at={tB} product="hub" size={50} style={{position: 'absolute', left: 120, top: 70}} />
					<div style={{position: 'absolute', left: 820, top: 76, fontFamily: inter, fontSize: 24, color: C.slate, opacity: life(t, c.W('hubb', 'connected'), tC, 0.6, 0.4)}}>
						Tenants, landlords and property managers — closer together.
					</div>
					<div style={{position: 'absolute', left: 1180, top: 76, opacity: life(t, tC, tF, 0.6, 0.4)}}>
						<Pill bg={C.white} color={C.slate} style={{boxShadow: SHADOW_SM, fontSize: 18}}>
							<Icon name="shield" size={20} color={HUB.accent} /> Each role sees only its own information
						</Pill>
					</div>
					<Browser w={1680} h={860} url="Velora Hub" style={{left: 120, top: 170, transform: `scale(${mix(0.85, 1, prog(t, tB + 0.3, 1.0, IN_OUT))})`}}>
						<Tabs active={view} t={t} at={tB + 0.6} />
						<div style={{position: 'absolute', top: 70, left: 0, right: 0, bottom: 0}}>
							{(
								[
									[tB + 0.6, tD - 0.2, <TenantView key="t" t={t} c={c} />],
									[tD - 0.2, tE - 0.2, <LandlordView key="l" t={t} c={c} />],
									[tE - 0.2, tF + 0.5, <ManagerView key="m" t={t} c={c} />],
								] as const
							).map(([a, b, node], i) => {
								const o = life(t, a, b, 0.5, 0.35);
								return o > 0 ? (
									<div key={i} style={{position: 'absolute', inset: 0, opacity: o, transform: `translateX(${(1 - prog(t, a, 0.6)) * 50}px)`}}>
										{node}
									</div>
								) : null;
							})}
						</div>
					</Browser>
				</AbsoluteFill>
			) : null}
			{/* Part F: three role-based views, one connected experience */}
			{trio > 0 ? (
				<AbsoluteFill style={{opacity: trio}}>
					<div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', ...H, fontSize: 60}}>
						<Words t={t} text="Different people." at={c.W('hubf', 'different')} />{' '}
						<Words t={t} text="Different responsibilities." at={c.W('hubf', 'different', 1)} />
					</div>
					<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
						{[0, 1].map((i) => {
							const p = prog(t, c.W('hubf', 'one') - 0.2 + i * 0.2, 0.8, IN_OUT);
							const x1 = 120 + 520 + i * 600;
							return <line key={i} x1={x1} y1={600} x2={x1 + 80 * p} y2={600} stroke={HUB.accent} strokeWidth={4} strokeLinecap="round" strokeDasharray="2 12" />;
						})}
					</svg>
					{ROLES.map((r, i) => {
						const p = prog(t, tF + i * 0.2, 0.8);
						return (
							<div key={r} style={{position: 'absolute', left: 120 + i * 600, top: 330, width: 520, height: 520, borderRadius: 20, background: C.white, boxShadow: SHADOW_SM, opacity: p, transform: `translateY(${(1 - p) * 50}px)`, padding: 28, boxSizing: 'border-box', fontFamily: inter}}>
								<Who icon={['user', 'key', 'building'][i]} name={['Arjun', 'Mr. Sharma', 'Property manager'][i]} role={r} />
								{(
									[
										['Rent due 5th · ₹25,000', 'Receipts · 4', 'Renewal in June'],
										['Flat 4B · rent received', 'Flat 2A · rent received', 'Tenancy details'],
										['6 properties', 'Tenancy records', '1 update'],
									] as const
								)[i].map((l, k) => (
									<div key={l} style={{padding: '14px 16px', borderRadius: 12, background: C.soft, marginTop: k ? 10 : 26, fontSize: 19, color: C.navy, opacity: prog(t, tF + 0.4 + i * 0.2 + k * 0.12, 0.4)}}>
										{l}
									</div>
								))}
								<div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 22, fontSize: 15, color: C.muted, opacity: prog(t, c.W('hubf', 'right'), 0.5)}}>
									<Icon name="shield" size={18} color={HUB.accent} /> {r} view
								</div>
							</div>
						);
					})}
				</AbsoluteFill>
			) : null}
			<Footnote t={t} at={tC} out={tF}>
				Illustrative interface. Access to information is role-based.
			</Footnote>
			<TitleCard t={t} at={c.E('hubf') - 0.6} out={end - 0.5} product="hub" />
		</AbsoluteFill>
	);
};

