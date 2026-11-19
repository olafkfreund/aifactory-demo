// AC#3: dateRange must include the leap day 2024-02-29 when stepping across
// February 2024 (UTC arithmetic, inclusive of end).

import { describe, it, expect } from 'vitest';
import { dateRange } from './dateRange';

describe('dateRange leap day 2024-02-29', () => {
  it('includes 2024-02-29 when stepping day-by-day across February 2024', () => {
    const start = new Date('2024-02-28T00:00:00.000Z');
    const end = new Date('2024-03-01T00:00:00.000Z');

    const result = dateRange(start, end, 1);

    const iso = result.map((d) => d.toISOString());
    expect(iso).toContain('2024-02-29T00:00:00.000Z');
  });

  it('produces the full inclusive sequence 02-28, 02-29, 03-01 with step 1', () => {
    const start = new Date('2024-02-28T00:00:00.000Z');
    const end = new Date('2024-03-01T00:00:00.000Z');

    const result = dateRange(start, end, 1);

    const iso = result.map((d) => d.toISOString());
    expect(iso).toEqual([
      '2024-02-28T00:00:00.000Z',
      '2024-02-29T00:00:00.000Z',
      '2024-03-01T00:00:00.000Z',
    ]);
  });

  it('lands exactly on the leap day when starting on it', () => {
    const start = new Date('2024-02-29T00:00:00.000Z');
    const end = new Date('2024-02-29T00:00:00.000Z');

    const result = dateRange(start, end, 1);

    expect(result).toHaveLength(1);
    expect(result[0].toISOString()).toBe('2024-02-29T00:00:00.000Z');
  });
});
