import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { slides } from '../src/slides.js';

const base = process.argv[2] || 'http://127.0.0.1:4178/';
const executablePath = process.env.CHROME_PATH || [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe'
].find(existsSync);
const browser = await chromium.launch({ headless: true, executablePath });
const output = join(tmpdir(), 'schaufenster-october');
mkdirSync(output, { recursive: true });
let cardsChecked = 0;
try {
  for (const [width, height] of [[1920, 1080], [1366, 768]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    for (const [index, slide] of slides.entries()) {
      await page.goto(`${base}?slide=${index + 1}&pause=1`);
      await page.locator('#title').filter({ hasText: /\S/ }).waitFor();
      assert.equal(await page.locator('#title').textContent(), slide.title);
      await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))));
      const missing = await page.locator('img').evaluateAll(imgs => imgs.filter(img => img.getClientRects().length && (!img.complete || !img.naturalWidth)).map(img => img.src));
      assert.deepEqual(missing, [], `missing images on slide ${index + 1}`);
      const items = slide.media?.items || [];
      assert.equal(await page.locator('.collection-card').count(), items.length);
      if (items.length) {
        const problems = await page.evaluate(() => {
          const problems = [];
          const title = document.querySelector('#title').getBoundingClientRect();
          const visual = document.querySelector('#visual').getBoundingClientRect();
          if (Math.min(title.right, visual.right) > Math.max(title.left, visual.left) + 1 && Math.min(title.bottom, visual.bottom) > Math.max(title.top, visual.top) + 1) problems.push('Heading overlaps books');
          for (const node of document.querySelectorAll('.collection-card h2, .collection-author')) {
            const style = getComputedStyle(node);
            if (['hidden', 'clip'].includes(style.overflowY) && node.scrollHeight > node.clientHeight + 2 || ['hidden', 'clip'].includes(style.overflowX) && node.scrollWidth > node.clientWidth + 2) problems.push(`Clipped: ${node.textContent}, ${node.clientWidth}x${node.clientHeight}, content ${node.scrollWidth}x${node.scrollHeight}, overflow ${style.overflow}`);
          }
          return problems;
        });
        assert.deepEqual(problems, [], `layout at ${width}x${height}, slide ${index + 1}`);
      }
      for (const [i, book] of items.entries()) {
        const card = page.locator('.collection-card').nth(i);
        assert.equal(await card.locator('h2').textContent(), book.title);
        assert.equal(await card.locator('.collection-label').textContent(), book.label);
        await card.click();
        assert.equal(await page.locator('#orderTitle').textContent(), book.title);
        assert.equal(await page.locator('#orderLink').getAttribute('href'), book.shopUrl);
        assert.equal(await page.locator('#orderQr').getAttribute('src'), `/qr/${book.isbn}.svg`);
        cardsChecked++;
      }
      if (width === 1920) await page.screenshot({ path: join(output, `slide-${index + 1}.png`) });
    }
    assert.deepEqual(errors, [], `browser errors at ${width}x${height}`);
    await page.close();
  }
  // Confirm unattended playback advances through real timers.
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.clock.install();
  await page.goto(base);
  await page.locator('#title').waitFor();
  await page.clock.fastForward(27000);
  assert.equal(await page.locator('#title').textContent(), slides[1].title);
  console.log(`PASS: ${slides.length} slides, ${cardsChecked} book/QR checks, automatic advance. Screenshots: ${output}`);
} finally { await browser.close(); }
