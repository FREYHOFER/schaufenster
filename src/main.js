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

let currentIndex = 0;
let intervalId;

function renderSlide(index) {
  const slide = slides[index];
  const [from, to] = slide.palette;

  refs.root.style.setProperty('--accent-from', from);
  refs.root.style.setProperty('--accent-to', to);
  refs.root.style.setProperty('--duration', `${slideDurationMs}ms`);

  refs.slide.dataset.type = slide.type;
  refs.eyebrow.textContent = slide.eyebrow;
  refs.kicker.textContent = slide.kicker;
  refs.title.textContent = slide.title;
  refs.author.textContent = slide.author;
  refs.focus.textContent = slide.focus;
  refs.note.textContent = slide.note;
  refs.source.textContent = slide.source;
  refs.counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  refs.visual.textContent = slide.symbol;

  refs.progressBar.getAnimations().forEach((animation) => animation.cancel());
  refs.progressBar.animate(
    [
      { transform: 'scaleX(0)' },
      { transform: 'scaleX(1)' }
    ],
    { duration: slideDurationMs, easing: 'linear', fill: 'forwards' }
  );

  refs.slide.classList.remove('is-active');
  window.requestAnimationFrame(() => refs.slide.classList.add('is-active'));
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length;
  renderSlide(currentIndex);
}

renderSlide(currentIndex);
intervalId = window.setInterval(nextSlide, slideDurationMs);

document.addEventListener('visibilitychange', () => {
  window.clearInterval(intervalId);

  if (document.visibilityState === 'visible') {
    renderSlide(currentIndex);
    intervalId = window.setInterval(nextSlide, slideDurationMs);
  }
});
