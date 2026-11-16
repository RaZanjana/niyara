/**
 * Reveals: how content comes into view.
 *
 * Three effects, all switched off for visitors who prefer reduced motion:
 * 1. `data-reveal`       an element fades up when it enters the screen.
 * 2. `data-split-lines`  a heading rises into place line by line.
 * 3. `data-scene-body`   a section's content fades at its top and bottom
 *                        edges, so sections dissolve into each other while
 *                        the background color changes.
 */
import { findAll } from '../lib/dom';
import { gsap, ScrollTrigger, SplitText } from '../lib/motion';

const clamp01 = gsap.utils.clamp(0, 1);

export function createReveals(): () => void {
  const items = findAll('[data-reveal]');
  // Only opacity is changed, never visibility, so that keyboard users can
  // still Tab to a link or button that has not been revealed yet.
  gsap.set(items, { opacity: 0, y: 32 });
  ScrollTrigger.batch(items, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power2.out',
        stagger: 0.12,
        overwrite: true,
      }),
  });

  const splits = findAll('[data-split-lines]').map((heading) =>
    SplitText.create(heading, {
      type: 'lines',
      mask: 'lines',
      // Split again if the text wraps differently after a resize or a font load.
      autoSplit: true,
      onSplit: (split) =>
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 1.3,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
        }),
    }),
  );

  const bodies = findAll('[data-scene-body]');
  bodies.forEach((body, index) => {
    const isLast = index === bodies.length - 1;
    const fadeEdges = (trigger: ScrollTrigger) => {
      const zone = window.innerHeight * 0.3;
      const entered = clamp01((trigger.scroll() - trigger.start) / zone);
      // The last section runs into the footer, which shares its color, so it stays.
      const remaining = isLast ? 1 : clamp01((trigger.end - trigger.scroll()) / zone);
      gsap.set(body, { opacity: Math.min(entered, remaining) });
    };
    ScrollTrigger.create({
      trigger: body.closest('[data-scene]'),
      start: 'top 85%',
      end: 'bottom 12%',
      onUpdate: fadeEdges,
      onRefresh: fadeEdges,
    });
  });

  return () => {
    splits.forEach((split) => split.revert());
    gsap.set([...items, ...bodies], { clearProps: 'all' });
  };
}
