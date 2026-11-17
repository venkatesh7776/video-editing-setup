// Master script Scene 03 — Velora Pay. Guardrails: recurring payments need the tenant's authorisation and supported
// payment arrangements; reminders never pay by themselves; "confirmed" only after the provider confirms.
import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {Spinner} from './ChOpenFlex';
import {AppBar, Btn, type ChapterProps, Headline, Illustrative, Lockup, PRODUCTS, Screens, StepList, Tap, TitleCard, Toast} from './filmkit';
import {BODY, C, Card, Eyebrow, Footnote, H, Icon, IconTile, IN_OUT, inter, life, mix, NUM, Phone, Pill, prog, Row, SHADOW_SM, SPRINGY, Words} from './kit';

const PAY = PRODUCTS.pay;

const Msg: React.FC<{t: number; at: number; from: string; text: string; color?: string}> = ({t, at, from, text, color = C.soft}) => {
	const p = prog(t, at, 0.6, SPRINGY);
	if (p <= 0) return null;
	return (
		<div style={{padding: '14px 16px', borderRadius: 16, background: color, marginTop: 12, transform: `scale(${p})`, transformOrigin: 'left top', fontFamily: inter}}>
			<div style={{fontSize: 14, color: C.muted, fontWeight: 600}}>{from}</div>
			<div style={{fontSize: 18, color: C.navy, marginTop: 3, lineHeight: 1.35}}>{text}</div>
		</div>
	);
};

const PayHome: React.FC<{t: number; at: number; pick?: 'auto' | 'manual'; pickAt?: number}> = ({t, at, pick, pickAt = 0}) => {
	const sel = pick ? prog(t, pickAt, 0.3) : 0;
	return (
		<>
			<AppBar product="pay" title="Rent" />
			<div style={{padding: '14px 26px', fontFamily: inter}}>
				<div style={{padding: 20, borderRadius: 16, border: `1px solid ${C.line}`, opacity: prog(t, at, 0.5)}}>
					<div style={{fontSize: 16, color: C.muted}}>Flat 4B · Indiranagar</div>
					<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6}}>
						<span style={{...NUM, fontWeight: 600, fontSize: 34, color: C.navy}}>₹25,000</span>
						<span style={{fontSize: 16, color: C.slate}}>due 5 Sep</span>
					</div>
					<div style={{marginTop: 10}}>
						<Pill bg={PAY.soft} color={PAY.accent} style={{fontSize: 15, padding: '5px 12px'}}>
							Upcoming
						</Pill>
					</div>
				</div>
				<div style={{fontWeight: 600, fontSize: 19, color: C.navy, marginTop: 22, opacity: prog(t, at + 0.3, 0.5)}}>Choose how you want to pay</div>
				{(
					[
						['auto', 'repeat', 'Automatic recurring payments', 'Set up once'],
						['manual', 'clock', 'Manual payments', 'With reminders'],
					] as const
				).map(([k, ic, l, sub], i) => {
					const on = pick === k ? sel : 0;
					return (
						<div key={k} style={{display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, marginTop: 12, border: `2px solid ${on > 0.5 ? PAY.accent : C.line}`, background: on > 0.5 ? PAY.soft : C.white, opacity: prog(t, at + 0.45 + i * 0.15, 0.5)}}>
							<IconTile name={ic} size={44} />
							<div>
								<div style={{fontWeight: 600, fontSize: 18, color: C.navy}}>{l}</div>
								<div style={{fontSize: 15, color: C.slate}}>{sub}</div>
							</div>
						</div>
					);
				})}
			</div>
		</>
	);
};

const AutoSetup: React.FC<{t: number; at: number; authAt: number}> = ({t, at, authAt}) => (
	<>
		<AppBar product="pay" title="Automatic payments" />
		<div style={{padding: '10px 26px', fontFamily: inter}}>
			{[
				['Frequency', 'Monthly'],
				['Rent amount', '₹25,000'],
				['Due date', '5th of every month'],
				['Payment method', 'Supported mandate'],
			].map(([l, v], i) => (
				<div key={l} style={{opacity: prog(t, at + 0.2 + i * 0.25, 0.5)}}>
					<Row label={l} value={v} size={18} style={{padding: '14px 0'}} />
				</div>
			))}
			<div style={{fontSize: 15, color: C.muted, marginTop: 14, lineHeight: 1.4, opacity: prog(t, at + 1.4, 0.5)}}>You authorise a recurring payment instruction with your bank or provider.</div>
			<Btn label="Authorise mandate" color={PAY.accent} press={life(t, authAt, authAt + 0.3, 0.08, 0.2)} style={{marginTop: 18}} />
		</div>
	</>
);

