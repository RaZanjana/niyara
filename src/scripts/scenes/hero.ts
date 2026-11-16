/**
 * Hero scene: the opening film plays forward as the visitor scrolls.
 *
 * The section is taller than the screen and its stage sticks to the top
 * (plain CSS). This script only maps "how far through the section" to
 * "which film frame", fades the text away, and dissolves the stage at the end.
 */
import sequences from '@/data/frame-sequences.json';
import { find } from '../lib/dom';
import { FrameSequence } from '../lib/frame-sequence';
import { frameUrl } from '../lib/frames';
import { gsap } from '../lib/motion';

/** True when the visitor has asked their browser to save mobile data. */
function prefersLessData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}

export function createHero({ wide }: { wide: boolean }): () => void {
  const scene = find('#top');
  const stage = find('[data-hero-stage]');
  const content = find('[data-hero-content]');
  const canvas = find<HTMLCanvasElement>('[data-hero-canvas]');
  if (!scene || !stage || !content || !canvas) return () => {};

  const { digits, extension } = sequences.hero;
  const film = wide ? sequences.hero.desktop : sequences.hero.mobile;
  const playhead = { progress: 0 };
  let sequence: FrameSequence | undefined;

  // On a data-saving connection, keep the single first frame and skip the film.
  if (!prefersLessData()) {
    sequence = new FrameSequence(canvas, {
      count: film.count,
      width: film.width,
      height: film.height,
      urlFor: (index) => frameUrl(film.path, index, digits, extension),
    });
    void sequence.load();
  }

  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom bottom', scrub: 0.4 },
    })
    .to(
      playhead,
      { progress: 1, duration: 1, onUpdate: () => sequence?.show(playhead.progress) },
      0,
    )
    .to(content, { autoAlpha: 0, y: -70, duration: 0.38 }, 0);

  // Once the film has finished, the stage dissolves into the next section.
  gsap.to(stage, {
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: scene, start: 'bottom bottom', end: 'bottom 30%', scrub: true },
  });

  return () => {
    sequence?.destroy();
    gsap.set([stage, content], { clearProps: 'all' });
  };
}
