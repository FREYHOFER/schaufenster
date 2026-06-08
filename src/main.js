import './styles.css';
import { slideDurationMs, slides } from './slides.js';

const refs = {
  root: document.documentElement,
  slide: document.querySelector('#slide'),
  eyebrow: document.querySelector('#eyebrow'),
  visual: document.querySelector('#visual'),
  kicker: document.querySelector('#kicker'),
  title: document.querySelector('#title'),
  author: document.querySelector('#author'),
  focus: document.querySelector('#focus'),
  note: document.querySelector('#note'),
  source: document.querySelector('#source'),
  counter: document.querySelector('#counter'),
  progressBar: document.querySelector('#progressBar')
};

const params = new URLSearchParams(window.location.search);

let currentIndex = getInitialIndex();
let advanceTimeoutId;
let progressAnimation;

function getInitialIndex() {
  const rawIndex = params.get('index');
  const rawSlide = params.get('slide');
  const raw = rawSlide ?? rawIndex;

  if (!raw) {
    return 0;
  }

  const value = Number.parseInt(raw, 10);

  if (!Number.isFinite(value)) {
    return 0;
  }

  const index = rawSlide ? value - 1 : value;
  return ((index % slides.length) + slides.length) % slides.length;
}

function isPaused() {
  return params.get('pause') === '1' || params.get('pause') === 'true';
}

function getVideoType(src) {
  if (/\.webm($|\?)/i.test(src)) return 'video/webm';
  if (/\.ogv|\.ogg($|\?)/i.test(src)) return 'video/ogg';
  return 'video/mp4';
}

function isDirectVideo(src = '') {
  return /\.(mp4|webm|ogv|ogg|mov)($|\?)/i.test(src);
}

function getInstagramEmbedUrl(src = '') {
  try {
    const url = new URL(src);

    if (!url.hostname.includes('instagram.com')) {
      return src;
    }

    const match = url.pathname.match(/\/(p|reel|tv)\/([^/]+)/i);
    if (!match) {
      return src;
    }

    return `https://www.instagram.com/${match[1].toLowerCase()}/${match[2]}/embed/`;
  } catch {
    return src;
  }
}

function renderSymbol(slide) {
  refs.visual.dataset.media = 'symbol';
  refs.visual.textContent = slide.symbol;
}

function renderImage(slide) {
  const shell = document.createElement('div');
  shell.className = 'cover-shell';

  const glow = document.createElement('img');
  glow.className = 'cover-glow';
  glow.src = slide.media.src;
  glow.alt = '';
  glow.decoding = 'async';
  glow.loading = 'eager';

  const image = document.createElement('img');
  image.className = 'cover-image';
  image.src = slide.media.src;
  image.alt = slide.media.alt || `Cover von ${slide.title}`;
  image.decoding = 'async';
  image.loading = 'eager';
  image.addEventListener('error', () => renderSymbol(slide), { once: true });

  shell.append(glow, image);
  refs.visual.append(shell);
}

function renderVideo(slide) {
  const video = document.createElement('video');
  video.className = 'visual-video';
  video.autoplay = true;
  video.loop = slide.media.loop !== false;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.disablePictureInPicture = true;
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-label', slide.media.alt || slide.title);

  if (video.loop) {
    video.setAttribute('loop', '');
  }

  if (slide.media.poster) {
    video.poster = slide.media.poster;
  }

  const source = document.createElement('source');
  source.src = slide.media.src;
  source.type = getVideoType(slide.media.src);
  video.append(source);
  video.addEventListener('error', () => renderSymbol(slide), { once: true });
  video.addEventListener('canplay', () => video.play().catch(() => {}), { once: true });

  refs.visual.append(video);
  video.play().catch(() => {});
  return video;
}

function renderInstagramEmbed(slide) {
  const shell = document.createElement('div');
  shell.className = 'instagram-embed';

  const frame = document.createElement('iframe');
  frame.title = slide.media.alt || slide.title;
  frame.src = getInstagramEmbedUrl(slide.media.src);
  frame.loading = 'eager';
  frame.allow = 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';

  shell.append(frame);
  refs.visual.append(shell);
}

function renderInstagramPoster(slide) {
  const phone = document.createElement('div');
  phone.className = `social-phone ${slide.media?.accent || ''}`.trim();

  const chrome = document.createElement('div');
  chrome.className = 'social-chrome';
  chrome.innerHTML = '<span></span><span></span><span></span>';

  const reel = document.createElement('div');
  reel.className = 'social-reel';
  reel.innerHTML = '<span></span><span></span><span></span>';

  const play = document.createElement('div');
  play.className = 'play-mark';
  play.setAttribute('aria-hidden', 'true');

  const label = document.createElement('p');
  label.className = 'social-label';
  label.textContent = slide.media?.title || slide.title;

  phone.append(chrome, reel, play, label);
  refs.visual.append(phone);
}

