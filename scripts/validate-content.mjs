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
assert(slideDurationMs >= 20000, 'slides should stay visible long enough for shop-window reading');

slides.forEach((slide, index) => {
  for (const field of ['type', 'eyebrow', 'title', 'author', 'source', 'symbol']) {
    assert(typeof slide[field] === 'string' && slide[field].trim(), `slide ${index + 1} is missing ${field}`);
  }

  assert(['book', 'instagram'].includes(slide.type), `slide ${index + 1} has an unsupported type`);
  assert(Array.isArray(slide.palette) && slide.palette.length === 2, `slide ${index + 1} needs two palette colors`);
  assert(!slide.durationMs || slide.durationMs >= 15000, `slide ${index + 1} duration is too short`);
  assert(typeof slide.focus === 'string', `slide ${index + 1} focus must be a string`);
  assert(typeof slide.note === 'string', `slide ${index + 1} note must be a string`);
  assert(slide.focus.length <= 360, `slide ${index + 1} focus text is too long`);
  assert(slide.note.length <= 220, `slide ${index + 1} note text is too long`);

  if (slide.type === 'book') {
    assert(typeof slide.kicker === 'string', `book slide ${index + 1} kicker must be a string`);
    assert(slide.focus.trim(), `book slide ${index + 1} is missing focus`);
    assert(slide.note.trim(), `book slide ${index + 1} is missing note`);
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

const bookCount = slides.filter((slide) => slide.type === 'book').length;
const instagramCount = slides.filter((slide) => slide.type === 'instagram').length;
assert(bookCount >= 10, 'show at least 10 book slides');
assert(instagramCount >= 2, 'add Instagram slides occasionally');

console.log(`Validated ${slides.length} slides, including ${bookCount} books and ${instagramCount} Instagram moments.`);
