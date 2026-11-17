import React from 'react';
import {Composition} from 'remotion';
import {calculateMainMetadata, Main, type MainCompositionProps} from './compositions/Main';
import {calculateScreeningMetadata, Screening} from './compositions/screening/Screening';
import {calculateReelMetadata, WeddingReel} from './compositions/wedding/Reel';
import {calculateReel2Metadata, WeddingReel2} from './compositions/wedding2/Reel2';
import {calculateQrMetadata, QrMemories} from './compositions/qr/Memories';
import {calculateHiwMetadata, MomentsQrHowItWorks} from './compositions/qr/HowItWorks';
import {calculateCygMetadata, VibeLevelCYG} from './compositions/cyg/Film';
import {calculateCyg5Metadata, VibeLevelCYG5} from './compositions/cyg/Film5';
import {calculateRedesignMetadata, RedesignReel} from './compositions/redesign/Reel';
import {TempleDmLine, TempleIntro, TempleOutro, TempleOverlay} from './compositions/temple/Reel';
import {INVITE_DURATION, INVITE_FPS, InviteReel} from './compositions/temple/InviteReel';
import {calculateTeluguMetadata, TeluguReel} from './compositions/telugu/Reel';
import {calculateFilmMetadata, VeloraFilm} from './compositions/velora/Film';
import {calculateAdMetadata, RentAd} from './compositions/rent/Ads';
import {calculateDemoMetadata, VibeLevelDemo} from './compositions/vl2/Demo';
import {calculateDemo3Metadata, VibeLevelDemo3} from './compositions/vl3/Demo3';
import {calculateDemo4Metadata, VibeLevelDemo4} from './compositions/vl4/Demo4';
import {calculateVeloraMetadata, Velora} from './compositions/velora/Velora';
import {calculateGuideMetadata, VibeLevelGuide} from './compositions/vibelevel/VibeLevelGuide';

const defaultProps: MainCompositionProps = {
	config: {input: 'input/raw-video.mp4', output: 'output/test-video.mp4', format: '9:16'},
	source: null,
	words: [],
};

