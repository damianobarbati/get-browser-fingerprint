import type { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import getBrowserFingerprint from './index';

describe('getBrowserFingerprint', () => {
  let browser: Browser, page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      // devtools: true,
    });
    page = await browser.newPage();

    await page.addScriptTag({
      type: 'module',
      path: './src/index.js',
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('works without args', async () => {
    const result = await page.evaluate(() => {
      const result = getBrowserFingerprint();
      return result;
    });

    expect(typeof result).toBe('number');
    expect(String(result).length).toBeGreaterThanOrEqual(7);
  });

  it('works without hardwareOnly=true', async () => {
    const result = await page.evaluate(() => {
      const result = getBrowserFingerprint();
      return result;
    });

    expect(typeof result).toBe('number');
    expect(String(result).length).toBeGreaterThanOrEqual(7);
  });

  it('works with enableWebgl=true', async () => {
    const result = await page.evaluate(() => {
      const result = getBrowserFingerprint({ enableWebgl: true });
      return result;
    });

    expect(typeof result).toBe('number');
    expect(String(result).length).toBeGreaterThanOrEqual(7);
  });
});
