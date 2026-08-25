// AC#8: The test suite covers every rules function, including emptyBoard.
// These tests verify emptyBoard() returns a fresh array of 9 null cells and
// that each call yields an independent instance (no shared mutable state).
//
// Run from repo root with: npx jest games/tictactoe/game.emptyboard.test.js
"use strict";

const { emptyBoard } = require("./game.js");

describe("emptyBoard returns a fresh array of 9 null cells", () => {
  test("returns an array of length 9", () => {
    expect(emptyBoard()).toHaveLength(9);
  });

  test("every cell is null", () => {
    expect(emptyBoard()).toEqual([
      null, null, null, null, null, null, null, null, null,
    ]);
  });

  test("returns a fresh instance on each call (not the same reference)", () => {
    expect(emptyBoard()).not.toBe(emptyBoard());
  });

  test("mutating one board does not affect a subsequent fresh board", () => {
    const first = emptyBoard();
    first[0] = "X";
    const second = emptyBoard();
    expect(second[0]).toBe(null);
  });
});
