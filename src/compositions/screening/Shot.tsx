// A genuine product capture in a rounded card, with a keyframed camera
// (push-in / pan / pull-out) and optional highlight boxes. Coordinates are
// fractions of the image, so captures can be swapped at any resolution.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {captureBg, fonts, palette} from './brand';
import {camAt, prog, type Key} from './motion';

export type HighlightBox = {from: number; to: number; x: number; y: number; w: number; h: number; label?: string};

export type ShotProps = {
	t: number;
	src: string; // path under work/public
	w: number; // image pixel size
	h: number;
	keys: Key[];
	boxes?: HighlightBox[];
	/** cover = fill the card (crop edges); contain = fit inside; width = full width, pan vertically (report pages). */
	fit?: 'cover' | 'contain' | 'width';
	tag?: string;
	enterAt?: number;
	fillColor?: string;
};

// Card geometry in the 1920×1080 frame; leaves room for subtitles below.
export const CARD = {x: 160, y: 100, w: 1600, h: 846, r: 26};

export const Shot: React.FC<ShotProps> = ({t, src, w, h, keys, boxes, fit = 'cover', tag, enterAt, fillColor = captureBg}) => {
	const cam = camAt(keys, t);
	const base = fit === 'width' ? CARD.w / w : fit === 'cover' ? Math.max(CARD.w / w, CARD.h / h) : Math.min(CARD.w / w, CARD.h / h);
	const s = base * cam.z;
	const iw = w * s;
	const ih = h * s;
	// Centre the focal point, but never reveal empty space when the image is larger than the card.
	const place = (view: number, size: number, focal: number) =>
		size <= view ? (view - size) / 2 : Math.min(0, Math.max(view - size, view / 2 - focal * size));
	const left = place(CARD.w, iw, cam.x);
	const top = place(CARD.h, ih, cam.y);
	const enter = enterAt === undefined ? 1 : prog(t, enterAt, 0.5);

	return (
		<AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					left: CARD.x,
					top: CARD.y,
					width: CARD.w,
					height: CARD.h,
					borderRadius: CARD.r,
					overflow: 'hidden',
					background: fillColor,
					boxShadow: '0 40px 90px rgba(5,12,8,0.22), 0 4px 14px rgba(5,12,8,0.10)',
					transform: `translateY(${(1 - enter) * 40}px) scale(${0.96 + 0.04 * enter})`,
				}}
			>
				<Img src={staticFile(src)} style={{position: 'absolute', left, top, width: iw, height: ih, maxWidth: 'none'}} />
				{boxes?.map((b, i) => {
					const on = prog(t, b.from, 0.35) * (1 - prog(t, b.to, 0.25));
					if (on <= 0) return null;
					const pad = 10;
					// Labels sit above the box, or below it when the box is near the card's top edge.
					const labelBelow = top + b.y * ih - pad < 90;
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: left + b.x * iw - pad,
								top: top + b.y * ih - pad,
								width: b.w * iw + pad * 2,
								height: b.h * ih + pad * 2,
								borderRadius: 16,
								border: `4px solid ${palette.neon}`,
								boxShadow: '0 0 0 8px rgba(0,230,118,0.16), 0 0 44px rgba(0,230,118,0.30)',
								opacity: on,
								transform: `scale(${1.04 - 0.04 * on})`,
							}}
						>
							{b.label ? (
								<div style={{position: 'absolute', ...(labelBelow ? {bottom: -52} : {top: -52}), left: -4, background: palette.dark, color: palette.neon, fontFamily: fonts.heading, fontWeight: 700, fontSize: 24, padding: '8px 16px', borderRadius: 10, whiteSpace: 'nowrap'}}>
									{b.label}
								</div>
							) : null}
						</div>
					);
				})}
				{tag ? <Tag text={tag} /> : null}
			</div>
		</AbsoluteFill>
	);
};

export const Tag: React.FC<{text: string}> = ({text}) => (
	<div
		style={{
			position: 'absolute',
			left: 28,
			top: 26,
			padding: '10px 20px',
			borderRadius: 999,
			background: palette.dark,
			color: '#fff',
			fontFamily: fonts.heading,
			fontWeight: 700,
			fontSize: 24,
			letterSpacing: 0.4,
			display: 'flex',
			alignItems: 'center',
			gap: 10,
			boxShadow: '0 8px 24px rgba(5,12,8,0.25)',
		}}
	>
		<span style={{width: 10, height: 10, borderRadius: 5, background: palette.neon}} />
		{text}
	</div>
);

/** Plays a list of shots back to back, cross-fading each one in. */
export type ShotItem = {from: number; to: number; fade?: number; render: (t: number) => React.ReactNode};

export const ShotSequence: React.FC<{t: number; items: ShotItem[]}> = ({t, items}) => (
	<>
		{items.map((it, i) => {
			const fade = it.fade ?? 0.3;
			// Keep the previous shot under the incoming one until the cross-fade completes.
			const next = items[i + 1];
			const end = next ? next.from + (next.fade ?? 0.3) : it.to;
			if (t < it.from || t > end) return null;
			const o = i === 0 ? 1 : prog(t, it.from, fade);
			return (
				<AbsoluteFill key={i} style={{opacity: o}}>
					{it.render(t)}
				</AbsoluteFill>
			);
		})}
	</>
);
