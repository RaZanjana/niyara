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

/** How much of the picture the closed gateway hides on a wide screen: top, right, bottom, left. */
const CLOSED_WIDE = 'inset(14% 39% 14% 39%)';
const OPEN_WIDE = 'inset(0% 0% 0% 0%)';

/** On a phone: the space kept clear between the slit of light and the words, in pixels. */
const GAP_ABOVE_WORDS = 28;
/** On a phone: the share of the width the slit of light takes. */
const SLIT_WIDTH = 0.48;

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

  // On a phone the words stand below the slit of light, so the slit is
  // measured from where the words actually are, in pixels. A share of the
  // screen is not enough: on a real phone the browser's bars change how much
  // of the scene can be seen, and the words are raised above them.
  const header = find('.header')?.offsetHeight ?? 64;
  const closedNarrow = () => {
    const top = header + 16;
    const bottom = Math.max(0, stage.offsetHeight - panel.offsetTop + GAP_ABOVE_WORDS);
    const side = (stage.offsetWidth * (1 - SLIT_WIDTH)) / 2;
    return `inset(${top}px ${side}px ${bottom}px ${side}px)`;
  };
  const closed = wide ? () => CLOSED_WIDE : closedNarrow;
  const open = wide ? OPEN_WIDE : 'inset(0px 0px 0px 0px)';

  const walk = gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        // Measure the slit again whenever the page is measured again.
        invalidateOnRefresh: true,
      },
    })
    .fromTo(
      doorway,
      { clipPath: closed },
      { clipPath: open, duration: opening, ease: 'power1.inOut' },
      1,
    )
    // The view starts a little too close and settles back, like a step forward.
    .fromTo(view, { scale: 1.32 }, { scale: 1, duration: opening + 0.6, ease: 'sine.out' }, 0.4)
    // The words arrive once the film above has mostly cleared (its own words
    // are already gone), and go as the light reaches them.
    .fromTo(
      panel,
      { autoAlpha: 0, x: -28 },
      { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power2.out' },
      0.68,
    )
    .to(panel, { autoAlpha: 0, duration: opening * 0.22 }, 1 + opening * 0.22)
    .set({}, {}, screens);

  // The light that spills from the gateway grows as it opens.
  if (glow) walk.fromTo(glow, { opacity: 0.28 }, { opacity: 1, duration: opening }, 1);

  return () => gsap.set([doorway, view, panel, glow].filter(Boolean), { clearProps: 'all' });
}
