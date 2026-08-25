// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals.
// This suite proves winner() returns the correct player for every one of the
// 8 winning lines, for BOTH players (X and O). The 8 lines break down as
// 3 rows + 3 columns + 2 diagonals.
//
// Run from repo root with: npx jest games/tictactoe/game.winner-lines.test.js
"use strict";

const { winner, emptyBoard } = require("./game.js");

// Build a board from a compact array, using '.' for empty cells.
function board(cells) {
  return cells.map((c) => (c === "." ? null : c));
}

// The 8 winning lines, grouped by kind so the counts (3 rows, 3 columns,
// 2 diagonals => 8 total) are self-documenting. Each entry names the line
// and gives its three cell indices.
const ROWS = [
  { name: "row 0 (top)", line: [0, 1, 2] },
  { name: "row 1 (middle)", line: [3, 4, 5] },
  { name: "row 2 (bottom)", line: [6, 7, 8] },
];
const COLUMNS = [
  { name: "col 0 (left)", line: [0, 3, 6] },
  { name: "col 1 (middle)", line: [1, 4, 7] },
  { name: "col 2 (right)", line: [2, 5, 8] },
];
const DIAGONALS = [
  { name: "diag \\ (top-left to bottom-right)", line: [0, 4, 8] },
  { name: "diag / (top-right to bottom-left)", line: [2, 4, 6] },
];

const ALL_LINES = [...ROWS, ...COLUMNS, ...DIAGONALS];

// Place `player` on the three indices of `line`, leaving all other cells empty.
function boardWithLine(line, player) {
  const b = emptyBoard();
  for (const idx of line) b[idx] = player;
  return b;
}

describe("winner detects all 8 winning lines", () => {
  test("there are exactly 8 winning lines: 3 rows, 3 columns, 2 diagonals", () => {
    expect(ROWS.length).toBe(3);
    expect(COLUMNS.length).toBe(3);
    expect(DIAGONALS.length).toBe(2);
    expect(ALL_LINES.length).toBe(8);
  });

  describe("X wins on each line", () => {
    for (const { name, line } of ALL_LINES) {
      test(`winner returns "X" for ${name}`, () => {
        expect(winner(boardWithLine(line, "X"))).toBe("X");
      });
    }
  });

  describe("O wins on each line", () => {
    for (const { name, line } of ALL_LINES) {
      test(`winner returns "O" for ${name}`, () => {
        expect(winner(boardWithLine(line, "O"))).toBe("O");
      });
    }
  });

  test('winner returns the correct player when a full line is present amid other marks', () => {
    // X completes the middle column; O has scattered non-winning marks.
    const b = board(["O", "X", "O", ".", "X", ".", ".", "X", "."]);
    expect(winner(b)).toBe("X");
  });
});
