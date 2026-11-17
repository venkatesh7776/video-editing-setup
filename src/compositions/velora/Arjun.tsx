// Arjun: minimal flat character (front view) in the Velora palette. Consistent proportions and wardrobe
// across scenes (brief): smart-casual indigo shirt, navy trousers, orange-gradient suitcase.
// walk: 0 = standing, 1 = full walk cycle; mood: 0 = happy … 1 = concerned; look: −1 down … 1 up.
import React from 'react';
import {C} from './kit';

export type ArjunProps = {t: number; walk?: number; mood?: number; look?: number; suitcase?: number; scale?: number; style?: React.CSSProperties; wave?: number; talk?: number};

export const Arjun: React.FC<ArjunProps> = ({t, walk = 0, mood = 0, look = 0, suitcase = 1, scale = 1, style, wave = 0, talk = 0}) => {
	const ph = t * Math.PI * 2 * 1.7; // ~1.7 steps/s
	const swing = Math.sin(ph) * 20 * walk;
	const bob = Math.abs(Math.cos(ph)) * -7 * walk;
	const breathe = Math.sin(t * 2.2) * 1.2 * (1 - walk);
	const brow = mood * 12; // inner-brow raise (concern)
	const mouth = 12 - mood * 18; // smile depth → slight frown
	const headTilt = look * -6 + mood * 4;
	return (
		<div style={{position: 'absolute', width: 260 * scale, height: 560 * scale, ...style}}>
			<svg width={260 * scale} height={560 * scale} viewBox="0 0 260 560" style={{overflow: 'visible'}}>
				<defs>
					<linearGradient id="arjun-case" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor="#FFB46A" />
						<stop offset="1" stopColor="#F2733C" />
					</linearGradient>
				</defs>
				{/* ground shadow */}
				<ellipse cx="130" cy="548" rx={70 + Math.abs(swing) * 0.4} ry="9" fill="rgba(10,37,64,0.10)" />
				<g transform={`translate(0 ${bob})`}>
					{/* legs */}
					<g transform={`rotate(${swing} 112 330)`}>
						<rect x="98" y="322" width="30" height="208" rx="15" fill={C.navy} />
						<rect x="90" y="514" width="44" height="20" rx="10" fill="#1A1A24" />
					</g>
					<g transform={`rotate(${-swing} 148 330)`}>
						<rect x="132" y="322" width="30" height="208" rx="15" fill="#11305A" />
						<rect x="128" y="514" width="44" height="20" rx="10" fill="#1A1A24" />
					</g>
					{/* back arm (left, swings) */}
					<g transform={`rotate(${-swing * 0.8 + wave * -150} 82 182)`}>
						<rect x="68" y="176" width="28" height="150" rx="14" fill="#5149E8" />
						<circle cx="82" cy="328" r="14" fill={C.skin} />
					</g>
					{/* torso: shirt */}
					<g transform={`translate(0 ${breathe})`}>
						<path d="M84 186 Q84 160 110 158 L150 158 Q176 160 176 186 L172 340 L88 340 Z" fill={C.indigo} />
						<path d="M118 158 L130 182 L142 158 Z" fill="#fff" opacity="0.9" />
						<line x1="130" y1="184" x2="130" y2="336" stroke="#5149E8" strokeWidth="2" />
						{/* head */}
						<g transform={`rotate(${headTilt} 130 140)`}>
							<rect x="118" y="124" width="24" height="30" rx="10" fill={C.skin} />
							<ellipse cx="130" cy="96" rx="42" ry="46" fill={C.skin} />
							<ellipse cx="88" cy="100" rx="7" ry="10" fill={C.skin} />
							<ellipse cx="172" cy="100" rx="7" ry="10" fill={C.skin} />
							{/* hair */}
							<path d="M88 92 Q86 48 128 46 Q168 44 174 86 Q160 70 140 72 Q118 64 102 76 Q94 82 88 92 Z" fill={C.hair} />
							{/* brows */}
							<path d={`M108 ${86 - brow * 0.2} L122 ${84 - brow * 0.6}`} stroke={C.hair} strokeWidth="4" strokeLinecap="round" />
							<path d={`M138 ${84 - brow * 0.6} L152 ${86 - brow * 0.2}`} stroke={C.hair} strokeWidth="4" strokeLinecap="round" />
							{/* eyes */}
							<ellipse cx="115" cy={98 - look * 3} rx="4.2" ry="5" fill={C.hair} />
							<ellipse cx="145" cy={98 - look * 3} rx="4.2" ry="5" fill={C.hair} />
							{/* mouth */}
							{talk > 0.05 ? <path d={`M118 118 Q130 ${122 + mouth * 0.25} 142 118 Q130 ${124 + 12 * talk} 118 118 Z`} fill="#5A2E22" /> : <path d={`M116 120 Q130 ${120 + mouth} 144 120`} stroke="#6B3A2A" strokeWidth="3.6" fill="none" strokeLinecap="round" />}
						</g>
					</g>
					{/* front arm (right) holding the suitcase handle */}
					<g transform={`rotate(${swing * 0.5 * (1 - suitcase) + 4 * suitcase} 178 182)`}>
						<rect x="164" y="176" width="28" height="150" rx="14" fill="#5A52F0" />
						<circle cx="178" cy="328" r="14" fill={C.skin} />
					</g>
				</g>
				{/* suitcase (rolls beside him) */}
				{suitcase > 0 ? (
					<g opacity={Math.min(1, suitcase * 2)} transform={`translate(${210 - (1 - suitcase) * 20} ${360}) rotate(${walk * 8})`}>
						<rect x="-6" y="-38" width="12" height="44" rx="4" fill="#2B2B3A" />
						<rect x="-34" y="0" width="68" height="150" rx="16" fill="url(#arjun-case)" />
						<line x1="-14" y1="14" x2="-14" y2="136" stroke="rgba(255,255,255,0.45)" strokeWidth="3" strokeLinecap="round" />
						<line x1="14" y1="14" x2="14" y2="136" stroke="rgba(255,255,255,0.45)" strokeWidth="3" strokeLinecap="round" />
						<circle cx="-22" cy="160" r="9" fill="#2B2B3A" />
						<circle cx="22" cy="160" r="9" fill="#2B2B3A" />
					</g>
				) : null}
			</svg>
		</div>
	);
};
