// Like capture-report.mjs, but blurs detail before capturing (applied only to this local
// browser copy of the page; the live report is untouched):
//  - Summary: keep the first 2 rows of each score column, blur the rest and everything below.
//  - Other tabs: keep headings/short labels, blur long explanatory text, remove "(…)" labels.
// Usage: node capture-report-redacted.mjs <outDir>
import {chromium} from 'playwright';
import fs from 'node:fs';
const URL = 'https://www.vibelevel.ai/share/report/5kOev08_?theme=light';
const TABS = ['Summary', 'Core Skills', 'Working with AI', 'Human Contribution', 'Video Q&A', 'Code Review', 'Interview Guide', 'Appendix'];
const [outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const slug = (s) => s.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1920, height: 1080}, deviceScaleFactor: 2});
await page.goto(URL, {waitUntil: 'networkidle', timeout: 60000});
await page.waitForTimeout(2500);
const scroller = 'div.flex-1.overflow-auto';

const redact = (tab) =>
	page.evaluate((tab) => {
		const BLUR = 'blur(5px)';
		const blur = (el) => {
			el.style.filter = BLUR;
			el.dataset.redacted = '1';
		};
		const inBlurred = (el) => el.closest('[data-redacted]');
		const tabsBtn = [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Summary');
		const tabsBottom = tabsBtn.getBoundingClientRect().bottom;
		const below = (el) => el.getBoundingClientRect().top > tabsBottom + 4;
		const all = [...document.querySelectorAll('body *')].filter((e) => e.offsetParent && below(e));

		if (tab === 'Summary') {
			const craft = all.find((e) => e.childElementCount === 0 && e.textContent.trim().toLowerCase() === 'craft');
			const columns = craft.parentElement.parentElement; // Craft | Working with AI | Deliverables
			const scoreLeaf = (e) => e.childElementCount === 0 && /^\d+(\.\d)?$/.test(e.textContent.trim());
			for (const col of columns.children) {
				const scores = [...col.querySelectorAll('*')].filter(scoreLeaf);
				// A row = the largest ancestor of a score that holds exactly one score.
				const rows = scores.map((s) => {
					let r = s;
					while (r.parentElement !== col && [...r.parentElement.querySelectorAll('*')].filter(scoreLeaf).length === 1) r = r.parentElement;
					return r;
				});
				rows.slice(2).forEach(blur);
				const cut = rows[1].getBoundingClientRect().bottom;
				[...col.querySelectorAll('*')].filter((e) => e.childElementCount === 0 && e.getBoundingClientRect().top > cut && !inBlurred(e)).forEach(blur);
			}
			// Everything below the score grid (understanding, probes, synthesis, delivered/missing, counts).
			const section = columns.parentElement; // [grid, understanding/probes]
			[...section.children].slice(1).forEach(blur);
			[...section.parentElement.children].slice(2).forEach(blur);
			return;
		}
		// Remove parenthetical sub-labels, e.g. "(Problem & Design Thinking)".
		all.filter((e) => /^\(.*\)$/.test(e.textContent.trim()) && e.textContent.length < 90).forEach((e) => (e.style.display = 'none'));
		// Blur the smallest elements holding long explanatory text; keep headings and uppercase eyebrows.
		const isLong = (e) => {
			const t = (e.innerText || '').trim();
			return t.length > 55 && t !== t.toUpperCase();
		};
		// Only blocks that carry the text themselves (a paragraph, a bullet), not wrappers that
		// merely group a heading with an eyebrow or a scale's labels.
		const ownText = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim().length >= 15;
		// Code-reference lines ("<> src/agent.py:82 invokes …") stay readable (user request).
		const codeRef = (e) => /^(src|tests)\/\S+:\d/.test((e.innerText || '').trim());
		for (const e of all) {
			if (!isLong(e) || !ownText(e) || codeRef(e) || inBlurred(e)) continue;
			blur(e);
		}
	}, tab);

for (const tab of TABS) {
	await page.setViewportSize({width: 1920, height: 1080});
	await page.locator('button').filter({hasText: new RegExp('^\\s*' + tab.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&') + '\\s*$')}).first().click();
	await page.waitForTimeout(2000);
	await page.$eval(scroller, (el) => el.scrollTo(0, 0)).catch(() => {});
	const h = await page.$eval(scroller, (el) => el.scrollHeight).catch(() => 1080);
	await page.setViewportSize({width: 1920, height: Math.min(h + 60, 12000)});
	await page.waitForTimeout(1200);
	await redact(tab);
	await page.waitForTimeout(400);
	await page.screenshot({path: `${outDir}/report-${slug(tab)}-full.png`});
	console.log(tab, '→', `report-${slug(tab)}-full.png`);
	await page.reload({waitUntil: 'networkidle'}); // clean DOM for the next tab
	await page.waitForTimeout(1500);
}
await browser.close();
