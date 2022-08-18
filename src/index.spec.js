import puppeteer from 'puppeteer';

describe('getBrowserFingerprint', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      // headless: false,
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
      const result = window.getBrowserFingerprint();
      return result;
    });

    expect(typeof result).toBe('number');
    expect(String(result).length).toBeGreaterThanOrEqual(7);
  });

  it('works without hardwareOnly=true', async () => {
    const result = await page.evaluate(() => {
      const result = window.getBrowserFingerprint();
      return result;
    });

    expect(typeof result).toBe('number');
    expect(String(result).length).toBeGreaterThanOrEqual(7);
  });

  it('works with enableWebgl=true', async () => {
    const result = await page.evaluate(() => {
      const result = window.getBrowserFingerprint({ enableWebgl: true });
      return result;
    });

    expect(typeof result).toBe('number');
    expect(String(result).length).toBeGreaterThanOrEqual(7);
  });
});
