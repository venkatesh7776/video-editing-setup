// Scenes built on genuine VibeLevel UI captures (scenes 3–7). Camera focal points
// are fractions of each capture; see projects/vibelevel-screening/screenshot-map.md.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {fonts, palette} from './brand';
import {AnimatedLogo, Quadrants} from './BrandScenes';
import {TASK_RECT, TaskCard} from './ProblemScene';
import type {SceneCtx} from './context';
import {mix, prog} from './motion';
import {CoreSkillsUI, WorkingWithAIUI} from './ReportUI';
import {CARD, Shot, ShotSequence, type ShotItem} from './Shot';

const Backdrop: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{background: `radial-gradient(1300px 760px at 12% 8%, #DDF3E5 0%, transparent 60%), radial-gradient(1100px 700px at 92% 100%, #E2F3EA 0%, transparent 55%), ${palette.page}`}}>{children}</AbsoluteFill>
);

// Report crops (r-*) are wider than the card: show their full width and pan vertically.
const REPORT_BG = '#F4F6F5';
const shot = (ctx: SceneCtx, name: string, props: Omit<React.ComponentProps<typeof Shot>, 't' | 'src' | 'w' | 'h'>) => {
	const i = ctx.img(name);
	const report = name.startsWith('r-') ? {fit: 'width' as const, fillColor: REPORT_BG} : {};
	return <Shot t={ctx.t} src={i.src} w={i.w} h={i.h} {...report} {...props} />;
};

// ─── Scene 3: logo → landing page → four dimensions ──────────────────────────
export const Intro: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const {t, scene, beat, img} = ctx;
	const logoAt = beat('VibeLevel Screening (logo)');
	const tasks = beat('realistic, role-specific tasks');
	const grid = beat('four dimensions') - 0.45;
	const heroFrom = logoAt + 1.9;
	const items: ShotItem[] = [
		{from: scene.start, to: heroFrom, render: (tt) => <TaskToProduct t={tt} start={scene.start} logoAt={logoAt} img={img} />},
		{
			from: heroFrom,
			to: tasks + 0.9,
			fade: 0.35,
			render: () => (
				<Backdrop>
					{shot(ctx, 'landing-hero', {
						fit: 'contain',
						keys: [
							{t: heroFrom, x: 0.5, y: 0.5, z: 1.0},
							{t: tasks - 0.2, x: 0.36, y: 0.3, z: 1.55},
						],
					})}
				</Backdrop>
			),
		},
		{
			from: tasks + 0.9,
			to: grid,
			fade: 0.35,
			render: () => (
				<Backdrop>
					{shot(ctx, 'landing-tasks', {
						fit: 'contain',
						keys: [
							{t: tasks + 0.9, x: 0.5, y: 0.45, z: 1.15},
							{t: grid, x: 0.4, y: 0.62, z: 1.3},
						],
						boxes: [{from: tasks + 1.6, to: grid + 1, x: 0.1, y: 0.705, w: 0.37, h: 0.045}],
					})}
				</Backdrop>
			),
		},
		{from: grid, to: scene.end + 0.4, fade: 0.4, render: () => <Quadrants ctx={ctx} from={grid} />},
	];
	return <ShotSequence t={t} items={items} />;
};

/**
 * Scene 2 opening (v7): picks up scene 1's illustrated task card at the same position, turns it
 * into the real candidate workspace (genuine product screenshot) and grows it, while the
 * VibeLevel Screening logo animates in above. Clean navy background, no patterns behind the logo.
 */
