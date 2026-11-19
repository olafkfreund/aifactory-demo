// AC#3: dateRange returns an empty array when start is after end (start > end returns []).

import { describe, it, expect } from 'vitest';
import { dateRange } from './dateRange.js';

const utc = (y: number, m: number, d: number): Date =>
  new Date(Date.UTC(y, m, d));

describe('dateRange - start after end', () => {
  it('returns an empty array when start is after end', () => {
    const result = dateRange(utc(2020, 0, 10), utc(2020, 0, 1));
    expect(result).toEqual([]);
  });

  it('returns an empty array for a start one day after end', () => {
    const result = dateRange(utc(2020, 0, 2), utc(2020, 0, 1));
    expect(result).toEqual([]);
  });

  it('returns an array of length 0 when start is after end', () => {
    const result = dateRange(utc(2021, 11, 31), utc(2021, 0, 1));
    expect(result).toHaveLength(0);
  });
});
