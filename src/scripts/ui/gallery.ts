/**
 * Gallery: shows one photograph at a time, and moves on by itself.
 *
 * Ways to change the picture: wait, or use the arrow buttons, a thumbnail,
 * a swipe, or the left and right keys while the picture has focus.
 *
 * The transition itself is CSS (see Gallery.astro). This script decides which
 * slide is shown, keeps the caption, counter, thumbnails and glow in step,
 * and runs the clock for the slideshow.
 *
 * The slideshow waits (the clock stops, and carries on from where it was)
 * while the pointer is on the picture, while the keyboard is inside the
 * gallery, while the gallery or the whole page is out of sight, and after the
 * pause button is pressed. For visitors who prefer reduced motion it only
 * runs if they press play.
 */
import { find, findAll } from '../lib/dom';
import { matches, queries } from '../lib/motion';

/** How long each picture is shown, in milliseconds. */
const SLIDE_TIME = 6500;

/** How long the last picture stays underneath while the next one sweeps in. */
const SWEEP_TIME = 2100;

/** How long the caption is out of sight while its words are changed. */
const CAPTION_DIP = 320;

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
  const glows = findAll('[data-gallery-glow]', gallery);
  const text = find('[data-gallery-text]', gallery);
  const title = find('[data-gallery-title]', gallery);
  const caption = find('[data-gallery-caption]', gallery);
  const count = find('[data-gallery-count]', gallery);
  const toggle = find<HTMLButtonElement>('[data-gallery-toggle]', gallery);
  if (slides.length === 0) return;

  let current = 0;
  let leavingTimer: number | undefined;
  let captionTimer: number | undefined;

  function show(index: number, direction: 'forward' | 'back' = 'forward') {
    const previous = current;
    // Wrap around at both ends.
    current = (index + slides.length) % slides.length;
    const slide = slides[current];
    if (!slide) return;

    // The picture before stays underneath until the new one has swept in.
    window.clearTimeout(leavingTimer);
    slides.forEach((item, itemIndex) => {
      item.toggleAttribute('data-active', itemIndex === current);
      item.toggleAttribute('data-leaving', itemIndex === previous && previous !== current);
    });
    leavingTimer = window.setTimeout(
      () => slides.forEach((item) => item.removeAttribute('data-leaving')),
      SWEEP_TIME,
    );
    stage?.setAttribute('data-direction', direction);

    thumbs.forEach((thumb, thumbIndex) =>
      thumb.setAttribute('aria-current', String(thumbIndex === current)),
    );
    glows.forEach((glow, glowIndex) => glow.toggleAttribute('data-active', glowIndex === current));
    if (count) count.textContent = `${current + 1} of ${slides.length}`;

    // The caption dips out of sight, changes, and comes back.
    const write = () => {
      if (title) title.textContent = slide.dataset.title ?? '';
      if (caption) caption.textContent = slide.dataset.caption ?? '';
      text?.removeAttribute('data-changing');
    };
    window.clearTimeout(captionTimer);
    if (text && previous !== current) {
      text.setAttribute('data-changing', '');
      captionTimer = window.setTimeout(write, CAPTION_DIP);
    } else {
      write();
    }

    elapsed = 0;
    drawTime();
  }

  // ---- The clock of the slideshow ----

  /** Reasons the slideshow is waiting. It runs only when there are none. */
  const waits = new Set<string>();
  let elapsed = 0;
  let lastTick: number | undefined;
  let frame: number | undefined;

  const drawTime = () =>
    gallery.style.setProperty('--time', Math.min(1, elapsed / SLIDE_TIME).toFixed(3));

  function tick(now: number) {
    if (lastTick !== undefined) elapsed += now - lastTick;
    lastTick = now;
    if (elapsed >= SLIDE_TIME) show(current + 1);
    else drawTime();
    frame = window.requestAnimationFrame(tick);
  }

  function setWaiting(reason: string, waiting: boolean) {
    if (waiting) waits.add(reason);
    else waits.delete(reason);

    const playing = waits.size === 0;
    if (playing && frame === undefined) {
      lastTick = undefined;
      frame = window.requestAnimationFrame(tick);
    }
    if (!playing && frame !== undefined) {
      window.cancelAnimationFrame(frame);
      frame = undefined;
    }

    // The button and the screen reader follow the visitor's own choice only.
    const paused = waits.has('button');
    gallery?.toggleAttribute('data-paused', paused);
    toggle?.setAttribute('aria-label', paused ? 'Play the slideshow' : 'Pause the slideshow');
    // New captions are read out only when the visitor is changing the picture
    // themselves, not every few seconds while the show runs.
    text?.setAttribute('aria-live', paused ? 'polite' : 'off');
  }

  toggle?.addEventListener('click', () => setWaiting('button', !waits.has('button')));
  stage.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') setWaiting('pointer', true);
  });
  stage.addEventListener('pointerleave', () => setWaiting('pointer', false));
  gallery.addEventListener('focusin', (event) => {
    // A mouse click also moves focus. Only keyboard focus should hold the show.
    if ((event.target as Element).matches(':focus-visible')) setWaiting('focus', true);
  });
  gallery.addEventListener('focusout', () => setWaiting('focus', false));
  document.addEventListener('visibilitychange', () => setWaiting('hidden', document.hidden));
  new IntersectionObserver(([entry]) => setWaiting('offscreen', !entry?.isIntersecting), {
    threshold: 0.35,
  }).observe(stage);

  // ---- Changing the picture by hand ----

  find('[data-gallery-previous]', gallery)?.addEventListener('click', () =>
    show(current - 1, 'back'),
  );
  find('[data-gallery-next]', gallery)?.addEventListener('click', () => show(current + 1));
  thumbs.forEach((thumb, index) =>
    thumb.addEventListener('click', () => show(index, index < current ? 'back' : 'forward')),
  );

  stage.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(current - 1, 'back');
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
    if (distance >= SWIPE_DISTANCE) show(current - 1, 'back');
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
  // Out of sight until the observer says otherwise, and paused from the start
  // for visitors who prefer reduced motion.
  waits.add('offscreen');
  setWaiting('button', !matches(queries.fullMotion));
}
