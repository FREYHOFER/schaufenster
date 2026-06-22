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
  previousSlide: document.querySelector('#previousSlide'),
  nextSlide: document.querySelector('#nextSlide')
};

const params = new URLSearchParams(window.location.search);

let currentIndex = getInitialIndex();
let advanceTimeoutId;
let particleAnimationTimerId;
let preloadTimerId;
const imagePreloads = new Map();

function normalizeIndex(index) {
  return ((index % slides.length) + slides.length) % slides.length;
}

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
  return normalizeIndex(index);
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

function preloadImage(src, priority = 'low') {
  if (!src || imagePreloads.has(src)) {
    return;
  }

  const image = new Image();
  image.decoding = 'async';
  image.loading = 'eager';
  image.fetchPriority = priority;
  image.src = src;
  imagePreloads.set(src, image);
}

function scheduleUpcomingImagePreloads(index) {
  window.clearTimeout(preloadTimerId);
  preloadTimerId = window.setTimeout(() => {
    let queued = 0;

    for (let offset = 1; offset < slides.length && queued < 3; offset += 1) {
      const candidate = slides[normalizeIndex(index + offset)];

      if (candidate.media?.kind === 'image' && candidate.media.src) {
        preloadImage(candidate.media.src);
        queued += 1;
      }
    }
  }, 180);
}

