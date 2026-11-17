/**
 * Select: a list of choices that opens under its field, drawn by the site so
 * that it matches the rest of the page (the browser's own list cannot be
 * styled). Used for the guests in the booking form.
 *
 * The real <select> stays in the form, hidden, and is kept in step, so the
 * form sends its value as before.
 *
 * With a keyboard: the arrow keys, Home and End move through the list, Enter
 * or Space chooses, Escape closes, and typing a letter jumps to the first
 * choice that starts with it.
 */
import { find, findAll } from '../lib/dom';

export function initSelects(): void {
  findAll('[data-select]').forEach(setUpSelect);
}

function setUpSelect(root: HTMLElement): void {
  const native = find<HTMLSelectElement>('[data-select-native]', root);
  const button = find<HTMLButtonElement>('[data-select-button]', root);
  const list = find('[data-select-list]', root);
  const value = find('[data-select-value]', root);
  if (!native || !button || !list) return;

  const options = findAll('[data-select-option]', list);
  let isOpen = false;
  /** The option the keyboard or pointer is on, which is not yet the chosen one. */
  let current = Math.max(0, native.selectedIndex);

  function setCurrent(index: number) {
    current = Math.min(options.length - 1, Math.max(0, index));
    options.forEach((option, optionIndex) =>
      option.toggleAttribute('data-current', isOpen && optionIndex === current),
    );
    const option = options[current];
    if (isOpen && option) button?.setAttribute('aria-activedescendant', option.id);
    else button?.removeAttribute('aria-activedescendant');
  }

  function choose(index: number) {
    const option = options[index];
    if (!option || !native) return;
    native.selectedIndex = index;
    native.dispatchEvent(new Event('change', { bubbles: true }));
    options.forEach((item, itemIndex) =>
      item.setAttribute('aria-selected', String(itemIndex === index)),
    );
    if (value) value.textContent = option.dataset.selectOption ?? '';
  }

  function open() {
    isOpen = true;
    list?.setAttribute('data-open', '');
    button?.setAttribute('aria-expanded', 'true');
    setCurrent(native?.selectedIndex ?? 0);
  }

  function close() {
    isOpen = false;
    list?.removeAttribute('data-open');
    button?.setAttribute('aria-expanded', 'false');
    setCurrent(current);
  }

  button.addEventListener('click', () => (isOpen ? close() : open()));

  button.addEventListener('keydown', (event) => {
    const { key } = event;
    if (key === 'Escape') {
      if (!isOpen) return;
      // Close the list only, not the booking window it may be inside.
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) open();
      else setCurrent(current + (key === 'ArrowDown' ? 1 : -1));
    } else if (key === 'Home' || key === 'End') {
      if (!isOpen) return;
      event.preventDefault();
      setCurrent(key === 'Home' ? 0 : options.length - 1);
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (!isOpen) return open();
      choose(current);
      close();
    } else if (key === 'Tab') {
      if (isOpen) close();
    } else if (key.length === 1) {
      const match = options.findIndex((option) =>
        (option.dataset.selectOption ?? '').toLowerCase().startsWith(key.toLowerCase()),
      );
      if (match === -1) return;
      if (isOpen) setCurrent(match);
      else choose(match);
    }
  });

  options.forEach((option, index) => {
    option.addEventListener('pointermove', () => {
      if (index !== current) setCurrent(index);
    });
    option.addEventListener('click', () => {
      choose(index);
      close();
      button.focus();
    });
  });

  document.addEventListener('pointerdown', (event) => {
    if (isOpen && !root.contains(event.target as Node)) close();
  });
  root.addEventListener('focusout', (event) => {
    if (isOpen && !root.contains(event.relatedTarget as Node | null)) close();
  });
}
