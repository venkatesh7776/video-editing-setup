// Explores a page: dumps links, headings, colours, logo candidates and a full-page screenshot.
import {chromium} from 'playwright';
import fs from 'node:fs';
const url = process.argv[2];
const name = process.argv[3] ?? 'page';
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1440, height: 900}, deviceScaleFactor: 1});
await page.goto(url, {waitUntil: 'networkidle', timeout: 60000}).catch((e) => console.log('goto:', e.message));
await page.waitForTimeout(2500);
const info = await page.evaluate(() => {
	const links = [...document.querySelectorAll('a')].map((a) => `${a.innerText.trim().replace(/\s+/g, ' ').slice(0, 50)} -> ${a.href}`);
	const heads = [...document.querySelectorAll('h1,h2,h3,button')].map((h) => `${h.tagName}: ${h.innerText.trim().replace(/\s+/g, ' ').slice(0, 120)}`);
	const colors = {};
	for (const el of document.querySelectorAll('*')) {
		const cs = getComputedStyle(el);
		for (const c of [cs.color, cs.backgroundColor, cs.borderTopColor]) if (c && c !== 'rgba(0, 0, 0, 0)') colors[c] = (colors[c] ?? 0) + 1;
	}
	const imgs = [...document.querySelectorAll('img, svg, link[rel*=icon]')].slice(0, 40).map((i) => `${i.tagName} ${i.getAttribute('src') ?? i.getAttribute('href') ?? ''} ${i.getAttribute('alt') ?? i.getAttribute('class') ?? ''}`.slice(0, 160));
	const fonts = [...new Set([...document.querySelectorAll('h1,h2,p,body')].map((e) => getComputedStyle(e).fontFamily))];
	return {title: document.title, height: document.body.scrollHeight, links: [...new Set(links)], heads: [...new Set(heads)], colors: Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 25), imgs, fonts, text: document.body.innerText.slice(0, 6000)};
});
fs.writeFileSync(`work/capture/${name}.json`, JSON.stringify(info, null, 1));
await page.screenshot({path: `work/capture/${name}.png`, fullPage: true});
console.log(JSON.stringify({...info, text: undefined}, null, 1));
console.log('---TEXT---\n' + info.text);
await browser.close();
