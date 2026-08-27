// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// This unit verifies the pure rule behind that UI behaviour:
//   move(board, index, player) is a no-op when the target cell is already
//   occupied — it returns the ORIGINAL board reference unchanged, does not
//   mutate it, and does not throw.
//
// The module under test (games/tictactoe/game.js) is a UMD/CommonJS file with
// no type declarations, so it is loaded via require. The spec's `app` import
// root does not apply to this in-repo relative JS module.
declare function require(id: string): any;

const {
  move,
  emptyBoard,
}: {
  move: (board: (string | null)[], index: number, player: string) => (string | null)[];
  emptyBoard: () => (string | null)[];
} = require("../../games/tictactoe/game");

describe("move(board, index, player) — rejects an occupied cell (AC#3)", () => {
  it("returns the SAME board reference when the target cell is occupied", () => {
    const board = emptyBoard();
    board[4] = "X";
    const result = move(board, 4, "O");
    expect(result).toBe(board);
  });

  it("does not change the occupied cell's existing mark", () => {
    const board = emptyBoard();
    board[0] = "X";
    const result = move(board, 0, "O");
    expect(result[0]).toBe("X");
  });

  it("does not mutate the board when the cell is occupied", () => {
    const board = emptyBoard();
    board[8] = "O";
    const before = board.slice();
    move(board, 8, "X");
    expect(board).toEqual(before);
  });

  it("does not throw when clicking an occupied cell", () => {
    const board = emptyBoard();
    board[2] = "X";
    expect(() => move(board, 2, "O")).not.toThrow();
  });
});
