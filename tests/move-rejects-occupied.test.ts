// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// The rules layer expresses "clicking an occupied cell" as move(board, index,
// player) targeting a cell that already holds a mark. This suite proves move()
// treats that as a no-op: it returns the original board unchanged, mutates
// nothing, and never throws — so no turn passes and no error surfaces.
import { move } from "../games/tictactoe/game";

describe("move() rejects an already-occupied cell (AC#3)", () => {
  it("returns the original board unchanged when the target cell is occupied", () => {
    const board = ["X", null, null, null, null, null, null, null, null];

    const result = move(board, 0, "O");

    // No-op: the exact same board object is handed back, untouched.
    expect(result).toBe(board);
    expect(result).toEqual([
      "X",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
  });

  it("does not mutate the input board when the cell is occupied", () => {
    const board = [null, null, null, null, "O", null, null, null, null];

    move(board, 4, "X");

    // The occupying mark stays exactly as it was; nothing else changes.
    expect(board[4]).toBe("O");
    expect(board).toEqual([
      null,
      null,
      null,
      null,
      "O",
      null,
      null,
      null,
      null,
    ]);
  });

  it("does not throw when a player clicks an occupied cell", () => {
    const board = [null, null, "X", null, null, null, null, null, null];

    expect(() => move(board, 2, "O")).not.toThrow();
  });

  it("leaves a cell occupied by the same player unchanged (no double-mark)", () => {
    const board = [null, null, null, null, null, null, null, null, "X"];

    const result = move(board, 8, "X");

    expect(result).toBe(board);
    expect(result[8]).toBe("X");
  });
});
