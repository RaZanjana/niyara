/**
 * Calendar: the date picker of the booking form.
 *
 * One calendar serves both date fields. The visitor picks the day they
 * arrive, then the day they leave, and the nights in between are joined by a
 * band. Choosing a day that is not after the arrival starts again from
 * that day.
 *
 * It works with a keyboard: the arrow keys move by a day or a week, Home and
 * End go to the ends of the week, Page Up and Page Down change the month, and
 * Escape closes it. Each day is read out in full ("Saturday 14 November 2026").
 *
 * The chosen dates are written into the form's hidden date inputs, so the
 * form sends them as before.
 */
import {
  addDays,
  addMonths,
  addMonthsToDate,
  dayAfter,
  monthOf,
  monthTitle,
  monthWeeks,
  nightsBetween,
  toInputValue,
  toShort,
  toSpoken,
  toWeekday,
  type Month,
} from '../lib/dates';
import { find, findAll } from '../lib/dom';

type Field = 'arrive' | 'leave';

const FIELDS: Field[] = ['arrive', 'leave'];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EMPTY_VALUE = 'Choose a date';

/** How long the finished stay is shown before the calendar closes itself. */
const CLOSE_DELAY = 420;

export function initCalendars(): void {
  findAll('[data-dates]').forEach(setUpCalendar);
}

