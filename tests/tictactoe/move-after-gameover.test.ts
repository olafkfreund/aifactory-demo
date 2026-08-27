// AC#6: Play stops once the game is decided; further clicks do nothing.
// This unit test verifies the rules-layer behaviour behind that AC: once
// winner(board) is non-null (a win OR a draw), move(board, index, player) is a
// no-op that returns the SAME board reference — no new board, no mutation, no
// throw — even when the targeted cell is still empty.
import { move, winner } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

describe("move() rejects moves after the game is over (AC#6)", () => {
  it("winner() reports a decided game on a won board (precondition)", () => {
    // Top row is X's win; cells 5..8 are still empty.
    const board: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];

    expect(winner(board)).toBe("X");
  });

  it("returns the same board reference for an empty cell after a win", () => {
    const board: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];

    // Cell 5 is empty, but the game is already decided.
    const result = move(board, 5, "O");

    expect(result).toBe(board);
  });

  it("does not mutate the board when a move is attempted after a win", () => {
    const board: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];

    move(board, 6, "O");

    expect(board).toEqual(["X", "X", "X", "O", "O", null, null, null, null]);
  });

  it("does not throw when a move is attempted after the game is over", () => {
    const board: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];

    expect(() => move(board, 7, "O")).not.toThrow();
  });

  it("returns the same board reference on a drawn (full) board", () => {
    // X O X / X O O / O X X -> full board, no completed line.
    const board: Cell[] = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    expect(winner(board)).toBe("draw");

    // No empty cell to target on a draw; move() is still a no-op.
    const result = move(board, 0, "O");

    expect(result).toBe(board);
  });

  it("is a no-op for every empty cell once the game is decided", () => {
    const board: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];

    for (const index of [5, 6, 7, 8]) {
      expect(move(board, index, "O")).toBe(board);
    }
  });
});
