/**
 * Date helpers for the booking form and its calendar.
 * A date is always a `YYYY-MM-DD` string, as date inputs use. Strings in that
 * form sort in date order, so two dates can be compared with `<` and `>`.
 * Kept free of browser code so it can be unit tested.
 */

const pad = (value: number) => String(value).padStart(2, '0');

/** A year and a month, with January as 0, as JavaScript counts them. */
export interface Month {
  year: number;
  month: number;
}

/** A date in the form a date input expects, in the visitor's own time zone. */
export function toInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The JavaScript date for a `YYYY-MM-DD` string, at midnight local time. */
export function toDate(value: string): Date {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** The date a number of days after (or, if negative, before) a date. */
export function addDays(value: string, days: number): string {
  const date = toDate(value);
  date.setDate(date.getDate() + days);
  return toInputValue(date);
}

/** The day after a `YYYY-MM-DD` date. */
export function dayAfter(value: string): string {
  return addDays(value, 1);
}

/** The month a date falls in. */
export function monthOf(value: string): Month {
  const date = toDate(value);
  return { year: date.getFullYear(), month: date.getMonth() };
}

/** The month a number of months after (or before) a month. */
export function addMonths({ year, month }: Month, months: number): Month {
  const date = new Date(year, month + months, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

/**
 * The same day of the month, a number of months later or earlier. If that
 * month is shorter, the last day of it (31 January plus one month is the end
 * of February).
 */
export function addMonthsToDate(value: string, months: number): string {
  const date = toDate(value);
  const target = addMonths({ year: date.getFullYear(), month: date.getMonth() }, months);
  const lastDay = new Date(target.year, target.month + 1, 0).getDate();
  return toInputValue(new Date(target.year, target.month, Math.min(date.getDate(), lastDay)));
}

/**
 * The days of a month laid out as a calendar: a list of weeks, each a list
 * of seven days from Monday to Sunday. Days of the neighbouring months are
 * left empty (`null`).
 */
export function monthWeeks({ year, month }: Month): (string | null)[][] {
  const days = new Date(year, month + 1, 0).getDate();
  // getDay() counts from Sunday as 0. Shift it so that Monday is 0.
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (string | null)[] = new Array(leading).fill(null);
  for (let day = 1; day <= days; day += 1) cells.push(toInputValue(new Date(year, month, day)));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

/** How many nights lie between an arrival and a departure. */
export function nightsBetween(arrive: string, leave: string): number {
  const day = 24 * 60 * 60 * 1000;
  return Math.round((toDate(leave).getTime() - toDate(arrive).getTime()) / day);
}

const format = (value: string, options: Intl.DateTimeFormatOptions) =>
  toDate(value).toLocaleDateString('en-GB', options);

/** A date written out for a person to read, for example "14 November 2026". */
export function toReadable(value: string): string {
  return format(value, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** A date with its weekday, for screen readers: "Saturday 14 November 2026". */
export function toSpoken(value: string): string {
  // Put together by hand, because browsers disagree about a comma after the weekday.
  return `${format(value, { weekday: 'long' })} ${toReadable(value)}`;
}

/** A date in a few characters, for a form field: "14 November". */
export function toShort(value: string): string {
  return format(value, { day: 'numeric', month: 'long' });
}

/** The weekday and year of a date, to go under the short form: "Saturday, 2026". */
export function toWeekday(value: string): string {
  return `${format(value, { weekday: 'long' })}, ${toDate(value).getFullYear()}`;
}

/** The name of a month, for the head of a calendar: "November 2026". */
export function monthTitle({ year, month }: Month): string {
  return new Date(year, month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}
