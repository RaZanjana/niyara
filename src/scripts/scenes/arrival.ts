/**
 * Arrival scene: the doorway in the brick wall opens until the courtyard
 * fills the screen, as if walking through the gateway.
 */
import { find } from '../lib/dom';
import { gsap } from '../lib/motion';

/** How much of the picture the closed doorway hides: top, right, bottom, left. */
const DOORWAY = {
  wide: 'inset(16% 37% 16% 37%)',
  narrow: 'inset(22% 24% 22% 24%)',
};
const OPEN = 'inset(0% 0% 0% 0%)';

export function createArrival({ wide }: { wide: boolean }): () => void {
  const scene = find('#arrival');
  const doorway = find('[data-arrival-doorway]');
  const view = find('[data-arrival-view]');
  const panel = find('[data-arrival-panel]');
  if (!scene || !doorway || !view || !panel) return () => {};

  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: scene, start: 'top 30%', end: 'bottom bottom', scrub: 0.4 },
    })
    .fromTo(
      doorway,
      { clipPath: wide ? DOORWAY.wide : DOORWAY.narrow },
      { clipPath: OPEN, duration: 1 },
      0,
    )
    // The view starts a little too close and settles back, like a step forward.
    .fromTo(view, { scale: 1.3 }, { scale: 1, duration: 1 }, 0)
    .to(panel, { autoAlpha: 0, duration: 0.25 }, 0.4);

  return () => gsap.set([doorway, view, panel], { clearProps: 'all' });
}
