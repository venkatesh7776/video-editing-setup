// v4 demo captures (2×) of the preview Review Session + report, with a JSON of boxes to blur for each shot
// (candidate name, email, assessment/session IDs, score numbers). Sign-in via VL_EMAIL / VL_PASSWORD env only.
//   CHROME_PATH=… VL_EMAIL=… VL_PASSWORD=… node projects/vibelevel-screening/capture-v4.mjs SESSION_ID
import {chromium} from 'playwright';
import fs from 'node:fs';
const id = process.argv[2];
const base = 'https://preview.vibelevel.ai';
const out = 'work/vl4/cap';
fs.mkdirSync(out, {recursive: true});
const browser = await chromium.launch(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {});
const context = await browser.newContext({viewport: {width: 1440, height: 810}, deviceScaleFactor: 2});
const page = await context.newPage();
await page.goto(base + '/login', {waitUntil: 'networkidle'}).catch(() => {});
const sw = page.getByText('Switch to Hiring');
if (await sw.count()) { await sw.first().click(); await page.waitForTimeout(1200); }
await page.locator('input[type="email"]').first().fill(process.env.VL_EMAIL);
await page.locator('input[type="password"]').first().fill(process.env.VL_PASSWORD);
await page.getByRole('button', {name: /log in/i}).last().click();
await page.waitForURL((u) => !u.pathname.startsWith('/login'), {timeout: 60000}).catch(() => {});

const boxes = {};
const sensitive = async () => page.evaluate(() => {
	const out = [];
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	const name = /Vipul|Ponugoti|@vibelevel\.ai|@outlook|@gmail/i;
	const idv = /^[0-9a-f]{6,}…?$/i;
	const score = /^\s*\d{1,2}(\.\d)?(\s*\/\s*10)?\s*$|\d\.\d\/10/;
	for (let n = walker.nextNode(); n; n = walker.nextNode()) {
		const s = n.textContent.trim();
		if (!s) continue;
		const kind = name.test(s) ? 'pii' : idv.test(s) ? 'id' : score.test(s) ? 'score' : null;
		if (!kind) continue;
		const r = document.createRange();
		r.selectNodeContents(n);
		for (const b of r.getClientRects()) if (b.width > 2 && b.bottom > 0 && b.top < innerHeight) out.push({kind, text: s.slice(0, 30), x: b.left, y: b.top, w: b.width, h: b.height});
	}
	return out;
});
const shot = async (name) => {
	await page.waitForTimeout(1800);
	await page.screenshot({path: `${out}/${name}.png`});
	boxes[name] = (await sensitive()).map((b) => ({...b, x: b.x * 2, y: b.y * 2, w: b.w * 2, h: b.h * 2}));
	console.log('✔', name, boxes[name].length, 'boxes');
};
// Review Session
await page.goto(`${base}/assess/${id}/review`, {waitUntil: 'networkidle', timeout: 90000}).catch(() => {});
await page.waitForTimeout(4000);
await shot('r01-chat-timeline');
await page.getByText(/^Final code$/).first().click().catch(() => {}); await shot('r03-final-code');
await page.getByText(/^Changes vs starter$/).first().click().catch(() => {});
await page.getByText(/Requirements Completion/).first().click().catch(() => {}); await shot('r05-done-well');
await page.keyboard.press('Escape');
await page.getByText(/L37/).first().click().catch(() => {}); await shot('r06-weakness-l37');
await page.keyboard.press('Escape');
await page.getByText(/L35/).first().click().catch(() => {}); await shot('r07-weakness-l35');
// Report
await page.goto(`${base}/assess/${id}/report`, {waitUntil: 'networkidle', timeout: 60000}).catch(() => {});
await page.waitForTimeout(4000);
await shot('p01-report-top');
for (const tab of ['Summary', 'Working with AI']) {
	const el = page.getByRole('button', {name: tab, exact: true}).or(page.getByRole('tab', {name: tab, exact: true}));
	await el.first().click().catch(() => {});
	await page.waitForTimeout(1200);
	await el.first().evaluate((n) => n.scrollIntoView({block: 'start'}));
	await page.evaluate(() => window.scrollBy(0, -20));
	await shot(`p-${tab.toLowerCase().replace(/[^a-z]+/g, '-')}`);
}
fs.writeFileSync(`${out}/blur-boxes.json`, JSON.stringify(boxes, null, 1));
await browser.close();
