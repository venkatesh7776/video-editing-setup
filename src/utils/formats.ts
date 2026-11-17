import type {EditConfig, FormatName} from './types';

export const FORMATS: Record<FormatName, {width: number; height: number}> = {
	'9:16': {width: 1080, height: 1920}, // Reels / Shorts / TikTok
	'16:9': {width: 1920, height: 1080}, // YouTube
	'1:1': {width: 1080, height: 1080}, // Square feed
	'4:5': {width: 1080, height: 1350}, // Instagram portrait feed
};

export const resolveDimensions = (format: EditConfig['format']) => {
	const dims = typeof format === 'string' ? FORMATS[format] : format;
	if (!dims) {
		throw new Error(`Unknown format "${String(format)}". Use one of ${Object.keys(FORMATS).join(', ')} or {width, height}.`);
	}
	// Encoders need even dimensions.
	return {width: Math.round(dims.width / 2) * 2, height: Math.round(dims.height / 2) * 2};
};

export const resolveFit = (
	fit: EditConfig['fit'],
	src: {width: number; height: number},
	out: {width: number; height: number},
): 'cover' | 'contain' | 'blur' => {
	if (fit && fit !== 'auto') return fit;
	const ratio = src.width / src.height / (out.width / out.height);
	// Close enough in shape: fill the frame. Otherwise show everything over a blurred fill.
	return ratio > 0.9 && ratio < 1.12 ? 'cover' : 'blur';
};
