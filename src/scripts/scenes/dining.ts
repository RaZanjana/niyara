/**
 * Dining scene: dusk turns to night as the visitor scrolls past the picture.
 *
 * Two things happen together, driven by the same scroll distance:
 * 1. A short film of the lamps being lit plays on a canvas.
 * 2. Underneath it, the night photograph fades in over the dusk photograph.
 *
 * The film sits on top once its frames have arrived. Until then, and for
 * visitors who are saving data, the cross-fade underneath does the same job.
 */
import { find } from '../lib/dom';
import { startFilm } from '../lib/film';
import type { FrameSequence } from '../lib/frame-sequence';
import { gsap, ScrollTrigger } from '../lib/motion';

export function createDining({ wide }: { wide: boolean }): () => void {
  const picture = find('[data-dining]');
  const night = find('[data-dining-night]');
  const canvas = find<HTMLCanvasElement>('[data-dining-canvas]');
  if (!picture || !night) return () => {};

  let film: FrameSequence | undefined;
  const playhead = { progress: 0 };

  // The film is far down the page, so its frames are only downloaded when the
  // visitor gets within two screens of it. The canvas is only on the page
  // when the film's frames exist.
  const loader = ScrollTrigger.create({
    trigger: picture,
    start: 'top 300%',
    once: true,
    onEnter: () => {
      if (!canvas) return;
      film = startFilm('dining', canvas, { wide });
      film?.show(playhead.progress);
    },
  });

  gsap
    .timeline({
      defaults: { ease: 'none', duration: 1 },
      scrollTrigger: { trigger: picture, start: 'top 65%', end: 'bottom 55%', scrub: 0.4 },
    })
    .to(night, { opacity: 1 }, 0)
    .to(playhead, { progress: 1, onUpdate: () => film?.show(playhead.progress) }, 0);

  return () => {
    loader.kill();
    film?.destroy();
    gsap.set(night, { clearProps: 'all' });
  };
}