function renderVisual(slide) {
  const media = slide.media;
  refs.visual.replaceChildren();
  refs.visual.textContent = '';
  refs.visual.dataset.media = media?.kind || 'symbol';

  if (media?.kind === 'image' && media.src) {
    renderImage(slide);
    return null;
  }

  if (media?.kind === 'video' && media.src) {
    return renderVideo(slide);
  }

  if (media?.kind === 'instagram' && media.src) {
    if (isDirectVideo(media.src)) {
      return renderVideo({ ...slide, media: { ...media, kind: 'video' } });
    }

    renderInstagramEmbed(slide);
    return null;
  }

  if (media?.kind === 'instagram') {
    renderInstagramPoster(slide);
    return null;
  }

  renderSymbol(slide);
  return null;
}

function setOptionalText(ref, value) {
  ref.textContent = value || '';
  ref.hidden = !value;
}

function getSlideDuration(slide) {
  return slide.durationMs || slideDurationMs;
}

function getVideoDuration(video, fallbackMs) {
  if (!Number.isFinite(video.duration) || video.duration <= 0) {
    return fallbackMs;
  }

  return Math.max(fallbackMs, Math.ceil(video.duration * 1000) + 1200);
}

function scheduleNextSlide(durationMs) {
  window.clearTimeout(advanceTimeoutId);

  if (!isPaused()) {
    advanceTimeoutId = window.setTimeout(nextSlide, durationMs);
  }
}

function startProgress(durationMs) {
  refs.root.style.setProperty('--duration', `${durationMs}ms`);
  progressAnimation?.cancel();

  refs.progressBar.style.transform = 'scaleX(0)';

  if (isPaused()) {
    return;
  }

  progressAnimation = refs.progressBar.animate(
    [
      { transform: 'scaleX(0)' },
      { transform: 'scaleX(1)' }
    ],
    { duration: durationMs, easing: 'linear', fill: 'forwards' }
  );
}

function seededValue(seed) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function renderParticles(slide, index) {
  refs.slide.querySelector('.particles')?.remove();

  const field = document.createElement('div');
  field.className = 'particles';
  field.setAttribute('aria-hidden', 'true');

  const count = slide.type === 'book' ? 34 : 18;
  const colors = slide.palette;

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement('span');
    const seed = (index + 1) * 97 + i * 17;
    const size = 4 + seededValue(seed + 1) * 13;
    const driftX = -44 + seededValue(seed + 2) * 88;
    const driftY = -36 + seededValue(seed + 3) * 72;

    particle.style.setProperty('--x', `${seededValue(seed + 4) * 100}%`);
    particle.style.setProperty('--y', `${seededValue(seed + 5) * 100}%`);
    particle.style.setProperty('--size', `${size}px`);
    particle.style.setProperty('--dx', `${driftX}px`);
    particle.style.setProperty('--dy', `${driftY}px`);
    particle.style.setProperty('--delay', `${seededValue(seed + 6) * -18}s`);
    particle.style.setProperty('--particle-color', colors[i % colors.length]);
    field.append(particle);
  }

  refs.slide.prepend(field);
}

function renderSlide(index) {
  const slide = slides[index];
  const [from, to] = slide.palette;
  const baseDuration = getSlideDuration(slide);

  refs.root.style.setProperty('--accent-from', from);
  refs.root.style.setProperty('--accent-to', to);

  refs.slide.dataset.type = slide.type;
  refs.slide.dataset.media = slide.media?.kind || 'symbol';
  refs.eyebrow.textContent = slide.eyebrow;
  setOptionalText(refs.kicker, slide.kicker);
  refs.title.textContent = slide.title;
  refs.author.textContent = slide.author;
  setOptionalText(refs.focus, slide.focus);
  setOptionalText(refs.note, slide.note);
  refs.source.textContent = slide.source;
  refs.counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  renderParticles(slide, index);
  const mediaElement = renderVisual(slide);

  startProgress(baseDuration);
  scheduleNextSlide(baseDuration);

  if (mediaElement instanceof HTMLVideoElement) {
    const syncVideoDuration = () => {
      const videoDuration = getVideoDuration(mediaElement, baseDuration);
      startProgress(videoDuration);
      scheduleNextSlide(videoDuration);
      mediaElement.play().catch(() => {});
    };

    if (mediaElement.readyState >= 1) {
      syncVideoDuration();
    } else {
      mediaElement.addEventListener('loadedmetadata', syncVideoDuration, { once: true });
    }
  }

  refs.slide.classList.remove('is-active');
  window.requestAnimationFrame(() => refs.slide.classList.add('is-active'));
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length;
  renderSlide(currentIndex);
}

renderSlide(currentIndex);

document.addEventListener('visibilitychange', () => {
  window.clearTimeout(advanceTimeoutId);

  if (document.visibilityState === 'visible') {
    renderSlide(currentIndex);
  }
});
