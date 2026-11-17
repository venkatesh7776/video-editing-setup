// Opens a visible browser on the VibeLevel login page. YOU sign in; this script
// only waits until you're past the login page, then saves the session cookies
// to .cache/vibelevel-auth.json (never commit or share this file).
import {chromium} from 'playwright';
const browser = await chromium.launch({headless: false, args: ['--window-size=1440,960']});
const context = await browser.newContext({viewport: {width: 1440, height: 900}});
const page = await context.newPage();
await page.goto('https://www.vibelevel.ai/login?persona=builder&source=aura');
console.log('Waiting for you to sign in (up to 15 minutes)...');
await page.waitForURL((u) => !u.pathname.startsWith('/login') && !u.hostname.includes('linkedin'), {timeout: 15 * 60 * 1000});
await page.waitForTimeout(5000);
await context.storageState({path: '.cache/vibelevel-auth.json'});
console.log('Signed in. Landed on:', page.url());
await browser.close();
