// Read-only probe of a signed-in app page: prints URL, links, buttons, headings; saves a viewport shot.
// Usage: node app-probe.mjs <path> <outPng> [clickText...]   (clicks are view-only: tabs/menus)
import {chromium} from 'playwright';
const [path, out, ...clicks] = process.argv.slice(2);
const STATE = new URL('../../.cache/vibelevel-screening-auth.json', import.meta.url).pathname;
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1920, height: 1080}, storageState: STATE});
const page = await ctx.newPage();
await page.goto('https://preview.vibelevel.ai' + path, {waitUntil: 'networkidle', timeout: 60000}).catch(e => console.log('goto', e.message));
await page.waitForTimeout(3000);
for (const c of clicks) { await page.getByText(c, {exact: true}).first().click({timeout: 8000}).catch(e => console.log('click fail', c)); await page.waitForTimeout(2500); }
console.log('URL', page.url());
console.log(await page.evaluate(() => {
  const vis = e => e.offsetParent || getComputedStyle(e).position === 'fixed';
  const links = [...document.querySelectorAll('a[href]')].filter(vis).map(a => `A ${a.innerText.trim().replace(/\s+/g,' ').slice(0,50)} -> ${a.getAttribute('href')}`);
  const btns = [...document.querySelectorAll('button,[role=tab],[role=menuitem]')].filter(vis).map(b => `B ${b.innerText.trim().replace(/\s+/g,' ').slice(0,50)}`).filter(s => s.length > 2);
  const heads = [...document.querySelectorAll('h1,h2,h3')].filter(vis).map(h => `H ${h.innerText.trim().slice(0,80)}`);
  return [...new Set([...heads, ...links, ...btns])].slice(0, 120).join('\n');
}));
await page.screenshot({path: out});
await browser.close();
