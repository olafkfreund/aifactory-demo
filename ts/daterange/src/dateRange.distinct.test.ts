// AC#3: returned dates are distinct objects — every Date in the returned
// array is a new, distinct object with no shared references between elements.

import { describe, it, expect } from 'vitest';
import { dateRange } from './dateRange.js';

describe('dateRange — returned dates are distinct objects', () => {
  it('returns no two elements that are the same object reference', () => {
    const result = dateRange(
      new Date(Date.UTC(2024, 0, 1)),
      new Date(Date.UTC(2024, 0, 5)),
      1,
    );

    expect(result.length).toBeGreaterThan(1);

    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        expect(result[i]).not.toBe(result[j]);
      }
    }
  });

  it('produces a set of unique object references equal in size to the array', () => {
    const result = dateRange(
      new Date(Date.UTC(2024, 0, 1)),
      new Date(Date.UTC(2024, 0, 10)),
      1,
    );

    const unique = new Set(result);
    expect(unique.size).toBe(result.length);
  });

  it('mutating one returned date does not affect any other returned date', () => {
    const result = dateRange(
      new Date(Date.UTC(2024, 0, 1)),
      new Date(Date.UTC(2024, 0, 5)),
      1,
    );

    const originalTimes = result.map((d) => d.getTime());
    result[0].setUTCFullYear(1999);

    for (let i = 1; i < result.length; i++) {
      expect(result[i].getTime()).toBe(originalTimes[i]);
    }
  });

  it('each element is a Date instance', () => {
    const result = dateRange(
      new Date(Date.UTC(2024, 0, 1)),
      new Date(Date.UTC(2024, 0, 3)),
      1,
    );

    for (const d of result) {
      expect(d).toBeInstanceOf(Date);
    }
  });
});
