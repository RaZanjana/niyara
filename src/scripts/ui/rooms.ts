/**
 * Rooms: switches between the three kinds of room.
 * Follows the standard "tabs" pattern: click or press Enter to choose,
 * and use the arrow, Home and End keys to move between the tabs.
 */
import { find, findAll } from '../lib/dom';

export function initRooms(): void {
  const chooser = find('[data-rooms]');
  if (!chooser) return;

  const tabs = findAll<HTMLButtonElement>('[data-room-tab]', chooser);
  const panels = findAll('[data-room-panel]', chooser);
  const pictures = findAll('[data-room-picture]', chooser);

  function select(roomId: string | undefined, { focus = false } = {}) {
    tabs.forEach((tab) => {
      const selected = tab.dataset.roomTab === roomId;
      tab.setAttribute('aria-selected', String(selected));
      // Only the chosen tab is in the Tab key order. Arrow keys reach the rest.
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.roomPanel !== roomId;
    });
    pictures.forEach((picture) => {
      picture.toggleAttribute('data-active', picture.dataset.roomPicture === roomId);
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab.dataset.roomTab));
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1;
      const target = {
        ArrowDown: index === last ? 0 : index + 1,
        ArrowRight: index === last ? 0 : index + 1,
        ArrowUp: index === 0 ? last : index - 1,
        ArrowLeft: index === 0 ? last : index - 1,
        Home: 0,
        End: last,
      }[event.key];
      if (target === undefined) return;
      event.preventDefault();
      select(tabs[target]?.dataset.roomTab, { focus: true });
    });
  });

  select(tabs[0]?.dataset.roomTab);
}
