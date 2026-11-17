/**
 * Dining scene: dusk turns to night as the visitor scrolls.
 *
 * Several things happen together, driven by the same scroll distance:
 * 1. A short film of the lanterns being lit plays on a canvas.
 * 2. Underneath it, the night photograph fades in over the dusk photograph,
 *    and the glow around the picture turns from dusk to night with it.
 * 3. On a wide screen the picture holds still meanwhile, and once the right
 *    of it has gone dark, the words come in there.
 *
 * The film sits on top once its frames have arrived. Until then, and for
 * visitors who are saving data, the cross-fade underneath does the same job.
 */
import { find, findAll } from '../lib/dom';
import { startFilm } from '../lib/film';
import type { FrameSequence } from '../lib/frame-sequence';
import { gsap, ScrollTrigger } from '../lib/motion';

export function createDining({ wide }: { wide: boolean }): () => void {
  const scene = find('#dining');
  const picture = find('[data-dining]');
  const layers = find('[data-dining-layers]');
  const shade = find('[data-dining-shade]');
  const canvas = find<HTMLCanvasElement>('[data-dining-canvas]');
  const night = findAll('[data-dining-night]');
  const lines = findAll('[data-dining-line]');
  if (!scene || !picture || !layers || night.length === 0) return () => {};

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

  // On a wide screen night falls while the picture holds still. On a phone
  // it falls as the picture passes up the screen.
  const nightfall = gsap
    .timeline({
      defaults: { ease: 'none', duration: 1 },
      scrollTrigger: wide
        ? { trigger: scene, start: 'top 35%', end: 'bottom bottom', scrub: 0.5 }
        : { trigger: picture, start: 'top 60%', end: 'top -18%', scrub: 0.5 },
    })
    .fromTo(night, { opacity: 0 }, { opacity: 1, duration: 0.72 }, 0)
    .to(playhead, { progress: 1, duration: 0.72, onUpdate: () => film?.show(playhead.progress) }, 0)
    .fromTo(layers, { scale: 1.1 }, { scale: 1, ease: 'sine.out' }, 0);

  if (wide) {
    if (shade) nightfall.fromTo(shade, { opacity: 0 }, { opacity: 1, duration: 0.34 }, 0.34);
    nightfall.fromTo(
      lines,
      { autoAlpha: 0, y: 30, filter: 'blur(6px)' },
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.22,
        stagger: 0.045,
        ease: 'power2.out',
      },
      0.44,
    );
  }

  return () => {
    loader.kill();
    film?.destroy();
    gsap.set([...night, ...lines, layers, shade].filter(Boolean), { clearProps: 'all' });
  };
}
