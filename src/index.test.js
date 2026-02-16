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

  it('works with debug=true', async () => {
    const result = await evaluateFn(page, { debug: true });
    assert.equal(typeof result.fingerprint, 'string');
    assert.ok(result.fingerprint.length === 8);
  });

  it('works with debug=false', async () => {
    const result = await evaluateFn(page, { debug: false });
    assert.equal(typeof result.fingerprint, 'string');
    assert.ok(result.fingerprint.length === 8);
  });
});
