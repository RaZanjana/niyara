/**
 * Smaller scroll effects that each take only a few lines:
 * the dining picture turning from dusk to night, pictures that drift
 * slightly as they pass (parallax), and the roads on the map drawing in.
 */
import { find, findAll } from '../lib/dom';
import { gsap } from '../lib/motion';

/** Dining: the night picture fades in over the dusk picture. */
export function createDiningNightfall(): () => void {
  const picture = find('[data-dining]');
  const night = find('[data-dining-night]');
  if (!picture || !night) return () => {};

  gsap.to(night, {
    opacity: 1,
    ease: 'none',
    scrollTrigger: { trigger: picture, start: 'top 65%', end: 'bottom 55%', scrub: true },
  });
  return () => gsap.set(night, { clearProps: 'all' });
}

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

/** Map: each road draws itself from the hotel outwards when the map appears. */
export function createMapDrawing(): () => void {
  const map = find('[data-map]');
  const roads = findAll<SVGPathElement>('[data-road]');
  if (!map || roads.length === 0) return () => {};

  gsap.fromTo(
    roads,
    { strokeDashoffset: 1 },
    {
      strokeDashoffset: 0,
      duration: 1.8,
      ease: 'power2.inOut',
      stagger: 0.15,
      scrollTrigger: { trigger: map, start: 'top 75%', once: true },
    },
  );
  return () => gsap.set(roads, { clearProps: 'all' });
}
