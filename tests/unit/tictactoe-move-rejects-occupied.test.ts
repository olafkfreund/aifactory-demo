// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// The pure rule `move(board, index, player)` backs the UI's cell-click.
// Rejecting an occupied cell means: no exception is thrown, and the call is a
// true no-op — it returns the SAME board reference it was given and the mark
// already in that cell is left untouched (so no turn passes).
//
// game.js is a CommonJS/UMD module; imported here via a relative path from
// tests/unit/ to games/tictactoe/game.js.
import { emptyBoard, move } from "../../games/tictactoe/game";

// Build a board from a compact array, using '.' for empty cells.
function board(cells: Array<string>): Array<string | null> {
  return cells.map((c) => (c === "." ? null : c));
}

describe("move() rejects an occupied cell (AC#3)", () => {
  it("returns the exact same board reference (no-op) when the cell is occupied", () => {
    const occupied = move(emptyBoard(), 0, "X");
    const attempt = move(occupied, 0, "O");
    expect(attempt).toBe(occupied); // same reference: true no-op
  });

  it("preserves the existing mark in the occupied cell", () => {
    const occupied = move(emptyBoard(), 4, "X");
    const attempt = move(occupied, 4, "O");
    expect(attempt[4]).toBe("X"); // original mark untouched, no turn passed
  });

  it("does not throw when the target cell is already occupied", () => {
    const occupied = move(emptyBoard(), 8, "X");
    expect(() => move(occupied, 8, "O")).not.toThrow();
  });

  it("leaves the rest of the board unchanged on a rejected move", () => {
    const before = board(["X", "O", ".", ".", ".", ".", ".", ".", "."]);
    const after = move(before, 1, "X"); // cell 1 already holds "O"
    expect(after).toBe(before); // same reference, whole board unchanged
    expect(after[1]).toBe("O");
  });
});