export const RemotionRoot: React.FC = () => (
	<>
		{/* Size, fps and duration come from the edit file via calculateMetadata. */}
		<Composition
			id="Main"
			component={Main}
			width={1080}
			height={1920}
			fps={30}
			durationInFrames={150}
			defaultProps={defaultProps}
			calculateMetadata={calculateMainMetadata}
		/>
		{/* Project: VibeLevel Aura user guide (projects/vibelevel-guide). */}
		<Composition
			id="VibeLevelGuide"
			component={VibeLevelGuide}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={150}
			defaultProps={{timeline: null}}
			calculateMetadata={calculateGuideMetadata}
		/>
		{/* Project: VibeLevel Screening demo (projects/vibelevel-screening). */}
		<Composition
			id="Screening"
			component={Screening}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={150}
			defaultProps={{timing: null, images: {}, cues: []}}
			calculateMetadata={calculateScreeningMetadata}
		/>
		{/* Project: wedding-website showcase reel, 9:16 (projects/wedding-reel). */}
		<Composition
			id="WeddingReel"
			component={WeddingReel}
			width={1080}
			height={1920}
			fps={30}
			durationInFrames={30}
			defaultProps={{lines: [], duration: 1, musicOffset: 0, captionLines: []}}
			calculateMetadata={calculateReelMetadata}
		/>
		{/* Project: wedding reel 2, "invitation → website", 9:16 (projects/wedding-reel2). */}
		<Composition
			id="WeddingReel2"
			component={WeddingReel2}
			width={1080}
			height={1920}
			fps={30}
			durationInFrames={30}
			defaultProps={{words: [], voDuration: 1, lead: 0, duration: 1, musicOffset: 0, segments: []}}
			calculateMetadata={calculateReel2Metadata}
		/>
		{/* Project: The Digital Moments — Temple-theme wedding website reel, 4K 9:16 (projects/temple-reel). */}
		<Composition id="TempleIntro" component={TempleIntro} width={2160} height={3840} fps={60} durationInFrames={252} />
		<Composition id="InviteReel" component={InviteReel} width={1080} height={1920} fps={INVITE_FPS} durationInFrames={Math.round(INVITE_DURATION * INVITE_FPS)} />
		<Composition id="TeluguReel" component={TeluguReel} width={1080} height={1920} fps={30} durationInFrames={30} defaultProps={{seq: [], duration: 1, end: 1}} calculateMetadata={calculateTeluguMetadata} />
		{/* Project: SaaS landing-page redesign reel, 9:16 (projects/redesign-reel). */}
		<Composition id="RedesignReel" component={RedesignReel} width={1080} height={1920} fps={30} durationInFrames={30} defaultProps={{parts: [], duration: 1}} calculateMetadata={calculateRedesignMetadata} />
		{/* Project: VibeLevel Screening — "Can You Get Away With It?", 16:9 (projects/vibelevel-cyg); render --scale=2 for 4K. */}
		<Composition id="VibeLevelCYG" component={VibeLevelCYG} width={1920} height={1080} fps={30} durationInFrames={30} defaultProps={{parts: [], cards: [], card: 2.6, duration: 1, segments: [], musicOffset: 4.5}} calculateMetadata={calculateCygMetadata} />
		<Composition id="VibeLevelCYG5" component={VibeLevelCYG5} width={1920} height={1080} fps={30} durationInFrames={30} defaultProps={{parts: [], cards: [], card: 2.6, duration: 1, segments: [], musicOffset: 4.5}} calculateMetadata={calculateCyg5Metadata} />
		<Composition id="TempleOutro" component={TempleOutro} width={2160} height={3840} fps={60} durationInFrames={240} />
		<Composition id="TempleDmLine" component={TempleDmLine} width={2160} height={3840} fps={60} durationInFrames={1} />
		<Composition id="TempleOverlay" component={TempleOverlay} width={2160} height={3840} fps={60} durationInFrames={1} />
		{/* Project: The Digital Moments — How Moments QR works, 16:9 (projects/qr-howitworks). */}
		<Composition
			id="MomentsQrHowItWorks"
			component={MomentsQrHowItWorks}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={30}
			defaultProps={{parts: [], duration: 1, segments: [], musicOffset: 0}}
			calculateMetadata={calculateHiwMetadata}
		/>
		{/* Project: Digital Wedding Memories — QR feature reel, 9:16 (projects/qr-memories). */}
		<Composition
			id="QrMemories"
			component={QrMemories}
			width={1080}
			height={1920}
			fps={30}
			durationInFrames={30}
			defaultProps={{parts: [], duration: 1, segments: [], musicOffset: 0}}
			calculateMetadata={calculateQrMetadata}
		/>
		{/* Project: Velora motion-graphics explainer, 16:9 (projects/velora). */}
		<Composition
			id="Velora"
			component={Velora}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={30}
			defaultProps={{words: [], lead: 0, duration: 1, segments: [], musicOffset: 0, voEnd: 0}}
			calculateMetadata={calculateVeloraMetadata}
		/>
		{/* Project: Velora complete product film — core + Flex, Pay, Hub, Protect (projects/velora-film). */}
		<Composition
			id="VeloraFilm"
			component={VeloraFilm}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={30}
			defaultProps={{parts: [], coreT: [], duration: 1, segments: [], music: []}}
			calculateMetadata={calculateFilmMetadata}
		/>
		{/* Project: Rent campaign — six ads (projects/rent-ads): video 1 is 16:9, videos 2–6 are 9:16. */}
		{[1, 2, 3, 4, 5, 6].map((n) => (
			<Composition
				key={n}
				id={`RentVideo${n}`}
				component={RentAd}
				width={n === 1 ? 1920 : 1080}
				height={n === 1 ? 1080 : 1920}
				fps={30}
				durationInFrames={30}
				defaultProps={{video: n, vertical: n !== 1, parts: [], duration: 1, segments: [], music: {file: 'piano-reflections', offset: 0}}}
				calculateMetadata={calculateAdMetadata}
			/>
		))}
		{/* Project: VibeLevel Screening demo v2 (projects/vibelevel-v2). */}
		<Composition
			id="VibeLevelV2"
			component={VibeLevelDemo}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={30}
			defaultProps={{parts: [], duration: 1, segments: [], musicOffset: 0}}
			calculateMetadata={calculateDemoMetadata}
		/>
		{/* Project: VibeLevel Screening demo v3, 90 s (projects/vibelevel-v3). */}
		<Composition
			id="VibeLevelV3"
			component={VibeLevelDemo3}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={30}
			defaultProps={{parts: [], duration: 1, segments: [], musicOffset: 0}}
			calculateMetadata={calculateDemo3Metadata}
		/>
		{/* Project: VibeLevel Screening demo v4 — master-prompt structure (projects/vibelevel-v4). */}
		<Composition
			id="VibeLevelV4"
			component={VibeLevelDemo4}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={30}
			defaultProps={{parts: [], duration: 1, segments: [], musicOffset: 4.5}}
			calculateMetadata={calculateDemo4Metadata}
		/>
	</>
);
