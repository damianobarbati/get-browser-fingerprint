import puppeteer from 'puppeteer';
import getBrowserFingerprint from './index.js';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const result = await page.evaluate(getBrowserFingerprint);
    await browser.close();

    if (!Number.isInteger(result))
        throw new Error(`${result} is not a valid fingerprint`);
})().then(console.log).catch(console.error); //tofix: this does not exit with error