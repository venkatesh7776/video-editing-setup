// Read-only capture of the shared score report: clicks each report tab (view-only) and
// saves a 1920x1080 @2x viewport shot plus a full-length shot of the tab's content.
// Usage: node capture-report.mjs <outDir> <textDir>
import {chromium} from 'playwright';
import fs from 'node:fs';
const URL = 'https://www.vibelevel.ai/share/report/5kOev08_?theme=light';
const TABS = ['Summary', 'Core Skills', 'Working with AI', 'Human Contribution', 'Video Q&A', 'Code Review', 'Interview Guide', 'Appendix'];
const [outDir, textDir] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true}); fs.mkdirSync(textDir, {recursive: true});
const slug = s => s.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1920, height: 1080}, deviceScaleFactor: 2});
await page.goto(URL, {waitUntil: 'networkidle', timeout: 60000});
await page.waitForTimeout(2500);
const scroller = 'div.flex-1.overflow-auto';
for (const tab of TABS) {
  await page.setViewportSize({width: 1920, height: 1080});
  const re = new RegExp('^\\s*' + tab.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&') + '\\s*$');
  await page.locator('button').filter({hasText: re}).first().click();
  await page.waitForTimeout(2500);
  await page.$eval(scroller, el => el.scrollTo(0, 0)).catch(() => {});
  const name = `report-${slug(tab)}`;
  await page.screenshot({path: `${outDir}/${name}-viewport.png`});
  // Grow the viewport so the inner scroll container shows the whole tab, then shoot it.
  const h = await page.$eval(scroller, el => el.scrollHeight).catch(() => 1080);
  await page.setViewportSize({width: 1920, height: Math.min(h + 60, 12000)});
  await page.waitForTimeout(1500);
  await page.screenshot({path: `${outDir}/${name}-full.png`});
  fs.writeFileSync(`${textDir}/${name}.txt`, await page.$eval(scroller, el => el.innerText).catch(() => ''));
  console.log(tab, '->', name, 'contentH', h);
}
await browser.close();
