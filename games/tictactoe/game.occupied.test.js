// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
// This suite proves the pure rules layer: move() returns the ORIGINAL board
// unchanged (same reference) when the target cell is already occupied.
// Run from repo root with: npx jest games/tictactoe/game.occupied.test.js
"use strict";

const { emptyBoard, move } = require("./game.js");

// Build a board from a compact array, using '.' for empty cells.
function board(cells) {
  return cells.map((c) => (c === "." ? null : c));
}

describe("move rejects an occupied cell (AC#3)", () => {
  test("returns the exact same board reference when the cell is taken", () => {
    const afterFirst = move(emptyBoard(), 0, "X");
    const attempt = move(afterFirst, 0, "O");
    expect(attempt).toBe(afterFirst); // exact no-op: same reference, not a copy
  });

  test("does not overwrite the mark already in the occupied cell", () => {
    const afterFirst = move(emptyBoard(), 4, "X");
    const attempt = move(afterFirst, 4, "O");
    expect(attempt[4]).toBe("X"); // original mark stays put
  });

  test("no error is thrown when clicking an occupied cell", () => {
    const occupied = board(["X", ".", ".", ".", ".", ".", ".", ".", "."]);
    expect(() => move(occupied, 0, "O")).not.toThrow();
  });

  test("rejects an occupied cell regardless of which player attempts it", () => {
    const occupied = board([".", ".", ".", ".", "O", ".", ".", ".", "."]);
    expect(move(occupied, 4, "X")).toBe(occupied);
    expect(move(occupied, 4, "O")).toBe(occupied);
  });

  test("still places a mark on a neighbouring empty cell (occupancy is per-cell)", () => {
    const occupied = board(["X", ".", ".", ".", ".", ".", ".", ".", "."]);
    const next = move(occupied, 1, "O");
    expect(next).not.toBe(occupied); // a real move produces a NEW board
    expect(next[1]).toBe("O");
    expect(occupied[1]).toBe(null); // original untouched
  });
});
