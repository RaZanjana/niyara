/**
 * Gallery: shows one photograph at a time.
 *
 * Ways to change the picture: the arrow buttons, a thumbnail, a swipe,
 * or the left and right keys while the picture has focus.
 * The transition itself is CSS (see Gallery.astro). This script only decides
 * which slide is active and keeps the caption, counter and thumbnails in step.
 */
import { find, findAll } from '../lib/dom';
import { matches, queries } from '../lib/motion';

/** A swipe must travel at least this far, in pixels, to count. */
const SWIPE_DISTANCE = 40;

/** How far a picture shifts as the pointer crosses it, in percent of its size. */
const LOOK_RANGE = 1.6;

export function initGallery(): void {
  const gallery = find('[data-gallery]');
  const stage = gallery && find('[data-gallery-stage]', gallery);
  if (!gallery || !stage) return;

  const slides = findAll('[data-gallery-slide]', gallery);
  const thumbs = findAll('[data-gallery-thumb]', gallery);
  const title = find('[data-gallery-title]', gallery);
  const caption = find('[data-gallery-caption]', gallery);
  const count = find('[data-gallery-count]', gallery);
  let current = 0;

  function show(index: number) {
    // Wrap around at both ends.
    current = (index + slides.length) % slides.length;
    const slide = slides[current];

    slides.forEach((item, itemIndex) => item.toggleAttribute('data-active', itemIndex === current));
    thumbs.forEach((thumb, thumbIndex) =>
      thumb.setAttribute('aria-current', String(thumbIndex === current)),
    );
    if (title) title.textContent = slide?.dataset.title ?? '';
    if (caption) caption.textContent = slide?.dataset.caption ?? '';
    if (count) count.textContent = `${current + 1} of ${slides.length}`;
  }

  find('[data-gallery-previous]', gallery)?.addEventListener('click', () => show(current - 1));
  find('[data-gallery-next]', gallery)?.addEventListener('click', () => show(current + 1));
  thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => show(index)));

  stage.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });

  // Swipe, for touch screens.
  let swipeStart: number | undefined;
  stage.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse') swipeStart = event.clientX;
  });
  stage.addEventListener('pointerup', (event) => {
    if (swipeStart === undefined) return;
    const distance = event.clientX - swipeStart;
    swipeStart = undefined;
    if (distance <= -SWIPE_DISTANCE) show(current + 1);
    if (distance >= SWIPE_DISTANCE) show(current - 1);
  });
  stage.addEventListener('pointercancel', () => (swipeStart = undefined));

  // "Looking around": the picture shifts a little against the pointer.
  if (matches(queries.finePointer) && matches(queries.fullMotion)) {
    stage.addEventListener('pointermove', (event) => {
      const box = stage.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      stage.style.setProperty('--look-x', `${(-x * LOOK_RANGE).toFixed(2)}%`);
      stage.style.setProperty('--look-y', `${(-y * LOOK_RANGE).toFixed(2)}%`);
      stage.toggleAttribute('data-looking', true);
    });
    stage.addEventListener('pointerleave', () => {
      stage.style.removeProperty('--look-x');
      stage.style.removeProperty('--look-y');
      stage.removeAttribute('data-looking');
    });
  }

  show(0);
}
