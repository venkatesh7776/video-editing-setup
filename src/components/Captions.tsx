import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {CaptionPage} from '../utils/captions';
import type {CaptionsConfig} from '../utils/types';

const {fontFamily} = loadFont('normal', {weights: ['800'], subsets: ['latin']});

const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '');

const Page: React.FC<{page: CaptionPage; config: CaptionsConfig}> = ({page, config}) => {
	const frame = useCurrentFrame(); // relative to page start
	const {fps, width, height} = useVideoConfig();
	const absolute = frame + page.from;

	const enter = spring({frame, fps, config: {damping: 200, stiffness: 300}, durationInFrames: 8});
	const fontSize = Math.min(width, height) * (config.fontScale ?? 0.065);
	const keywords = (config.keywords ?? []).map(normalize);

	return (
		<div
			style={{
				fontFamily,
				fontWeight: 800,
				fontSize,
				lineHeight: 1.15,
				textAlign: 'center',
				color: config.textColor ?? 'white',
				textTransform: config.uppercase ? 'uppercase' : 'none',
				maxWidth: width * 0.84,
				opacity: enter,
				transform: `scale(${0.85 + 0.15 * enter}) translateY(${(1 - enter) * 20}px)`,
				WebkitTextStroke: `${fontSize * 0.14}px black`,
				paintOrder: 'stroke fill',
				textShadow: `0 ${fontSize * 0.06}px ${fontSize * 0.25}px rgba(0,0,0,0.55)`,
			}}
		>
			{page.words.map((w, i) => {
				const active = config.highlightActiveWord !== false && absolute >= w.from && absolute < w.to;
				const isKeyword = keywords.includes(normalize(w.text));
				const color = active
					? (config.highlightColor ?? '#FFD60A')
					: isKeyword
						? (config.keywordColor ?? '#34D399')
						: undefined;
				return (
					<span
						key={i}
						style={{
							color,
							display: 'inline-block',
							transform: active ? 'scale(1.08)' : undefined,
							margin: `0 ${fontSize * 0.12}px`,
						}}
					>
						{w.text}
					</span>
				);
			})}
		</div>
	);
};

export const Captions: React.FC<{pages: CaptionPage[]; config: CaptionsConfig}> = ({pages, config}) => {
	const {height, width} = useVideoConfig();
	const vertical = height > width;
	const position = config.position ?? 'bottom';
	// Bottom captions sit above the platform UI on vertical video.
	const justifyContent = position === 'top' ? 'flex-start' : position === 'center' ? 'center' : 'flex-end';
	const padding = position === 'center' ? 0 : height * (vertical ? 0.2 : 0.08);

	return (
		<AbsoluteFill style={{justifyContent, alignItems: 'center', paddingTop: padding, paddingBottom: padding}}>
			{pages.map((page, i) => (
				<Sequence
					key={i}
					from={Math.round(page.from)}
					durationInFrames={Math.max(1, Math.round(page.to) - Math.round(page.from))}
					layout="none"
				>
					<Page page={page} config={config} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
