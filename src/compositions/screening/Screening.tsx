// "VibeLevel Screening" product demo (16:9, ~1:55). Timing comes from the real
// voiceover (props.timing, built by projects/vibelevel-screening/build.mjs).
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';
import {fonts, palette} from './brand';
import {Close, LogoCTA, Outcome} from './BrandScenes';
import {Exhibit} from './Exhibit';
import {BrandLogo} from './Logo';
import {makeBeat, type SceneCtx} from './context';
import {prog} from './motion';
import {Problem} from './ProblemScene';
import {OwnershipScene} from './ReportUI';
import {Candidate, Create, Intro, Report, SkillsAI} from './ProductScenes';
import type {Cue, ScreeningProps, SceneTiming, Timing} from './types';

const FPS = 30;
const OVERLAP = 0.4; // seconds each scene stays under the next one while it fades in

export const calculateScreeningMetadata: CalculateMetadataFunction<ScreeningProps> = ({props}) => ({
	fps: FPS,
	width: 1920,
	height: 1080,
	durationInFrames: props.timing ? Math.ceil(props.timing.duration * FPS) : 150,
});

const RENDERERS: Record<string, React.FC<{ctx: SceneCtx}>> = {
	's1-problem': Problem,
	's3-intro': Intro,
	// Scenes 4–9 (revised order): candidate → skills/AI → ownership → creation/ATS → report → outcome.
	'n4-candidate': Candidate,
	'n5-skills': SkillsAI,
	'n6-ownership': OwnershipScene,
	'n7-create': Create,
	'n8-report': Report,
	'n9-outcome': Outcome,
	's9-close': Close,
	's10-cta': LogoCTA,
	's10-exhibit': Exhibit,
};
// Scenes that cut in instead of cross-fading. Scene 2 is a match-cut: it starts with scene 1's
// task card at the identical position.
const HARD_CUT = new Set(['s3-intro']);

export const Screening: React.FC<ScreeningProps> = ({timing, images, cues, musicOffset = 0, muteVoice = false, muteSfx = false}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (!timing) return <AbsoluteFill style={{background: palette.dark}} />;
	const img = (name: string) => {
		const i = images[name];
		if (!i) throw new Error(`Image "${name}" not staged`);
		return i;
	};

	return (
		<AbsoluteFill style={{background: palette.dark}}>
			{timing.scenes.map((scene) => {
				if (t < scene.start || t > scene.end + OVERLAP) return null;
				const Comp = RENDERERS[scene.id];
				const ctx: SceneCtx = {t, scene, img, beat: makeBeat(scene)};
				const o = HARD_CUT.has(scene.id) || scene.start === 0 ? 1 : prog(t, scene.start, OVERLAP);
				return (
					<AbsoluteFill key={scene.id} style={{opacity: o}}>
						<Comp ctx={ctx} />
					</AbsoluteFill>
				);
			})}
			<CornerLogo t={t} timing={timing} img={img} />
			<Subtitles t={t} cues={cues} />
			<Soundtrack timing={timing} musicOffset={musicOffset} muteVoice={muteVoice} muteSfx={muteSfx} />
		</AbsoluteFill>
	);
};

/** Small vibelevel.ai logo, top-right throughout. Hidden while a full-size logo is on screen
 * (scene 2's reveal and the closing CTA). */
const CornerLogo: React.FC<{t: number; timing: Timing; img: (n: string) => {src: string; w: number; h: number}}> = ({t, timing, img}) => {
	const by = (id: string) => timing.scenes.find((s) => s.id === id);
	const intro = by('s3-intro') as SceneTiming;
	const logoEnd = makeBeat(intro)('VibeLevel Screening (logo)') + 1.9; // end of the scene 2 logo reveal
	const cta = by('s10-cta');
	const problem = by('s1-problem');
	const climaxAt = problem ? makeBeat(problem)('But neither') : -1; // the full-width climax headline needs the top row
	const on = Math.min(prog(t, 0.3, 0.4), 1 - prog(t, climaxAt - 0.2, 0.25) + prog(t, logoEnd, 0.4), 1 - prog(t, intro.start - 0.2, 0.2) + prog(t, logoEnd, 0.4), cta ? 1 - prog(t, cta.start - 0.3, 0.3) : 1);
	if (on <= 0) return null;
	return <BrandLogo h={38} star={img('logo-star')} word={img('logo-word')} style={{position: 'absolute', right: 160, top: 32, opacity: on}} />;
};

const Subtitles: React.FC<{t: number; cues: Cue[]}> = ({t, cues}) => {
	const cue = cues.find((c) => t >= c.start && t < c.end);
	if (!cue) return null;
	const o = Math.min(prog(t, cue.start, 0.12), 1 - prog(t, cue.end - 0.1, 0.1));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 30, display: 'flex', justifyContent: 'center', opacity: o}}>
			<div style={{maxWidth: 1500, padding: '14px 36px', borderRadius: 16, background: 'rgba(5,12,8,0.92)', color: '#fff', fontFamily: fonts.subtitle, fontWeight: 700, fontSize: 44, lineHeight: 1.25, letterSpacing: 0.2, textAlign: 'center', boxShadow: '0 8px 30px rgba(5,12,8,0.35)', WebkitFontSmoothing: 'antialiased'}}>{cue.text}</div>
		</div>
	);
};

