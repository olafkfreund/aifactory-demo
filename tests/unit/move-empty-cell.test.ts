// AC#2: Clicking an empty cell places the current player's mark and passes the turn.
// Verifies move(board, index, player) returns a NEW board with the mark placed at
// `index`, leaving the original board unchanged (pure/immutable behaviour).
import { move, emptyBoard } from "../../games/tictactoe/game";

describe("move places mark on empty cell", () => {
  it("places the player's mark at the given index", () => {
    const board = emptyBoard();
    const next = move(board, 4, "X");
    expect(next[4]).toBe("X");
  });

  it("returns a new board, leaving the original unchanged", () => {
    const board = emptyBoard();
    const next = move(board, 0, "X");
    expect(next).not.toBe(board);
    expect(board[0]).toBeNull();
  });

  it("only mutates the targeted cell, leaving the rest empty", () => {
    const board = emptyBoard();
    const next = move(board, 8, "O");
    expect(next[8]).toBe("O");
    const others = next.filter((_: unknown, i: number) => i !== 8);
    expect(others.every((cell: unknown) => cell === null)).toBe(true);
  });

  it("is a no-op returning the same board when the cell is occupied", () => {
    const board = emptyBoard();
    const afterFirst = move(board, 3, "X");
    const afterSecond = move(afterFirst, 3, "O");
    expect(afterSecond).toBe(afterFirst);
    expect(afterSecond[3]).toBe("X");
  });
});
