// AC#1: nextFocusIndex(current, key) takes a cell index 0-8 and a key name.
// AC#4: returns 0 for Home and 8 for End from any cell.
// AC#5: returns the current index unchanged for any other key.

const { nextFocusIndex } = require("./game.js");

describe("nextFocusIndex Home/End and passthrough", () => {
  test("Home returns 0 from any cell (AC#4)", () => {
    for (let i = 0; i < 9; i++) {
      expect(nextFocusIndex(i, "Home")).toBe(0);
    }
  });

  test("End returns 8 from any cell (AC#4)", () => {
    for (let i = 0; i < 9; i++) {
      expect(nextFocusIndex(i, "End")).toBe(8);
    }
  });

  test("returns the current index unchanged for any other key (AC#5)", () => {
    expect(nextFocusIndex(4, "Enter")).toBe(4);
    expect(nextFocusIndex(0, " ")).toBe(0);
    expect(nextFocusIndex(7, "a")).toBe(7);
    expect(nextFocusIndex(3, "Tab")).toBe(3);
    expect(nextFocusIndex(8, "Escape")).toBe(8);
  });
});
