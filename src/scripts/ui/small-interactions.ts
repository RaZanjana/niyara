/**
 * Smaller interactions that each take only a few lines:
 * the row of cards, the map's road highlight and the pool ripples.
 */
import { find, findAll } from '../lib/dom';

/** Card row: the arrow buttons move the row by one card. */
export function initScroller(): void {
  const scroller = find('[data-scroller]');
  const track = scroller && find('[data-scroller-track]', scroller);
  if (!scroller || !track) return;

  const previous = find<HTMLButtonElement>('[data-scroller-previous]', scroller);
  const next = find<HTMLButtonElement>('[data-scroller-next]', scroller);

  const step = (direction: 1 | -1) => {
    const card = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const distance = (card?.getBoundingClientRect().width ?? track.clientWidth) + gap;
    track.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  // Grey out an arrow when there is nothing more in that direction.
  const updateButtons = () => {
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

/** Map: choosing a place in the list lights up its road. */
export function initLocation(): void {
  const section = find('[data-location]');
  if (!section) return;

  const buttons = findAll<HTMLButtonElement>('[data-destination]', section);
  const roads = findAll<SVGPathElement>('[data-road]', section);

  const highlight = (destination: string | undefined) => {
    buttons.forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.destination === destination)),
    );
    roads.forEach((road) => road.toggleAttribute('data-active', road.dataset.road === destination));
  };

  buttons.forEach((button) => {
    const destination = button.dataset.destination;
    // A click (or tap, or Enter key) switches the road on, and off again.
    button.addEventListener('click', () => {
      const isOn = button.getAttribute('aria-pressed') === 'true';
      highlight(isOn ? undefined : destination);
    });
    // With a mouse, hovering is enough to preview it.
    button.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') highlight(destination);
    });
    button.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse') highlight(undefined);
    });
  });
}

/** Pool: two rings follow the pointer or finger across the water. */
export function initPoolRipples(): void {
  const surface = find('[data-ripples]');
  if (!surface) return;

  surface.addEventListener('pointermove', (event) => {
    const box = surface.getBoundingClientRect();
    surface.style.setProperty(
      '--x',
      `${(((event.clientX - box.left) / box.width) * 100).toFixed(1)}%`,
    );
    surface.style.setProperty(
      '--y',
      `${(((event.clientY - box.top) / box.height) * 100).toFixed(1)}%`,
    );
    surface.toggleAttribute('data-rippling', true);
  });
  surface.addEventListener('pointerleave', () => surface.removeAttribute('data-rippling'));
}