const Authorised: React.FC<{t: number; at: number}> = ({t, at}) => {
	const done = t > at + 1.4;
	return (
		<>
			<AppBar product="pay" title={done ? 'Mandate authorised' : 'Authorising…'} />
			<div style={{padding: '30px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: inter}}>
				{done ? (
					<div style={{transform: `scale(${prog(t, at + 1.4, 0.6, SPRINGY)})`}}>
						<IconTile name="check" size={110} bg={C.greenSoft} color={C.green} />
					</div>
				) : (
					<Spinner t={t} color={PAY.accent} size={100} />
				)}
				<div style={{fontSize: 18, color: C.slate, marginTop: 26, textAlign: 'center', lineHeight: 1.45}}>{done ? 'Recurring instruction set for the 5th of every month.' : 'Confirming with your bank…'}</div>
				<div style={{display: 'flex', gap: 10, marginTop: 30, opacity: prog(t, at + 2.0, 0.6)}}>
					{['Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
						<div key={m} style={{width: 70, padding: '10px 0', borderRadius: 12, border: `1.5px solid ${C.line}`, textAlign: 'center'}}>
							<div style={{fontSize: 13, color: C.muted}}>{m}</div>
							<div style={{fontWeight: 600, fontSize: 22, color: PAY.accent}}>5</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
};

const Cycle: React.FC<{t: number; at: number; confirmAt: number; title?: string; via?: string}> = ({t, at, confirmAt, title = 'September rent', via = 'Recurring mandate'}) => {
	const ok = t >= confirmAt;
	return (
		<>
			<AppBar product="pay" title={title} />
			<div style={{padding: '14px 26px', fontFamily: inter}}>
				<div style={{padding: 22, borderRadius: 16, border: `1px solid ${C.line}`}}>
					<div style={{...NUM, fontWeight: 600, fontSize: 38, color: C.navy}}>₹25,000</div>
					<div style={{fontSize: 16, color: C.slate, marginTop: 4}}>{via}</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, padding: 14, borderRadius: 12, background: ok ? C.greenSoft : C.soft}}>
						{ok ? <Icon name="check" size={26} color={C.green} sw={2.6} /> : <Spinner t={t} color={PAY.accent} size={26} />}
						<span style={{fontWeight: 600, fontSize: 18, color: ok ? C.green : C.slate}}>{ok ? 'Payment confirmed' : 'Processing…'}</span>
					</div>
					<div style={{fontSize: 14, color: C.muted, marginTop: 10}}>{ok ? 'Confirmed by the payment provider' : 'Initiated on the 5th'}</div>
				</div>
				<Illustrative style={{display: 'block', marginTop: 14}} />
			</div>
		</>
	);
};

const ManualReview: React.FC<{t: number; at: number; payAt: number}> = ({t, at, payAt}) => (
	<>
		<AppBar product="pay" title="Review payment" />
		<div style={{padding: '10px 26px', fontFamily: inter}}>
			<Row label="To" value="Mr. Sharma" size={18} style={{padding: '14px 0'}} />
			<Row label="For" value="October rent" size={18} style={{padding: '14px 0'}} />
			<Row label="Amount" value="₹25,000" size={18} style={{padding: '14px 0'}} strong />
			<div style={{fontSize: 15, color: C.muted, marginTop: 18}}>Pay with</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, border: `2px solid ${PAY.accent}`, marginTop: 8, background: PAY.soft, opacity: prog(t, at + 0.8, 0.5)}}>
				<IconTile name="bank" size={36} />
				<span style={{fontSize: 17, color: C.navy, fontWeight: 600}}>Supported payment method</span>
			</div>
			<Btn label="Pay ₹25,000" color={PAY.accent} press={life(t, payAt, payAt + 0.3, 0.08, 0.2)} style={{marginTop: 20}} />
		</div>
	</>
);

const History: React.FC<{t: number; at: number; openAt: number}> = ({t, at, openAt}) => (
	<>
		<AppBar product="pay" title="Payment history" />
		<div style={{padding: '10px 26px', fontFamily: inter}}>
			{['March', 'February', 'January'].map((m, i) => (
				<div key={m} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '16px 14px', margin: '0 -14px', borderRadius: 12, borderBottom: `1px solid ${C.line}`, opacity: prog(t, at + 0.2 + i * 0.2, 0.5), background: i === 0 && t > openAt - 0.2 ? PAY.soft : undefined}}>
					<IconTile name="receipt" size={40} />
					<div style={{flex: 1}}>
						<div style={{fontWeight: 600, fontSize: 18, color: C.navy}}>{m} rent</div>
						<div style={{fontSize: 15, color: C.muted}}>₹25,000</div>
					</div>
					<Pill style={{fontSize: 14, padding: '4px 10px'}}>Paid</Pill>
				</div>
			))}
		</div>
	</>
);

