// AC#2: `npm run typecheck` passes under strict mode.
//
// This file exercises the public type signature of
//   export function dateRange(start: Date, end: Date, stepDays = 1): Date[]
// so that `tsc --noEmit` under strict mode compiles it with no errors.

import { describe, it, expectTypeOf, assertType } from 'vitest';

import { dateRange } from './dateRange';

describe('dateRange type signature (strict mode)', () => {
  const start = new Date('2024-01-01T00:00:00Z');
  const end = new Date('2024-01-10T00:00:00Z');

  it('is a callable function', () => {
    expectTypeOf(dateRange).toBeFunction();
  });

  it('accepts two Date arguments and returns Date[]', () => {
    expectTypeOf(dateRange).returns.toEqualTypeOf<Date[]>();
    assertType<Date[]>(dateRange(start, end));
  });

  it('accepts an optional numeric stepDays argument', () => {
    expectTypeOf(dateRange).parameter(0).toEqualTypeOf<Date>();
    expectTypeOf(dateRange).parameter(1).toEqualTypeOf<Date>();
    assertType<Date[]>(dateRange(start, end, 1));
    assertType<Date[]>(dateRange(start, end, 2));
    assertType<Date[]>(dateRange(start, end, 7));
  });

  it('returns an array whose elements are Date values', () => {
    const result = dateRange(start, end);
    expectTypeOf(result).toEqualTypeOf<Date[]>();
    expectTypeOf(result[0]).toEqualTypeOf<Date>();
  });
});
