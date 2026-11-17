// The VibeLevel logo as "vibelevel.ai": the official star + wordmark (split from the
// supplied PNG in build.mjs) with ".ai" set on the wordmark's own baseline and colour.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {fonts} from './brand';
import type {ImageInfo} from './types';

export const LOGO_GREEN = '#00D76A'; // dominant wordmark colour in the supplied logo
// Wordmark crop metrics (logo-word.png, 740 px tall): baseline at y=663, cap height 531 px.
const BASELINE = 663 / 740;
export const AI_WIDTH = 820; // ".ai" box width, in wordmark-crop pixels

/** Total logo width for a given height (star + wordmark + ".ai"). */
export const logoWidth = (h: number, star: ImageInfo, word: ImageInfo) => (h / star.h) * (star.w + word.w + AI_WIDTH);

export const AiSuffix: React.FC<{h: number; word: ImageInfo; color?: string}> = ({h, word, color = LOGO_GREEN}) => {
	const k = h / word.h;
	return (
		<svg width={AI_WIDTH * k} height={h} viewBox={`0 0 ${AI_WIDTH} ${word.h}`} style={{display: 'block', overflow: 'visible'}}>
			<text x={10} y={BASELINE * word.h} fontFamily={fonts.subtitle} fontWeight={700} fontSize={735} fill={color} letterSpacing={-12}>
				.ai
			</text>
		</svg>
	);
};

/** Static logo, e.g. the small corner logo. `h` is the logo height in px. */
export const BrandLogo: React.FC<{h: number; star: ImageInfo; word: ImageInfo; style?: React.CSSProperties}> = ({h, star, word, style}) => {
	const k = h / star.h;
	return (
		<div style={{display: 'flex', alignItems: 'flex-start', height: h, ...style}}>
			<Img src={staticFile(star.src)} style={{width: star.w * k, height: h}} />
			<Img src={staticFile(word.src)} style={{width: word.w * k, height: h}} />
			<AiSuffix h={h} word={word} />
		</div>
	);
};
