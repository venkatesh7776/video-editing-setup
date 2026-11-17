// Read-only reconnaissance: loads a URL, prints title, visible text, links, fonts and
// key colours, and saves a viewport + full-page screenshot to the scratch dir given.
// Usage: node explore.mjs <url> <outDir> <name>
import {chromium} from 'playwright';
const [url, outDir, name] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1920, height: 1080}, deviceScaleFactor: 1});
await page.goto(url, {waitUntil: 'networkidle', timeout: 60000}).catch(e => console.log('goto:', e.message));
await page.waitForTimeout(3000);
console.log('FINAL URL:', page.url());
console.log('TITLE:', await page.title());
const info = await page.evaluate(() => {
  const fonts = new Set(), colors = new Map();
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    fonts.add(cs.fontFamily);
    for (const c of [cs.backgroundColor, cs.color]) if (c && c !== 'rgba(0, 0, 0, 0)') colors.set(c, (colors.get(c) || 0) + 1);
  }
  const links = [...document.querySelectorAll('a[href]')].map(a => `${a.innerText.trim().replace(/\s+/g,' ').slice(0,60)} -> ${a.getAttribute('href')}`);
  const heads = [...document.querySelectorAll('h1,h2,h3,h4')].map(h => `${h.tagName}: ${h.innerText.trim().replace(/\s+/g,' ').slice(0,120)}`);
  const cssVars = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch { return []; } })
    .filter(r => r.selectorText === ':root').map(r => r.cssText.slice(0, 3000));
  return {fonts: [...fonts], colors: [...colors].sort((a,b)=>b[1]-a[1]).slice(0,20), links: [...new Set(links)], heads, cssVars, height: document.body.scrollHeight, text: document.body.innerText.slice(0, 6000)};
});
console.log(JSON.stringify(info, null, 1));
await page.screenshot({path: `${outDir}/${name}-viewport.png`});
await page.screenshot({path: `${outDir}/${name}-full.png`, fullPage: true});
await browser.close();
