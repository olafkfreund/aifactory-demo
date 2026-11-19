// AC#3: dateRange throws RangeError when stepDays is not a positive integer —
// specifically for stepDays of 0, -1, 1.5, and NaN.

import { describe, it, expect } from 'vitest';
import { dateRange } from './dateRange.js';

describe('dateRange — RangeError for invalid stepDays', () => {
  const start = new Date('2024-01-01T00:00:00.000Z');
  const end = new Date('2024-01-10T00:00:00.000Z');

  it('throws RangeError when stepDays is 0', () => {
    expect(() => dateRange(start, end, 0)).toThrow(RangeError);
  });

  it('throws RangeError when stepDays is -1', () => {
    expect(() => dateRange(start, end, -1)).toThrow(RangeError);
  });

  it('throws RangeError when stepDays is 1.5 (fractional)', () => {
    expect(() => dateRange(start, end, 1.5)).toThrow(RangeError);
  });

  it('throws RangeError when stepDays is NaN', () => {
    expect(() => dateRange(start, end, NaN)).toThrow(RangeError);
  });
});
