#!/usr/bin/env node

const os = require('os');
const path = require('path');
const { chromium } = require('playwright-core');

async function main() {
  const baseUrl = process.argv[2] || 'http://127.0.0.1:4173';
  const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const errors = [];
  const failedResources = [];
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });

  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`);
    });

    await page.goto(`${baseUrl}/?slide=3&pause=1`, { waitUntil: 'networkidle' });
    await page.waitForSelector('iframe.book-renderer.is-ready', { timeout: 30000 });
    await page.waitForTimeout(4200);

    const frameElement = await page.$('iframe.book-renderer');
    const frame = await frameElement.contentFrame();
    const result = {
      title: await page.locator('#title').textContent(),
      hasContent: (await page.locator('body').innerText()).trim().length > 0,
      errorOverlay: await page.locator('.vite-error-overlay, #webpack-dev-server-client-overlay').count(),
      rendererReady: await frame.evaluate(() => window.__VIDEO_READY === true),
      rendererError: await frame.evaluate(() => window.__VIDEO_ERROR || ''),
      canvas: await frame.locator('#video-canvas').evaluate((canvas) => ({ width: canvas.width, height: canvas.height })),
      errors,
      failedResources,
      screenshot: path.join(os.tmpdir(), 'schaufenster-book-renderer.png'),
    };
    await page.screenshot({ path: result.screenshot, fullPage: true });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

    if (!result.hasContent || result.errorOverlay || !result.rendererReady || result.rendererError || errors.length || failedResources.length) {
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
