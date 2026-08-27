// AC#8: The unit test suite covers every rule function including emptyBoard.
// This test verifies emptyBoard() returns a 9-length board with every cell null.

import { emptyBoard } from "../../games/tictactoe/game";

describe("emptyBoard()", () => {
  it("returns a board with exactly 9 cells", () => {
    expect(emptyBoard()).toHaveLength(9);
  });

  it("returns a board whose every cell is null", () => {
    const board = emptyBoard();
    expect(board.every((cell) => cell === null)).toBe(true);
  });

  it("returns a fully empty 9-cell board", () => {
    expect(emptyBoard()).toEqual([
      null,
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

  it("returns a fresh array on each call (no shared reference)", () => {
    expect(emptyBoard()).not.toBe(emptyBoard());
  });
});
