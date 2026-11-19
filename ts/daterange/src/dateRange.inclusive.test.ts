// AC#3: inclusive end, step of 1 — dateRange yields start through end
// inclusive, advancing one calendar day at a time with the default step.

import { describe, it, expect } from 'vitest';
import { dateRange } from './dateRange';

describe('dateRange — inclusive end, default step of 1', () => {
  it('yields every day from start through end inclusive with the default step', () => {
    const start = new Date(Date.UTC(2024, 0, 1));
    const end = new Date(Date.UTC(2024, 0, 5));

    const result = dateRange(start, end);

    expect(result).toHaveLength(5);
    expect(result.map((d) => d.toISOString())).toEqual([
      '2024-01-01T00:00:00.000Z',
      '2024-01-02T00:00:00.000Z',
      '2024-01-03T00:00:00.000Z',
      '2024-01-04T00:00:00.000Z',
      '2024-01-05T00:00:00.000Z',
    ]);
  });

  it('includes the end date as the final element (inclusive end)', () => {
    const start = new Date(Date.UTC(2024, 0, 1));
    const end = new Date(Date.UTC(2024, 0, 5));

    const result = dateRange(start, end);

    expect(result[0].toISOString()).toBe('2024-01-01T00:00:00.000Z');
    expect(result[result.length - 1].toISOString()).toBe(
      '2024-01-05T00:00:00.000Z',
    );
  });

  it('advances exactly one calendar day at a time with the default step', () => {
    const start = new Date(Date.UTC(2024, 2, 10));
    const end = new Date(Date.UTC(2024, 2, 13));

    const result = dateRange(start, end);

    expect(result.map((d) => d.getUTCDate())).toEqual([10, 11, 12, 13]);
  });

  it('behaves the same when the default step of 1 is passed explicitly', () => {
    const start = new Date(Date.UTC(2024, 0, 1));
    const end = new Date(Date.UTC(2024, 0, 3));

    const implicitStep = dateRange(start, end);
    const explicitStep = dateRange(start, end, 1);

    expect(explicitStep.map((d) => d.toISOString())).toEqual(
      implicitStep.map((d) => d.toISOString()),
    );
    expect(explicitStep.map((d) => d.toISOString())).toEqual([
      '2024-01-01T00:00:00.000Z',
      '2024-01-02T00:00:00.000Z',
      '2024-01-03T00:00:00.000Z',
    ]);
  });
});
