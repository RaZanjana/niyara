/** Date helpers for the booking form. Dates are `YYYY-MM-DD`, as date inputs use. */

const pad = (value: number) => String(value).padStart(2, '0');

/** A date in the form a date input expects, in the visitor's own time zone. */
export function toInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The day after a `YYYY-MM-DD` date. */
export function dayAfter(value: string): string {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number);
  return toInputValue(new Date(year, month - 1, day + 1));
}

/** A date written out for a person to read, for example "14 November 2026". */
export function toReadable(value: string): string {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
