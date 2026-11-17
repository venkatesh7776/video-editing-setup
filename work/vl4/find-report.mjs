import {chromium} from 'playwright';
const browser = await chromium.launch({executablePath: process.env.CHROME_PATH});
const context = await browser.newContext({viewport: {width: 1440, height: 810}, deviceScaleFactor: 2});
const page = await context.newPage();
const base = 'https://preview.vibelevel.ai';
await page.goto(base + '/login', {waitUntil: 'networkidle'}).catch(() => {});
const sw = page.getByText('Switch to Hiring'); if (await sw.count()) { await sw.first().click(); await page.waitForTimeout(1200); }
await page.locator('input[type="email"]').first().fill(process.env.VL_EMAIL);
await page.locator('input[type="password"]').first().fill(process.env.VL_PASSWORD);
await page.getByRole('button', {name: /log in/i}).last().click();
await page.waitForURL((u) => !u.pathname.startsWith('/login'), {timeout: 60000}).catch(() => {});
const id = '54d2a454-07ab-49ee-94bd-b2abaa5b4a66';
for (const p of [`/assess/${id}/report`, `/assess/${id}`, `/hiring/report/${id}`, `/hiring/sessions/${id}`, `/report/${id}`]) {
	await page.goto(base + p, {waitUntil: 'networkidle', timeout: 60000}).catch(() => {});
	await page.waitForTimeout(3000);
	const t = await page.evaluate(() => document.body.innerText);
	const ok = /SITS|Summary|Interview Guide/.test(t);
	console.log(p, '→', page.url(), ok ? 'REPORT' : t.slice(0, 60).replace(/\n/g, ' '));
	if (ok) { await page.screenshot({path: 'work/vl4/cap/p01-report-top.png'}); break; }
}
await browser.close();