const TaskToProduct: React.FC<{t: number; start: number; logoAt: number; img: SceneCtx['img']}> = ({t, start, logoAt, img}) => {
	const ws = img('workspace');
	const swap = prog(t, start + 0.25, 0.6); // illustration → real UI
	const grow = prog(t, start + 0.35, 1.1);
	const END = {x: 330, y: 380, w: 1260, h: 560};
	const r = {x: mix(TASK_RECT.x, END.x, grow), y: mix(TASK_RECT.y, END.y, grow), w: mix(TASK_RECT.w, END.w, grow), h: mix(TASK_RECT.h, END.h, grow)};
	return (
		<AbsoluteFill style={{background: `radial-gradient(1300px 760px at 70% 40%, #0B3A26 0%, ${palette.dark} 68%)`}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center'}}>
				<AnimatedLogo t={t} at={logoAt - 0.2} width={640} star={img('logo-star')} word={img('logo-word')} subSize={64} />
			</div>
			<div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 26, overflow: 'hidden', background: '#0B1A12', border: '2px solid rgba(0,230,118,0.45)', boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(0,230,118,0.18)'}}>
				<div style={{position: 'absolute', left: 0, top: 0, width: TASK_RECT.w, height: TASK_RECT.h, opacity: 1 - swap, transform: `scale(${r.w / TASK_RECT.w}, ${r.h / TASK_RECT.h})`, transformOrigin: 'left top'}}>
					<TaskCard t={t} at={-100} ai={-100} tests={-100} />
				</div>
				<Img src={staticFile(ws.src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%', opacity: swap}} />
			</div>
		</AbsoluteFill>
	);
};

// ─── Scene 4: assessment creation & ATS ──────────────────────────────────────
export const Create: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const {t, scene, beat} = ctx;
	const tpl = beat('ready-made template');
	const role = beat('role requirements');
	const ai = beat('use AI to build one');
	const desc = beat('describing what you need');
	const ats = beat('Lever or Ashby');
	const flow = beat('existing hiring workflow');
	const items: ShotItem[] = [
		{
			from: scene.start,
			to: tpl - 0.1,
			render: () =>
				shot(ctx, 'app-create-crop', {
					tag: 'Create an assessment',
					keys: [
						{t: scene.start, x: 0.5, y: 0.45, z: 1.0},
						{t: tpl - 0.6, x: 0.75, y: 0.25, z: 1.3},
					],
					boxes: [{from: tpl - 1.2, to: tpl, x: 0.686, y: 0.206, w: 0.296, h: 0.086, label: 'From Template'}],
				}),
		},
		{
			from: tpl - 0.1,
			to: role - 0.1,
			render: () =>
				shot(ctx, 'app-role-picker', {
					tag: 'Ready-made templates',
					keys: [
						{t: tpl - 0.1, x: 0.5, y: 0.3, z: 1.35},
						{t: role - 0.3, x: 0.62, y: 0.3, z: 1.75},
					],
					boxes: [{from: tpl + 0.6, to: role, x: 0.672, y: 0.215, w: 0.155, h: 0.12}],
				}),
		},
		{
			from: role - 0.1,
			to: ai - 0.1,
			render: () =>
				shot(ctx, 'app-refine-role-selected', {
					tag: 'Customised to the role',
					keys: [
						{t: role - 0.1, x: 0.5, y: 0.3, z: 1.35},
						{t: ai - 0.2, x: 0.5, y: 0.33, z: 1.6},
					],
					boxes: [
						{from: role + 0.2, to: ai, x: 0.365, y: 0.21, w: 0.135, h: 0.09},
						{from: role + 0.6, to: ai, x: 0.233, y: 0.35, w: 0.42, h: 0.045},
					],
				}),
		},
		{
			from: ai - 0.1,
			to: ai + 1.15,
			render: () =>
				shot(ctx, 'app-create-crop', {
					tag: 'Or build with AI',
					keys: [
						{t: ai - 0.1, x: 0.75, y: 0.29, z: 1.12},
						{t: ai + 1.1, x: 0.77, y: 0.3, z: 1.34},
					],
					boxes: [{from: ai + 0.1, to: ai + 1.2, x: 0.686, y: 0.292, w: 0.296, h: 0.086, label: 'From AI'}],
				}),
		},
		{
			from: ai + 1.15,
			to: desc - 0.1,
			render: () =>
				shot(ctx, 'app-ai-builder', {
					tag: 'Assessment Builder',
					keys: [
						{t: ai + 1.15, x: 0.5, y: 0.45, z: 1.55},
						{t: desc - 0.2, x: 0.5, y: 0.42, z: 1.9},
					],
				}),
		},
		{
			from: desc - 0.1,
			to: ats - 0.3,
			render: () => (
				<Backdrop>
					{shot(ctx, 'site-ai-builder', {
						fit: 'contain',
						tag: 'Describe what you need',
						keys: [
							{t: desc - 0.1, x: 0.68, y: 0.5, z: 2.1},
							{t: ats - 0.4, x: 0.48, y: 0.6, z: 2.0},
						],
					})}
				</Backdrop>
			),
		},
		{
			from: ats - 0.3,
			to: scene.end + 0.4,
			render: () => (
				<Backdrop>
					{shot(ctx, 'site-ats', {
						fit: 'contain',
						tag: 'ATS integrations',
						keys: [
							{t: ats - 0.3, x: 0.5, y: 0.58, z: 1.75},
							{t: flow - 0.2, x: 0.5, y: 0.55, z: 1.7},
							{t: scene.end, x: 0.5, y: 0.5, z: 1.45},
						],
					})}
				</Backdrop>
			),
		},
	];
	return (
		<Backdrop>
			<ShotSequence t={t} items={items} />
		</Backdrop>
	);
};

// ─── Scene 5: candidate workspace ────────────────────────────────────────────
export const Candidate: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const {scene, beat} = ctx;
	const tasks = beat('realistic, role-specific tasks');
	const ws = beat('dedicated workspace');
	const cc = beat('Claude Code built in');
	const work = beat('work with AI to solve problems');
	const beyond = beat('looks beyond the final result');
	const tools = beat('AI coding tools');
	const toolBeats = [
		['Claude Code', beat('Claude Code built in')],
		['Codex', beat('Codex')],
		['GitHub Copilot', beat('GitHub Copilot')],
	] as const;
	const callout = prog(ctx.t, tools - 0.15, 0.45) * (1 - prog(ctx.t, work + 0.6, 0.4));
	return (
		<Backdrop>
			{shot(ctx, 'workspace', {
				tag: 'Candidate workspace',
				enterAt: scene.start,
				keys: [
					{t: scene.start, x: 0.5, y: 0.5, z: 1.0},
					{t: tasks + 0.3, x: 0.25, y: 0.45, z: 1.22},
					{t: ws - 0.2, x: 0.27, y: 0.46, z: 1.24},
					{t: ws + 0.9, x: 0.5, y: 0.45, z: 1.05},
					{t: cc + 0.2, x: 0.76, y: 0.3, z: 1.24},
					{t: work - 0.1, x: 0.76, y: 0.35, z: 1.24},
					{t: work + 2.2, x: 0.76, y: 0.62, z: 1.24},
					{t: beyond + 0.2, x: 0.6, y: 0.55, z: 1.15},
					{t: beyond + 1.8, x: 0.5, y: 0.5, z: 1.0},
				],
				boxes: [
					{from: tasks + 0.3, to: ws + 0.4, x: 0.005, y: 0.085, w: 0.57, h: 0.25, label: 'The task'},
					{from: cc - 0.1, to: work + 0.8, x: 0.584, y: 0.06, w: 0.413, h: 0.92},
				],
			})}
			{callout > 0 ? (
				<div style={{position: 'absolute', left: CARD.x + 40, top: CARD.y + CARD.h - 220, width: 860, padding: '26px 32px', borderRadius: 22, background: palette.dark, boxShadow: '0 24px 60px rgba(5,12,8,0.35)', opacity: callout, transform: `translateY(${(1 - callout) * 30}px)`}}>
					<div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: palette.neon}}>AI CODING TOOLS, BUILT IN</div>
					<div style={{display: 'flex', gap: 30, marginTop: 16}}>
						{toolBeats.map(([name, at]) => {
							const o = prog(ctx.t, at - 0.1, 0.35);
							return (
								<div key={name} style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 36, whiteSpace: 'nowrap', color: '#fff', opacity: mix(0.25, 1, o), transform: `translateY(${(1 - o) * 10}px)`}}>
									{name}
								</div>
							);
						})}
						<div style={{fontFamily: fonts.heading, fontWeight: 600, fontSize: 36, whiteSpace: 'nowrap', color: palette.neon, opacity: mix(0.25, 1, prog(ctx.t, beat('and more') - 0.1, 0.35))}}>& more</div>
					</div>
				</div>
			) : null}
		</Backdrop>
	);
};

