// Read-only: dumps a page's full visible text and its scrollable containers.
// Usage: node dump.mjs <url> <outFile>
import {chromium} from 'playwright';
import fs from 'node:fs';
const [url, out] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1920, height: 1080}});
await page.goto(url, {waitUntil: 'networkidle', timeout: 60000}).catch(e => console.log('goto:', e.message));
await page.waitForTimeout(3000);
const res = await page.evaluate(() => {
  const scrollers = [...document.querySelectorAll('*')].filter(el => {
    const cs = getComputedStyle(el);
    return /(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 50;
  }).map(el => `${el.tagName}.${[...el.classList].slice(0,4).join('.')} scrollH=${el.scrollHeight} clientH=${el.clientHeight}`);
  const tabs = [...document.querySelectorAll('[role=tab],button')].map(b => b.innerText.trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,80);
  return {scrollers, tabs, docH: document.documentElement.scrollHeight, text: document.body.innerText};
});
fs.writeFileSync(out, res.text);
console.log(JSON.stringify({scrollers: res.scrollers, docH: res.docH, buttons: res.tabs}, null, 1));
await browser.close();
