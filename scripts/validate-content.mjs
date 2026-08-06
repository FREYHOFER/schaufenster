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

const fullBookTitles = new Set(slides.filter((slide) => slide.type === 'book').map((slide) => slide.title));

slides.forEach((slide, index) => {
  for (const field of ['type', 'eyebrow', 'title', 'author', 'symbol']) {
    assert(typeof slide[field] === 'string' && slide[field].trim(), `slide ${index + 1} is missing ${field}`);
  }

  assert(['book', 'collection', 'instagram', 'event', 'info', 'poster', 'community'].includes(slide.type), `slide ${index + 1} has an unsupported type`);
  assert(Array.isArray(slide.palette) && slide.palette.length === 2, `slide ${index + 1} needs two palette colors`);
  assert(!slide.durationMs || slide.durationMs >= 15000, `slide ${index + 1} duration is too short`);
  assert(typeof slide.focus === 'string', `slide ${index + 1} focus must be a string`);
  assert(typeof slide.note === 'string', `slide ${index + 1} note must be a string`);
  assert(slide.focus.length <= 360, `slide ${index + 1} focus text is too long`);
  assert(slide.note.length <= 220, `slide ${index + 1} note text is too long`);

  if (slide.type === 'book') {
    assert(typeof slide.kicker === 'string', `book slide ${index + 1} kicker must be a string`);
    assert(slide.focus.trim(), `book slide ${index + 1} is missing focus`);
    assert(slide.focus.endsWith(' …'), `book slide ${index + 1} should end its excerpt with an ellipsis`);
    assert(!slide.note.trim(), `book slide ${index + 1} should not add promotional copy below the excerpt`);
    assert(!slide.audience.trim(), `book slide ${index + 1} should keep age information in the eyebrow`);
    assert(slide.media?.kind === 'image', `book slide ${index + 1} needs clean cover image media`);
    assert(typeof slide.media.src === 'string' && slide.media.src.trim(), `book slide ${index + 1} is missing media src`);
    assert(typeof slide.media.coverSrc === 'string' && slide.media.coverSrc.trim(), `book slide ${index + 1} is missing its cover source`);
    assert(slide.media.src === slide.media.coverSrc, `book slide ${index + 1} should render the Libri cover directly`);
    assert(/\.jpg($|\?)/i.test(slide.media.src), `book slide ${index + 1} should use the rectangular JPG cover`);
  }

  if (slide.media) {
    assert(['image', 'collection', 'video', 'instagram'].includes(slide.media.kind), `slide ${index + 1} has unsupported media kind`);

    if (slide.media.kind === 'collection') {
      assert(Array.isArray(slide.media.items) && slide.media.items.length >= 1, `collection slide ${index + 1} needs at least one book`);
      assert(Array.isArray(slide.media.backgroundItems), `collection slide ${index + 1} needs decorative background titles`);
      assert(slide.media.backgroundItems.length >= 3, `collection slide ${index + 1} needs at least three decorative background titles`);

      const foregroundTitles = new Set(slide.media.items.map((item) => item.title));

      slide.media.backgroundItems.forEach((item, itemIndex) => {
        assert(typeof item.label === 'string' && item.label.trim(), `collection slide ${index + 1}, background title ${itemIndex + 1} is missing label`);
        assert(typeof item.title === 'string' && item.title.trim(), `collection slide ${index + 1}, background title ${itemIndex + 1} is missing title`);
        assert(typeof item.author === 'string' && item.author.trim(), `collection slide ${index + 1}, background title ${itemIndex + 1} is missing author`);
        assert(!foregroundTitles.has(item.title), `collection slide ${index + 1}, background title ${itemIndex + 1} duplicates a foreground title`);
        assert(!fullBookTitles.has(item.title), `collection slide ${index + 1}, background title ${itemIndex + 1} duplicates a full book slide`);
      });

      slide.media.items.forEach((item, itemIndex) => {
        assert(typeof item.title === 'string' && item.title.trim(), `collection slide ${index + 1}, book ${itemIndex + 1} is missing title`);
        assert(typeof item.author === 'string' && item.author.trim(), `collection slide ${index + 1}, book ${itemIndex + 1} is missing author`);
        assert(typeof item.src === 'string' && item.src.trim(), `collection slide ${index + 1}, book ${itemIndex + 1} is missing media src`);

        if (item.src.startsWith('/')) {
          const publicPath = join(process.cwd(), 'public', item.src.slice(1));
          assert(existsSync(publicPath), `collection slide ${index + 1} media file does not exist: ${item.src}`);
        }
      });
    }

    if (slide.media.kind !== 'book' && slide.media.src?.startsWith('/')) {
      const publicPath = join(process.cwd(), 'public', slide.media.src.slice(1));
      assert(existsSync(publicPath), `slide ${index + 1} media file does not exist: ${slide.media.src}`);
    }
  }
});

const bookCount = slides.filter((slide) => slide.type === 'book').length;
const collectionCount = slides.filter((slide) => slide.type === 'collection').length;
const instagramCount = slides.filter((slide) => slide.type === 'instagram').length;
const eventCount = slides.filter((slide) => slide.type === 'event').length;
const infoCount = slides.filter((slide) => slide.type === 'info').length;
const posterCount = slides.filter((slide) => slide.type === 'poster').length;
const communityCount = slides.filter((slide) => slide.type === 'community').length;
const videoCount = slides.filter((slide) => slide.media?.kind === 'video').length;
assert(bookCount === 0, 'keep individual book slides out of the condensed shop-window rotation');
assert(collectionCount === 8, 'show eight substantial editorial overview slides');
assert(posterCount === 3, 'show three deliberate shop-window slogans');
assert(communityCount === 1, 'show the restored community slide');
assert(instagramCount === 0, 'keep Instagram slides disabled for the live version');
assert(videoCount === 0, 'keep video slides disabled for the live version');

console.log(
  `Validated ${slides.length} slides: ${bookCount} books, ${collectionCount} collections, ${posterCount} posters and ${communityCount} community slide.`
);
