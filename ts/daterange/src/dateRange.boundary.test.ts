// AC#3: month and year boundary crossing
// Verify dateRange crosses month and year boundaries correctly using UTC arithmetic.

import { describe, it, expect } from 'vitest';
import { dateRange } from './dateRange.js';

const iso = (d: Date) => d.toISOString().slice(0, 10);

describe('dateRange — month and year boundary crossing (UTC)', () => {
  it('crosses a month boundary, advancing one UTC day at a time', () => {
    const start = new Date(Date.UTC(2024, 0, 30)); // 2024-01-30
    const end = new Date(Date.UTC(2024, 1, 2)); // 2024-02-02

    const result = dateRange(start, end, 1);

    expect(result.map(iso)).toEqual([
      '2024-01-30',
      '2024-01-31',
      '2024-02-01',
      '2024-02-02',
    ]);
  });

  it('crosses a year boundary, advancing one UTC day at a time', () => {
    const start = new Date(Date.UTC(2023, 11, 30)); // 2023-12-30
    const end = new Date(Date.UTC(2024, 0, 2)); // 2024-01-02

    const result = dateRange(start, end, 1);

    expect(result.map(iso)).toEqual([
      '2023-12-30',
      '2023-12-31',
      '2024-01-01',
      '2024-01-02',
    ]);
  });

  it('crosses a month boundary with a multi-day step using UTC arithmetic', () => {
    const start = new Date(Date.UTC(2024, 0, 29)); // 2024-01-29
    const end = new Date(Date.UTC(2024, 1, 10)); // 2024-02-10

    const result = dateRange(start, end, 7);

    expect(result.map(iso)).toEqual([
      '2024-01-29',
      '2024-02-05',
    ]);
  });

  it('crosses a year boundary with a multi-day step using UTC arithmetic', () => {
    const start = new Date(Date.UTC(2023, 11, 28)); // 2023-12-28
    const end = new Date(Date.UTC(2024, 0, 10)); // 2024-01-10

    const result = dateRange(start, end, 7);

    expect(result.map(iso)).toEqual([
      '2023-12-28',
      '2024-01-04',
    ]);
  });

  it('reports the correct UTC calendar fields across a year boundary', () => {
    const start = new Date(Date.UTC(2023, 11, 31)); // 2023-12-31
    const end = new Date(Date.UTC(2024, 0, 1)); // 2024-01-01

    const result = dateRange(start, end, 1);

    expect(result).toHaveLength(2);
    expect(result[0].getUTCFullYear()).toBe(2023);
    expect(result[0].getUTCMonth()).toBe(11);
    expect(result[0].getUTCDate()).toBe(31);
    expect(result[1].getUTCFullYear()).toBe(2024);
    expect(result[1].getUTCMonth()).toBe(0);
    expect(result[1].getUTCDate()).toBe(1);
  });
});
