// AC#2: Clicking an empty cell places the current player's mark and passes the turn.
//
// This unit verifies the pure rule behind that behaviour:
//   move(board, index, player) places `player`'s mark at an empty `index` and
//   returns a NEW board, leaving the original board untouched (immutability).
//
// The module under test is a UMD/CommonJS file (games/tictactoe/game.js) with
// no type declarations, so it is loaded via require. `app` import root is not
// applicable to this in-repo relative JS module.
declare function require(id: string): any;

const {
  move,
  emptyBoard,
}: {
  move: (board: (string | null)[], index: number, player: string) => (string | null)[];
  emptyBoard: () => (string | null)[];
} = require("../../games/tictactoe/game");

describe("move(board, index, player) — places mark on a new board (AC#2)", () => {
  it("places the player's mark at the chosen empty index", () => {
    const board = emptyBoard();
    const next = move(board, 4, "X");
    expect(next[4]).toBe("X");
  });

  it("places an O mark at a different empty index", () => {
    const board = emptyBoard();
    const next = move(board, 0, "O");
    expect(next[0]).toBe("O");
  });

  it("returns a NEW board object, not the original reference", () => {
    const board = emptyBoard();
    const next = move(board, 4, "X");
    expect(next).not.toBe(board);
  });

  it("leaves the original board untouched after a move", () => {
    const board = emptyBoard();
    move(board, 4, "X");
    expect(board[4]).toBeNull();
    expect(board).toEqual(emptyBoard());
  });

  it("only mutates the target cell, leaving all other cells empty", () => {
    const board = emptyBoard();
    const next = move(board, 8, "X");
    expect(next[8]).toBe("X");
    const others = next.filter((_cell, i) => i !== 8);
    expect(others.every((cell) => cell === null)).toBe(true);
  });
});
