// AC#2: Clicking an empty cell places the current player's mark and passes the turn.
// This unit test proves the rules-layer behaviour behind that AC: move(board, index, player)
// returns a NEW board with the player's mark at `index` when the cell is empty, while leaving
// the original board object unmutated.
import { emptyBoard, move } from "app/games/tictactoe/game";

describe("move places a mark on an empty cell", () => {
  it("puts the player's mark at the target index when the cell is empty", () => {
    const board = emptyBoard();

    const next = move(board, 4, "X");

    expect(next[4]).toBe("X");
  });

  it("returns a new board and leaves the original board unmutated", () => {
    const board = emptyBoard();

    const next = move(board, 0, "O");

    expect(next).not.toBe(board);
    expect(board).toEqual([null, null, null, null, null, null, null, null, null]);
  });

  it("only changes the targeted cell, leaving every other cell untouched", () => {
    const board = emptyBoard();

    const next = move(board, 8, "X");

    expect(next).toEqual([null, null, null, null, null, null, null, null, "X"]);
  });
});
