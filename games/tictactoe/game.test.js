// Run from repo root with: node --test games/tictactoe/game.test.js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { emptyBoard, move, winner, winningLine } = require("./game.js");

// Build a board from a compact array, using '.' for empty cells.
function board(cells) {
  return cells.map((c) => (c === "." ? null : c));
}

test("emptyBoard returns a fresh 9-cell board", () => {
  const b = emptyBoard();
  assert.equal(b.length, 9);
  assert.ok(b.every((cell) => cell === null));
});

test("move places the mark and returns a NEW board (immutability)", () => {
  const b = emptyBoard();
  const next = move(b, 4, "X");
  assert.equal(next[4], "X");
  assert.notEqual(next, b);
  assert.equal(b[4], null); // original untouched
});

test("move rejects an occupied cell: no-op, same board returned", () => {
  const b = move(emptyBoard(), 0, "X");
  const attempt = move(b, 0, "O");
  assert.equal(attempt, b); // exact no-op, same reference
  assert.equal(attempt[0], "X");
});

test("move rejects a move after the game is over", () => {
  let b = emptyBoard();
  for (const [i, p] of [[0, "X"], [3, "O"], [1, "X"], [4, "O"], [2, "X"]]) {
    b = move(b, i, p);
  }
  assert.equal(winner(b), "X");
  const after = move(b, 5, "O"); // empty cell, but game is over
  assert.equal(after, b);
});

test("move rejects an out-of-range index", () => {
  const b = emptyBoard();
  assert.equal(move(b, -1, "X"), b);
  assert.equal(move(b, 9, "X"), b);
  assert.equal(move(b, 1.5, "X"), b);
});

// All 8 winning lines, verified via winner() and winningLine() together.
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
  test(`winner/winningLine detect winning line: ${name}`, () => {
    const b = board(cells);
    assert.equal(winner(b), "X");
    assert.deepEqual(winningLine(b), line);
  });
}

test("a win is reachable through play and the winning line is recorded", () => {
  let b = emptyBoard();
  // X: 0,1,2 (top row) ; O: 3,4
  const moves = [[0, "X"], [3, "O"], [1, "X"], [4, "O"], [2, "X"]];
  for (const [i, p] of moves) b = move(b, i, p);
  assert.equal(winner(b), "X");
  assert.deepEqual(winningLine(b), [0, 1, 2]);
});

test("a full board with no winner reports a draw", () => {
  // X O X / X O O / O X X  -> full board, no line for either player
  const cells = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
  const full = board(cells);
  assert.equal(winner(full), "draw");
  assert.equal(winningLine(full), null);

  // Reach it through play: X and O alternate filling exactly this board.
  let b = emptyBoard();
  const order = [
    [0, "X"], [1, "O"], [2, "X"], [4, "O"], [3, "X"],
    [5, "O"], [7, "X"], [6, "O"], [8, "X"],
  ];
  for (const [i, p] of order) b = move(b, i, p);
  assert.deepEqual(b, full);
  assert.equal(winner(b), "draw");
});

test("winner returns null while play continues", () => {
  assert.equal(winner(emptyBoard()), null);
  assert.equal(winner(move(emptyBoard(), 0, "X")), null);
});

test("winningLine returns null when there is no winning line", () => {
  assert.equal(winningLine(emptyBoard()), null);
  assert.equal(winningLine(board(["X", "O", ".", ".", ".", ".", ".", ".", "."])), null);
});
