// AC#3: inputs not mutated — dateRange must not mutate the start or end
// Date arguments it is given; it returns new Date objects and leaves the
// caller's inputs unchanged.

import { describe, it, expect } from 'vitest';
import { dateRange } from './dateRange.js';

describe('dateRange — inputs are not mutated', () => {
  it('does not mutate the start Date argument', () => {
    const start = new Date(Date.UTC(2024, 0, 1));
    const end = new Date(Date.UTC(2024, 0, 10));
    const startTimeBefore = start.getTime();

    dateRange(start, end, 1);

    expect(start.getTime()).toBe(startTimeBefore);
  });

  it('does not mutate the end Date argument', () => {
    const start = new Date(Date.UTC(2024, 0, 1));
    const end = new Date(Date.UTC(2024, 0, 10));
    const endTimeBefore = end.getTime();

    dateRange(start, end, 1);

    expect(end.getTime()).toBe(endTimeBefore);
  });

  it('leaves both start and end unchanged across a multi-day step', () => {
    const start = new Date(Date.UTC(2024, 0, 1));
    const end = new Date(Date.UTC(2024, 1, 15));
    const startTimeBefore = start.getTime();
    const endTimeBefore = end.getTime();

    dateRange(start, end, 7);

    expect(start.getTime()).toBe(startTimeBefore);
    expect(end.getTime()).toBe(endTimeBefore);
  });

  it('does not alias the inputs into the returned array', () => {
    const start = new Date(Date.UTC(2024, 0, 1));
    const end = new Date(Date.UTC(2024, 0, 3));

    const result = dateRange(start, end, 1);

    for (const d of result) {
      expect(d).not.toBe(start);
      expect(d).not.toBe(end);
    }
  });
});
