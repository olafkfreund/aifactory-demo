// AC#3: dateRange returns exactly one element when start === end.
import { describe, it, expect } from 'vitest';
import { dateRange } from './dateRange.js';

describe('dateRange — start === end', () => {
  it('returns exactly one element when start and end are the same date', () => {
    const start = new Date(Date.UTC(2024, 0, 15));
    const end = new Date(Date.UTC(2024, 0, 15));

    const result = dateRange(start, end);

    expect(result).toHaveLength(1);
  });

  it('the single returned element equals the start/end date', () => {
    const start = new Date(Date.UTC(2024, 0, 15));
    const end = new Date(Date.UTC(2024, 0, 15));

    const result = dateRange(start, end);

    expect(result).toHaveLength(1);
    expect(result[0].getTime()).toBe(start.getTime());
  });

  it('returns one element when start and end are the exact same Date object', () => {
    const date = new Date(Date.UTC(2020, 5, 1));

    const result = dateRange(date, date);

    expect(result).toHaveLength(1);
    expect(result[0].getTime()).toBe(date.getTime());
  });
});
