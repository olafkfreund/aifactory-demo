// AC#3: dateRange throws RangeError when either start or end is an invalid
// Date (NaN time).

import { describe, it, expect } from 'vitest';
import { dateRange } from './dateRange.js';

describe('dateRange invalid Date handling', () => {
  const validDate = new Date(Date.UTC(2024, 0, 1));
  const invalidDate = new Date(NaN);

  it('throws RangeError when start is an invalid Date', () => {
    expect(() => dateRange(invalidDate, validDate)).toThrow(RangeError);
  });

  it('throws RangeError when end is an invalid Date', () => {
    expect(() => dateRange(validDate, invalidDate)).toThrow(RangeError);
  });

  it('throws RangeError when both start and end are invalid Dates', () => {
    expect(() => dateRange(invalidDate, invalidDate)).toThrow(RangeError);
  });
});
