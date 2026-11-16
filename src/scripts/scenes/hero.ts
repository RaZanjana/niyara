/**
 * Hero scene: the opening film plays forward as the visitor scrolls.
 *
 * The section is taller than the screen and its stage sticks to the top
 * (plain CSS). This script only maps "how far through the section" to
 * "which film frame", fades the text away, and dissolves the stage at the end.
 */
import { find } from '../lib/dom';
import { startFilm } from '../lib/film';
import { gsap } from '../lib/motion';

export function createHero({ wide }: { wide: boolean }): () => void {
  const scene = find('#top');
  const stage = find('[data-hero-stage]');
  const content = find('[data-hero-content]');
  const canvas = find<HTMLCanvasElement>('[data-hero-canvas]');
  if (!scene || !stage || !content || !canvas) return () => {};

  // On a data-saving connection this is empty, and the first frame stays.
  const film = startFilm('hero', canvas, { wide });
  const playhead = { progress: 0 };

  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub: 0.4 },
    })
    .to(playhead, { progress: 1, duration: 1, onUpdate: () => film?.show(playhead.progress) }, 0)
    .to(content, { autoAlpha: 0, y: -70, duration: 0.38 }, 0);

  // Once the film has finished, the stage dissolves into the next section.
  gsap.to(stage, {
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: scene, start: 'bottom bottom', end: 'bottom 30%', scrub: true },
  });

  return () => {
    film?.destroy();
    gsap.set([stage, content], { clearProps: 'all' });
  };
}
