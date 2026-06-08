import { slides, slideDurationMs } from '../src/slides.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

assert(Array.isArray(slides), 'slides must be an array');
assert(slides.length >= 8, 'slideshow should contain at least 8 slides');
assert(slideDurationMs >= 5000, 'slides should stay visible long enough for shop-window reading');

slides.forEach((slide, index) => {
  for (const field of ['type', 'eyebrow', 'kicker', 'title', 'author', 'focus', 'note', 'source', 'symbol']) {
    assert(typeof slide[field] === 'string' && slide[field].trim(), `slide ${index + 1} is missing ${field}`);
  }

  assert(['book', 'instagram'].includes(slide.type), `slide ${index + 1} has an unsupported type`);
  assert(Array.isArray(slide.palette) && slide.palette.length === 2, `slide ${index + 1} needs two palette colors`);
  assert(slide.focus.length <= 130, `slide ${index + 1} focus text is too long`);

  if (slide.type === 'book') {
    assert(slide.media?.kind === 'image', `book slide ${index + 1} needs image media`);
    assert(typeof slide.media.src === 'string' && slide.media.src.trim(), `book slide ${index + 1} is missing media src`);
  }

  if (slide.media) {
    assert(['image', 'video', 'instagram'].includes(slide.media.kind), `slide ${index + 1} has unsupported media kind`);

    if (slide.media.src?.startsWith('/')) {
      const publicPath = join(process.cwd(), 'public', slide.media.src.slice(1));
      assert(existsSync(publicPath), `slide ${index + 1} media file does not exist: ${slide.media.src}`);
    }
  }
});

const instagramCount = slides.filter((slide) => slide.type === 'instagram').length;
assert(instagramCount >= 2, 'add Instagram slides occasionally');

console.log(`Validated ${slides.length} slides, including ${instagramCount} Instagram moments.`);
