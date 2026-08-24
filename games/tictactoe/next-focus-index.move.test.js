// AC#2: nextFocusIndex moves right/left within a row and up/down within a
// column: from 4, ArrowRight is 5, ArrowLeft is 3, ArrowUp is 1, ArrowDown is 7.
//
// Run from the repo root with:
//   npx jest games/tictactoe/next-focus-index.move.test.js
"use strict";

const { nextFocusIndex } = require("./game.js");

describe("nextFocusIndex — moves within row/column from the center cell (4)", () => {
  test("ArrowRight from 4 moves one cell right to 5", () => {
    expect(nextFocusIndex(4, "ArrowRight")).toBe(5);
  });

  test("ArrowLeft from 4 moves one cell left to 3", () => {
    expect(nextFocusIndex(4, "ArrowLeft")).toBe(3);
  });

  test("ArrowUp from 4 moves one cell up to 1", () => {
    expect(nextFocusIndex(4, "ArrowUp")).toBe(1);
  });

  test("ArrowDown from 4 moves one cell down to 7", () => {
    expect(nextFocusIndex(4, "ArrowDown")).toBe(7);
  });
});