// ─── Scene 6: Core Skills & Working with AI (brand-built panels, real report values) ─
export const SkillsAI: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const {t, scene, beat} = ctx;
	const wwai = beat('Working with AI') - 0.35;
	const items: ShotItem[] = [
		{from: scene.start, to: wwai, render: () => <CoreSkillsUI ctx={ctx} from={scene.start + 0.1} />},
		{from: wwai, to: scene.end + 0.4, fade: 0.4, render: () => <WorkingWithAIUI ctx={ctx} from={wwai} />},
	];
	return <ShotSequence t={t} items={items} />;
};

// ─── Scene 7: Ownership, Human Contribution & the report ─────────────────────
const WALL = ['r-overview', 'r-core-skills', 'r-wwai', 'r-code-review', 'r-video-qa', 'r-interview'];

export const Report: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const {t, scene, beat} = ctx;
	const report = beat('assessment report brings together');
	const scores = beat('skill scores');
	const collab = beat('AI collaboration insights');
	const review = beat('Code Review');
	const vqa = beat('Video Q&A');
	const guide = beat('Interview Guide');
	const follow = beat('follow-up questions');
	const wallAt = scene.end - 0.95;
	const items: ShotItem[] = [
		{
			from: scene.start,
			to: scores - 0.1,
			render: () =>
				shot(ctx, 'r-overview', {
					tag: 'Assessment report',
					keys: [
						{t: report - 0.2, x: 0.5, y: 0.2, z: 1.08},
						{t: scores - 0.1, x: 0.5, y: 0.35, z: 1.0},
					],
				}),
		},
		{
			from: scores - 0.1,
			to: collab - 0.1,
			render: () => shot(ctx, 'r-scores', {tag: 'Skill scores', keys: [{t: scores - 0.1, x: 0.5, y: 0.42, z: 1.0}, {t: collab, x: 0.5, y: 0.45, z: 1.06}]}),
		},
		{
			from: collab - 0.1,
			to: review - 0.1,
			render: () => shot(ctx, 'r-wwai', {tag: 'AI collaboration insights', keys: [{t: collab - 0.1, x: 0.5, y: 0.3, z: 1.0}, {t: review, x: 0.5, y: 0.5, z: 1.04}]}),
		},
		{
			from: review - 0.1,
			to: vqa - 0.1,
			render: () => shot(ctx, 'r-code-review', {tag: 'Code Review', keys: [{t: review - 0.1, x: 0.5, y: 0.15, z: 1.0}, {t: vqa, x: 0.5, y: 0.3, z: 1.05}]}),
		},
		{
			from: vqa - 0.1,
			to: guide - 0.1,
			render: () => shot(ctx, 'r-video-qa', {tag: 'Video Q&A', keys: [{t: vqa - 0.1, x: 0.5, y: 0.2, z: 1.0}, {t: guide, x: 0.5, y: 0.45, z: 1.05}]}),
		},
		{
			from: guide - 0.1,
			to: follow - 0.2,
			render: () => shot(ctx, 'r-interview', {tag: 'Interview Guide', keys: [{t: guide - 0.1, x: 0.5, y: 0.2, z: 1.0}, {t: follow, x: 0.5, y: 0.35, z: 1.05}]}),
		},
		{
			from: follow - 0.2,
			to: wallAt,
			render: () =>
				shot(ctx, 'r-probes', {
					tag: 'Focused follow-up questions',
					keys: [{t: follow - 0.2, x: 0.5, y: 0.4, z: 1.0}, {t: wallAt, x: 0.5, y: 0.5, z: 1.06}],
				}),
		},
		{from: wallAt, to: scene.end + 0.5, fade: 0.25, render: (tt) => <CardWall ctx={ctx} t={tt} from={wallAt} />},
	];
	return (
		<Backdrop>
			<ShotSequence t={t} items={items} />
		</Backdrop>
	);
};

/** Pull back into a tilted wall of the report's sections, then rush past it into the next scene. */
const CardWall: React.FC<{ctx: SceneCtx; t: number; from: number}> = ({ctx, t, from}) => {
	const p = prog(t, from, 1.4);
	const rush = prog(t, from + 0.7, 0.8);
	return (
		<AbsoluteFill style={{background: palette.dark, perspective: 1800, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, transform: `rotateX(${mix(0, 28, p)}deg) rotateZ(${mix(0, -10, p)}deg) translateY(${mix(0, -900, rush)}px) scale(${mix(1, 0.62, p)})`, filter: `blur(${rush * 6}px)`}}>
				{WALL.map((name, i) => {
					const im = ctx.img(name);
					const col = (i % 3) - 1;
					const row = Math.floor(i / 3);
					const w = 760;
					return (
						<Img key={name} src={staticFile(im.src)} style={{position: 'absolute', left: col * 820 - w / 2, top: row * 500 - 470, width: w, height: 460, objectFit: 'cover', objectPosition: 'top', borderRadius: 22, boxShadow: '0 30px 70px rgba(0,0,0,0.45)', opacity: mix(0.4, 1, prog(t, from + i * 0.05, 0.4))}} />
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
