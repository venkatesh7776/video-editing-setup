// Read-only capture of public VibeLevel pages at 1920 wide @2x: one full-length shot per
// page plus one shot per <section>. Dismisses the promo banner (view-only) first.
// Usage: node capture-pages.mjs <outDir> <name>=<url> ...
import {chromium} from 'playwright';
import fs from 'node:fs';
const [outDir, ...pairs] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const browser = await chromium.launch();
for (const pair of pairs) {
  const [name, url] = [pair.slice(0, pair.indexOf('=')), pair.slice(pair.indexOf('=') + 1)];
  const page = await browser.newPage({viewport: {width: 1920, height: 1080}, deviceScaleFactor: 2});
  await page.goto(url, {waitUntil: 'networkidle', timeout: 60000});
  await page.waitForTimeout(2000);
  await page.locator('button[aria-label*="lose" i], button[aria-label*="ismiss" i]').first().click({timeout: 2000}).catch(() => {});
  // Scroll the page's scroll container step by step so scroll-triggered reveals fire.
  const sc = 'div.min-h-screen.overflow-x-hidden';
  const total = await page.$eval(sc, el => el.scrollHeight).catch(() => 1080);
  for (let y = 0; y < total; y += 600) { await page.$eval(sc, (el, y) => el.scrollTo(0, y), y).catch(() => {}); await page.waitForTimeout(250); }
  await page.$eval(sc, el => el.scrollTo(0, 0)).catch(() => {});
  await page.setViewportSize({width: 1920, height: Math.min(total, 16000)});
  await page.waitForTimeout(2500);
  await page.screenshot({path: `${outDir}/${name}-full.png`});
  const sections = await page.$$('section');
  let i = 0;
  for (const s of sections) {
    const box = await s.boundingBox();
    if (!box || box.height < 200) continue;
    const head = (await s.$eval('h1,h2', h => h.innerText).catch(() => '')).replace(/\s+/g, ' ').trim();
    const slug = head.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40).replace(/-$/, '') || 'section';
    const file = `${name}-${String(++i).padStart(2, '0')}-${slug}.png`;
    await s.screenshot({path: `${outDir}/${file}`});
    console.log(file, Math.round(box.y), Math.round(box.height), '|', head.slice(0, 90));
  }
  await page.close();
}
await browser.close();
