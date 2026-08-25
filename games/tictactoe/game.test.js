// Run from repo root with: node --test games/tictactoe/game.test.js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  WIN_LINES,
  newGame,
  checkWinner,
  isBoardFull,
  isGameOver,
  move,
} = require("./game.js");

// Build a board from a compact array, using '.' for empty cells.
function board(cells) {
  return cells.map((c) => (c === "." ? null : c));
}

test("newGame starts with an empty board, X to move, nothing decided", () => {
  const state = newGame();
  assert.deepEqual(state.board, Array(9).fill(null));
  assert.equal(state.currentPlayer, "X");
  assert.equal(state.winner, null);
  assert.equal(state.winningLine, null);
  assert.equal(state.isDraw, false);
  assert.equal(isGameOver(state), false);
});

test("clicking an empty cell places the mark and passes the turn", () => {
  const state = newGame();
  const next = move(state, 4);
  assert.equal(next.board[4], "X");
  assert.equal(next.currentPlayer, "O");
  // original state is untouched (immutability)
  assert.equal(state.board[4], null);
});

test("clicking an occupied cell does nothing: no turn pass, no error", () => {
  const state = move(newGame(), 0); // X at 0, O to move
  const attempt = move(state, 0);
  assert.equal(attempt, state); // exact no-op, same reference
  assert.equal(attempt.board[0], "X");
  assert.equal(attempt.currentPlayer, "O");
});

test("out-of-range index is rejected without error", () => {
  const state = newGame();
  assert.equal(move(state, -1), state);
  assert.equal(move(state, 9), state);
  assert.equal(move(state, 1.5), state);
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
    assert.equal(result.winner, "X");
    assert.deepEqual(result.line, line);
  });
}

test("all 8 winning lines are represented in WIN_LINES", () => {
  assert.equal(WIN_LINES.length, 8);
  for (const { line } of winningBoards) {
    assert.ok(WIN_LINES.some((l) => l.join(",") === line.join(",")));
  }
});

test("a win is reachable through play and the winning line is recorded", () => {
  let state = newGame();
  // X: 0,1,2 (top row) ; O: 3,4
  const moves = [0, 3, 1, 4, 2];
  for (const m of moves) state = move(state, m);
  assert.equal(state.winner, "X");
  assert.deepEqual(state.winningLine, [0, 1, 2]);
  assert.equal(isGameOver(state), true);
});

test("a full board with no winner reports a draw", () => {
  // X O X / X O O / O X X  -> full board, no line for either player
  const cells = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
  const full = board(cells);
  assert.equal(isBoardFull(full), true);
  assert.equal(checkWinner(full).winner, null);

  // Reach it through play: X and O alternate filling exactly this board.
  let state = newGame();
  const order = [0, 1, 2, 4, 3, 5, 7, 6, 8]; // X: 0,2,3,7,8 O: 1,4,5,6 -> matches cells above
  for (const m of order) state = move(state, m);
  assert.deepEqual(state.board, full);
  assert.equal(state.winner, null);
  assert.equal(state.isDraw, true);
  assert.equal(isGameOver(state), true);
});

test("play stops once decided: further clicks do nothing after a win", () => {
  let state = newGame();
  for (const m of [0, 3, 1, 4, 2]) state = move(state, m); // X wins on top row
  assert.equal(state.winner, "X");
  const after = move(state, 5); // empty cell, but game is over
  assert.equal(after, state);
  assert.equal(after.board[5], null);
});

test("play stops once decided: further clicks do nothing after a draw", () => {
  let state = newGame();
  for (const m of [0, 1, 2, 4, 3, 5, 7, 6, 8]) state = move(state, m);
  assert.equal(state.isDraw, true);
  const after = move(state, 0); // occupied anyway, but also game-over
  assert.equal(after, state);
});

test("New game resets to an empty board with X to move", () => {
  let state = newGame();
  for (const m of [0, 3, 1, 4, 2]) state = move(state, m);
  assert.ok(isGameOver(state));

  const reset = newGame();
  assert.deepEqual(reset.board, Array(9).fill(null));
  assert.equal(reset.currentPlayer, "X");
  assert.equal(isGameOver(reset), false);
});
