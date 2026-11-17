// Signs in to the preview site once and saves the session to .cache (gitignored).
// Credentials come only from env vars VL_EMAIL / VL_PASS and are never printed or stored.
import {chromium} from 'playwright';
const {VL_EMAIL, VL_PASS} = process.env;
if (!VL_EMAIL || !VL_PASS) throw new Error('Set VL_EMAIL and VL_PASS');
const STATE = new URL('../../.cache/vibelevel-screening-auth.json', import.meta.url).pathname;
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1920, height: 1080}});
const page = await ctx.newPage();
await page.goto('https://preview.vibelevel.ai/login?persona=hiring&source=hiring', {waitUntil: 'networkidle'});
await page.fill('input[type=email]', VL_EMAIL);
await page.fill('input[type=password]', VL_PASS);
await page.locator('form button[type=submit]', {hasText: /^Log In$/}).last().click();
await page.waitForLoadState('networkidle').catch(() => {});
await page.waitForTimeout(5000);
const ok = !/\/login/.test(page.url());
console.log(ok ? `Signed in. Landed on ${new URL(page.url()).pathname}` : 'Login did not complete (still on login page).');
if (ok) await ctx.storageState({path: STATE});
await browser.close();
process.exit(ok ? 0 : 1);
