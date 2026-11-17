import { describe, expect, it } from 'vitest';
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
  toReadable,
  toShort,
  toSpoken,
} from './dates';

describe('dates', () => {
  it('writes a date for a date input', () => {
    expect(toInputValue(new Date(2026, 10, 4))).toBe('2026-11-04');
  });

  it('finds the next day across the end of a month and a year', () => {
    expect(dayAfter('2026-11-30')).toBe('2026-12-01');
    expect(dayAfter('2026-12-31')).toBe('2027-01-01');
  });

  it('moves forwards and backwards by days', () => {
    expect(addDays('2026-11-17', 7)).toBe('2026-11-24');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('moves by months across the end of a year', () => {
    expect(addMonths({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(addMonths({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
    expect(monthOf('2026-11-17')).toEqual({ year: 2026, month: 10 });
  });

  it('keeps the day when moving a date by a month, or uses the last day', () => {
    expect(addMonthsToDate('2026-11-17', 1)).toBe('2026-12-17');
    expect(addMonthsToDate('2027-01-31', 1)).toBe('2027-02-28');
    expect(addMonthsToDate('2026-03-31', -1)).toBe('2026-02-28');
  });

  it('counts the nights of a stay', () => {
    expect(nightsBetween('2026-11-20', '2026-11-23')).toBe(3);
    expect(nightsBetween('2026-12-30', '2027-01-02')).toBe(3);
  });

  it('writes a date for a person to read', () => {
    expect(toReadable('2026-11-14')).toBe('14 November 2026');
    expect(toShort('2026-11-14')).toBe('14 November');
    expect(toSpoken('2026-11-14')).toBe('Saturday 14 November 2026');
    expect(monthTitle({ year: 2026, month: 10 })).toBe('November 2026');
  });
});

describe('monthWeeks', () => {
  // November 2026 begins on a Sunday and has 30 days.
  const weeks = monthWeeks({ year: 2026, month: 10 });

  it('lays a month out in whole weeks that start on Monday', () => {
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks[0]).toEqual([null, null, null, null, null, null, '2026-11-01']);
    expect(weeks[1]?.[0]).toBe('2026-11-02');
  });

  it('holds every day of the month once', () => {
    const days = weeks.flat().filter(Boolean);
    expect(days).toHaveLength(30);
    expect(days.at(-1)).toBe('2026-11-30');
  });

  it('handles a leap year', () => {
    const days = monthWeeks({ year: 2028, month: 1 }).flat().filter(Boolean);
    expect(days).toHaveLength(29);
  });
});
