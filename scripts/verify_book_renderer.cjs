#!/usr/bin/env node

const os = require('os');
const path = require('path');
const { chromium } = require('playwright-core');

async function main() {
  const explicitBaseUrl = process.argv[2];
  const baseUrls = explicitBaseUrl ? [explicitBaseUrl] : getDefaultBaseUrls();
  const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });

  try {
    const attempts = [];

    for (const baseUrl of baseUrls) {
      try {
        const results = await inspectBaseUrl(browser, baseUrl);
        const failed = results.some(hasFailedResult);
        const payload = { baseUrl, results };
        if (attempts.length) payload.attempts = attempts;
        process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
        if (failed) process.exitCode = 1;
        return;
      } catch (error) {
        attempts.push({ baseUrl, error: error.message });
        if (explicitBaseUrl) throw error;
      }
    }

    process.stdout.write(`${JSON.stringify({ attempts }, null, 2)}\n`);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

function getDefaultBaseUrls() {
  const urls = [];
  const add = (url) => {
    if (!urls.includes(url)) urls.push(url);
  };

  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const address of addresses || []) {
      if (address.family === 'IPv4' && !address.internal) {
        add(`http://${address.address}:4173/schaufenster`);
      }
    }
  }

  add('http://localhost:4173/schaufenster');
  add('http://127.0.0.1:4173/schaufenster');
  return urls;
}

async function inspectBaseUrl(browser, baseUrl) {
  const results = [];

  for (const target of [
    { label: 'desktop', viewport: { width: 1600, height: 1000 } },
    { label: 'mobile', viewport: { width: 390, height: 844 } },
  ]) {
    results.push(await inspectBookViewport(browser, baseUrl, target));
    results.push(await inspectCollectionViewport(browser, baseUrl, target, 2, 'manga'));
    results.push(await inspectCollectionViewport(browser, baseUrl, target, 10, 'young-adult'));
  }

  return results;
}

function hasFailedResult(result) {
  if (result.kind === 'collection') {
    return (
      !result.hasContent
      || result.errorOverlay
      || !result.hasCollectionGrid
      || !result.foregroundCardsVisible
      || !result.backgroundCardsVisible
      || result.backgroundTitleCount !== 5
      || !result.backgroundTitlesDistinctFromForeground
      || !result.hasParticles
      || result.has3dRenderer
      || result.errors.length
      || result.failedResources.length
    );
  }

  return (
    !result.hasContent
    || result.errorOverlay
    || !result.coverReady
    || !result.coverVisible
    || !result.coverFromMediaFolder
    || !result.coverIsJpg
    || !result.bookBackgroundWhite
    || !result.hasParticles
    || result.has3dRenderer
    || result.errors.length
    || result.failedResources.length
  );
}

function makeSlideUrl(baseUrl, slideNumber) {
  const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const url = new URL(normalized);
  url.searchParams.set('slide', String(slideNumber));
  url.searchParams.set('pause', '1');
  return url.toString();
}

