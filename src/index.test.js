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

  it('returns a deterministic fingerprint', async () => {
    const result1 = await evaluateFn(page, {});
    const result2 = await evaluateFn(page, {});
    assert.equal(result1.fingerprint, result2.fingerprint);
  });

  it('works with debug=true', async () => {
    const result = await evaluateFn(page, { debug: true });
    assert.equal(typeof result.fingerprint, 'string');
    assert.ok(result.fingerprint.length === 8);
  });

  it('includes expected data fields', async () => {
    const result = await evaluateFn(page, {});
    assert.ok('timezone' in result);
    assert.ok('languages' in result);
    assert.ok('colorScheme' in result);
    assert.ok('touchSupport' in result);
    assert.ok('pixelDepth' in result);
    assert.ok('colorDepth' in result);
  });
});
