/**
 * Scroll scenes: everything that moves because the visitor scrolls.
 *
 * `gsap.matchMedia` runs the setup again whenever one of the conditions
 * changes (the window crosses the phone/desktop width, or the visitor turns
 * reduced motion on or off). Before each new run it removes the animations
 * of the previous run, and calls the cleanup function returned here.
 */
import { gsap, queries } from '../lib/motion';
import { createArrival } from './arrival';
import { createAtmosphere } from './atmosphere';
import { createDining } from './dining';
import { createHero } from './hero';
import { createReveals } from './reveals';
import { createMapDrawing, createParallax } from './small-effects';

export function initScrollScenes(): void {
  const root = document.documentElement;

  gsap.matchMedia().add(
    {
      fullMotion: queries.fullMotion,
      reducedMotion: '(prefers-reduced-motion: reduce)',
      wide: queries.wide,
    },
    (context) => {
      const fullMotion = context.conditions?.fullMotion ?? false;
      const wide = context.conditions?.wide ?? false;

      // The styles read this to give the hero and arrival their extra scroll
      // distance. It must be set before any scroll positions are measured.
      root.dataset.motion = fullMotion ? 'full' : 'reduced';

      const cleanups = [createAtmosphere({ blend: fullMotion })];
      if (fullMotion) {
        cleanups.push(
          createHero({ wide }),
          createArrival({ wide }),
          createReveals(),
          createDining({ wide }),
          createParallax(),
          createMapDrawing(),
        );
      }

      return () => {
        cleanups.forEach((cleanup) => cleanup());
        delete root.dataset.motion;
      };
    },
  );
}
