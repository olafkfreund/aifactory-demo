// AC#7: A "New game" control resets to an empty board with X to move.
// emptyBoard() is the reset primitive behind that AC: it must return a fresh
// 9-cell board with every cell null, and a distinct array on each call so a
// reset never aliases a prior game's board.
import { emptyBoard } from "app/games/tictactoe/game";

describe("emptyBoard returns a fresh 9-cell blank board", () => {
  it("returns an array of exactly 9 cells", () => {
    const board = emptyBoard();

    expect(board).toHaveLength(9);
  });

  it("initialises every one of the 9 cells to null", () => {
    const board = emptyBoard();

    expect(board).toEqual([null, null, null, null, null, null, null, null, null]);
  });

  it("has no non-null cell (nothing marked on a reset board)", () => {
    const board = emptyBoard();

    expect(board.every((cell) => cell === null)).toBe(true);
  });

  it("returns a fresh, independent array on each call", () => {
    const first = emptyBoard();
    const second = emptyBoard();

    expect(second).not.toBe(first);
    expect(second).toEqual(first);
  });
});
