// AC#9: The test suite runs and passes from the repo root, and the command used
// is recorded in the run's evidence.
//
// Command used (run from the repo root): `npx jest tests/tictactoe/`
//
// This is the repo-root smoke test for the tic-tac-toe rules suite. It imports
// the DOM-free rules module (games/tictactoe/game.js) using a repo-root-relative
// require — the same style the sibling suite uses — and exercises every pure
// function (emptyBoard, move, winner, winningLine) end to end. If the module
// cannot be resolved and loaded from the repo root, every case below fails
// identically, surfacing that as a real build/wiring defect rather than a flake.
//
// The module is plain CommonJS/UMD; it exports its four functions via
// module.exports, so it is required against the repo-root-relative path.

/* eslint-disable @typescript-eslint/no-var-requires */
const game = require("../../games/tictactoe/game.js");

const { emptyBoard, move, winner, winningLine } = game;

// The 8 winning lines: 3 rows, 3 columns, 2 diagonals.
const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Build a board with `player` placed on the three cells of `line`.
function boardWithLine(line: number[], player: string): (string | null)[] {
  const board = emptyBoard();
  for (const idx of line) {
    board[idx] = player;
  }
  return board;
}

describe("rules suite smoke test — runs from repo root (AC#9)", () => {
  it("resolves and loads the rules module from the repo root", () => {
    expect(typeof emptyBoard).toBe("function");
    expect(typeof move).toBe("function");
    expect(typeof winner).toBe("function");
    expect(typeof winningLine).toBe("function");
  });

  it("emptyBoard returns a fresh board of 9 null cells", () => {
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

  it("move places a mark on a new board and leaves the original untouched (AC#2)", () => {
    const board = emptyBoard();
    const next = move(board, 4, "X");
    expect(next[4]).toBe("X");
    expect(next).not.toBe(board);
    expect(board[4]).toBeNull();
  });

  it("move rejects an occupied cell as a no-op (AC#3)", () => {
    const board = move(emptyBoard(), 0, "X");
    const attempt = move(board, 0, "O");
    expect(attempt).toBe(board);
    expect(attempt[0]).toBe("X");
  });

  it("move rejects a move once the game is over (AC#6)", () => {
    const board = boardWithLine([0, 1, 2], "X"); // X has already won
    const after = move(board, 5, "O"); // empty cell, but game is decided
    expect(after).toBe(board);
    expect(after[5]).toBeNull();
  });

  it.each(WIN_LINES)(
    "winner and winningLine detect the win on line [%i, %i, %i] (AC#4)",
    (a: number, b: number, c: number) => {
      const board = boardWithLine([a, b, c], "X");
      expect(winner(board)).toBe("X");
      expect(winningLine(board)).toEqual([a, b, c]);
    }
  );

  it("winner reports a draw on a full board with no line (AC#5)", () => {
    // X O X / X X O / O X O — 9 filled cells, no winning line.
    const board = ["X", "O", "X", "X", "X", "O", "O", "X", "O"];
    expect(winner(board)).toBe("draw");
    expect(winningLine(board)).toBeNull();
  });

  it("winner and winningLine return null while play continues (AC#8)", () => {
    expect(winner(emptyBoard())).toBeNull();
    expect(winningLine(emptyBoard())).toBeNull();
  });

  it("a full game is playable end to end and records the winning line", () => {
    let board = emptyBoard();
    const moves: [number, string][] = [
      [0, "X"],
      [3, "O"],
      [1, "X"],
      [4, "O"],
      [2, "X"],
    ];
    for (const [index, player] of moves) {
      board = move(board, index, player);
    }
    expect(winner(board)).toBe("X");
    expect(winningLine(board)).toEqual([0, 1, 2]);
  });
});
