// VibeLevel brand tokens, taken from vibelevel.ai (colours, fonts, logo mark).
import {loadFont as loadDMSans} from '@remotion/google-fonts/DMSans';
import {loadFont as loadSpaceGrotesk} from '@remotion/google-fonts/SpaceGrotesk';
import React from 'react';

export const fonts = {
	heading: loadSpaceGrotesk('normal', {weights: ['500', '700'], subsets: ['latin']}).fontFamily,
	body: loadDMSans('normal', {weights: ['400', '500', '700'], subsets: ['latin']}).fontFamily,
	mono: 'ui-monospace, "SF Mono", Menlo, monospace',
};

export const colors = {
	ink: '#131B17',
	muted: '#4B5D53',
	green: '#0A7B3B',
	greenDeep: '#0E3B2B',
	neon: '#00E676',
	mint: '#6EE7B7',
	mintBg: '#E9F7EE',
	page: '#F0F5F1',
	line: '#D7DBE0',
	purple: '#6B26D9',
	blue: '#1D4FD7',
	amber: '#D97706',
	navy: '#08111F',
	white: '#FFFFFF',
};

/** The VibeLevel star mark (from vibelevel.ai/icon.svg). */
export const LogoMark: React.FC<{size: number; tile?: boolean}> = ({size, tile = true}) => (
	<svg width={size} height={size} viewBox="0 0 28 28" fill="none">
		{tile ? <rect width="28" height="28" rx="6" fill={colors.navy} /> : null}
		<g transform="translate(0.85 0.85) scale(0.96)">
			<path d="M14 2L16.5 10.5H25L18.25 15.5L20.75 24L14 19L7.25 24L9.75 15.5L3 10.5H11.5L14 2Z" fill={colors.neon} opacity="0.15" />
			<path d="M12.5 4L15 12H10L14 7L12.5 4Z" fill={colors.neon} />
			<path d="M10 13L7 22L14 17L10 13Z" fill={colors.neon} opacity="0.7" />
			<path d="M18 13L21 22L14 17L18 13Z" fill={colors.neon} opacity="0.7" />
		</g>
	</svg>
);

export const Wordmark: React.FC<{size: number; color?: string}> = ({size, color = colors.green}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: size * 0.3}}>
		<LogoMark size={size * 1.1} tile={false} />
		<span style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: size, color, letterSpacing: -0.5}}>VibeLevel</span>
	</div>
);
