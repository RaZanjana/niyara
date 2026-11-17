/**
 * Booking window: opens from "Book a stay", out of the button itself.
 *
 * How the opening works:
 * 1. A plain shape (the "ghost") is laid exactly over the button, in the
 *    button's own color and roundness.
 * 2. The ghost travels and grows to where the window will be, changing to the
 *    window's color and square corners on the way, while the page dims.
 * 3. The real window takes its place, and its words and fields rise in.
 * Closing plays the same steps backwards, and the ghost lands on the button.
 *
 * For visitors who prefer reduced motion the window simply appears.
 *
 * The window is a native <dialog>: the browser keeps keyboard focus inside
 * it, and returns focus to the button when it closes.
 */
import { find, findAll } from '../lib/dom';
import { gsap, matches, queries } from '../lib/motion';
import type { ScrollLock } from '../lib/smooth-scroll';

export function initBookingModal(scroll: ScrollLock): void {
  const dialog = find<HTMLDialogElement>('[data-book-dialog]');
  const panel = dialog && find('[data-book-panel]', dialog);
  const ghost = dialog && find('[data-book-ghost]', dialog);
  if (!dialog || !panel || !ghost) return;

  const lines = findAll('[data-book-line]', panel);
  const headerButton = find('.header [data-book-open]');
  let origin: Element | null = null;
  let busy = false;

  /** Where the ghost starts and ends: the button that was pressed, if it can be seen. */
  function originBox(): DOMRect | undefined {
    const visible = [origin, headerButton].find((candidate) => {
      const box = candidate?.getBoundingClientRect();
      return box && box.width > 0 && box.bottom > 0 && box.top < window.innerHeight;
    });
    return visible?.getBoundingClientRect();
  }

  /** The ghost's position and look when it lies over the button. */
  function atButton() {
    const box = originBox();
    const look = getComputedStyle(origin ?? headerButton ?? panel!);
    // With no button on screen, the window grows from a point in its own middle.
    const fallback = panel!.getBoundingClientRect();
    return box
      ? {
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
          borderRadius: box.height / 2,
          backgroundColor: look.backgroundColor,
        }
      : {
          top: fallback.top + fallback.height / 2,
          left: fallback.left + fallback.width / 2,
          width: 0,
          height: 0,
          borderRadius: 0,
          backgroundColor: getComputedStyle(panel!).backgroundColor,
        };
  }

  /** The ghost's position and look when it lies over the window. */
  function atPanel() {
    const box = panel!.getBoundingClientRect();
    return {
      top: box.top,
      left: box.left,
      width: box.width,
      height: Math.min(box.height, window.innerHeight - box.top),
      borderRadius: 0,
      backgroundColor: getComputedStyle(panel!).backgroundColor,
    };
  }

  function open(trigger: Element | null) {
    if (dialog!.open || busy) return;
    origin = trigger;
    // The menu may be open on a phone. It closes first.
    find<HTMLDialogElement>('[data-menu][open]')?.close();

    dialog!.showModal();
    scroll.lock();
    dialog!.scrollTop = 0;
    if (!matches(queries.fullMotion)) return;

    busy = true;
    gsap.set(panel, { autoAlpha: 0 });
    gsap.set(lines, { autoAlpha: 0, y: 26 });
    gsap.set(ghost, { display: 'block', ...atButton() });
    gsap
      .timeline({ onComplete: () => (busy = false) })
      .fromTo(dialog, { '--veil': 0 }, { '--veil': 1, duration: 0.7, ease: 'power2.out' }, 0)
      .to(ghost, { ...atPanel(), duration: 0.85, ease: 'expo.inOut' }, 0)
      // The window takes the ghost's place at the very moment they match.
      .set(panel, { autoAlpha: 1 })
      .set(ghost, { display: 'none' })
      .to(lines, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.07,
        ease: 'power3.out',
        // Leave nothing behind on the lines: a leftover transform would let a
        // later line be drawn over the open guests list.
        clearProps: 'all',
      });
  }

  function close() {
    if (!dialog!.open || busy) return;
    const finish = () => {
      busy = false;
      dialog!.close();
      gsap.set([panel, ghost, dialog, ...lines], { clearProps: 'all' });
    };
    if (!matches(queries.fullMotion)) return finish();

    busy = true;
    gsap
      .timeline({ onComplete: finish })
      .to(lines, { autoAlpha: 0, duration: 0.22, ease: 'power1.in' }, 0)
      .set(ghost, { display: 'block', ...atPanel() })
      .set(panel, { autoAlpha: 0 })
      .to(ghost, { ...atButton(), duration: 0.65, ease: 'expo.inOut' })
      .to(dialog, { '--veil': 0, duration: 0.55, ease: 'power2.in' }, '<0.1');
  }

  findAll('[data-book-open]').forEach((trigger) =>
    trigger.addEventListener('click', (event) => {
      // Without this the link would also scroll the page to the booking section.
      event.preventDefault();
      open(trigger);
    }),
  );
  find('[data-book-close]', dialog)?.addEventListener('click', close);

  // The Escape key: play the closing, instead of vanishing at once.
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  // A click on the dimmed page around the window closes it too.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener('close', () => scroll.unlock());
}
