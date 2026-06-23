import { slides, slideDurationMs } from '../src/slides.js';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

assert(Array.isArray(slides), 'slides must be an array');
assert(slides.length >= 8, 'slideshow should contain at least 8 slides');
assert(slideDurationMs >= 20000, 'slides should stay visible long enough for shop-window reading');

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
    assert(slide.note.trim(), `book slide ${index + 1} is missing note`);
    assert(slide.media?.kind === 'book', `book slide ${index + 1} needs 3D book media`);
    assert(typeof slide.media.src === 'string' && slide.media.src.trim(), `book slide ${index + 1} is missing media src`);
    assert(typeof slide.media.coverSrc === 'string' && slide.media.coverSrc.trim(), `book slide ${index + 1} is missing its fallback cover`);
  }

  if (slide.media) {
    assert(['book', 'image', 'collection', 'video', 'instagram'].includes(slide.media.kind), `slide ${index + 1} has unsupported media kind`);

    if (slide.media.kind === 'book') {
      for (const src of [slide.media.src.split('?')[0], slide.media.coverSrc]) {
        const publicPath = join(process.cwd(), 'public', src.slice(1));
        assert(existsSync(publicPath), `book slide ${index + 1} media file does not exist: ${src}`);
      }

      const projectSrc = new URLSearchParams(slide.media.src.split('?')[1]).get('project');
      assert(projectSrc?.startsWith('/'), `book slide ${index + 1} needs a local project URL`);
      const projectPath = join(process.cwd(), 'public', projectSrc.slice(1));
      assert(existsSync(projectPath), `book slide ${index + 1} project does not exist: ${projectSrc}`);
      const project = JSON.parse(readFileSync(projectPath, 'utf8'));
      assert(project.title === slide.title, `book slide ${index + 1} project title does not match`);
      assert(project.author === slide.author, `book slide ${index + 1} project author does not match`);
      assert(project.isbn === slide.isbn, `book slide ${index + 1} project ISBN does not match`);
      assert(existsSync(join(dirname(projectPath), project.cover_path)), `book slide ${index + 1} project cover does not exist`);
    }

    if (slide.media.kind === 'collection') {
      assert(Array.isArray(slide.media.items) && slide.media.items.length >= 3, `collection slide ${index + 1} needs at least three books`);

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
assert(bookCount >= 10, 'show at least 10 book slides');
assert(collectionCount === 2, 'show the Manga and Young Adult collection slides');
assert(posterCount === 4, 'show the four restored poster slides');
assert(communityCount === 1, 'show the restored community slide');
assert(instagramCount === 0, 'keep Instagram slides disabled for the live version');
assert(videoCount === 0, 'keep video slides disabled for the live version');

console.log(
  `Validated ${slides.length} slides: ${bookCount} books, ${collectionCount} collections, ${posterCount} posters and ${communityCount} community slide.`
);
