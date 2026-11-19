// AC#1: `cd ts/daterange && npm install && npm test` passes with vitest.
// Smoke test: the dateRange module imports and the function behaves sanely,
// so the full vitest suite can run green under `npm test`.

import { describe, it, expect } from 'vitest';
import { dateRange } from './dateRange';

describe('dateRange smoke test', () => {
  it('imports dateRange as a callable function', () => {
    expect(typeof dateRange).toBe('function');
  });

  it('returns an array of Date objects for a simple range', () => {
    const result = dateRange(
      new Date('2024-01-01T00:00:00.000Z'),
      new Date('2024-01-03T00:00:00.000Z'),
    );
    expect(Array.isArray(result)).toBe(true);
    for (const d of result) {
      expect(d).toBeInstanceOf(Date);
    }
  });

  it('includes start through end inclusive with the default step of 1 day', () => {
    const result = dateRange(
      new Date('2024-01-01T00:00:00.000Z'),
      new Date('2024-01-03T00:00:00.000Z'),
    );
    expect(result.map((d) => d.toISOString())).toEqual([
      '2024-01-01T00:00:00.000Z',
      '2024-01-02T00:00:00.000Z',
      '2024-01-03T00:00:00.000Z',
    ]);
  });
});
