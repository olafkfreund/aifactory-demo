// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// This unit test proves the rules-layer behaviour behind that AC: once the
// game is decided — whether by a win OR a draw — move(board, index, player)
// is a no-op that returns the SAME board reference unchanged, even when the
// targeted cell is still empty. No new board, no mutation, no throw.
import { move, winner } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

// X wins the top row; cells 5..8 remain empty (valid move targets).
const wonBoard = (): Cell[] => ["X", "X", "X", "O", "O", null, null, null, null];

// Full board, no completed line -> a draw.
const drawnBoard = (): Cell[] => ["X", "O", "X", "X", "O", "O", "O", "X", "X"];

describe("move() rejects moves after the game is over (AC#6)", () => {
  it("treats a won board as decided (precondition)", () => {
    expect(winner(wonBoard())).toBe("X");
  });

  it("returns the same board reference for an empty cell after a win", () => {
    const board = wonBoard();

    // Cell 5 is empty, but play has already stopped.
    const result = move(board, 5, "O");

    expect(result).toBe(board);
  });

  it("does not mutate the board when a move is attempted after a win", () => {
    const board = wonBoard();

    move(board, 6, "O");

    expect(board).toEqual(["X", "X", "X", "O", "O", null, null, null, null]);
  });

  it("does not throw when clicking after the game is decided", () => {
    const board = wonBoard();

    expect(() => move(board, 7, "O")).not.toThrow();
  });

  it("treats a full no-winner board as a draw (precondition)", () => {
    expect(winner(drawnBoard())).toBe("draw");
  });

  it("returns the same board reference on a drawn board", () => {
    const board = drawnBoard();

    const result = move(board, 0, "O");

    expect(result).toBe(board);
  });

  it("is a no-op for every remaining empty cell once the game is won", () => {
    const board = wonBoard();

    for (const index of [5, 6, 7, 8]) {
      expect(move(board, index, "O")).toBe(board);
    }
  });
});
