/**
 * Returns an array of `Date` objects starting at `start` and ending at `end`
 * (inclusive), advancing by `stepDays` calendar days at a time.
 *
 * - Uses UTC date arithmetic (`setUTCDate`) so results are stable across
 *   DST transitions.
 * - Never mutates `start` or `end`; every returned `Date` is a new, distinct
 *   object.
 * - Returns `[]` when `start` is after `end`.
 *
 * @throws {RangeError} if `stepDays` is not a positive integer, or if
 *   `start`/`end` is an invalid `Date`.
 */
export function dateRange(start: Date, end: Date, stepDays = 1): Date[] {
  if (!Number.isInteger(stepDays) || stepDays <= 0) {
    throw new RangeError(
      `stepDays must be a positive integer, received ${stepDays}`,
    );
  }
  if (Number.isNaN(start.getTime())) {
    throw new RangeError("start must be a valid Date");
  }
  if (Number.isNaN(end.getTime())) {
    throw new RangeError("end must be a valid Date");
  }

  if (start.getTime() > end.getTime()) {
    return [];
  }

  const result: Date[] = [];
  const cursor = new Date(start.getTime());
  const endTime = end.getTime();

  while (cursor.getTime() <= endTime) {
    result.push(new Date(cursor.getTime()));
    cursor.setUTCDate(cursor.getUTCDate() + stepDays);
  }

  return result;
}
