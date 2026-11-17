// Captures a page as one tall, crisp 1920px-wide image (for smooth "scroll" shots
// in Remotion) plus a 1920x1080 screenshot of the top of the page.
//   node scripts/capture/page-shots.mjs URL name [--auth] [--height 7000]
import {chromium} from 'playwright';
import fs from 'node:fs';
const [url, name] = process.argv.slice(2);
const auth = process.argv.includes('--auth');
const hIdx = process.argv.indexOf('--height');
const tall = hIdx > 0 ? Number(process.argv[hIdx + 1]) : 6000;
const out = 'assets/images/vibelevel';
fs.mkdirSync(out, {recursive: true});
const browser = await chromium.launch();
const context = await browser.newContext({
	viewport: {width: 1440, height: 810},
	deviceScaleFactor: 4 / 3, // 1440 css px → 1920 image px
	storageState: auth ? '.cache/vibelevel-auth.json' : undefined,
});
const page = await context.newPage();
await page.goto(url, {waitUntil: 'networkidle', timeout: 60000}).catch(() => {});
await page.waitForTimeout(3000);
// Hide sticky promo banners so they don't cover content.
await page.addStyleTag({content: '[class*="banner" i][class*="fixed" i], [class*="toast" i]{display:none!important}'});
await page.screenshot({path: `${out}/${name}-top.png`});
// A tall viewport makes inner scroll containers render their full content at once.
await page.setViewportSize({width: 1440, height: tall});
await page.waitForTimeout(2500);
await page.mouse.wheel(0, 20000); await page.waitForTimeout(1500); // trigger lazy/in-view animations
await page.evaluate(() => { document.querySelectorAll('*').forEach((el) => { if (el.scrollTop) el.scrollTop = 0; }); window.scrollTo(0, 0); });
await page.waitForTimeout(1500);
const h = await page.evaluate(() => Math.max(...[...document.querySelectorAll('*')].map((e) => e.scrollHeight)));
await page.screenshot({path: `${out}/${name}-full.png`, fullPage: true});
console.log(name, 'content height', h, '→', `${out}/${name}-full.png`);
await browser.close();
