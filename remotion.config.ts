// Remotion CLI defaults. See https://www.remotion.dev/docs/config
import {Config} from '@remotion/cli/config';

// Remotion serves media from here. The pipeline copies the prepared source
// video and any referenced assets into it, so `input/` and `assets/` stay clean.
Config.setPublicDir('./work/public');

// JPEG frames render faster; switch to 'png' only if you need transparency.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
// Tag output as standard BT.709 so players show correct contrast/colours.
Config.setColorSpace('bt709');
