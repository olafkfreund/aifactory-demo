// AC#6: Play stops once the game is decided; further clicks do nothing.
// This unit test proves the rules-layer behaviour behind that AC: once
// winner(board) is non-null (a win OR a draw), move(board, index, player)
// must return the board unchanged — the same reference, no mutation, and
// no throw — even when the targeted cell is empty.
import { move, winner } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

describe("move is rejected once the game is over (AC#6)", () => {
  it("winner is non-null on a won board (guards the precondition)", () => {
    // Top row is X's win; cell 5 is still empty.
    const board: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];

    expect(winner(board)).toBe("X");
  });

  it("returns the same board reference after a win, even for an empty cell", () => {
    const board: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];

    const result = move(board, 5, "O");

    // Identical reference => no new board was produced, i.e. the click did nothing.
    expect(result).toBe(board);
  });

  it("leaves the board contents unchanged after a win", () => {
    const board: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];

    const result = move(board, 5, "O");

    expect(result).toEqual(["X", "X", "X", "O", "O", null, null, null, null]);
  });

  it("does not mutate the original board after a win", () => {
    const board: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];

    move(board, 6, "O");

    expect(board).toEqual(["X", "X", "X", "O", "O", null, null, null, null]);
  });

  it("returns the same board reference after a draw (full board, no winner)", () => {
    // X O X / X O O / O X X -> full board, no completed line.
    const board: Cell[] = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    expect(winner(board)).toBe("draw");

    const result = move(board, 0, "O");

    expect(result).toBe(board);
  });

  it("does not throw when a move is attempted after the game is over", () => {
    const board: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];

    expect(() => move(board, 5, "O")).not.toThrow();
  });

  it("rejects a move for every empty cell once the game is decided", () => {
    const board: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];

    // Cells 5, 6, 7, 8 are empty but the game is already won.
    for (const index of [5, 6, 7, 8]) {
      expect(move(board, index, "O")).toBe(board);
    }
  });
});
