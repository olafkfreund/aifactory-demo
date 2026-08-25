// AC#4: the winning line is visibly marked — winningLine() identifies the 3
// indices of the completed line. This suite proves winningLine() returns the
// exact triple of indices for each of the 8 winning lines (3 rows, 3 columns,
// 2 diagonals) and returns null when there is no completed line.
//
// Run from repo root with: npx jest games/tictactoe/game.winningline.test.js
"use strict";

const { emptyBoard, move, winningLine } = require("./game.js");

// Build a board from a compact array, using '.' for empty cells.
function board(cells) {
  return cells.map((c) => (c === "." ? null : c));
}

// The 8 winning lines and a board on which exactly that line is completed.
const winningBoards = [
  { name: "row 0", cells: ["X", "X", "X", "O", "O", ".", ".", ".", "."], line: [0, 1, 2] },
  { name: "row 1", cells: ["O", "O", ".", "X", "X", "X", ".", ".", "."], line: [3, 4, 5] },
  { name: "row 2", cells: [".", ".", ".", "O", "O", ".", "X", "X", "X"], line: [6, 7, 8] },
  { name: "col 0", cells: ["X", "O", ".", "X", "O", ".", "X", ".", "."], line: [0, 3, 6] },
  { name: "col 1", cells: ["O", "X", ".", "O", "X", ".", ".", "X", "."], line: [1, 4, 7] },
  { name: "col 2", cells: [".", "O", "X", ".", "O", "X", ".", ".", "X"], line: [2, 5, 8] },
  { name: "diag \\", cells: ["X", "O", ".", "O", "X", ".", ".", ".", "X"], line: [0, 4, 8] },
  { name: "diag /", cells: [".", ".", "X", ".", "X", "O", "X", "O", "."], line: [2, 4, 6] },
];

describe("winningLine returns the three indices of the completed line", () => {
  for (const { name, cells, line } of winningBoards) {
    test(`returns ${JSON.stringify(line)} for ${name}`, () => {
      expect(winningLine(board(cells))).toEqual(line);
    });
  }

  test("covers all 8 winning lines", () => {
    expect(winningBoards).toHaveLength(8);
  });
});

describe("winningLine returns null when there is no completed line", () => {
  test("returns null for a fresh empty board", () => {
    expect(winningLine(emptyBoard())).toBe(null);
  });

  test("returns null while play continues (single mark placed)", () => {
    const b = move(emptyBoard(), 0, "X");
    expect(winningLine(b)).toBe(null);
  });

  test("returns null for a full board with no completed line (draw)", () => {
    // X O X / X O O / O X X -> full board, no winning triple for either player.
    const full = board(["X", "O", "X", "X", "O", "O", "O", "X", "X"]);
    expect(winningLine(full)).toBe(null);
  });
});

describe("winningLine reports the line reached through actual play", () => {
  test("returns [0, 1, 2] when X completes the top row via move()", () => {
    let b = emptyBoard();
    for (const [i, p] of [[0, "X"], [3, "O"], [1, "X"], [4, "O"], [2, "X"]]) {
      b = move(b, i, p);
    }
    expect(winningLine(b)).toEqual([0, 1, 2]);
  });
});
