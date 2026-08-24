// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// This suite proves getWinner()/move() detect a win on each of the 8 WIN_LINES
// (3 rows, 3 columns, 2 diagonals), setting winner, over=true, and exposing the
// matching winning line for the UI to highlight.
"use strict";

const { createGame, move, getWinner, WIN_LINES } = require("./game.js");

// Drive a sequence of cell indices into a fresh game, alternating X/O.
function play(indices) {
  let state = createGame();
  for (const index of indices) {
    state = move(state, index);
  }
  return state;
}

// The 8 winning lines, split by kind so the counts (3 rows, 3 cols, 2 diags)
// are asserted structurally rather than by eyeballing indices.
const ROWS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];
const COLUMNS = [
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];
const DIAGONALS = [
  [0, 4, 8],
  [2, 4, 6],
];
const ALL_LINES = [...ROWS, ...COLUMNS, ...DIAGONALS];

describe("AC#4: win detected on all 8 lines", () => {
  it("exposes exactly 8 winning lines — 3 rows, 3 columns, 2 diagonals", () => {
    expect(WIN_LINES).toHaveLength(8);
    expect(ROWS).toHaveLength(3);
    expect(COLUMNS).toHaveLength(3);
    expect(DIAGONALS).toHaveLength(2);
    expect(ALL_LINES).toHaveLength(8);
  });

  describe("getWinner() detects a win directly on the board", () => {
    it.each(ALL_LINES)(
      "reports winner X and the winning line for %p",
      (a, b, c) => {
        const board = [null, null, null, null, null, null, null, null, null];
        board[a] = "X";
        board[b] = "X";
        board[c] = "X";

        const result = getWinner(board);
        expect(result).not.toBeNull();
        expect(result.winner).toBe("X");
        expect(result.line).toEqual([a, b, c]);
      }
    );
  });

  describe("move() ends the game and marks the winning line", () => {
    it.each(ALL_LINES)(
      "sets winner, over=true, and the winning line for %p",
      (a, b, c) => {
        // Interleave X on the line with O on off-line cells:
        // X, O, X, O, X -> X completes the line on the 5th move.
        const offLine = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(
          (cell) => cell !== a && cell !== b && cell !== c
        );
        const state = play([a, offLine[0], b, offLine[1], c]);

        expect(state.over).toBe(true);
        expect(state.winner).toBe("X");
        expect(state.line).toEqual([a, b, c]);
        expect(state.draw).toBe(false);
      }
    );
  });

  it("returns null when no line is complete", () => {
    expect(getWinner([null, null, null, null, null, null, null, null, null])).toBeNull();
  });
});
