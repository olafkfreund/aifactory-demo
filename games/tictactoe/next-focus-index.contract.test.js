// AC#1: nextFocusIndex(current, key) — given a cell index 0-8 and a key name,
// it returns the index the grid focus should move to. This contract test
// verifies the return value is always an integer in the range 0-8 for every
// arrow key, Home, End, and any other (default) key, from each cell 0-8.
"use strict";

const { nextFocusIndex } = require("./game.js");

const CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const KEYS = [
  "ArrowRight",
  "ArrowLeft",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "Tab", // an unrelated "other" key exercising the default branch
];

describe("nextFocusIndex returns a valid cell index for every cell and key", () => {
  for (const current of CELLS) {
    for (const key of KEYS) {
      test(`nextFocusIndex(${current}, "${key}") is an integer in 0-8`, () => {
        const result = nextFocusIndex(current, key);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(8);
      });
    }
  }
});
