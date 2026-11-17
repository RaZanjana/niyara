/**
 * Rooms: switches between the three kinds of villa, and between each
 * villa's pictures.
 *
 * The villas follow the standard "tabs" pattern: click or press Enter to
 * choose, and use the arrow, Home and End keys to move between the tabs.
 *
 * A villa's pictures change with the arrows on the picture, the small
 * pictures underneath, a swipe, or the left and right keys while a picture
 * button has focus. Choosing another villa starts again at its first picture.
 */
import { find, findAll } from '../lib/dom';

/** A swipe must travel at least this far, in pixels, to count. */
const SWIPE_DISTANCE = 40;

const twoDigits = (value: number) => String(value).padStart(2, '0');

export function initRooms(): void {
  const chooser = find('[data-rooms]');
  if (!chooser) return;

  const tabs = findAll<HTMLButtonElement>('[data-room-tab]', chooser);
  const panels = findAll('[data-room-panel]', chooser);
  const rooms = findAll('[data-room-picture]', chooser);
  const thumbLists = findAll('[data-room-thumbs]', chooser);
  const stage = find('[data-room-stage]', chooser);
  const count = find('[data-room-count]', chooser);

  let roomId = tabs[0]?.dataset.roomTab;
  let current = 0;

  const framesOf = (id: string | undefined) =>
    findAll('[data-room-frame]', rooms.find((room) => room.dataset.roomPicture === id) ?? chooser);
  const thumbsOf = (id: string | undefined) =>
    findAll<HTMLButtonElement>(
      '[data-room-thumb]',
      thumbLists.find((list) => list.dataset.roomThumbs === id) ?? chooser,
    );

  /** Shows picture number `index` of the chosen villa, wrapping at both ends. */
  function showFrame(index: number) {
    const frames = framesOf(roomId);
    if (frames.length === 0) return;
    current = (index + frames.length) % frames.length;
    frames.forEach((frame, frameIndex) =>
      frame.toggleAttribute('data-active', frameIndex === current),
    );
    thumbsOf(roomId).forEach((thumb, thumbIndex) =>
      thumb.setAttribute('aria-current', String(thumbIndex === current)),
    );
    if (count) count.textContent = `${twoDigits(current + 1)} / ${twoDigits(frames.length)}`;
  }

  function select(id: string | undefined, { focus = false } = {}) {
    roomId = id;
    tabs.forEach((tab) => {
      const selected = tab.dataset.roomTab === id;
      tab.setAttribute('aria-selected', String(selected));
      // Only the chosen tab is in the Tab key order. Arrow keys reach the rest.
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.roomPanel !== id;
    });
    rooms.forEach((room) => room.toggleAttribute('data-active', room.dataset.roomPicture === id));
    thumbLists.forEach((list) => {
      list.hidden = list.dataset.roomThumbs !== id;
    });
    showFrame(0);
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

  find('[data-room-previous]', chooser)?.addEventListener('click', () => showFrame(current - 1));
  find('[data-room-next]', chooser)?.addEventListener('click', () => showFrame(current + 1));

  thumbLists.forEach((list) => {
    const thumbs = findAll<HTMLButtonElement>('[data-room-thumb]', list);
    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => showFrame(index));
      thumb.addEventListener('keydown', (event) => {
        const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
        if (step === undefined) return;
        event.preventDefault();
        showFrame(current + step);
        thumbs[current]?.focus();
      });
    });
  });

  // Swipe, for touch screens.
  let swipeStart: number | undefined;
  stage?.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse') swipeStart = event.clientX;
  });
  stage?.addEventListener('pointerup', (event) => {
    if (swipeStart === undefined) return;
    const distance = event.clientX - swipeStart;
    swipeStart = undefined;
    if (distance <= -SWIPE_DISTANCE) showFrame(current + 1);
    if (distance >= SWIPE_DISTANCE) showFrame(current - 1);
  });
  stage?.addEventListener('pointercancel', () => (swipeStart = undefined));

  select(roomId);
}