export const Pay: React.FC<ChapterProps> = ({t, c}) => {
	const s = c.P('paya');
	const end = c.P('huba');
	const tB = c.P('payb');
	const tC = c.P('payc');
	const tD = c.P('payd');
	const tE = c.P('paye');
	const tF = c.P('payf');
	const tSearch = c.W('paya', 'sometimes');
	const clutterOut = prog(t, tB - 0.4, 0.9, IN_OUT);
	const enter = prog(t, s - 1.3, 1.0);
	const authAt = c.W('payc', 'authoriz*') + 0.2;
	const tConfig = c.W('payc', 'once');
	const tConfirmed = c.W('payc', 'confirmed');
	const tRemind = c.W('payd', 'reminders');
	const tPayManual = c.W('payd', 'complete') + 0.3;
	const tOpen = c.W('paye', 'view');
	const tDownload = c.W('paye', 'keep');
	const tLandlord = c.W('paye', 'searching') - 0.4;
	const phoneLeft = 1180;
	return (
		<AbsoluteFill style={{opacity: enter * (1 - prog(t, end - 0.6, 0.5))}}>
			<AbsoluteFill style={{background: C.bg}} />
			{/* Part A: the monthly routine — notifications, a landlord's reminder, scattered proof */}
			<AbsoluteFill style={{opacity: 1 - clutterOut}}>
				<Headline t={t} at={s + 0.2} text="Rent payments shouldn't be complicated." grad={['complicated']} />
				<Phone w={400} style={{left: 260, top: 230}}>
					<div style={{padding: '66px 18px 0'}}>
						<Msg t={t} at={s + 0.3} from="Calendar" text="Design review · 11:00" />
						<Msg t={t} at={s + 0.9} from="Team chat" text="Can you join the 3 pm call?" />
						<Msg t={t} at={c.W('paya', 'managing')} from="Mr. Sharma (landlord)" text="Hi Arjun, just a reminder about this month's rent." color={PAY.soft} />
						{t > tSearch ? (
							<div style={{marginTop: 16, padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${C.line}`, fontFamily: inter, fontSize: 18, color: C.slate, display: 'flex', alignItems: 'center', gap: 10}}>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.slate} strokeWidth="2">
									<circle cx="11" cy="11" r="7" />
									<path d="m20 20-4-4" />
								</svg>
								{'payment confirmation'.slice(0, Math.round(20 * prog(t, tSearch + 0.2, 1.2, Easing.linear)))}
							</div>
						) : null}
					</div>
				</Phone>
				{/* scattered screenshots */}
				{t > tSearch
					? [0, 1, 2, 3, 4, 5].map((i) => {
							const p = prog(t, tSearch + 0.6 + i * 0.15, 0.8, SPRINGY);
							const x = [740, 860, 700, 900, 780, 640][i];
							const y = [300, 470, 620, 700, 820, 450][i];
							return (
								<div key={i} style={{position: 'absolute', left: x, top: y, width: 150, height: 110, borderRadius: 12, background: C.white, boxShadow: SHADOW_SM, transform: `scale(${p}) rotate(${(i % 2 ? 7 : -6) + i}deg)`, padding: 14, boxSizing: 'border-box'}}>
									<div style={{height: 8, width: '70%', borderRadius: 4, background: C.line}} />
									<div style={{height: 8, width: '45%', borderRadius: 4, background: C.line, marginTop: 8}} />
									<div style={{height: 22, width: '60%', borderRadius: 6, background: i === 2 ? C.greenSoft : C.soft, marginTop: 14}} />
								</div>
							);
						})
					: null}
				{/* the to-do list it becomes */}
				<div style={{position: 'absolute', left: 1180, top: 300}}>
					{(
						[
							['remembering', 'calendar', 'Remember the due date'],
							['making', 'wallet', 'Make the payment'],
							['sharing', 'chat', 'Share the confirmation'],
							['finding', 'receipt', 'Find the receipt later'],
						] as const
					).map(([w, ic, l], i) => {
						const p = prog(t, c.W('paya', w) - 0.1, 0.6);
						return (
							<div key={l} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22, opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
								<div style={{width: 34, height: 34, borderRadius: 9, border: `2.5px solid ${C.line}`, background: C.white}} />
								<Icon name={ic} size={30} color={C.slate} />
								<span style={{fontFamily: inter, fontWeight: 500, fontSize: 30, color: C.navy}}>{l}</span>
							</div>
						);
					})}
				</div>
			</AbsoluteFill>
			{/* Parts B–F: Velora Pay */}
			{(() => {
				const o = life(t, tB - 0.2, end - 0.5, 0.7, 0.5);
				if (o <= 0) return null;
				const lockMove = prog(t, tB + 1.3, 1.0, IN_OUT);
				const ph = prog(t, tB + 0.7, 1.1);
				const auto = life(t, tC - 0.3, tD - 0.2, 0.7, 0.4);
				const manual = life(t, tD - 0.1, tE - 0.2, 0.7, 0.4);
				const hist = life(t, tE - 0.1, tF + 0.6, 0.7, 0.4);
				return (
					<AbsoluteFill style={{opacity: o}}>
						<Lockup t={t} at={tB - 0.05} product="pay" size={72} style={{position: 'absolute', left: mix(700, 120, lockMove), top: mix(470, 110, lockMove), transform: `scale(${mix(1, 0.7, lockMove)})`, transformOrigin: 'left top'}} />
						{/* B: choose */}
						<div style={{position: 'absolute', left: 120, top: 300, width: 900, opacity: life(t, c.W('payb', 'simpler'), tC - 0.2, 0.6, 0.4)}}>
							<div style={{...H, fontSize: 66}}>
								<Words t={t} text="Choose how you want to pay." at={c.W('payb', 'choose')} grad={['pay']} />
							</div>
							<div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 18}}>
								{(
									[
										['automatic', 'repeat', 'Automatic recurring payments'],
										['manually', 'clock', 'Manual payments with reminders'],
									] as const
								).map(([w, ic, l], i) => {
									const p = prog(t, c.W('payb', w) - 0.1, 0.6, SPRINGY);
									return (
										<div key={l} style={{display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${p})`, transformOrigin: 'left center'}}>
											<div style={{width: 46, height: 46, borderRadius: 23, background: PAY.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: inter, fontWeight: 600, fontSize: 22}}>{i + 1}</div>
											<IconTile name={ic} size={52} />
											<span style={{fontFamily: inter, fontWeight: 500, fontSize: 32, color: C.navy}}>{l}</span>
										</div>
									);
								})}
							</div>
						</div>
						{/* C: automatic */}
						{auto > 0 ? (
							<div style={{position: 'absolute', left: 120, top: 270, opacity: auto}}>
								<div style={{...H, fontSize: 54}}>
									<Words t={t} text="Automatic recurring payments" at={tC} />
								</div>
								<div style={{...BODY, fontSize: 30, marginTop: 14}}>
									<Words t={t} text="Set up once. Manage recurring rent with greater ease." at={tC + 0.5} stagger={0.04} />
								</div>
								<StepList
									t={t}
									at={[c.W('payc', 'reviewing'), authAt, tConfig, tConfirmed]}
									steps={['Review the details', 'Authorise the mandate', 'Payments as scheduled', 'Confirmed by provider']}
									accent={PAY.accent}
									style={{left: 0, top: 230}}
								/>
							</div>
						) : null}
						{/* D: manual */}
						{manual > 0 ? (
							<div style={{position: 'absolute', left: 120, top: 270, opacity: manual}}>
								<div style={{...H, fontSize: 54}}>
									<Words t={t} text="Manual payments" at={tD} />
								</div>
								<div style={{...BODY, fontSize: 30, marginTop: 14}}>
									<Words t={t} text="Get reminders. Review. Pay when ready." at={tD + 0.5} stagger={0.05} />
								</div>
								<StepList t={t} at={[tRemind, c.W('payd', 'review'), tPayManual, c.W('payd', 'status')]} steps={['Reminder before the due date', 'Review the amount', 'Pay with a supported method', 'Status updated on confirmation']} accent={PAY.accent} style={{left: 0, top: 230}} />
							</div>
						) : null}
						{/* E: receipt + landlord view */}
						{hist > 0 ? (
							<div style={{opacity: hist}}>
								<Card t={t} at={tOpen + 0.3} style={{left: 140, top: 260, width: 540}} pad={34}>
									<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
										<Eyebrow>Digital receipt</Eyebrow>
										<Icon name="receipt" size={28} color={PAY.accent} />
									</div>
									<div style={{...NUM, fontFamily: inter, fontWeight: 600, fontSize: 44, color: C.navy, marginTop: 12}}>₹25,000</div>
									<Row label="Paid on" value="5 Mar" size={20} style={{padding: '12px 0'}} />
									<Row label="To" value="Mr. Sharma" size={20} style={{padding: '12px 0'}} />
									<Row label="Reference" value="VLR-0325-118" size={20} style={{padding: '12px 0'}} />
									<Btn label={t > tDownload + 0.5 ? 'Saved ✓' : 'Download receipt'} color={PAY.accent} ghost={t <= tDownload + 0.5} press={life(t, tDownload, tDownload + 0.3, 0.08, 0.2)} style={{marginTop: 22}} />
								</Card>
								<Card t={t} at={tLandlord} style={{left: 140, top: 760, width: 540}} pad={24}>
									<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
										<IconTile name="key" size={46} bg={C.soft} color={C.slate} />
										<div style={{flex: 1}}>
											<div style={{fontFamily: inter, fontSize: 15, color: C.muted}}>Landlord view · Mr. Sharma</div>
											<div style={{fontFamily: inter, fontWeight: 600, fontSize: 21, color: C.navy}}>March rent received · ₹25,000</div>
										</div>
									</div>
								</Card>
							</div>
						) : null}
						{/* the phone */}
						<div style={{position: 'absolute', left: phoneLeft, top: 110, transform: `translateY(${(1 - ph) * 700}px)`}}>
							<Phone w={420} style={{position: 'relative'}}>
								<Screens
									t={t}
									list={[
										[tB + 0.8, tC + 0.3, <PayHome key="h" t={t} at={tB + 1.0} pick="auto" pickAt={tC} />],
										[tC + 0.3, authAt + 0.4, <AutoSetup key="s" t={t} at={tC + 0.4} authAt={authAt} />],
										[authAt + 0.4, tConfig, <Authorised key="z" t={t} at={authAt + 0.4} />],
										[tConfig, tD, <Cycle key="c" t={t} at={tConfig} confirmAt={tConfirmed + 0.2} />],
										[tD, tRemind + 1.2, <PayHome key="h2" t={t} at={tD} pick="manual" pickAt={c.W('payd', 'manual*')} />],
										[tRemind + 1.2, tPayManual + 0.6, <ManualReview key="r" t={t} at={tRemind + 1.2} payAt={tPayManual} />],
										[tPayManual + 0.6, tE, <Cycle key="c2" t={t} at={tPayManual + 0.6} confirmAt={c.W('payd', 'confirmed') + 0.1} title="October rent" via="Paid manually" />],
										[tE, tF + 0.8, <History key="hi" t={t} at={tE} openAt={tOpen} />],
									]}
								/>
								<Tap t={t} at={tC - 0.05} x={210} y={612} color={PAY.accent} />
								<Tap t={t} at={authAt} x={210} y={668} color={PAY.accent} />
								<Tap t={t} at={c.W('payd', 'manual*')} x={210} y={700} color={PAY.accent} />
								<Tap t={t} at={tPayManual} x={210} y={652} color={PAY.accent} />
								<Tap t={t} at={tOpen} x={210} y={230} color={PAY.accent} />
							</Phone>
							<Toast t={t} at={tRemind - 0.1} out={tRemind + 1.3} icon="clock" title="Rent due in 3 days" body="October rent · ₹25,000" accent={PAY.accent} app="Velora Pay" style={{left: -50, top: -40}} />
						</div>
						{/* F: confirmed */}
						<Toast t={t} at={tF + 0.1} out={end - 1.4} icon="check" title="Rent payment confirmed" body="March rent · ₹25,000" accent={C.green} app="Velora Pay" style={{left: 140, top: 120}} />
						<Footnote t={t} at={tC + 0.5} out={tE}>
							Automatic payments need your authorisation and a supported payment arrangement. Reminders don&apos;t make payments.
						</Footnote>
					</AbsoluteFill>
				);
			})()}
			<TitleCard t={t} at={c.W('payf', 'velora') + 0.2} out={end - 0.6} product="pay" />
		</AbsoluteFill>
	);
};
