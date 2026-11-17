/**
 * A smaller scroll effect that takes only a few lines:
 * pictures that drift slightly as they pass (parallax).
 */
import { findAll } from '../lib/dom';
import { gsap } from '../lib/motion';

/**
 * Parallax: a picture marked `data-parallax` moves a little slower than the
 * page, which gives a sense of depth. It is scaled up slightly so its edges
 * never show.
 */
export function createParallax(): () => void {
  const pictures = findAll('[data-parallax]');
  pictures.forEach((picture) => {
    gsap.fromTo(
      picture,
      { yPercent: -5, scale: 1.12 },
      {
        yPercent: 5,
        scale: 1.12,
        ease: 'none',
        scrollTrigger: {
          trigger: picture.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
  });
  return () => gsap.set(pictures, { clearProps: 'all' });
}
