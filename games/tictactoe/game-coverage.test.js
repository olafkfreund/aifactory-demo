// AC#8: game.test.js covers every function above (createEmptyBoard, createGame,
//   move, getWinner, isBoardFull), including all 8 winning lines, the draw, the
//   occupied-cell rejection, and the move-after-game-over rejection.
// AC#9: the suite runs and passes from the repo root.
//
// This is a single Jest suite that exercises every pure-logic function of the
// tic-tac-toe module in one file, so coverage of the rules layer is complete
// regardless of the UI. The module is authored as a UMD/CommonJS module with no
// build step, so we require it directly.
"use strict";

const {
  createEmptyBoard,
  createGame,
  move,
  getWinner,
  isBoardFull,
  WIN_LINES,
} = require("./game.js");

// Drive a fresh game through a sequence of cell indices, alternating players
// via the module's own turn logic. Returns the final state.
function play(indices) {
  let state = createGame();
  for (const index of indices) {
    state = move(state, index);
  }
  return state;
}

describe("createEmptyBoard", () => {
  it("returns a 9-cell board of nulls", () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(9);
    expect(board.every((cell) => cell === null)).toBe(true);
  });

  it("returns a fresh array each call (no shared state)", () => {
    const a = createEmptyBoard();
    const b = createEmptyBoard();
    a[0] = "X";
    expect(b[0]).toBeNull();
  });
});

describe("createGame", () => {
  it("starts empty, with X to move and nothing decided", () => {
    const state = createGame();
    expect(state.board).toEqual(Array(9).fill(null));
    expect(state.current).toBe("X");
    expect(state.over).toBe(false);
    expect(state.winner).toBeNull();
    expect(state.draw).toBe(false);
    expect(state.line).toBeNull();
  });
});

describe("getWinner", () => {
  it("returns null for an empty board", () => {
    expect(getWinner(createEmptyBoard())).toBeNull();
  });

  it("returns null when no line is complete", () => {
    const board = ["X", "O", "X", "X", "O", null, "O", null, null];
    expect(getWinner(board)).toBeNull();
  });

  it("reports the winner and the winning line", () => {
    const board = ["X", "X", "X", null, "O", "O", null, null, null];
    expect(getWinner(board)).toEqual({ winner: "X", line: [0, 1, 2] });
  });
});

describe("isBoardFull", () => {
  it("is false when at least one cell is empty", () => {
    const board = ["X", "O", "X", "O", "X", "O", "X", "O", null];
    expect(isBoardFull(board)).toBe(false);
  });

  it("is true when every cell is filled", () => {
    const board = ["X", "O", "X", "O", "X", "O", "X", "O", "X"];
    expect(isBoardFull(board)).toBe(true);
  });
});

describe("move — placing marks and passing the turn", () => {
  it("places the current player's mark and passes the turn", () => {
    const state = move(createGame(), 4);
    expect(state.board[4]).toBe("X");
    expect(state.current).toBe("O");
    expect(state.over).toBe(false);
  });

  it("rejects a move on an occupied cell without passing the turn", () => {
    const afterFirst = move(createGame(), 0); // X at 0, turn -> O
    const afterSecond = move(afterFirst, 0); // O tries the same cell
    expect(afterSecond.board).toEqual(afterFirst.board);
    expect(afterSecond.current).toBe(afterFirst.current);
    expect(afterSecond.over).toBe(false);
  });

  it("rejects an out-of-range index without error", () => {
    const state = createGame();
    expect(() => move(state, -1)).not.toThrow();
    expect(() => move(state, 9)).not.toThrow();
    const after = move(state, 9);
    expect(after.board).toEqual(state.board);
    expect(after.current).toBe(state.current);
  });
});

describe("move — win detection on all 8 winning lines", () => {
  // WIN_LINES holds the 8 lines: 3 rows, 3 columns, 2 diagonals.
  it("exposes exactly 8 winning lines", () => {
    expect(WIN_LINES).toHaveLength(8);
  });

  const offLinePool = Array.from({ length: 9 }, (_, i) => i);

  WIN_LINES.forEach((line, lineIndex) => {
    it(`detects an X win on line ${lineIndex} (${line.join(",")})`, () => {
      const offLine = offLinePool.filter((cell) => !line.includes(cell));
      // Interleave X and O: X completes its line on the 5th move.
      const moves = [line[0], offLine[0], line[1], offLine[1], line[2]];
      const state = play(moves);
      expect(state.over).toBe(true);
      expect(state.winner).toBe("X");
      expect(state.line).toEqual(line);
      expect(state.draw).toBe(false);
    });
  });
});

describe("move — draw detection", () => {
  it("reports a draw when the board fills with no winner", () => {
    // X O X
    // X O O
    // O X X
    const state = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
    expect(isBoardFull(state.board)).toBe(true);
    expect(state.draw).toBe(true);
    expect(state.winner).toBeNull();
    expect(state.over).toBe(true);
  });
});

describe("move — play stops once the game is decided", () => {
  it("ignores clicks after a win (move-after-game-over rejection)", () => {
    const won = play([0, 3, 1, 4, 2]); // X wins the top row
    expect(won.over).toBe(true);
    const after = move(won, 5); // empty cell, but the game is over
    expect(after.board).toEqual(won.board);
    expect(after.current).toBe(won.current);
    expect(after.winner).toBe(won.winner);
    expect(after.over).toBe(true);
  });

  it("ignores clicks after a draw", () => {
    const drawn = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
    expect(drawn.draw).toBe(true);
    const after = move(drawn, 0);
    expect(after.board).toEqual(drawn.board);
    expect(after.draw).toBe(true);
    expect(after.over).toBe(true);
  });
});
