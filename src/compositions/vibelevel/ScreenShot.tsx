// A product screenshot shown in a browser window, with a scripted camera
// (pan/zoom), an animated cursor with clicks, and highlight boxes.
// All x/y values are in screenshot pixels; `at` values are frames within the scene.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from './brand';

export type CameraKey = {at: number; x: number; y: number; zoom: number};
export type CursorKey = {at: number; x: number; y: number; click?: boolean};
export type HighlightBox = {from: number; to: number; x: number; y: number; w: number; h: number; label?: string};

type Props = {
	src: string;
	imgW: number;
	imgH: number;
	url: string;
	camera: CameraKey[];
	cursor?: CursorKey[];
	boxes?: HighlightBox[];
	children?: React.ReactNode;
};

// Browser window geometry (in the 1920×1080 frame).
const FW = 1600;
const BAR = 46;
const VH = 900;
const FX = (1920 - FW) / 2;
const FY = 30;
const BASE = FW / 1920; // screenshot scale at zoom 1

const ease = Easing.inOut(Easing.cubic);

const interpKeys = <T extends {at: number}>(keys: T[], frame: number, fields: (keyof T)[]) => {
	const out = {} as Record<keyof T, number>;
	for (const f of fields) {
		if (keys.length === 1) {
			out[f] = keys[0][f] as number;
			continue;
		}
		out[f] = interpolate(frame, keys.map((k) => k.at), keys.map((k) => k[f] as number), {
			easing: ease,
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	}
	return out;
};

export const ScreenShot: React.FC<Props> = ({src, imgW, imgH, url, camera, cursor, boxes, children}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const cam = interpKeys(camera, frame, ['x', 'y', 'zoom']);
	const s = BASE * cam.zoom;
	// Keep the screenshot covering the viewport (no empty edges).
	const left = Math.min(0, Math.max(FW - imgW * s, FW / 2 - cam.x * s));
	const top = Math.min(0, Math.max(VH - imgH * s, VH / 2 - cam.y * s));
	const toScreen = (x: number, y: number) => ({x: left + x * s, y: top + y * s});

	const enter = spring({frame, fps, config: {damping: 200}, durationInFrames: 18});

	return (
		<AbsoluteFill style={{background: `radial-gradient(1200px 700px at 15% 10%, #DDF3E5 0%, transparent 60%), radial-gradient(1000px 700px at 90% 100%, #E8E4FB 0%, transparent 55%), ${colors.page}`}}>
			<div
				style={{
					position: 'absolute',
					left: FX,
					top: FY,
					width: FW,
					height: BAR + VH,
					borderRadius: 18,
					overflow: 'hidden',
					background: colors.white,
					boxShadow: '0 30px 80px rgba(14,59,43,0.18), 0 2px 8px rgba(14,59,43,0.08)',
					border: `1px solid ${colors.line}`,
					transform: `translateY(${(1 - enter) * 30}px) scale(${0.97 + 0.03 * enter})`,
				}}
			>
				{/* Browser chrome */}
				<div style={{height: BAR, display: 'flex', alignItems: 'center', gap: 9, padding: '0 18px', background: '#F7F9F8', borderBottom: `1px solid ${colors.line}`}}>
					{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
						<div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
					))}
					<div style={{marginLeft: 24, flex: 1, maxWidth: 620, height: 28, borderRadius: 8, background: colors.white, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontFamily: fonts.body, fontSize: 16, color: colors.muted}}>
						<span style={{color: colors.green, marginRight: 8}}>●</span>
						{url}
					</div>
				</div>
				{/* Viewport */}
				<div style={{position: 'relative', width: FW, height: VH, overflow: 'hidden'}}>
					<Img src={staticFile(src)} style={{position: 'absolute', left, top, width: imgW * s, height: imgH * s, maxWidth: 'none'}} />
					{boxes?.map((b, i) => <Box key={i} box={b} frame={frame} fps={fps} toScreen={toScreen} s={s} />)}
					{cursor?.length ? <Cursor keys={cursor} frame={frame} toScreen={toScreen} /> : null}
				</div>
			</div>
			{children}
		</AbsoluteFill>
	);
};

const Box: React.FC<{
	box: HighlightBox;
	frame: number;
	fps: number;
	s: number;
	toScreen: (x: number, y: number) => {x: number; y: number};
}> = ({box, frame, fps, toScreen, s}) => {
	if (frame < box.from || frame > box.to + 10) return null;
	const inn = spring({frame: frame - box.from, fps, config: {damping: 14, stiffness: 140}});
	const out = interpolate(frame, [box.to, box.to + 10], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const p = toScreen(box.x, box.y);
	const pad = 8;
	return (
		<div
			style={{
				position: 'absolute',
				left: p.x - pad,
				top: p.y - pad,
				width: box.w * s + pad * 2,
				height: box.h * s + pad * 2,
				border: `4px solid ${colors.neon}`,
				borderRadius: 14,
				boxShadow: `0 0 0 6px rgba(0,230,118,0.18), 0 0 40px rgba(0,230,118,0.35)`,
				opacity: Math.min(inn, out),
				transform: `scale(${1.08 - 0.08 * inn})`,
			}}
		>
			{box.label ? (
				<div style={{position: 'absolute', top: -46, left: -4, background: colors.greenDeep, color: colors.neon, fontFamily: fonts.heading, fontWeight: 700, fontSize: 20, padding: '6px 14px', borderRadius: 8, whiteSpace: 'nowrap', letterSpacing: 0.5}}>
					{box.label}
				</div>
			) : null}
		</div>
	);
};

const Cursor: React.FC<{keys: CursorKey[]; frame: number; toScreen: (x: number, y: number) => {x: number; y: number}}> = ({keys, frame, toScreen}) => {
	const pos = interpKeys(keys, frame, ['x', 'y']);
	const p = toScreen(pos.x, pos.y);
	const clicks = keys.filter((k) => k.click);
	const recent = clicks.map((k) => frame - k.at).filter((d) => d >= 0 && d < 18);
	const press = clicks.some((k) => Math.abs(frame - k.at) < 4) ? 0.85 : 1;
	const appear = interpolate(frame, [keys[0].at - 8, keys[0].at], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<>
			{recent.map((d, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: p.x - 30,
						top: p.y - 30,
						width: 60,
						height: 60,
						borderRadius: 30,
						border: `4px solid ${colors.green}`,
						opacity: 1 - d / 18,
						transform: `scale(${0.3 + d / 12})`,
					}}
				/>
			))}
			<svg
				width={34}
				height={34}
				viewBox="0 0 24 24"
				style={{position: 'absolute', left: p.x - 4, top: p.y - 2, opacity: appear, transform: `scale(${press})`, transformOrigin: '4px 2px', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.35))'}}
			>
				<path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.7 L11.6 14 L18 14 Z" fill="#111" stroke="white" strokeWidth={1.6} strokeLinejoin="round" />
			</svg>
		</>
	);
};
