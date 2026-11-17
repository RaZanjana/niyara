/**
 * Back to top: shows the button once the visitor is past the opening, fills
 * its ring as they scroll, and glides the page back to the top when pressed
 * (components/layout/BackToTop.astro).
 */
import { find } from '../lib/dom';
import type { ScrollLock } from '../lib/smooth-scroll';

/** How far down, in screens, before the button appears. */
const SHOW_AFTER = 1.5;

export function initBackToTop(scroll: ScrollLock): void {
  const button = find<HTMLAnchorElement>('[data-to-top]');
  if (!button) return;

  let queued = false;
  let shown: boolean | undefined;
  let left = '';

  // Reads the scroll position at most once a frame, and writes only what changed.
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    const show = y > window.innerHeight * SHOW_AFTER;
    if (show !== shown) {
      shown = show;
      button.toggleAttribute('data-shown', show);
    }
    const remaining = (1 - Math.min(1, Math.max(0, max > 0 ? y / max : 0))).toFixed(3);
    if (remaining !== left) {
      left = remaining;
      button.style.setProperty('--scrolled-left', remaining);
    }
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue, { passive: true });
  update();

  button.addEventListener('click', (event) => {
    event.preventDefault();
    scroll.scrollTo(0);
    // Keyboard users carry on from the top of the page, not from the button.
    find('.header__home')?.focus({ preventScroll: true });
  });
}
