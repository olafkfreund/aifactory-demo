// AC#3: step of 2 and 7 — dateRange advances by the given stepDays, including
// the end only when it lands exactly on a step.

import { describe, it, expect } from 'vitest';
import { dateRange } from './dateRange.js';

/** UTC date helper so results never depend on the host timezone / DST. */
function utc(year: number, month1: number, day: number): Date {
  return new Date(Date.UTC(year, month1 - 1, day));
}

/** Compare a returned Date[] to expected calendar days by UTC timestamp. */
function isoList(dates: Date[]): string[] {
  return dates.map((d) => d.toISOString());
}

describe('dateRange — step of 2', () => {
  it('advances two calendar days at a time, including the end when it lands on a step', () => {
    const result = dateRange(utc(2024, 1, 1), utc(2024, 1, 7), 2);
    expect(isoList(result)).toEqual([
      '2024-01-01T00:00:00.000Z',
      '2024-01-03T00:00:00.000Z',
      '2024-01-05T00:00:00.000Z',
      '2024-01-07T00:00:00.000Z',
    ]);
  });

  it('excludes the end when it does not land exactly on a step', () => {
    const result = dateRange(utc(2024, 1, 1), utc(2024, 1, 6), 2);
    expect(isoList(result)).toEqual([
      '2024-01-01T00:00:00.000Z',
      '2024-01-03T00:00:00.000Z',
      '2024-01-05T00:00:00.000Z',
    ]);
  });
});

describe('dateRange — step of 7', () => {
  it('advances seven calendar days at a time, including the end when it lands on a step', () => {
    const result = dateRange(utc(2024, 1, 1), utc(2024, 1, 22), 7);
    expect(isoList(result)).toEqual([
      '2024-01-01T00:00:00.000Z',
      '2024-01-08T00:00:00.000Z',
      '2024-01-15T00:00:00.000Z',
      '2024-01-22T00:00:00.000Z',
    ]);
  });

  it('excludes the end when it does not land exactly on a step', () => {
    const result = dateRange(utc(2024, 1, 1), utc(2024, 1, 20), 7);
    expect(isoList(result)).toEqual([
      '2024-01-01T00:00:00.000Z',
      '2024-01-08T00:00:00.000Z',
      '2024-01-15T00:00:00.000Z',
    ]);
  });
});
