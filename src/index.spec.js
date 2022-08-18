import { strict as assert } from 'assert';
import puppeteer from 'puppeteer';
import getBrowserFingerprint from './index.js';

await (async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const result = await page.evaluate(getBrowserFingerprint);
  await browser.close();

  assert.deepStrictEqual(Number.isInteger(result), true, 'fingerprint is not an integer');
  assert.deepStrictEqual(String(result).length > 7, true, 'fingerprint is not long enough');
})();

await (async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const result = await page.evaluate(getBrowserFingerprint, true);
  await browser.close();

  assert.deepStrictEqual(Number.isInteger(result), true, 'fingerprint is not an integer');
  assert.deepStrictEqual(String(result).length > 7, true, 'fingerprint is not long enough');
})();