// AC#2: Clicking an empty cell places the current player's mark and passes the turn.
// This unit test proves the rules-layer behaviour behind that AC: move(board, index, player)
// places the current player's mark at an empty index and returns a NEW, immutable board —
// the original board object is never mutated.
import { emptyBoard, move } from "app/games/tictactoe/game";

describe("move places the mark and returns a new immutable board", () => {
  it("places the current player's mark at the empty target index", () => {
    const board = emptyBoard();

    const next = move(board, 4, "X");

    expect(next[4]).toBe("X");
  });

  it("places the mark for whichever player takes the turn", () => {
    const board = emptyBoard();

    const next = move(board, 0, "O");

    expect(next[0]).toBe("O");
  });

  it("returns a new board reference rather than the original", () => {
    const board = emptyBoard();

    const next = move(board, 2, "X");

    expect(next).not.toBe(board);
  });

  it("leaves the original board unmutated (immutability)", () => {
    const board = emptyBoard();

    move(board, 5, "X");

    expect(board).toEqual([null, null, null, null, null, null, null, null, null]);
  });

  it("changes only the targeted cell and leaves the rest empty", () => {
    const board = emptyBoard();

    const next = move(board, 8, "X");

    expect(next).toEqual([null, null, null, null, null, null, null, null, "X"]);
  });

  it("passes the turn: alternating players fill their own distinct cells", () => {
    let board = emptyBoard();

    board = move(board, 0, "X");
    board = move(board, 1, "O");

    expect(board[0]).toBe("X");
    expect(board[1]).toBe("O");
  });
});
