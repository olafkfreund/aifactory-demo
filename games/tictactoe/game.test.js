// Run from repo root with: npx jest games/tictactoe/game.test.js
"use strict";

const {
  WIN_LINES,
  newGame,
  checkWinner,
  isBoardFull,
  isGameOver,
  move,
  nextFocusIndex,
} = require("./game.js");

// Build a board from a compact array, using '.' for empty cells.
function board(cells) {
  return cells.map((c) => (c === "." ? null : c));
}

test("newGame starts with an empty board, X to move, nothing decided", () => {
  const state = newGame();
  expect(state.board).toEqual(Array(9).fill(null));
  expect(state.currentPlayer).toBe("X");
  expect(state.winner).toBe(null);
  expect(state.winningLine).toBe(null);
  expect(state.isDraw).toBe(false);
  expect(isGameOver(state)).toBe(false);
});

test("clicking an empty cell places the mark and passes the turn", () => {
  const state = newGame();
  const next = move(state, 4);
  expect(next.board[4]).toBe("X");
  expect(next.currentPlayer).toBe("O");
  // original state is untouched (immutability)
  expect(state.board[4]).toBe(null);
});

test("clicking an occupied cell does nothing: no turn pass, no error", () => {
  const state = move(newGame(), 0); // X at 0, O to move
  const attempt = move(state, 0);
  expect(attempt).toBe(state); // exact no-op, same reference
  expect(attempt.board[0]).toBe("X");
  expect(attempt.currentPlayer).toBe("O");
});

test("out-of-range index is rejected without error", () => {
  const state = newGame();
  expect(move(state, -1)).toBe(state);
  expect(move(state, 9)).toBe(state);
  expect(move(state, 1.5)).toBe(state);
});

// All 8 winning lines, verified via checkWinner directly.
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

for (const { name, cells, line } of winningBoards) {
  test(`checkWinner detects winning line: ${name}`, () => {
    const result = checkWinner(board(cells));
    expect(result.winner).toBe("X");
    expect(result.line).toEqual(line);
  });
}

test("all 8 winning lines are represented in WIN_LINES", () => {
  expect(WIN_LINES.length).toBe(8);
  for (const { line } of winningBoards) {
    expect(WIN_LINES.some((l) => l.join(",") === line.join(","))).toBe(true);
  }
});

test("a win is reachable through play and the winning line is recorded", () => {
  let state = newGame();
  // X: 0,1,2 (top row) ; O: 3,4
  const moves = [0, 3, 1, 4, 2];
  for (const m of moves) state = move(state, m);
  expect(state.winner).toBe("X");
  expect(state.winningLine).toEqual([0, 1, 2]);
  expect(isGameOver(state)).toBe(true);
});

test("a full board with no winner reports a draw", () => {
  // X O X / X O O / O X X  -> full board, no line for either player
  const cells = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
  const full = board(cells);
  expect(isBoardFull(full)).toBe(true);
  expect(checkWinner(full).winner).toBe(null);

  // Reach it through play: X and O alternate filling exactly this board.
  let state = newGame();
  const order = [0, 1, 2, 4, 3, 5, 7, 6, 8]; // X: 0,2,3,7,8 O: 1,4,5,6 -> matches cells above
  for (const m of order) state = move(state, m);
  expect(state.board).toEqual(full);
  expect(state.winner).toBe(null);
  expect(state.isDraw).toBe(true);
  expect(isGameOver(state)).toBe(true);
});

test("play stops once decided: further clicks do nothing after a win", () => {
  let state = newGame();
  for (const m of [0, 3, 1, 4, 2]) state = move(state, m); // X wins on top row
  expect(state.winner).toBe("X");
  const after = move(state, 5); // empty cell, but game is over
  expect(after).toBe(state);
  expect(after.board[5]).toBe(null);
});

test("play stops once decided: further clicks do nothing after a draw", () => {
  let state = newGame();
  for (const m of [0, 1, 2, 4, 3, 5, 7, 6, 8]) state = move(state, m);
  expect(state.isDraw).toBe(true);
  const after = move(state, 0); // occupied anyway, but also game-over
  expect(after).toBe(state);
});

test("New game resets to an empty board with X to move", () => {
  let state = newGame();
  for (const m of [0, 3, 1, 4, 2]) state = move(state, m);
  expect(isGameOver(state)).toBe(true);

  const reset = newGame();
  expect(reset.board).toEqual(Array(9).fill(null));
  expect(reset.currentPlayer).toBe("X");
  expect(isGameOver(reset)).toBe(false);
});

// nextFocusIndex: keyboard navigation for the 3x3 grid.
describe("nextFocusIndex", () => {
  test("moves right/left within a row and up/down within a column", () => {
    expect(nextFocusIndex(4, "ArrowRight")).toBe(5);
    expect(nextFocusIndex(4, "ArrowLeft")).toBe(3);
    expect(nextFocusIndex(4, "ArrowUp")).toBe(1);
    expect(nextFocusIndex(4, "ArrowDown")).toBe(7);
  });

  test("wraps at the edges", () => {
    expect(nextFocusIndex(2, "ArrowRight")).toBe(0);
    expect(nextFocusIndex(0, "ArrowLeft")).toBe(2);
    expect(nextFocusIndex(0, "ArrowUp")).toBe(6);
    expect(nextFocusIndex(6, "ArrowDown")).toBe(0);
  });

  test("Home returns 0 and End returns 8 from any cell", () => {
    for (let i = 0; i < 9; i++) {
      expect(nextFocusIndex(i, "Home")).toBe(0);
      expect(nextFocusIndex(i, "End")).toBe(8);
    }
  });

  test("returns the current index unchanged for any other key", () => {
    expect(nextFocusIndex(4, "Enter")).toBe(4);
    expect(nextFocusIndex(0, " ")).toBe(0);
    expect(nextFocusIndex(7, "a")).toBe(7);
    expect(nextFocusIndex(3, "Tab")).toBe(3);
  });
});
