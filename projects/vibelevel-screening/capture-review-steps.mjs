// Review Session walkthrough captures (2×) for the v4 demo. Signs in with VL_EMAIL / VL_PASSWORD (env only).
//   CHROME_PATH=… VL_EMAIL=… VL_PASSWORD=… node projects/vibelevel-screening/capture-review-steps.mjs REVIEW_URL
import {chromium} from 'playwright';
import fs from 'node:fs';
const url = process.argv[2];
const out = 'work/vl4/cap';
fs.mkdirSync(out, {recursive: true});
const browser = await chromium.launch(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {});
const context = await browser.newContext({viewport: {width: 1440, height: 810}, deviceScaleFactor: 2});
const page = await context.newPage();
await page.goto(new URL('/login', url).href, {waitUntil: 'networkidle', timeout: 90000}).catch(() => {});
const sw = page.getByText('Switch to Hiring');
if (await sw.count()) { await sw.first().click(); await page.waitForTimeout(1500); }
await page.locator('input[type="email"], input[name="email"]').first().fill(process.env.VL_EMAIL);
await page.locator('input[type="password"]').first().fill(process.env.VL_PASSWORD);
await page.getByRole('button', {name: /log in/i}).last().click();
await page.waitForURL((u) => !u.pathname.startsWith('/login'), {timeout: 60000}).catch(() => {});
await page.goto(url, {waitUntil: 'networkidle', timeout: 90000}).catch(() => {});
await page.waitForTimeout(4000);
const shot = async (name) => { await page.waitForTimeout(1800); await page.screenshot({path: `${out}/${name}.png`}); console.log('✔', name); };
const click = async (re, nth = 0) => {
	const el = page.getByText(re);
	const n = await el.count();
	if (n > nth) { await el.nth(nth).click().catch((e) => console.log('click failed', re, e.message.slice(0, 80))); return true; }
	console.log('not found', re);
	return false;
};
await shot('r01-chat-timeline');
await click(/^Review Files & Output$/); await shot('r02-files-output');
await click(/^Final code$/); await shot('r03-final-code');
await click(/^Changes vs starter$/); await page.waitForTimeout(500);
await click(/^Review Findings$/); await shot('r04-findings');
await click(/Requirements Completion/); await shot('r05-done-well');
await page.keyboard.press('Escape');
await click(/^L37$/) || (await click(/L37/)); await shot('r06-weakness-l37');
await page.keyboard.press('Escape');
await click(/^L35$/) || (await click(/L35/)); await shot('r07-weakness-l35');
await page.keyboard.press('Escape');
await click(/^Review Chat & Timeline$/); await shot('r08-chat-again');
// the recruiter report for this candidate
const links = await page.evaluate(() => [...document.querySelectorAll('a')].map((a) => a.href).filter((h) => /report|submission|result/i.test(h)).slice(0, 10));
console.log('report-ish links:', links);
await browser.close();
