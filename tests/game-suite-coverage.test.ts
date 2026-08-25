// AC#8/AC#9: The unit test file must cover every rule function in
// games/tictactoe/game.js — emptyBoard, move, winner, winningLine — including
// all 8 winning lines, the draw, the occupied-cell rejection, and the
// move-after-game-over rejection, and the suite must run and pass from the
// repo root (npx jest tests/game-suite-coverage.test.ts).
//
// The module under test is a plain CommonJS/UMD module (games/tictactoe/game.js);
// it exports its four pure functions via module.exports, so it is imported here
// with require against the repo-root-relative path.

/* eslint-disable @typescript-eslint/no-var-requires */
const game = require("../games/tictactoe/game.js");

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

describe("module.exports surface (AC#8: covers every function)", () => {
  it("exports emptyBoard, move, winner, and winningLine", () => {
    expect(typeof emptyBoard).toBe("function");
    expect(typeof move).toBe("function");
    expect(typeof winner).toBe("function");
    expect(typeof winningLine).toBe("function");
  });
});

describe("emptyBoard", () => {
  it("returns a fresh array of 9 null cells", () => {
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

  it("returns a new array each call so games do not share state", () => {
    const a = emptyBoard();
    const b = emptyBoard();
    expect(a).not.toBe(b);
  });
});

describe("move", () => {
  it("places the player's mark on an empty cell in a new board", () => {
    const board = emptyBoard();
    const next = move(board, 0, "X");
    expect(next[0]).toBe("X");
    expect(next).not.toBe(board);
    expect(board[0]).toBeNull();
  });

  it("does nothing when the target cell is already occupied (AC#3)", () => {
    const board = emptyBoard();
    board[4] = "X";
    const result = move(board, 4, "O");
    expect(result).toBe(board);
    expect(result[4]).toBe("X");
  });

  it("does nothing once the game is already decided by a win (AC#6)", () => {
    const board = boardWithLine([0, 1, 2], "X"); // X has already won
    const result = move(board, 5, "O");
    expect(result).toBe(board);
    expect(result[5]).toBeNull();
  });

  it("does nothing once the game is a decided draw (AC#6)", () => {
    // Full board, no line: X O X / X X O / O X O
    const board = ["X", "O", "X", "X", "X", "O", "O", "X", "O"];
    expect(winner(board)).toBe("draw");
    const result = move(board, 0, "O");
    expect(result).toBe(board);
  });
});

describe("winner", () => {
  it("returns null while the game is still in progress", () => {
    expect(winner(emptyBoard())).toBeNull();
  });

  it.each(WIN_LINES)(
    "detects X on winning line [%i, %i, %i] (AC#4)",
    (a: number, b: number, c: number) => {
      const board = boardWithLine([a, b, c], "X");
      expect(winner(board)).toBe("X");
    }
  );

  it.each(WIN_LINES)(
    "detects O on winning line [%i, %i, %i] (AC#4)",
    (a: number, b: number, c: number) => {
      const board = boardWithLine([a, b, c], "O");
      expect(winner(board)).toBe("O");
    }
  );

  it("returns \"draw\" for a full board with no completed line (AC#5)", () => {
    // X O X / X X O / O X O — 9 filled cells, no winning line.
    const board = ["X", "O", "X", "X", "X", "O", "O", "X", "O"];
    expect(winner(board)).toBe("draw");
  });
});

describe("winningLine", () => {
  it("returns null when no line is complete", () => {
    expect(winningLine(emptyBoard())).toBeNull();
  });

  it.each(WIN_LINES)(
    "returns the three winning indices for line [%i, %i, %i] (AC#4)",
    (a: number, b: number, c: number) => {
      const board = boardWithLine([a, b, c], "X");
      expect(winningLine(board)).toEqual([a, b, c]);
    }
  );
});
