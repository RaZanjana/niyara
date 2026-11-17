/**
 * Smooth scrolling for mouse wheels (Lenis).
 *
 * Only switched on for desktop pointers, and only when the visitor has not
 * asked for reduced motion. Phones and tablets keep their own native scrolling,
 * which is already smooth and must not be interfered with.
 */
import Lenis from 'lenis';
import { gsap, matches, queries, ScrollTrigger } from './motion';

export interface ScrollLock {
  /** Stops the page from scrolling, for example while the menu is open. */
  lock(): void;
  unlock(): void;
  /** Glides the page to a position, or jumps there for reduced motion. */
  scrollTo(top: number): void;
}

const LOCKED_CLASS = 'is-scroll-locked';

export function initSmoothScroll(): ScrollLock {
  const root = document.documentElement;
  let lenis: Lenis | undefined;

  if (matches(queries.finePointer) && matches(queries.fullMotion)) {
    lenis = new Lenis({ anchors: true });
    // Keep the scroll animations in step with the smoothed scroll position.
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis?.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // The menu and the booking window can both hold the page still, and one can
  // open as the other closes. The page moves again only when neither holds it.
  let holds = 0;

  return {
    lock() {
      holds += 1;
      lenis?.stop();
      root.classList.add(LOCKED_CLASS);
    },
    unlock() {
      holds = Math.max(0, holds - 1);
      if (holds > 0) return;
      lenis?.start();
      root.classList.remove(LOCKED_CLASS);
    },
    scrollTo(top) {
      if (lenis) {
        // Slow at both ends, like the camera moves on the page.
        lenis.scrollTo(top, { duration: 2.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
        return;
      }
      window.scrollTo({ top, behavior: matches(queries.fullMotion) ? 'smooth' : 'auto' });
    },
  };
}