function setUpCalendar(group: HTMLElement): void {
  const calendar = find('[data-calendar]', group);
  const monthsBox = calendar && find('[data-calendar-months]', calendar);
  const hint = calendar && find('[data-calendar-hint]', calendar);
  const summary = calendar && find('[data-calendar-summary]', calendar);
  const previous = calendar && find<HTMLButtonElement>('[data-calendar-previous]', calendar);
  const inputs = FIELDS.map((field) =>
    find<HTMLInputElement>(`[data-date-input="${field}"]`, group),
  );
  const triggers = FIELDS.map((field) =>
    find<HTMLButtonElement>(`[data-date-trigger="${field}"]`, group),
  );
  if (!calendar || !monthsBox || inputs.includes(null) || triggers.includes(null)) return;

  const today = toInputValue(new Date());
  const state = {
    arrive: '',
    leave: '',
    /** Which date the next click sets. */
    choosing: 'arrive' as Field,
    /** The first month on show. */
    view: monthOf(today),
    /** The day the keyboard is on. */
    focus: today,
    /** The day under the pointer, used to preview the stay. */
    preview: '',
    open: false,
  };
  let closeTimer: number | undefined;

  // The form script checks the dates itself, and says what is missing in words.
  inputs.forEach((input) => input?.removeAttribute('required'));

  // ---- Drawing ----

  /** How many months are on show: two side by side on a wide screen, else one. */
  const monthsShown = () => (window.matchMedia('(min-width: 56.25em)').matches ? 2 : 1);

  const isInView = (day: string) => {
    const first = toInputValue(new Date(state.view.year, state.view.month, 1));
    const end = addMonths(state.view, monthsShown());
    return day >= first && day < toInputValue(new Date(end.year, end.month, 1));
  };

  /** Builds the months from scratch. Needed when the months on show change. */
  function draw() {
    monthsBox?.replaceChildren(drawMonth(state.view), drawMonth(addMonths(state.view, 1)));
    paint();
  }

  function drawMonth(month: Month): HTMLElement {
    const box = element('div', 'calendar__month');
    const title = element('p', 'calendar__title', monthTitle(month));
    const grid = element('div', 'calendar__grid');
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', monthTitle(month));

    const head = element('div', 'calendar__week');
    head.setAttribute('role', 'row');
    WEEKDAYS.forEach((weekday) => {
      const cell = element('span', 'calendar__weekday', weekday.slice(0, 2));
      cell.setAttribute('role', 'columnheader');
      cell.setAttribute('aria-label', weekday);
      head.append(cell);
    });
    grid.append(head);

    monthWeeks(month).forEach((week) => {
      const row = element('div', 'calendar__week');
      row.setAttribute('role', 'row');
      week.forEach((day) => {
        const cell = element('span', 'calendar__cell');
        cell.setAttribute('role', 'gridcell');
        if (day) {
          const button = element('button', 'calendar__day', String(Number(day.slice(8))));
          button.setAttribute('type', 'button');
          button.dataset.day = day;
          cell.append(button);
        }
        row.append(cell);
      });
      grid.append(row);
    });

    box.append(title, grid);
    return box;
  }

  /** Brings the days, the fields and the words up to date with the state. */
  function paint() {
    const { arrive, leave } = state;
    // While the departure is still open, the stay runs to the day pointed at.
    const previewing = !leave && arrive !== '' && state.preview > arrive;
    const end = leave || (previewing ? state.preview : '');

    const days = findAll<HTMLButtonElement>('[data-day]', monthsBox ?? undefined);
    // Exactly one day can be reached with the Tab key: the one the keyboard is on.
    const tabStop = days.some((day) => day.dataset.day === state.focus && isInView(state.focus))
      ? state.focus
      : days.find((day) => (day.dataset.day ?? '') >= today && isInView(day.dataset.day ?? ''))
          ?.dataset.day;

    days.forEach((button) => {
      const day = button.dataset.day ?? '';
      const chosen = day === arrive || day === leave;
      button.disabled = day < today;
      button.tabIndex = day === tabStop ? 0 : -1;
      button.setAttribute('aria-pressed', String(chosen));
      button.setAttribute(
        'aria-label',
        toSpoken(day) + (day === arrive ? ', arriving' : day === leave ? ', leaving' : ''),
      );
      button.toggleAttribute('data-today', day === today);

      const cell = button.parentElement;
      const range =
        !end || !arrive
          ? ''
          : day === arrive
            ? 'start'
            : day === end
              ? 'end'
              : day > arrive && day < end
                ? 'middle'
                : '';
      if (range) cell?.setAttribute('data-range', range);
      else cell?.removeAttribute('data-range');
      cell?.toggleAttribute('data-preview', range !== '' && previewing);
    });

    FIELDS.forEach((field, index) => {
      const value = state[field];
      const main = find(`[data-date-value="${field}"]`, group);
      const note = find(`[data-date-note="${field}"]`, group);
      if (main) {
        main.textContent = value ? toShort(value) : EMPTY_VALUE;
        main.toggleAttribute('data-empty', !value);
      }
      if (note) note.textContent = value ? toWeekday(value) : '';
      triggers[index]?.setAttribute(
        'aria-expanded',
        String(state.open && state.choosing === field),
      );
    });

    if (hint) {
      hint.textContent =
        arrive && leave && state.choosing === 'leave'
          ? 'Your stay. Choose another day to change it.'
          : state.choosing === 'arrive'
            ? 'Choose the day you arrive'
            : 'Now the day you leave';
    }
    if (summary) {
      const nights = arrive && leave ? nightsBetween(arrive, leave) : 0;
      summary.textContent = nights
        ? `${nights} ${nights === 1 ? 'night' : 'nights'}, ${toShort(arrive)} to ${toShort(leave)}`
        : '';
    }
    if (previous) {
      const thisMonth = monthOf(today);
      previous.disabled =
        state.view.year === thisMonth.year && state.view.month === thisMonth.month;
    }
  }

  /** Writes the chosen dates into the form's own inputs. */
  function commit() {
    FIELDS.forEach((field, index) => {
      const input = inputs[index];
      if (!input || input.value === state[field]) return;
      input.value = state[field];
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  // ---- Opening and closing ----

  function open(field: Field) {
    window.clearTimeout(closeTimer);
    // There is no leaving without arriving first.
    state.choosing = field === 'leave' && !state.arrive ? 'arrive' : field;
    state.focus =
      state[state.choosing] ||
      (state.choosing === 'leave' && state.arrive ? dayAfter(state.arrive) : today);
    if (!state.open || !isInView(state.focus)) state.view = monthOf(state.focus);
    state.open = true;
    state.preview = '';
    calendar?.setAttribute('data-open', '');
    calendar?.removeAttribute('inert');
    draw();
    focusDay(state.focus);
  }

  function close({ returnFocus = false } = {}) {
    if (!state.open) return;
    window.clearTimeout(closeTimer);
    state.open = false;
    calendar?.removeAttribute('data-open');
    calendar?.setAttribute('inert', '');
    paint();
    if (returnFocus) triggers[FIELDS.indexOf(state.choosing)]?.focus();
  }

  function focusDay(day: string) {
    find<HTMLButtonElement>(`[data-day="${day}"]`, monthsBox ?? undefined)?.focus({
      preventScroll: true,
    });
  }

  /** Moves the keyboard to a day, turning the page if that day is not on show. */
  function moveTo(day: string) {
    state.focus = day < today ? today : day;
    state.preview = state.focus;
    if (!isInView(state.focus)) {
      const month = monthOf(state.focus);
      // Going forwards on a wide screen, the new month appears on the right.
      const forwards = state.focus > toInputValue(new Date(state.view.year, state.view.month, 1));
      state.view = forwards && monthsShown() === 2 ? addMonths(month, -1) : month;
      draw();
    } else {
      paint();
    }
    focusDay(state.focus);
  }

  function choose(day: string) {
    if (day < today) return;
    state.focus = day;
    if (state.choosing === 'arrive' || !state.arrive || day <= state.arrive) {
      state.arrive = day;
      if (state.leave && state.leave <= day) state.leave = '';
      state.choosing = 'leave';
      state.preview = '';
      commit();
      paint();
      return;
    }
    state.leave = day;
    commit();
    paint();
    // Let the finished stay be seen for a moment, then put the calendar away.
    closeTimer = window.setTimeout(() => close({ returnFocus: true }), CLOSE_DELAY);
  }

  // ---- Listening ----

  triggers.forEach((trigger, index) => {
    const field = FIELDS[index];
    if (!trigger || !field) return;
    trigger.addEventListener('click', () => {
      if (state.open && state.choosing === field) close({ returnFocus: true });
      else open(field);
    });
  });

  monthsBox.addEventListener('click', (event) => {
    const day = (event.target as Element).closest<HTMLElement>('[data-day]')?.dataset.day;
    if (day) choose(day);
  });

  // The stay is previewed up to the day under the pointer.
  monthsBox.addEventListener('pointerover', (event) => {
    const day = (event.target as Element).closest<HTMLElement>('[data-day]')?.dataset.day;
    if (!day || day === state.preview) return;
    state.preview = day;
    paint();
  });

  monthsBox.addEventListener('keydown', (event) => {
    const day = (event.target as Element).closest<HTMLElement>('[data-day]')?.dataset.day;
    if (!day) return;
    const weekday = (new Date(`${day}T12:00`).getDay() + 6) % 7;
    const target = {
      ArrowLeft: addDays(day, -1),
      ArrowRight: addDays(day, 1),
      ArrowUp: addDays(day, -7),
      ArrowDown: addDays(day, 7),
      Home: addDays(day, -weekday),
      End: addDays(day, 6 - weekday),
      PageUp: addMonthsToDate(day, -1),
      PageDown: addMonthsToDate(day, 1),
    }[event.key];
    if (!target) return;
    event.preventDefault();
    moveTo(target);
  });

  const turnPage = (months: number) => {
    state.view = addMonths(state.view, months);
    draw();
  };
  previous?.addEventListener('click', () => turnPage(-1));
  find('[data-calendar-next]', calendar)?.addEventListener('click', () => turnPage(1));

  find('[data-calendar-clear]', calendar)?.addEventListener('click', () => {
    state.arrive = '';
    state.leave = '';
    state.choosing = 'arrive';
    state.preview = '';
    commit();
    paint();
  });
  find('[data-calendar-done]', calendar)?.addEventListener('click', () =>
    close({ returnFocus: true }),
  );

  group.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !state.open) return;
    // Close the calendar only, not the booking window it may be inside.
    event.preventDefault();
    event.stopPropagation();
    close({ returnFocus: true });
  });

  document.addEventListener('pointerdown', (event) => {
    if (state.open && !group.contains(event.target as Node)) close();
  });

  paint();
}

/** A new element with a class and, if given, some text. */
function element(tag: string, className: string, text?: string): HTMLElement {
  const created = document.createElement(tag);
  created.className = className;
  if (text !== undefined) created.textContent = text;
  return created;
}
