/**
 * Experiences scene: the row of cards travels sideways as the visitor
 * scrolls up and down.
 *
 * The row sticks to the screen (plain CSS). This script measures how far the
 * cards have to travel, makes the section that much taller, and moves the
 * cards by the scroll position. Each picture also drifts a little inside its
 * frame as its card crosses the screen, which gives the row some depth.
 *
 * The arrow buttons belong to scripts/ui/small-interactions.ts. It asks
 * first, with a `scroller:step` event, whether anyone wants to handle a step.
 * Here we do: we scroll the page to the next card's position.
 */
import { find, findAll } from '../lib/dom';
import { gsap, ScrollTrigger } from '../lib/motion';

const twoDigits = (value: number) => String(value).padStart(2, '0');

export function createExperiences(): () => void {
  const run = find('[data-scroller]');
  const track = run && find('[data-scroller-track]', run);
  if (!run || !track) return () => {};

  const cards = findAll('[data-card]', track);
  const progressBar = find('[data-scroller-progress]', run);
  const count = find('[data-scroller-count]', run);
  const previous = find<HTMLButtonElement>('[data-scroller-previous]', run);
  const next = find<HTMLButtonElement>('[data-scroller-next]', run);
  const last = cards.length - 1;

  /** How far the row must move for the last card to reach its resting place. */
  const measure = () => {
    const lastCard = cards[last];
    if (!lastCard) return 0;
    const gutter = parseFloat(getComputedStyle(track).paddingRight) || 0;
    const end = lastCard.offsetLeft + lastCard.offsetWidth + gutter;
    return Math.max(0, end - run.clientWidth);
  };
  let travel = 0;
  const applyTravel = () => {
    travel = measure();
    run.style.setProperty('--travel', `${travel}px`);
  };
  // Measure again, before the scroll positions are worked out, whenever the
  // window changes size.
  applyTravel();
  ScrollTrigger.addEventListener('refreshInit', applyTravel);
  run.toggleAttribute('data-pinned', true);

  const slide = gsap.to(track, {
    x: () => -travel,
    ease: 'none',
    scrollTrigger: {
      trigger: run,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => update(self.progress),
    },
  });

  function update(progress: number) {
    if (progressBar) gsap.set(progressBar, { scaleX: progress });
    if (count) count.textContent = twoDigits(Math.round(progress * last) + 1);
    if (previous) previous.disabled = progress <= 0.001;
    if (next) next.disabled = progress >= 0.999;
  }

  // Each picture drifts across its frame while its card crosses the screen.
  cards.forEach((card) => {
    const image = find('[data-card-image]', card);
    if (!image) return;
    gsap.fromTo(
      image,
      { xPercent: -6 },
      {
        xPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          containerAnimation: slide,
          start: 'left right',
          end: 'right left',
          scrub: true,
        },
      },
    );
  });

  // An arrow button, or an arrow key, moves the page to the next card's place.
  const step = (direction: number) => {
    const trigger = slide.scrollTrigger;
    if (!trigger || last < 1) return;
    const current = Math.round(trigger.progress * last);
    const target = Math.min(last, Math.max(0, current + direction));
    window.scrollTo({ top: trigger.start + (target / last) * (trigger.end - trigger.start) });
  };
  const onStep = (event: Event) => {
    event.preventDefault();
    step((event as CustomEvent<number>).detail);
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') step(1);
    if (event.key === 'ArrowLeft') step(-1);
  };
  run.addEventListener('scroller:step', onStep);
  track.addEventListener('keydown', onKey);

  return () => {
    ScrollTrigger.removeEventListener('refreshInit', applyTravel);
    run.removeEventListener('scroller:step', onStep);
    track.removeEventListener('keydown', onKey);
    run.removeAttribute('data-pinned');
    run.style.removeProperty('--travel');
    gsap.set([track, ...findAll('[data-card-image]', track), progressBar].filter(Boolean), {
      clearProps: 'all',
    });
  };
}
