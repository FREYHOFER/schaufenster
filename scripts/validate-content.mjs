import { slides, slideDurationMs } from '../src/slides.js';

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
});

const instagramCount = slides.filter((slide) => slide.type === 'instagram').length;
assert(instagramCount >= 2, 'add Instagram slides occasionally');

console.log(`Validated ${slides.length} slides, including ${instagramCount} Instagram moments.`);
