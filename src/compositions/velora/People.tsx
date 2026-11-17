// Supporting cast for the complete film, on the same flat rig and proportions as Arjun (Arjun.tsx):
// Mr. Sharma — landlord: grey hair, glasses, moustache, slate-blue shirt.
// Property manager — professional woman with a tablet: hair bun, navy blazer.
import React from 'react';
import {C} from './kit';

type P = {t: number; walk?: number; mood?: number; look?: number; scale?: number; style?: React.CSSProperties; tablet?: number; talk?: number; gesture?: number};

const Body: React.FC<P & {skin: string; shirt: string; shirtDark: string; trousers: string; trousers2: string; head: React.ReactNode; inner?: string; extra?: React.ReactNode}> = ({t, walk = 0, mood = 0, look = 0, scale = 1, style, skin, shirt, shirtDark, trousers, trousers2, head, inner = '#fff', extra, tablet = 0, gesture = 0}) => {
	const ph = t * Math.PI * 2 * 1.6;
	const swing = Math.sin(ph) * 18 * walk;
	const bob = Math.abs(Math.cos(ph)) * -6 * walk;
	const breathe = Math.sin(t * 2.1) * 1.1 * (1 - walk);
	const tilt = look * -6 + mood * 4;
	return (
		<div style={{position: 'absolute', width: 260 * scale, height: 560 * scale, ...style}}>
			<svg width={260 * scale} height={560 * scale} viewBox="0 0 260 560" style={{overflow: 'visible'}}>
				<ellipse cx="130" cy="548" rx="70" ry="9" fill="rgba(10,37,64,0.10)" />
				<g transform={`translate(0 ${bob})`}>
					<g transform={`rotate(${swing} 112 330)`}>
						<rect x="98" y="322" width="30" height="208" rx="15" fill={trousers} />
						<rect x="90" y="514" width="44" height="20" rx="10" fill="#1A1A24" />
					</g>
					<g transform={`rotate(${-swing} 148 330)`}>
						<rect x="132" y="322" width="30" height="208" rx="15" fill={trousers2} />
						<rect x="128" y="514" width="44" height="20" rx="10" fill="#1A1A24" />
					</g>
					<g transform={`rotate(${-swing * 0.8} 82 182)`}>
						<rect x="68" y="176" width="28" height="150" rx="14" fill={shirtDark} />
						<circle cx="82" cy="328" r="14" fill={skin} />
					</g>
					<g transform={`translate(0 ${breathe})`}>
						<path d="M84 186 Q84 160 110 158 L150 158 Q176 160 176 186 L172 340 L88 340 Z" fill={shirt} />
						<path d="M118 158 L130 184 L142 158 Z" fill={inner} opacity="0.95" />
						{extra}
						<g transform={`rotate(${tilt} 130 140)`}>
							<rect x="118" y="124" width="24" height="30" rx="10" fill={skin} />
							{head}
						</g>
					</g>
					{/* front arm; with a tablet it bends to hold it at the chest */}
					<g transform={`rotate(${tablet > 0 ? -38 * tablet : swing * 0.8 - gesture * (40 + Math.sin(t * 2.3) * 8)} 178 182)`}>
						<rect x="164" y="176" width="28" height="150" rx="14" fill={shirtDark} />
						<circle cx="178" cy="328" r="14" fill={skin} />
					</g>
					{tablet > 0 ? (
						<g opacity={tablet} transform="translate(176 236) rotate(-8)">
							<rect x="-40" y="-56" width="80" height="108" rx="10" fill="#1d2433" />
							<rect x="-34" y="-50" width="68" height="96" rx="6" fill={C.indigoSoft} />
							<rect x="-26" y="-40" width="40" height="6" rx="3" fill={C.indigo} />
							<rect x="-26" y="-28" width="52" height="5" rx="2.5" fill="#b9b4ff" />
							<rect x="-26" y="-18" width="46" height="5" rx="2.5" fill="#b9b4ff" />
						</g>
					) : null}
				</g>
			</svg>
		</div>
	);
};

/** Face; `talk` 0–1 opens the mouth (driven by the voiceover), eyes blink every few seconds. */
export const Face: React.FC<{skin: string; mood: number; look: number; brows: string; talk?: number; t?: number}> = ({skin, mood, look, brows, talk = 0, t = 0}) => {
	const brow = mood * 12 - talk * 2;
	const mouth = 11 - mood * 17;
	const ph = (t + 0.7) % 3.7;
	const blink = ph < 0.12 ? 0.15 : 1;
	return (
		<>
			<ellipse cx="130" cy="96" rx="42" ry="46" fill={skin} />
			<ellipse cx="88" cy="100" rx="7" ry="10" fill={skin} />
			<ellipse cx="172" cy="100" rx="7" ry="10" fill={skin} />
			<path d={`M108 ${86 - brow * 0.2} L122 ${84 - brow * 0.6}`} stroke={brows} strokeWidth="4" strokeLinecap="round" />
			<path d={`M138 ${84 - brow * 0.6} L152 ${86 - brow * 0.2}`} stroke={brows} strokeWidth="4" strokeLinecap="round" />
			<ellipse cx="115" cy={98 - look * 3} rx="4.2" ry={5 * blink} fill={C.hair} />
			<ellipse cx="145" cy={98 - look * 3} rx="4.2" ry={5 * blink} fill={C.hair} />
			{talk > 0.05 ? (
				<path d={`M119 119 Q130 ${123 + mouth * 0.25} 141 119 Q130 ${121 + 4 + 12 * talk} 119 119 Z`} fill="#5A2E22" />
			) : (
				<path d={`M118 121 Q130 ${121 + mouth} 142 121`} stroke="#6B3A2A" strokeWidth="3.4" fill="none" strokeLinecap="round" />
			)}
		</>
	);
};

