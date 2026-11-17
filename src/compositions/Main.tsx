// The reusable edit composition. Everything it shows is driven by the edit file
// (edits/*.json) passed in as props, so new edits rarely need code changes.

import React from 'react';
import {AbsoluteFill, type CalculateMetadataFunction} from 'remotion';
import {Captions} from '../components/Captions';
import {BackgroundMusic, Logo, TitleCard} from '../components/Overlays';
import {VideoLayer, type ZoomWindow} from '../components/VideoLayer';
import {buildCaptionPages, type CaptionPage} from '../utils/captions';
import {resolveDimensions, resolveFit} from '../utils/formats';
import {frameSegments, keptRanges, mapRange, totalFrames, type FramedSegment} from '../utils/timeline';
import type {MainProps} from '../utils/types';

type Derived = {
	segments: FramedSegment[];
	pages: CaptionPage[];
	zooms: ZoomWindow[];
	fit: 'cover' | 'contain' | 'blur';
};

export type MainCompositionProps = MainProps & {derived?: Derived};

export const calculateMainMetadata: CalculateMetadataFunction<MainCompositionProps> = ({props}) => {
	const {config, source, words} = props;
	const dims = resolveDimensions(config.format);
	if (!source) {
		return {...dims, fps: 30, durationInFrames: 150, props};
	}
	const fps = config.fps ?? source.fps;
	const segments = frameSegments(keptRanges(config, source.duration), fps);
	const durationInFrames = Math.max(1, totalFrames(segments));

	const pages = config.captions?.enabled ? buildCaptionPages(words, segments, fps, config.captions) : [];
	const zooms: ZoomWindow[] = (config.zooms ?? []).flatMap((z) => {
		const r = mapRange(z, segments, fps);
		return r ? [{from: r.from, to: r.to, scale: z.scale ?? 1.25, x: z.x ?? 0.5, y: z.y ?? 0.5}] : [];
	});

	return {
		...dims,
		fps,
		durationInFrames,
		props: {...props, derived: {segments, pages, zooms, fit: resolveFit(config.fit, source, dims)}},
	};
};

export const Main: React.FC<MainCompositionProps> = ({config, source, derived}) => {
	if (!source || !derived) {
		return (
			<AbsoluteFill style={{background: '#111', color: '#aaa', justifyContent: 'center', alignItems: 'center', fontSize: 40}}>
				No source loaded — run `npm run preview` after adding input/raw-video.mp4
			</AbsoluteFill>
		);
	}
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<VideoLayer
				src={source.src}
				segments={derived.segments}
				fit={derived.fit}
				focus={config.focus ?? {x: 0.5, y: 0.5}}
				zooms={derived.zooms}
				volume={config.audio?.volume ?? 1}
			/>
			{config.captions?.enabled ? <Captions pages={derived.pages} config={config.captions} /> : null}
			{config.logo ? <Logo logo={config.logo} /> : null}
			{config.title ? <TitleCard title={config.title} /> : null}
			{config.music ? <BackgroundMusic music={config.music} /> : null}
		</AbsoluteFill>
	);
};
