/**
 * Smaller interactions that each take only a few lines:
 * the row of cards, the card under the pointer and the pool ripples.
 */
import { find, findAll } from '../lib/dom';
import { gsap, matches, queries } from '../lib/motion';

/** Card row: the arrow buttons move the row by one card. */
export function initScroller(): void {
  const scroller = find('[data-scroller]');
  const track = scroller && find('[data-scroller-track]', scroller);
  if (!scroller || !track) return;

  const previous = find<HTMLButtonElement>('[data-scroller-previous]', scroller);
  const next = find<HTMLButtonElement>('[data-scroller-next]', scroller);

  const step = (direction: 1 | -1) => {
    // While the row is held still and moved by scrolling, the scroll scene
    // takes the step instead (scripts/scenes/experiences.ts).
    const handled = !scroller.dispatchEvent(
      new CustomEvent('scroller:step', { detail: direction, cancelable: true }),
    );
    if (handled) return;
    const card = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const distance = (card?.getBoundingClientRect().width ?? track.clientWidth) + gap;
    track.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  // Grey out an arrow when there is nothing more in that direction.
  const updateButtons = () => {
    if (scroller.hasAttribute('data-pinned')) return;
    const end = track.scrollWidth - track.clientWidth - 1;
    if (previous) previous.disabled = track.scrollLeft <= 0;
    if (next) next.disabled = track.scrollLeft >= end;
  };

  previous?.addEventListener('click', () => step(-1));
  next?.addEventListener('click', () => step(1));
  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons, { passive: true });
  updateButtons();
}

/** Cards: the card under the pointer tilts toward it, and a light follows it. */
export function initCardHover(): void {
  if (!matches(queries.finePointer) || !matches(queries.fullMotion)) return;

  findAll('[data-card]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      card.style.setProperty('--light-x', `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty('--light-y', `${((y + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${(x * 6).toFixed(2)}deg`);
      card.style.setProperty('--shift-x', `${(-x * 3).toFixed(2)}%`);
      card.style.setProperty('--shift-y', `${(-y * 3).toFixed(2)}%`);
    });
    card.addEventListener('pointerleave', () => {
      ['--light-x', '--light-y', '--tilt-x', '--tilt-y', '--shift-x', '--shift-y'].forEach((name) =>
        card.style.removeProperty(name),
      );
    });
  });
}

/** Pool: two rings follow the pointer or finger across the water. */
export function initPoolRipples(): void {
  const surface = find('[data-ripples]');
  const near = surface && find('[data-ripple="near"]', surface);
  const far = surface && find('[data-ripple="far"]', surface);
  const layer = near?.parentElement;
  if (!surface || !near || !far || !layer) return;

  // Each ring glides after the pointer, the wider one more slowly. quickTo
  // keeps one animation per ring and retargets it, rather than starting a
  // new one on every movement of the pointer.
  const follow = (ring: HTMLElement, duration: number) => ({
    x: gsap.quickTo(ring, 'x', { duration, ease: 'power3.out' }),
    y: gsap.quickTo(ring, 'y', { duration, ease: 'power3.out' }),
  });
  const rings = [follow(near, 0.7), follow(far, 1.4)];

  // The layer is measured when the pointer arrives, and again only after the
  // page has scrolled. Measuring on every movement would make the browser
  // work out the layout again each time.
  let box: DOMRect | undefined;
  let entered = false;

  surface.addEventListener('pointerenter', () => {
    box = undefined;
    entered = false;
  });
  surface.addEventListener('pointermove', (event) => {
    box ??= layer.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    // The first time, the rings appear where the pointer is, not glide in from a corner.
    if (!entered) gsap.set([near, far], { x, y });
    rings.forEach((ring) => {
      ring.x(x);
      ring.y(y);
    });
    entered = true;
    surface.toggleAttribute('data-rippling', true);
  });
  surface.addEventListener('pointerleave', () => surface.removeAttribute('data-rippling'));
  window.addEventListener('scroll', () => (box = undefined), { passive: true });
}