// ─── Audio ───────────────────────────────────────────────────────────────────
type Sfx = {t: number; name: string; vol: number; dur?: number};

const sfxCues = (timing: Timing): Sfx[] => {
	const by = (id: string) => timing.scenes.find((s) => s.id === id) as SceneTiming;
	const b = (id: string, label: string) => makeBeat(by(id))(label);
	const out: Sfx[] = [];
	const add = (t: number, name: string, vol = 0.22, dur?: number) => out.push({t, name, vol: vol * 0.56, dur}); // ≈ -5 dB trim
	// Scene 1 (problem): soft pops on the headlines, a slide as each illustration enters, an accent on the climax.
	add(0.05, 'whoosh-air', 0.14);
	for (const l of ["what they've done", 'how they present']) add(b('s1-problem', l) - 0.1, 'text-pop', 0.2);
	add(b('s1-problem', 'Interviews') - 0.25, 'tech-slide', 0.16);
	add(b('s1-problem', 'But neither') - 0.15, 'tech-slide', 0.18);
	add(b('s1-problem', 'how they perform') - 0.3, 'ui-click', 0.14);
	add(b('s1-problem', 'when the work gets real') - 0.2, 'text-pop', 0.3);
	for (const k of [0, 1, 2]) add(b('s1-problem', 'when the work gets real') + 0.1 + k * 0.3, 'ui-click', 0.12);
	add(b('s3-intro', 'VibeLevel Screening (logo)') - 0.95, 'logo-sweep', 0.26, 3);
	for (const l of ['Core Skills', 'Working with AI', 'Ownership', 'Human Contribution']) add(b('s3-intro', l) - 0.05, 'ui-click', 0.2);
	add(b('n4-candidate', 'Claude Code built in') - 0.1, 'whoosh-air', 0.16);
	for (const l of ['guide AI', 'evaluate its suggestions', 'verify its output']) add(b('n5-skills', l) - 0.1, 'ui-click', 0.16);
	add(b('n6-ownership', 'Ownership') - 0.3, 'tech-slide', 0.16);
	for (const l of ['ready-made template', 'role requirements', 'use AI to build one', 'Lever or Ashby']) add(b('n7-create', l) - 0.15, 'ui-zoom-in', 0.14);
	for (const l of ['skill scores', 'AI collaboration insights', 'Code Review', 'Video Q&A', 'Interview Guide']) add(b('n8-report', l) - 0.15, 'ui-zoom-in', 0.12);
	add(by('n8-report').end - 0.9, 'whoosh-transition', 0.22);
	for (const l of ['clearer view', 'Identify strengths', 'Build a shortlist backed by evidence']) add(b('n9-outcome', l) - 0.05, 'text-pop', 0.18);
	if (timing.scenes.some((s) => s.id === 's10-cta')) {
		add(b('s10-cta', 'VibeLevel Screening') - 1.0, 'logo-sweep', 0.26, 3);
		add(b('s10-cta', 'Book a demo') - 0.05, 'ui-click', 0.2);
	} else {
		add(b('s10-exhibit', 'Booth SU80') - 0.9, 'logo-sweep', 0.26, 3);
		add(b('s10-exhibit', 'HR Tech') - 0.3, 'tech-slide', 0.18);
	}
	return out;
};

const Soundtrack: React.FC<{timing: Timing; musicOffset: number; muteVoice: boolean; muteSfx: boolean}> = ({timing, musicOffset, muteVoice, muteSfx}) => {
	const spans = timing.scenes.filter((s) => s.voDuration > 0).map((s) => [s.voStart, s.voStart + s.voDuration] as const);
	const total = timing.duration;
	// Music sits well under the voice (user feedback: it was dominating). Measured with
	// mix QA renders: ≈20 dB below the narration while speaking, ~-19 dB in gaps, 0.3 s ramps.
	const musicVol = (f: number) => {
		const t = f / FPS;
		const speaking = Math.max(...spans.map(([a, b]) => Math.min(prog(t, a - 0.3, 0.3), 1 - prog(t, b, 0.4))), 0);
		const level = 0.11 - 0.081 * speaking;
		const fade = Math.min(prog(t, 0, 0.4), 1 - prog(t, total - 3, 3));
		return level * fade;
	};
	return (
		<>
			<Audio src={staticFile('screening/music.mp3')} startFrom={Math.round(musicOffset * FPS)} volume={musicVol} />
			{timing.scenes.filter((s) => s.voDuration > 0).map((s) => (
				<Sequence key={s.id} from={Math.round(s.voStart * FPS)} durationInFrames={Math.ceil(s.voDuration * FPS) + 6}>
					<Audio src={staticFile(`screening/vo/${s.id}.wav`)} volume={muteVoice ? 0 : 1.58} />
				</Sequence>
			))}
			{(muteSfx ? [] : sfxCues(timing)).map((c, i) => (
				<Sequence key={i} from={Math.max(0, Math.round(c.t * FPS))} durationInFrames={Math.round((c.dur ?? 2.5) * FPS)}>
					<Audio src={staticFile(`screening/sfx/${c.name}.mp3`)} volume={(f) => c.vol * interpolate(f, [((c.dur ?? 2.5) - 0.5) * FPS, (c.dur ?? 2.5) * FPS], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
				</Sequence>
			))}
		</>
	);
};
