import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { chromium } from '@playwright/test';

const evaluateFn = (page, options = {}) => page.evaluate((opts) => window.getBrowserFingerprint(opts), options);

describe('getBrowserFingerprint', () => {
  let browser;
  let page;

  before(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    await page.addScriptTag({ path: './src/index.js', type: 'module' }); // add the script to the page
  });

  after(async () => {
    await browser.close();
  });

  it('works without args', async () => {
    const result = await evaluateFn(page, {});
    assert.equal(typeof result.fingerprint, 'string');
    assert.ok(result.fingerprint.length === 8);
  });

  it('works with hardwareOnly=true', async () => {
    const result = await evaluateFn(page, { hardwareOnly: true });
    assert.equal(typeof result.fingerprint, 'string');
    assert.ok(result.fingerprint.length === 8);
  });

  it('works with enableWebgl=true', async () => {
    const result = await evaluateFn(page, { enableWebgl: true });
    assert.equal(typeof result.fingerprint, 'string');
    assert.ok(result.fingerprint.length === 8);
  });
});
