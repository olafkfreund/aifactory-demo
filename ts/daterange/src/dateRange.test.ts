import { describe, expect, it } from "vitest";
import { dateRange } from "./dateRange.js";

const utc = (y: number, m: number, d: number): Date =>
  new Date(Date.UTC(y, m, d));

describe("dateRange", () => {
  it("includes the end date (inclusive range)", () => {
    const result = dateRange(utc(2024, 0, 1), utc(2024, 0, 3));
    expect(result.map((d) => d.toISOString())).toEqual([
      utc(2024, 0, 1).toISOString(),
      utc(2024, 0, 2).toISOString(),
      utc(2024, 0, 3).toISOString(),
    ]);
  });

  it("steps by 1 day when stepDays is omitted", () => {
    const result = dateRange(utc(2024, 2, 1), utc(2024, 2, 4));
    expect(result).toHaveLength(4);
    expect(result[1].toISOString()).toBe(utc(2024, 2, 2).toISOString());
  });

  it("steps by 2 days", () => {
    const result = dateRange(utc(2024, 0, 1), utc(2024, 0, 10), 2);
    expect(result.map((d) => d.getUTCDate())).toEqual([1, 3, 5, 7, 9]);
  });

  it("steps by 7 days (weekly)", () => {
    const result = dateRange(utc(2024, 0, 1), utc(2024, 1, 1), 7);
    expect(result.map((d) => d.toISOString())).toEqual([
      utc(2024, 0, 1).toISOString(),
      utc(2024, 0, 8).toISOString(),
      utc(2024, 0, 15).toISOString(),
      utc(2024, 0, 22).toISOString(),
      utc(2024, 0, 29).toISOString(),
    ]);
  });

  it("returns a single element when start === end", () => {
    const start = utc(2024, 5, 15);
    const end = utc(2024, 5, 15);
    const result = dateRange(start, end);
    expect(result).toHaveLength(1);
    expect(result[0].toISOString()).toBe(start.toISOString());
  });

  it("returns an empty array when start > end", () => {
    const result = dateRange(utc(2024, 5, 15), utc(2024, 5, 14));
    expect(result).toEqual([]);
  });

  it("does not mutate the start or end inputs", () => {
    const start = utc(2024, 0, 1);
    const end = utc(2024, 0, 5);
    const startTime = start.getTime();
    const endTime = end.getTime();

    dateRange(start, end, 2);

    expect(start.getTime()).toBe(startTime);
    expect(end.getTime()).toBe(endTime);
  });

  it("returns distinct Date objects, not aliases of the inputs", () => {
    const start = utc(2024, 0, 1);
    const end = utc(2024, 0, 3);
    const result = dateRange(start, end);

    expect(result[0]).not.toBe(start);
    expect(result[0]).not.toBe(result[1]);
    expect(result[1]).not.toBe(result[2]);

    // Mutating a returned Date must not affect the others or the inputs.
    result[0].setUTCFullYear(1999);
    expect(start.getUTCFullYear()).toBe(2024);
    expect(result[1].getUTCFullYear()).toBe(2024);
  });

  it("crosses a month boundary correctly", () => {
    const result = dateRange(utc(2024, 0, 30), utc(2024, 1, 2));
    expect(result.map((d) => d.toISOString())).toEqual([
      utc(2024, 0, 30).toISOString(),
      utc(2024, 0, 31).toISOString(),
      utc(2024, 1, 1).toISOString(),
      utc(2024, 1, 2).toISOString(),
    ]);
  });

  it("crosses a year boundary correctly", () => {
    const result = dateRange(utc(2023, 11, 30), utc(2024, 0, 2));
    expect(result.map((d) => d.toISOString())).toEqual([
      utc(2023, 11, 30).toISOString(),
      utc(2023, 11, 31).toISOString(),
      utc(2024, 0, 1).toISOString(),
      utc(2024, 0, 2).toISOString(),
    ]);
  });

  it("includes the leap day 2024-02-29", () => {
    const result = dateRange(utc(2024, 1, 28), utc(2024, 2, 1));
    expect(result.map((d) => d.toISOString())).toEqual([
      utc(2024, 1, 28).toISOString(),
      utc(2024, 1, 29).toISOString(),
      utc(2024, 2, 1).toISOString(),
    ]);
  });

  it("throws RangeError when stepDays is 0", () => {
    expect(() => dateRange(utc(2024, 0, 1), utc(2024, 0, 5), 0)).toThrow(
      RangeError,
    );
  });

  it("throws RangeError when stepDays is negative", () => {
    expect(() => dateRange(utc(2024, 0, 1), utc(2024, 0, 5), -1)).toThrow(
      RangeError,
    );
  });

  it("throws RangeError when stepDays is fractional", () => {
    expect(() => dateRange(utc(2024, 0, 1), utc(2024, 0, 5), 1.5)).toThrow(
      RangeError,
    );
  });

  it("throws RangeError when stepDays is NaN", () => {
    expect(() => dateRange(utc(2024, 0, 1), utc(2024, 0, 5), NaN)).toThrow(
      RangeError,
    );
  });

  it("throws RangeError when start or end is an invalid Date", () => {
    const invalid = new Date("not-a-date");
    expect(() => dateRange(invalid, utc(2024, 0, 5))).toThrow(RangeError);
    expect(() => dateRange(utc(2024, 0, 1), invalid)).toThrow(RangeError);
  });
});
