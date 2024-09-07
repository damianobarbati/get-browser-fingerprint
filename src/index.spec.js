import { chromium } from "@playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("getBrowserFingerprint", () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    await page.addScriptTag({ path: "./src/index.js", type: "module" }); // add the script to the page
  });

  afterAll(async () => {
    await browser.close();
  });

  it("works without args", async () => {
    const result = await page.evaluate(() => {
      return window.getBrowserFingerprint();
    });

    expect(typeof result).toBe("number");
    expect(String(result).length).toBeGreaterThanOrEqual(7);
  });

  it("works with hardwareOnly=true", async () => {
    const result = await page.evaluate(() => {
      return window.getBrowserFingerprint({ hardwareOnly: true });
    });

    expect(typeof result).toBe("number");
    expect(String(result).length).toBeGreaterThanOrEqual(7);
  });

  it("works with enableWebgl=true", async () => {
    const result = await page.evaluate(() => {
      return window.getBrowserFingerprint({ enableWebgl: true });
    });

    expect(typeof result).toBe("number");
    expect(String(result).length).toBeGreaterThanOrEqual(7);
  });
});
