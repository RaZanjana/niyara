/**
 * Arrival scene: a slit of daylight in the dark of the gateway opens until
 * the courtyard fills the screen, as if walking through.
 *
 * The scroll distance has two parts: one screen during which the film before
 * it dissolves away on top of this scene, then the hold, during which the
 * gateway opens.
 */
import { find } from '../lib/dom';
import { gsap } from '../lib/motion';

/** How much of the picture the closed gateway hides: top, right, bottom, left. */
const CLOSED = {
  wide: 'inset(14% 39% 14% 39%)',
  // On a phone the words stand below the slit of light, so it sits high.
  narrow: 'inset(11% 27% 48% 27%)',
};
const OPEN = 'inset(0% 0% 0% 0%)';

export function createArrival({ wide }: { wide: boolean }): () => void {
  const scene = find('#arrival');
  const stage = find('[data-arrival-stage]');
  const doorway = find('[data-arrival-doorway]');
  const view = find('[data-arrival-view]');
  const panel = find('[data-arrival-panel]');
  const glow = find('[data-arrival-glow]');
  if (!scene || !stage || !doorway || !view || !panel) return () => {};

  // Measured in screens: 0 to 1 is the dissolve in, the rest is the hold.
  const screens = (scene.offsetHeight - stage.offsetHeight) / stage.offsetHeight;
  const hold = Math.max(0.5, screens - 1);
  const opening = hold * 0.82;

  const walk = gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
    })
    .fromTo(
      doorway,
      { clipPath: wide ? CLOSED.wide : CLOSED.narrow },
      { clipPath: OPEN, duration: opening, ease: 'power1.inOut' },
      1,
    )
    // The view starts a little too close and settles back, like a step forward.
    .fromTo(view, { scale: 1.32 }, { scale: 1, duration: opening + 0.6, ease: 'sine.out' }, 0.4)
    // The words arrive as the film above clears, and go as the light reaches them.
    .fromTo(
      panel,
      { autoAlpha: 0, x: -28 },
      { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power2.out' },
      0.55,
    )
    .to(panel, { autoAlpha: 0, duration: opening * 0.22 }, 1 + opening * 0.22)
    .set({}, {}, screens);

  // The light that spills from the gateway grows as it opens.
  if (glow) walk.fromTo(glow, { opacity: 0.28 }, { opacity: 1, duration: opening }, 1);

  return () => gsap.set([doorway, view, panel, glow].filter(Boolean), { clearProps: 'all' });
}
