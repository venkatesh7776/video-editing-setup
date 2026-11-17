// Read-only: prints bounding boxes (CSS px, 1920-wide page with the tab fully expanded;
// multiply by 2 for the @2x *-full.png captures) of key report elements, for crop planning.
import {chromium} from 'playwright';
const URL = 'https://www.vibelevel.ai/share/report/5kOev08_?theme=light';
const PLAN = {
  'Summary': ['WHERE 4.9 SITS', 'CRAFT', 'AREAS TO PROBE', 'DELIVERED', 'Prompts 8', 'External Assistance Indicators', 'Sathish R', 'Assessment ID'],
  'Core Skills': ['Skills evidenced', 'Product Thinking', 'Requirements Completion'],
  'Working with AI': ['Plan & Decompose', 'Define Goals & Spec', 'Build & Steer', 'Verify & Iterate'],
  'Human Contribution': ['Passive Delegator', 'AI Steerer: the session'],
  'Video Q&A': ['Understanding check', 'QUESTION 1 · CODE UNDERSTANDING', 'Understanding level: Medium'],
  'Code Review': ['Major rework', 'MAINTAINABILITY', 'src/tools.py:23 · correctness'],
  'Interview Guide': ['Strengths', 'Areas for Improvement', 'Suggested areas to probe'],
  'Appendix': ['HOW TO READ THIS REPORT', 'HOW THE 4.9 IS COMPOSED', 'HOW CONTRIBUTION IS READ'],
};
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1920, height: 1080}});
await page.goto(URL, {waitUntil: 'networkidle'});
await page.waitForTimeout(2000);
const sc = 'div.flex-1.overflow-auto';
for (const [tab, labels] of Object.entries(PLAN)) {
  await page.setViewportSize({width: 1920, height: 1080});
  await page.locator('button').filter({hasText: new RegExp('^\\s*' + tab.replace('&', '\\&') + '\\s*$')}).first().click();
  await page.waitForTimeout(1500);
  const h = await page.$eval(sc, el => el.scrollHeight);
  await page.setViewportSize({width: 1920, height: Math.min(h + 60, 12000)});
  await page.waitForTimeout(1200);
  for (const label of labels) {
    const loc = page.getByText(label, {exact: false}).first();
    // Walk up to the nearest card-like block for a useful crop.
    const box = await loc.evaluate(el => {
      let n = el;
      for (let i = 0; i < 6 && n.parentElement; i++) { const r = n.getBoundingClientRect(); if (r.width > 500 && r.height > 60) break; n = n.parentElement; }
      const r = n.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round);
    }).catch(() => null);
    console.log(`${tab} | ${label} | x,y,w,h = ${box}`);
  }
  // Video thumbnails (candidate face) on this tab.
  const vids = await page.$$eval('video, img', els => els.map(e => { const r = e.getBoundingClientRect(); return r.width > 80 ? `${e.tagName}@${[r.x, r.y, r.width, r.height].map(Math.round)}` : null; }).filter(Boolean));
  if (vids.length) console.log(`${tab} | media | ${vids.join(' ; ')}`);
}
await browser.close();
