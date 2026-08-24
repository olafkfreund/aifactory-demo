// AC#4: nextFocusIndex returns 0 for Home and 8 for End, from any cell.
// Verify that pressing Home jumps focus to the first cell (index 0) and
// pressing End jumps focus to the last cell (index 8), regardless of which
// cell (0-8) currently holds focus.

const { nextFocusIndex } = require("./game.js");

describe("nextFocusIndex Home/End", () => {
  const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  describe("Home jumps to the first cell", () => {
    it.each(cells)("returns 0 for Home from cell %i", (index) => {
      expect(nextFocusIndex(index, "Home")).toBe(0);
    });
  });

  describe("End jumps to the last cell", () => {
    it.each(cells)("returns 8 for End from cell %i", (index) => {
      expect(nextFocusIndex(index, "End")).toBe(8);
    });
  });
});
