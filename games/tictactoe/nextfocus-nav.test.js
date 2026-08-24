// AC#2: nextFocusIndex moves right/left within a row and up/down within a
//       column: from 4, ArrowRight is 5, ArrowLeft is 3, ArrowUp is 1,
//       ArrowDown is 7.
// AC#3: nextFocusIndex wraps at the edges: from 2, ArrowRight is 0; from 0,
//       ArrowLeft is 2; from 0, ArrowUp is 6; from 6, ArrowDown is 0.
"use strict";

const { nextFocusIndex } = require("./game.js");

describe("nextFocusIndex arrow navigation and edge wrapping", () => {
  // AC#2 — movement within the interior of the 3x3 grid (from center cell 4).
  test("ArrowRight from 4 moves to 5", () => {
    expect(nextFocusIndex(4, "ArrowRight")).toBe(5);
  });

  test("ArrowLeft from 4 moves to 3", () => {
    expect(nextFocusIndex(4, "ArrowLeft")).toBe(3);
  });

  test("ArrowUp from 4 moves to 1", () => {
    expect(nextFocusIndex(4, "ArrowUp")).toBe(1);
  });

  test("ArrowDown from 4 moves to 7", () => {
    expect(nextFocusIndex(4, "ArrowDown")).toBe(7);
  });

  // AC#3 — wrapping at every edge of the grid.
  test("ArrowRight from 2 wraps to 0", () => {
    expect(nextFocusIndex(2, "ArrowRight")).toBe(0);
  });

  test("ArrowLeft from 0 wraps to 2", () => {
    expect(nextFocusIndex(0, "ArrowLeft")).toBe(2);
  });

  test("ArrowUp from 0 wraps to 6", () => {
    expect(nextFocusIndex(0, "ArrowUp")).toBe(6);
  });

  test("ArrowDown from 6 wraps to 0", () => {
    expect(nextFocusIndex(6, "ArrowDown")).toBe(0);
  });
});
