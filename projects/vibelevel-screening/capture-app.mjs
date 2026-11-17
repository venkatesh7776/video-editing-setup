// Read-only capture of the signed-in hiring app @2x. Clicks only open menus, toggle
// on-screen selections or navigate; nothing is created, sent, saved or published.
import {chromium} from 'playwright';
import fs from 'node:fs';
const OUT = 'assets/images/vibelevel-screening/research/app';
const STATE = new URL('../../.cache/vibelevel-screening-auth.json', import.meta.url).pathname;
fs.mkdirSync(OUT, {recursive: true});
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1920, height: 1080}, deviceScaleFactor: 2, storageState: STATE});
const page = await ctx.newPage();
const BASE = 'https://preview.vibelevel.ai';
const go = async p => { await page.goto(BASE + p, {waitUntil: 'networkidle', timeout: 60000}).catch(() => {}); await page.waitForTimeout(2500); };
const shot = async name => { await page.mouse.move(1919, 1079); await page.waitForTimeout(400); await page.screenshot({path: `${OUT}/${name}.png`}); console.log(name, page.url().replace(BASE, '')); };
const click = async (text, opts = {}) => { await page.getByText(text, {exact: true, ...opts}).first().click({timeout: 8000}); await page.waitForTimeout(2000); };

await go('/hiring/dashboard'); await shot('app-dashboard');
await go('/hiring/assessments'); await shot('app-assessments-list');
await click('Create'); await shot('app-create-menu');
await go('/hiring/assessments/new'); await shot('app-role-picker');
await click('Generative AI'); await shot('app-refine-role');
for (const t of ['Mid', 'AI agents', 'LLM integration', 'Testing']) await click(t);
await shot('app-refine-role-selected');
await click('Continue'); await page.waitForTimeout(2000); await shot('app-template-results');
await go('/hiring/assessments/new'); await click('Create with AI'); await page.waitForTimeout(3000); await shot('app-ai-builder');
await go('/hiring/integrations'); await shot('app-ats-integrations');
await go('/hiring/integrations/ashby'); await shot('app-ats-ashby');
await go('/hiring/integrations/lever'); await shot('app-ats-lever');
await browser.close();
