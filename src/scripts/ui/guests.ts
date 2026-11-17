/**
 * Guests: the guests field of the booking form. It opens a small panel with
 * two counters, for adults and for children aged 10 to 17, and a note that
 * younger children stay free.
 *
 * The form's own number inputs stay in the form, hidden, and are kept in
 * step, so the form sends the counts as before. The panel closes with its
 * Done button, the Escape key, or a click anywhere else.
 */
import { find, findAll } from '../lib/dom';

export function initGuests(): void {
  findAll('[data-guests]').forEach(setUpGuests);
}

/** "2 adults", "1 adult". */
const adultsText = (count: number) => `${count} ${count === 1 ? 'adult' : 'adults'}`;
/** "1 child aged 10 to 17", "No children aged 10 to 17". */
const childrenText = (count: number) =>
  count === 0
    ? 'No children aged 10 to 17'
    : `${count} ${count === 1 ? 'child' : 'children'} aged 10 to 17`;

function setUpGuests(root: HTMLElement): void {
  const button = find<HTMLButtonElement>('[data-guests-button]', root);
  const panel = find('[data-guests-panel]', root);
  const summary = find('[data-guests-summary]', root);
  const note = find('[data-guests-note]', root);
  if (!button || !panel) return;

  const rows = findAll('[data-guests-row]', panel).map((row) => {
    const name = row.dataset.guestsRow ?? '';
    const input = find<HTMLInputElement>(`[data-guests-input="${name}"]`, root);
    return {
      input,
      value: find('[data-guests-value]', row),
      less: find<HTMLButtonElement>('[data-guests-step="-1"]', row),
      more: find<HTMLButtonElement>('[data-guests-step="1"]', row),
      min: Number(input?.min ?? 0),
      max: Number(input?.max ?? 99),
    };
  });

  const read = (row: (typeof rows)[number]) =>
    Math.min(row.max, Math.max(row.min, Number(row.input?.value) || row.min));

  function render() {
    rows.forEach((row) => {
      const count = read(row);
      if (row.value) row.value.textContent = String(count);
      if (row.less) row.less.disabled = count <= row.min;
      if (row.more) row.more.disabled = count >= row.max;
    });
    const [adults, children] = rows.map(read);
    if (summary) summary.textContent = adultsText(adults ?? 1);
    if (note) note.textContent = childrenText(children ?? 0);
  }

  rows.forEach((row) => {
    const step = (by: number) => {
      if (!row.input) return;
      row.input.value = String(Math.min(row.max, Math.max(row.min, read(row) + by)));
      row.input.dispatchEvent(new Event('change', { bubbles: true }));
      render();
    };
    row.less?.addEventListener('click', () => step(-1));
    row.more?.addEventListener('click', () => step(1));
  });

  let isOpen = false;
  function open() {
    isOpen = true;
    panel?.removeAttribute('inert');
    panel?.setAttribute('data-open', '');
    button?.setAttribute('aria-expanded', 'true');
    // Start where the visitor most likely wants to be: adding a guest.
    find<HTMLButtonElement>('[data-guests-step="1"]', panel ?? undefined)?.focus();
  }
  function close({ returnFocus = false } = {}) {
    if (!isOpen) return;
    isOpen = false;
    panel?.removeAttribute('data-open');
    panel?.setAttribute('inert', '');
    button?.setAttribute('aria-expanded', 'false');
    if (returnFocus) button?.focus();
  }

  button.addEventListener('click', () => (isOpen ? close() : open()));
  find('[data-guests-done]', panel)?.addEventListener('click', () => close({ returnFocus: true }));
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !isOpen) return;
    // Close the panel only, not the booking window it may be inside.
    event.preventDefault();
    event.stopPropagation();
    close({ returnFocus: true });
  });
  document.addEventListener('pointerdown', (event) => {
    if (isOpen && !root.contains(event.target as Node)) close();
  });
  root.addEventListener('focusout', (event) => {
    if (isOpen && !root.contains(event.relatedTarget as Node | null)) close();
  });

  render();
}
