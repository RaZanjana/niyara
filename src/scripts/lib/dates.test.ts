import { describe, expect, it } from 'vitest';
import { dayAfter, toInputValue, toReadable } from './dates';

describe('dates', () => {
  it('writes a date for a date input', () => {
    expect(toInputValue(new Date(2026, 10, 4))).toBe('2026-11-04');
  });

  it('finds the next day across the end of a month and a year', () => {
    expect(dayAfter('2026-11-30')).toBe('2026-12-01');
    expect(dayAfter('2026-12-31')).toBe('2027-01-01');
  });

  it('writes a date for a person to read', () => {
    expect(toReadable('2026-11-14')).toBe('14 November 2026');
  });
});
