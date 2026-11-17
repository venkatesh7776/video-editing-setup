// Captures the Review Session (preview link) at 2× for the v4 demo: first view, then each review step and finding.
//   node projects/vibelevel-screening/capture-review.mjs URL [--auth]
import {chromium} from 'playwright';
import fs from 'node:fs';
const url = process.argv[2];
const auth = process.argv.includes('--auth');
const out = 'work/vl4/cap';
fs.mkdirSync(out, {recursive: true});
const exe = process.env.CHROME_PATH; // e.g. Remotion's chrome-headless-shell in node_modules/.remotion
const browser = await chromium.launch(exe ? {executablePath: exe} : {});
const context = await browser.newContext({viewport: {width: 1440, height: 810}, deviceScaleFactor: 2, storageState: auth ? '.cache/vibelevel-auth.json' : undefined});
const page = await context.newPage();
// sign in with VL_EMAIL / VL_PASSWORD (env only — never written to disk), hiring persona
if (process.env.VL_EMAIL) {
	await page.goto(new URL('/login', url).href, {waitUntil: 'networkidle', timeout: 90000}).catch(() => {});
	const sw = page.getByText('Switch to Hiring');
	if (await sw.count()) { await sw.first().click(); await page.waitForTimeout(1500); }
	await page.locator('input[type="email"], input[name="email"]').first().fill(process.env.VL_EMAIL);
	await page.locator('input[type="password"]').first().fill(process.env.VL_PASSWORD);
	await page.getByRole('button', {name: /log in/i}).last().click();
	await page.waitForURL((u) => !u.pathname.startsWith('/login'), {timeout: 60000}).catch(() => {});
	await page.waitForTimeout(3000);
	console.log('after login:', page.url());
}
await page.goto(url, {waitUntil: 'networkidle', timeout: 90000}).catch(() => {});
await page.waitForTimeout(4000);
await page.screenshot({path: `${out}/00-landing.png`});
console.log('title:', await page.title(), '| url:', page.url());
const text = await page.evaluate(() => document.body.innerText.slice(0, 800));
console.log(text);
await browser.close();