export const Sharma: React.FC<P> = (p) => {
	const skin = '#A06B4B';
	return (
		<Body
			{...p}
			skin={skin}
			shirt="#5B7BA6"
			shirtDark="#4C6A93"
			trousers="#3A3F4B"
			trousers2="#444A57"
			inner="#E9E2D3"
			head={
				<>
					<Face skin={skin} mood={p.mood ?? 0} look={p.look ?? 0} brows="#8E949C" talk={p.talk} t={p.t} />
					{/* receding grey hair */}
					<path d="M88 94 Q86 62 104 54 Q100 70 102 80 Q94 84 88 94 Z M172 94 Q174 62 156 54 Q160 70 158 80 Q166 84 172 94 Z" fill="#A9AFB7" />
					<path d="M104 54 Q130 44 156 54 Q140 50 130 51 Q118 50 104 54 Z" fill="#A9AFB7" />
					{/* glasses */}
					<g fill="none" stroke="#2B2B3A" strokeWidth="3">
						<rect x="103" y="88" width="24" height="19" rx="7" />
						<rect x="133" y="88" width="24" height="19" rx="7" />
						<line x1="127" y1="96" x2="133" y2="96" />
					</g>
					{/* moustache */}
					<path d="M114 114 Q130 106 146 114 Q138 118 130 114 Q122 118 114 114 Z" fill="#7D838B" />
				</>
			}
		/>
	);
};

export const Manager: React.FC<P> = (p) => {
	const skin = '#C48B66';
	return (
		<Body
			{...p}
			skin={skin}
			shirt={C.navy}
			shirtDark="#14375E"
			trousers="#1F2A44"
			trousers2="#26334F"
			inner="#F3E9FF"
			tablet={p.tablet ?? 1}
			head={
				<>
					{/* bun behind */}
					<circle cx="130" cy="46" r="20" fill={C.hair} />
					<Face skin={skin} mood={p.mood ?? 0} look={p.look ?? 0} brows={C.hair} talk={p.talk} t={p.t} />
					<path d="M86 100 Q82 52 130 50 Q178 52 174 100 Q168 74 146 68 Q124 76 104 70 Q90 80 86 100 Z" fill={C.hair} />
					<circle cx="88" cy="112" r="3.5" fill="#E6C27A" />
					<circle cx="172" cy="112" r="3.5" fill="#E6C27A" />
				</>
			}
		/>
	);
};

/** Founder (Rent ads): short beard, side-parted hair, charcoal tee. */
export const Founder: React.FC<P> = (p) => {
	const skin = '#B07A55';
	return (
		<Body
			{...p}
			skin={skin}
			shirt="#2E3548"
			shirtDark="#262C3D"
			trousers="#1F2433"
			trousers2="#272D3E"
			inner="#2E3548"
			head={
				<>
					<Face skin={skin} mood={p.mood ?? 0} look={p.look ?? 0} brows={C.hair} talk={p.talk} t={p.t} />
					<path d="M90 104 Q92 140 130 146 Q168 140 170 104 Q166 128 150 132 Q140 126 130 127 Q120 126 110 132 Q94 128 90 104 Z" fill="#2A2230" opacity="0.92" />
					<path d="M87 96 Q84 50 128 46 Q172 44 174 90 Q168 66 150 62 Q118 56 100 70 Q90 80 87 96 Z" fill={C.hair} />
				</>
			}
		/>
	);
};

/** Creator (UGC ad): curly hair, violet hoodie. */
export const Creator: React.FC<P> = (p) => {
	const skin = '#C99067';
	return (
		<Body
			{...p}
			skin={skin}
			shirt="#8E5CE6"
			shirtDark="#7A4CD1"
			trousers="#2B2F45"
			trousers2="#34395A"
			inner="#B48CF5"
			extra={<path d="M100 160 Q130 186 160 160 L156 176 Q130 196 104 176 Z" fill="#7A4CD1" />}
			head={
				<>
					<Face skin={skin} mood={p.mood ?? 0} look={p.look ?? 0} brows={C.hair} talk={p.talk} t={p.t} />
					{[[96, 66], [110, 54], [126, 48], [142, 50], [158, 58], [168, 72], [90, 82], [172, 86]].map(([x, y], i) => (
						<circle key={i} cx={x} cy={y} r={15} fill={C.hair} />
					))}
				</>
			}
		/>
	);
};
