/**
 * Menu: opens and closes the full-screen menu.
 * The menu is a native <dialog>, so the browser already keeps keyboard focus
 * inside it, closes it on Escape and returns focus to the Menu button.
 */
import { find, findAll } from '../lib/dom';
import type { ScrollLock } from '../lib/smooth-scroll';

export function initMenu(scroll: ScrollLock): void {
  const menu = find<HTMLDialogElement>('[data-menu]');
  const openButton = find('[data-menu-open]');
  if (!menu || !openButton) return;

  openButton.addEventListener('click', () => {
    menu.showModal();
    scroll.lock();
  });

  find('[data-menu-close]', menu)?.addEventListener('click', () => menu.close());

  // Following a link in the menu closes it, then the page scrolls to the section.
  findAll('[data-menu-link]', menu).forEach((link) =>
    link.addEventListener('click', () => menu.close()),
  );

  // Fires however the menu was closed: the button, a link or the Escape key.
  menu.addEventListener('close', () => scroll.unlock());
}
