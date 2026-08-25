// AC#2: Clicking an empty cell places the current player's mark and passes the turn.
// This unit test proves the rules-layer precondition behind that AC: emptyBoard()
// returns a fresh array of 9 null cells, so a new game starts with a blank grid
// (and, by convention, X to move first).
import { emptyBoard } from "app/games/tictactoe/game";

describe("emptyBoard returns a fresh blank grid", () => {
  it("returns an array of exactly 9 cells", () => {
    const board = emptyBoard();

    expect(board).toHaveLength(9);
  });

  it("initialises every cell to null", () => {
    const board = emptyBoard();

    expect(board).toEqual([null, null, null, null, null, null, null, null, null]);
  });

  it("returns a new independent array on each call", () => {
    const first = emptyBoard();
    const second = emptyBoard();

    expect(second).not.toBe(first);
  });
});
