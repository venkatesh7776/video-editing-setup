// Brand tokens for the Screening video, taken from preview.vibelevel.ai:
// Brand colours; Inter Tight 800 headlines (user preference over the site's Space Grotesk), Manrope subtitles.
import {loadFont as loadInterTight} from '@remotion/google-fonts/InterTight';
import {loadFont as loadManrope} from '@remotion/google-fonts/Manrope';
import {colors, fonts as baseFonts} from '../vibelevel/brand';

export {colors, LogoMark} from '../vibelevel/brand';

export const fonts = {
	...baseFonts,
	// On-screen headlines and UI titles: heavy, clean grotesque (subtitles stay Manrope).
	heading: loadInterTight('normal', {weights: ['600', '700', '800', '900'], subsets: ['latin']}).fontFamily,
	subtitle: loadManrope('normal', {weights: ['500', '600', '700'], subsets: ['latin']}).fontFamily,
};

/** Page tint behind website/app captures, so "contain"-fitted shots blend into the card. */
export const captureBg = '#F3F6F4';

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const palette = {
	...colors,
	surface: '#E9F7EE',
	dark: '#050C08',
	darkCard: '#0B1A12',
};
