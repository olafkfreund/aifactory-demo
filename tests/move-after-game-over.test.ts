// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// The rules layer expresses "the game is decided" as winner(board) returning a
// non-null value — a player mark ("X"/"O") on a win, or "draw" on a full board
// with no line. This suite proves move() short-circuits in that state: once the
// game is over it returns the original board unchanged (a no-op), mutates
// nothing, and never throws — so further clicks have no effect.
import { move, winner } from "../games/tictactoe/game";

describe("move() rejects moves after the game is over (AC#6)", () => {
  it("returns the original board unchanged after a win is decided", () => {
    // Top row is a completed win for X; cell 8 is still empty.
    const board = ["X", "X", "X", "O", "O", null, null, null, null];
    expect(winner(board)).toBe("X");

    const result = move(board, 8, "O");

    // No-op: the exact same board object is handed back, untouched.
    expect(result).toBe(board);
    expect(result).toEqual(["X", "X", "X", "O", "O", null, null, null, null]);
  });

  it("returns the original board unchanged after a draw is decided", () => {
    // Full board, no completed line → winner() reports "draw".
    const board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    expect(winner(board)).toBe("draw");

    const result = move(board, 0, "O");

    expect(result).toBe(board);
    expect(result).toEqual(["X", "O", "X", "X", "O", "O", "O", "X", "X"]);
  });

  it("does not mutate the input board once the game is won", () => {
    const board = ["X", "X", "X", "O", "O", null, null, null, null];

    move(board, 5, "O");

    expect(board).toEqual(["X", "X", "X", "O", "O", null, null, null, null]);
  });

  it("does not throw when a player clicks after the game is decided", () => {
    const board = ["O", "O", "O", "X", "X", null, null, null, null];
    expect(winner(board)).toBe("O");

    expect(() => move(board, 7, "X")).not.toThrow();
  });
});
