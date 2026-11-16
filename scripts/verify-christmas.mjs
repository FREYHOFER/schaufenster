import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { slides } from '../src/slides.js';

const base = process.argv[2] || 'http://127.0.0.1:4192/';
const browser = await chromium.launch({ headless: true, executablePath: [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
].find(existsSync) });
const output = join(tmpdir(), 'schaufenster-christmas');
mkdirSync(output, { recursive: true });
let states = 0;
try {
  for (const [width, height] of [[1920,1080], [1920,1032], [1536,864], [1366,768], [1280,720], [2560,1440], [390,844]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    for (const [index, slide] of slides.entries()) {
      await page.goto(`${base}?slide=${index + 1}&pause=1`);
      await page.locator('#title').filter({ hasText: /\S/ }).waitFor();
      assert.equal(await page.locator('#title').textContent(), slide.title);
      await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))));
      const items = slide.media?.items || [];
      assert.equal(await page.locator('.collection-card').count(), items.length);
      if (items.length) {
        assert.equal(items.length, 1);
        assert.equal(await page.locator('#orderTitle').textContent(), items[0].title);
        assert.equal(await page.locator('#orderLink').getAttribute('href'), items[0].shopUrl);
        assert.equal(await page.locator('#orderQr').getAttribute('src'), `/qr/${items[0].isbn}.svg`);
        assert.equal(await page.locator('#focus').textContent(), slide.focus, 'full description remains readable');
      }
      const issues = await page.evaluate(() => {
        const issues = [];
        for (const el of document.querySelectorAll('h1, .eyebrow, .author, .kicker, .focus, .audience, .note, .order-panel, #orderQr, .order-panel__content, .order-panel__link')) {
          if (!el.getClientRects().length) continue;
          const r = el.getBoundingClientRect();
          if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) issues.push(`Outside viewport: ${el.id || el.className}`);
          if (el.scrollWidth > el.clientWidth + 2 || (['hidden','clip','auto'].includes(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 2)) issues.push(`Overflow: ${el.id || el.className}`);
        }
        for (const img of document.images) {
          if (img.getClientRects().length && (!img.complete || !img.naturalWidth)) issues.push('Missing: ' + img.src);
        }
        if (document.querySelector('.collection-card')) {
          const cover = document.querySelector('.collection-cover img').getBoundingClientRect();
          const title = document.querySelector('h1').getBoundingClientRect();
          if (Math.min(title.right, cover.right) > Math.max(title.left, cover.left) + 1 && Math.min(title.bottom, cover.bottom) > Math.max(title.top, cover.top) + 1) issues.push('Cover overlaps title');
        }
        return issues;
      });
      assert.deepEqual(issues, [], `${width}x${height}, slide ${index + 1}`);
      if (width === 1920 && height === 1080) await page.screenshot({ path: join(output, `slide-${index + 1}.png`) });
      states++;
    }
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`PASS ${width}x${height}: ${slides.length} slides, covers and permanent QR codes`);
  }
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.clock.install();
  await page.goto(base);
  await page.locator('#title').filter({ hasText: /\S/ }).waitFor();
  await page.clock.fastForward(slides[0].durationMs + 100);
  assert.equal(await page.locator('#title').textContent(), slides[1].title);
  await page.clock.fastForward(slides[1].durationMs + 100);
  assert.equal(await page.locator('#title').textContent(), slides[2].title);
  await page.goto(`${base}?slide=1&pause=1`);
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#title').textContent(), slides[1].title);
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#title').textContent(), slides[0].title);
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#title').textContent(), slides.at(-1).title);
  console.log(`PASS ${states} layouts, automatic playback and keyboard navigation. Screenshots: ${output}`);
} finally { await browser.close(); }
