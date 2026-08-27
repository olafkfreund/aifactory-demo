// AC#2: Clicking an empty cell places the current player's mark and passes the turn.
// This unit test proves the rules-layer behaviour behind that AC: move(board, index, player)
// returns a NEW board carrying the player's mark at `index` when that cell is empty, while
// leaving the original board object completely unmutated (immutability).
import { emptyBoard, move } from "app/games/tictactoe/game";

describe("move places the mark and is immutable", () => {
  it("places the current player's mark at the targeted empty cell", () => {
    const board = emptyBoard();

    const next = move(board, 4, "X");

    expect(next[4]).toBe("X");
  });

  it("places O's mark for the O player at the targeted empty cell", () => {
    const board = emptyBoard();

    const next = move(board, 0, "O");

    expect(next[0]).toBe("O");
  });

  it("returns a NEW board rather than the same reference", () => {
    const board = emptyBoard();

    const next = move(board, 2, "X");

    expect(next).not.toBe(board);
  });

  it("leaves the original board unmutated after a move", () => {
    const board = emptyBoard();

    move(board, 5, "X");

    expect(board).toEqual([null, null, null, null, null, null, null, null, null]);
  });

  it("only changes the targeted cell, leaving every other cell untouched", () => {
    const board = emptyBoard();

    const next = move(board, 8, "O");

    expect(next).toEqual([null, null, null, null, null, null, null, null, "O"]);
  });
});