function renderImage(slide) {
  const shell = document.createElement('div');
  shell.className = 'cover-shell';
  preloadImage(slide.media.src, 'high');

  const image = document.createElement('img');
  image.className = 'cover-image';
  image.src = slide.media.src;
  image.alt = slide.media.alt || `Cover von ${slide.title}`;
  image.decoding = 'async';
  image.loading = 'eager';
  image.fetchPriority = 'high';
  image.addEventListener('error', () => renderSymbol(slide), { once: true });

  shell.append(image);
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

function setClampedText(ref, value) {
  setOptionalText(ref, value);

  if (!value) {
    ref.removeAttribute('title');
    return;
  }

  const fullText = value.trim();
  ref.textContent = fullText;
  ref.removeAttribute('title');

  if (ref.scrollHeight <= ref.clientHeight + 1) {
    return;
  }

  let low = 0;
  let high = fullText.length;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    ref.textContent = `${fullText.slice(0, mid).trimEnd()}...`;

    if (ref.scrollHeight <= ref.clientHeight + 1) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const hardClip = fullText.slice(0, Math.max(0, high)).trimEnd();
  const wordClip = hardClip.replace(/\s+\S*$/, '').trimEnd();
  ref.textContent = `${wordClip || hardClip}...`;
  ref.title = fullText;
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

function syncUrlToSlide(index) {
  params.set('slide', String(index + 1));
  params.delete('index');

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  window.history.replaceState(null, '', nextUrl);
}

function seededValue(seed) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function stopParticleAnimation() {
  if (particleAnimationTimerId) {
    window.clearInterval(particleAnimationTimerId);
    particleAnimationTimerId = undefined;
  }
}

function animateHeatParticles(specs) {
  stopParticleAnimation();

  const animate = () => {
    const seconds = window.performance.now() / 1000;

    specs.forEach((spec) => {
      const rawProgress = (seconds / spec.duration + spec.offset) % 1;
      const easedProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
      const fadeIn = Math.min(rawProgress / 0.16, 1);
      const fadeOut = rawProgress > 0.72 ? Math.max(0, (1 - rawProgress) / 0.28) : 1;
      const opacity = spec.opacity * fadeIn * fadeOut;
      const sway = Math.sin(rawProgress * Math.PI * 2 + spec.wobble) * spec.sway;
      const x = spec.driftX * easedProgress + sway;
      const y = 24 + spec.driftY * easedProgress;
      const scale = 0.45 + easedProgress * 1.05;

      spec.element.style.opacity = opacity.toFixed(3);
      spec.element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
    });
  };

  animate();
  particleAnimationTimerId = window.setInterval(animate, 50);
}

function renderParticles(slide, index) {
  stopParticleAnimation();
  refs.slide.querySelector('.particles')?.remove();

  if (slide.type === 'poster') {
    return;
  }

  const field = document.createElement('div');
  field.className = 'particles';
  field.setAttribute('aria-hidden', 'true');

  const count = slide.type === 'book' ? 42 : 24;
  const colors = slide.palette;
  const specs = [];

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement('span');
    const seed = (index + 1) * 97 + i * 17;
    const size = 1.6 + seededValue(seed + 1) * 5.4;
    const driftX = -78 + seededValue(seed + 2) * 156;
    const driftY = -180 - seededValue(seed + 3) * 320;
    const startY = 78 + seededValue(seed + 5) * 32;
    const duration = 6.5 + seededValue(seed + 6) * 8.5;
    const opacity = 0.18 + seededValue(seed + 7) * 0.32;
    const blur = seededValue(seed + 8) * 1.8;
    const offset = seededValue(seed + 9);
    const sway = 8 + seededValue(seed + 10) * 26;
    const wobble = seededValue(seed + 11) * Math.PI * 2;

    particle.style.setProperty('--x', `${seededValue(seed + 4) * 100}%`);
    particle.style.setProperty('--y', `${startY}%`);
    particle.style.setProperty('--size', `${size}px`);
    particle.style.setProperty('--delay', `${offset * duration * -1}s`);
    particle.style.setProperty('--heat-duration', `${duration}s`);
    particle.style.setProperty('--particle-blur', `${blur.toFixed(2)}px`);
    particle.style.setProperty('--particle-color', colors[i % colors.length]);
    field.append(particle);
    specs.push({
      element: particle,
      driftX,
      driftY,
      duration,
      offset,
      opacity,
      sway,
      wobble
    });
  }

  refs.slide.prepend(field);
  animateHeatParticles(specs);
}

function renderSlide(index) {
  const slide = slides[index];
  const [from, to] = slide.palette;
  const baseDuration = getSlideDuration(slide);
  const isLight = slide.theme === 'light' || slide.theme === 'poster';

  refs.root.style.setProperty('--accent-from', from);
  refs.root.style.setProperty('--accent-to', to);
  refs.root.style.setProperty('--text', isLight ? '#20231f' : '#fffaf2');
  refs.root.style.setProperty('--muted', isLight ? 'rgba(32, 35, 31, 0.68)' : 'rgba(255, 250, 242, 0.7)');
  syncUrlToSlide(index);

  refs.slide.dataset.type = slide.type;
  refs.slide.dataset.theme = slide.theme || 'dark';
  refs.slide.dataset.media = slide.media?.kind || 'symbol';
  refs.eyebrow.textContent = slide.eyebrow;
  setOptionalText(refs.kicker, slide.kicker);
  refs.title.textContent = slide.title;
  refs.author.textContent = slide.author;
  setClampedText(refs.focus, slide.focus);
  setOptionalText(refs.note, slide.note);
  renderParticles(slide, index);
  const mediaElement = renderVisual(slide);
  scheduleUpcomingImagePreloads(index);

  scheduleNextSlide(baseDuration);

  if (mediaElement instanceof HTMLVideoElement) {
    const syncVideoDuration = () => {
      const videoDuration = getVideoDuration(mediaElement, baseDuration);
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
  currentIndex = normalizeIndex(currentIndex + 1);
  renderSlide(currentIndex);
}

function previousSlide() {
  currentIndex = normalizeIndex(currentIndex - 1);
  renderSlide(currentIndex);
}

function handleKeyboardNavigation(event) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return;
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    nextSlide();
    return;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    previousSlide();
  }
}

function handlePointerNavigation(event) {
  if (event.pointerType === 'touch') {
    return;
  }

  const rect = refs.slide.getBoundingClientRect();
  const position = (event.clientX - rect.left) / rect.width;

  if (position <= 0.22) {
    refs.slide.dataset.navHover = 'previous';
    return;
  }

  if (position >= 0.78) {
    refs.slide.dataset.navHover = 'next';
    return;
  }

  delete refs.slide.dataset.navHover;
}

function clearPointerNavigation() {
  delete refs.slide.dataset.navHover;
}

function bindNavigation() {
  refs.nextSlide?.addEventListener('click', nextSlide);
  refs.previousSlide?.addEventListener('click', previousSlide);
  refs.slide.addEventListener('pointermove', handlePointerNavigation);
  refs.slide.addEventListener('pointerleave', clearPointerNavigation);
  window.addEventListener('keydown', handleKeyboardNavigation);
}

function renderCurrentSlide() {
  renderSlide(currentIndex);
}

bindNavigation();
renderCurrentSlide();

document.addEventListener('visibilitychange', () => {
  window.clearTimeout(advanceTimeoutId);

  if (document.visibilityState === 'visible') {
    renderCurrentSlide();
  }
});
