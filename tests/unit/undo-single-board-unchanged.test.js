// AC#1: undo(history) returns the same single-board history unchanged (same reference).
// games/tictactoe/game.js exports undo(history), a pure function: given an array of
// boards (oldest first) it returns a new array without the last board, and returns the
// same single-board history unchanged.
"use strict";

const { undo } = require("../../games/tictactoe/game.js");

describe("undo on a single-board history", () => {
  it("returns the same single-board history unchanged (same reference)", () => {
    const board = Array(9).fill(null);
    const history = [board];

    const result = undo(history);

    expect(result).toBe(history);
  });

  it("leaves the single-board history contents unchanged", () => {
    const board = Array(9).fill(null);
    const history = [board];

    const result = undo(history);

    expect(result).toEqual([board]);
    expect(result).toHaveLength(1);
  });
});