async function inspectBookViewport(browser, baseUrl, target) {
  const errors = [];
  const failedResources = [];
  const page = await browser.newPage({ viewport: target.viewport, deviceScaleFactor: 1 });

  try {
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`);
    });

    await page.goto(makeSlideUrl(baseUrl, 3), { waitUntil: 'load', timeout: 30000 });
    await page.waitForFunction(() => {
      const image = document.querySelector('.cover-image');
      return image && image.complete && image.naturalWidth > 100 && image.naturalHeight > 100;
    }, null, { timeout: 30000 });
    await page.waitForTimeout(400);

    const screenshot = path.join(os.tmpdir(), `schaufenster-book-cover-${target.label}.png`);
    const result = await page.evaluate(() => {
      const image = document.querySelector('.cover-image');
      const visual = document.querySelector('#visual');
      const slide = document.querySelector('#slide');
      const imageRect = image.getBoundingClientRect();
      const imageStyles = window.getComputedStyle(image);
      const slideStyles = window.getComputedStyle(slide);
      const renderedWidth = imageRect.width;
      const renderedHeight = imageRect.height;
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
      const background = slideStyles.backgroundColor.replace(/\s+/g, '');

      return {
        title: document.querySelector('#title')?.textContent || '',
        hasContent: document.body.innerText.trim().length > 0,
        errorOverlay: document.querySelectorAll('.vite-error-overlay, #webpack-dev-server-client-overlay').length,
        visualMedia: visual?.dataset.media || null,
        slideType: slide?.dataset.type || null,
        slideTheme: slide?.dataset.theme || null,
        coverReady: image.complete && naturalWidth > 100 && naturalHeight > 100,
        coverVisible: Number(imageStyles.opacity || 1) > 0.9 && renderedWidth > 100 && renderedHeight > 100,
        coverFromMediaFolder: image.currentSrc.includes('/media/covers/'),
        coverIsJpg: /\.jpg($|\?)/i.test(new URL(image.currentSrc).pathname),
        bookBackgroundWhite: background === 'rgb(255,255,255)' || background === '#fff' || background === '#ffffff',
        hasParticles: !!document.querySelector('.particles'),
        has3dRenderer: !!document.querySelector('.book-renderer-shell, .book-3d-canvas, canvas.book-3d-canvas'),
        cover: {
          src: image.currentSrc,
          naturalWidth,
          naturalHeight,
          renderedWidth,
          renderedHeight,
        },
      };
    });

    await page.screenshot({ path: screenshot, fullPage: true });

    return {
      kind: 'book',
      label: target.label,
      viewport: target.viewport,
      ...result,
      errors,
      failedResources,
      screenshot,
    };
  } finally {
    await page.close();
  }
}

async function inspectCollectionViewport(browser, baseUrl, target, slideNumber, collectionSlug) {
  const errors = [];
  const failedResources = [];
  const page = await browser.newPage({ viewport: target.viewport, deviceScaleFactor: 1 });

  try {
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`);
    });

    await page.goto(makeSlideUrl(baseUrl, slideNumber), { waitUntil: 'load', timeout: 30000 });
    await page.waitForFunction(() => {
      const backgroundCards = document.querySelectorAll('.collection-backdrop-card');
      const foregroundCards = document.querySelectorAll('.collection-card');
      return backgroundCards.length === 5 && foregroundCards.length >= 3;
    }, null, { timeout: 30000 });
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('.collection-cover img')).every((image) => (
        image.complete && image.naturalWidth > 100 && image.naturalHeight > 100
      ));
    }, null, { timeout: 30000 });
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('.collection-card')).every((card) => {
        const rect = card.getBoundingClientRect();
        const styles = window.getComputedStyle(card);
        return rect.width > 100 && rect.height > 140 && Number(styles.opacity || 0) > 0.85;
      });
    }, null, { timeout: 30000 });
    await page.waitForTimeout(200);

    const screenshot = path.join(os.tmpdir(), `schaufenster-collection-${collectionSlug}-${target.label}.png`);
    const result = await page.evaluate(() => {
      const slide = document.querySelector('#slide');
      const visual = document.querySelector('#visual');
      const foregroundTitles = Array.from(document.querySelectorAll('.collection-details h2'))
        .map((node) => node.textContent.trim())
        .filter(Boolean);
      const backgroundCards = Array.from(document.querySelectorAll('.collection-backdrop-card'));
      const backgroundTitles = backgroundCards
        .map((node) => node.querySelector('strong')?.textContent.trim())
        .filter(Boolean);
      const foregroundTitleSet = new Set(foregroundTitles);
      const foregroundCards = Array.from(document.querySelectorAll('.collection-card'));
      const visibleForegroundCards = foregroundCards.filter((card) => {
        const rect = card.getBoundingClientRect();
        const styles = window.getComputedStyle(card);
        return rect.width > 100 && rect.height > 140 && Number(styles.opacity || 0) > 0.85;
      });
      const visibleBackgroundCards = backgroundCards.filter((card) => {
        const rect = card.getBoundingClientRect();
        const styles = window.getComputedStyle(card);
        return rect.width > 40 && rect.height > 30 && Number(styles.opacity || 0) > 0.05;
      });

      return {
        title: document.querySelector('#title')?.textContent || '',
        hasContent: document.body.innerText.trim().length > 0,
        errorOverlay: document.querySelectorAll('.vite-error-overlay, #webpack-dev-server-client-overlay').length,
        visualMedia: visual?.dataset.media || null,
        slideType: slide?.dataset.type || null,
        slideTheme: slide?.dataset.theme || null,
        hasCollectionGrid: document.querySelectorAll('.collection-card').length >= 3,
        foregroundCardsVisible: visibleForegroundCards.length === foregroundCards.length,
        backgroundTitleCount: backgroundTitles.length,
        backgroundCardsVisible: visibleBackgroundCards.length === 5,
        backgroundTitlesDistinctFromForeground: backgroundTitles.every((title) => !foregroundTitleSet.has(title)),
        foregroundTitles,
        backgroundTitles,
        hasParticles: !!document.querySelector('.particles'),
        has3dRenderer: !!document.querySelector('.book-renderer-shell, .book-3d-canvas, canvas.book-3d-canvas'),
      };
    });

    await page.screenshot({ path: screenshot, fullPage: true });

    return {
      kind: 'collection',
      collectionSlug,
      slideNumber,
      label: target.label,
      viewport: target.viewport,
      ...result,
      errors,
      failedResources,
      screenshot,
    };
  } finally {
    await page.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
