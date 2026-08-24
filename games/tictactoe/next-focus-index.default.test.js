// AC#5: nextFocusIndex returns the current index unchanged for any other key.
// Unrelated keys (e.g. Tab, a, Enter) must leave the focus where it is.
//
// Run from the repo root with:
//   npx jest games/tictactoe/next-focus-index.default.test.js
"use strict";

const { nextFocusIndex } = require("./game.js");

describe("nextFocusIndex — unrelated keys leave the index unchanged (AC#5)", () => {
  const UNRELATED_KEYS = ["Tab", "a", "Enter", " ", "Escape", "Shift", "1"];

  for (const key of UNRELATED_KEYS) {
    it(`returns the current index unchanged for key "${key}" from every cell 0-8`, () => {
      for (let current = 0; current <= 8; current++) {
        expect(nextFocusIndex(current, key)).toBe(current);
      }
    });
  }

  it("returns the current index unchanged for Tab from cell 4", () => {
    expect(nextFocusIndex(4, "Tab")).toBe(4);
  });

  it("returns the current index unchanged for 'a' from cell 0", () => {
    expect(nextFocusIndex(0, "a")).toBe(0);
  });

  it("returns the current index unchanged for Enter from cell 8", () => {
    expect(nextFocusIndex(8, "Enter")).toBe(8);
  });
});
