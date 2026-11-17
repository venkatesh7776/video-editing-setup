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
await page.goto(base + '/assess/54d2a454-07ab-49ee-94bd-b2abaa5b4a66/report', {waitUntil: 'networkidle', timeout: 60000}).catch(() => {});
await page.waitForTimeout(4000);
await page.screenshot({path: 'work/vl4/cap/p01-report-top.png'});
const tabs = ['Summary', 'Core Skills', 'Working with AI', 'Human Contribution', 'Video Q&A', 'Code Review', 'Interview Guide'];
for (const [i, name] of tabs.entries()) {
	const el = page.getByRole('button', {name, exact: true}).or(page.getByRole('tab', {name, exact: true}));
	if (!(await el.count())) { console.log('no tab', name); continue; }
	await el.first().click().catch(() => {});
	await page.waitForTimeout(1500);
	await el.first().evaluate((n) => n.scrollIntoView({block: 'start'}));
	await page.evaluate(() => window.scrollBy(0, -20));
	await page.waitForTimeout(1200);
	await page.screenshot({path: `work/vl4/cap/p${String(i + 2).padStart(2, '0')}-${name.toLowerCase().replace(/[^a-z]+/g, '-')}.png`});
	console.log('✔', name);
}
await browser.close();
