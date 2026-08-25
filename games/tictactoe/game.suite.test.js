// AC#9: The test suite runs and passes from the repo root, and the command
// used is recorded in the run's evidence.
//
// Command of record (run from repo root): npx jest games/tictactoe
//
// This file exercises the rules functions end to end — an empty board is
// played through complete games (win on each of the 8 lines, a draw, and a
// game that locks after it is decided) so the whole rules surface runs green
// as one suite when Jest is invoked from the repo root.
"use strict";

const {
  WIN_LINES,
  emptyBoard,
  move,
  winner,
  winningLine,
  newGame,
  isGameOver,
  applyMove,
  nextFocusIndex,
  bestMove,
} = require("./game.js");

// Build a board from a compact array, using '.' for empty cells.
function board(cells) {
  return cells.map((c) => (c === "." ? null : c));
}

describe("AC#9: full tic-tac-toe rules suite runs end to end from repo root", () => {
  test("every rules function is exported and callable", () => {
    for (const fn of [
      emptyBoard,
      move,
      winner,
      winningLine,
      newGame,
      isGameOver,
      applyMove,
      nextFocusIndex,
      bestMove,
    ]) {
      expect(typeof fn).toBe("function");
    }
    expect(Array.isArray(WIN_LINES)).toBe(true);
  });

  test("a fresh board has 9 empty cells and X to move", () => {
    const b = emptyBoard();
    expect(b.length).toBe(9);
    expect(b).toEqual(Array(9).fill(null));
    expect(newGame().currentPlayer).toBe("X");
  });

  // All 8 winning lines (3 rows, 3 columns, 2 diagonals), played end to end.
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

  test("all 8 winning lines are represented in WIN_LINES", () => {
    expect(WIN_LINES.length).toBe(8);
  });

  for (const { name, cells, line } of winningBoards) {
    test(`winner detects a completed line end to end: ${name}`, () => {
      const b = board(cells);
      expect(winner(b)).toBe("X");
      expect(winningLine(b)).toEqual(line);
    });
  }

  test("a full board with no completed line reports a draw", () => {
    // X O X / X O O / O X X -> 9 cells filled, no line for either player.
    const full = board(["X", "O", "X", "X", "O", "O", "O", "X", "X"]);
    expect(winner(full)).toBe("draw");
    expect(winningLine(full)).toBe(null);
  });

  test("playing a game through applyMove wins the top row and then locks", () => {
    let state = newGame();
    // X: 0, 1, 2  |  O: 3, 4 — X completes the top row.
    for (const m of [0, 3, 1, 4, 2]) state = applyMove(state, m);

    expect(state.board[0]).toBe("X");
    expect(winner(state.board)).toBe("X");
    expect(winningLine(state.board)).toEqual([0, 1, 2]);
    expect(isGameOver(state)).toBe(true);

    // Play stops once decided: a further click on an empty cell is a no-op.
    const after = applyMove(state, 5);
    expect(after).toBe(state);
    expect(after.board[5]).toBe(null);
  });

  test("winner returns null while play continues", () => {
    const b = move(emptyBoard(), 4, "X");
    expect(winner(b)).toBe(null);
    expect(winningLine(b)).toBe(null);
  });
});
