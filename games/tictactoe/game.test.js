// Run from repo root with: node --test games/tictactoe/game.test.js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  WIN_LINES,
  emptyBoard,
  move,
  winner,
  winningLine,
  nextFocusIndex,
  bestMove,
} = require("./game.js");

// Build a board from a compact array, using '.' for empty cells.
function board(cells) {
  return cells.map((c) => (c === "." ? null : c));
}

test("emptyBoard returns a fresh 9-cell board", () => {
  assert.deepEqual(emptyBoard(), Array(9).fill(null));
  // Each call returns its own array, not a shared reference.
  assert.notEqual(emptyBoard(), emptyBoard());
});

test("clicking an empty cell places the mark and returns a NEW board", () => {
  const b = emptyBoard();
  const next = move(b, 4, "X");
  assert.equal(next[4], "X");
  assert.equal(b[4], null); // original board is untouched (immutability)
});

test("clicking an occupied cell does nothing: no-op, same reference", () => {
  const b = move(emptyBoard(), 0, "X");
  const attempt = move(b, 0, "O");
  assert.equal(attempt, b);
  assert.equal(attempt[0], "X");
});

test("out-of-range index is rejected without error", () => {
  const b = emptyBoard();
  assert.equal(move(b, -1, "X"), b);
  assert.equal(move(b, 9, "X"), b);
  assert.equal(move(b, 1.5, "X"), b);
});

// All 8 winning lines.
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

test("all 8 winning lines are represented in WIN_LINES", () => {
  assert.equal(WIN_LINES.length, 8);
  for (const { line } of winningBoards) {
    assert.ok(WIN_LINES.some((l) => l.join(",") === line.join(",")));
  }
});

test("winner/winningLine return null while play continues", () => {
  assert.equal(winner(emptyBoard()), null);
  assert.equal(winningLine(emptyBoard()), null);
});

test("a win is reachable through play and the winning line is reported", () => {
  let b = emptyBoard();
  // X: 0,1,2 (top row) ; O: 3,4
  const moves = [
    [0, "X"], [3, "O"], [1, "X"], [4, "O"], [2, "X"],
  ];
  for (const [i, p] of moves) b = move(b, i, p);
  assert.equal(winner(b), "X");
  assert.deepEqual(winningLine(b), [0, 1, 2]);
});

test("a full board with no winner reports a draw", () => {
  // X O X / X O O / O X X -> full board, no line for either player
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

test("play stops once decided: a move after a win is rejected", () => {
  let b = emptyBoard();
  for (const [i, p] of [[0, "X"], [3, "O"], [1, "X"], [4, "O"], [2, "X"]]) b = move(b, i, p);
  assert.equal(winner(b), "X");
  const after = move(b, 5, "O"); // empty cell, but game is over
  assert.equal(after, b);
  assert.equal(after[5], null);
});

test("play stops once decided: a move after a draw is rejected", () => {
  let b = emptyBoard();
  for (const [i, p] of [
    [0, "X"], [1, "O"], [2, "X"], [4, "O"], [3, "X"],
    [5, "O"], [7, "X"], [6, "O"], [8, "X"],
  ]) {
    b = move(b, i, p);
  }
  assert.equal(winner(b), "draw");
  const after = move(b, 0, "X"); // occupied anyway, but also game-over
  assert.equal(after, b);
});

test("New game resets to an empty board with X to move (no persisted state)", () => {
  let b = emptyBoard();
  for (const [i, p] of [[0, "X"], [3, "O"], [1, "X"], [4, "O"], [2, "X"]]) b = move(b, i, p);
  assert.equal(winner(b), "X");

  const reset = emptyBoard();
  assert.deepEqual(reset, Array(9).fill(null));
  assert.equal(winner(reset), null);
});

// nextFocusIndex: keyboard navigation for the 3x3 grid.
test("nextFocusIndex moves right/left within a row and up/down within a column", () => {
  assert.equal(nextFocusIndex(4, "ArrowRight"), 5);
  assert.equal(nextFocusIndex(4, "ArrowLeft"), 3);
  assert.equal(nextFocusIndex(4, "ArrowUp"), 1);
  assert.equal(nextFocusIndex(4, "ArrowDown"), 7);
});

test("nextFocusIndex wraps at the edges", () => {
  assert.equal(nextFocusIndex(2, "ArrowRight"), 0);
  assert.equal(nextFocusIndex(0, "ArrowLeft"), 2);
  assert.equal(nextFocusIndex(0, "ArrowUp"), 6);
  assert.equal(nextFocusIndex(6, "ArrowDown"), 0);
});

test("nextFocusIndex: Home returns 0 and End returns 8 from any cell", () => {
  for (let i = 0; i < 9; i++) {
    assert.equal(nextFocusIndex(i, "Home"), 0);
    assert.equal(nextFocusIndex(i, "End"), 8);
  }
});

test("nextFocusIndex returns the current index unchanged for any other key", () => {
  assert.equal(nextFocusIndex(4, "Enter"), 4);
  assert.equal(nextFocusIndex(0, " "), 0);
  assert.equal(nextFocusIndex(7, "a"), 7);
  assert.equal(nextFocusIndex(3, "Tab"), 3);
});

// bestMove: the minimax AI (out of scope for this issue's acceptance
// criteria, but already present in the codebase and exercised by the UI —
// kept covered here since it now lives on the required board-based API).
test("bestMove returns null once the game is decided", () => {
  let b = emptyBoard();
  for (const [i, p] of [[0, "X"], [3, "O"], [1, "X"], [4, "O"], [2, "X"]]) b = move(b, i, p);
  assert.equal(bestMove(b, "O"), null);
});

test("bestMove takes the centre on an empty board", () => {
  assert.equal(bestMove(emptyBoard(), "X"), 4);
});

test("bestMove takes the winning move when one is available in one ply", () => {
  // X: 0, 1 already placed; O: 3, 4. X to move and can win at 2.
  const b = board(["X", "X", ".", "O", "O", ".", ".", ".", "."]);
  assert.equal(bestMove(b, "X"), 2);
});

test("bestMove blocks the opponent's immediate winning threat when it cannot win itself", () => {
  // O: 0, 1 already placed, threatening to win at 2. X: 3, 6 (no threat of its own).
  const b = board(["O", "O", ".", "X", ".", ".", "X", ".", "."]);
  assert.equal(bestMove(b, "X"), 2);
});

// Exhaustive proof it never loses: play the AI against EVERY possible
// sequence of opponent moves. Run once with the AI moving first (as X) and
// once with the AI moving second (as O).
function assertAiNeverLoses(b, currentPlayer, aiSymbol) {
  const result = winner(b);
  if (result) {
    const opponentSymbol = aiSymbol === "X" ? "O" : "X";
    assert.notEqual(result, opponentSymbol);
    return;
  }
  if (currentPlayer === aiSymbol) {
    const idx = bestMove(b, currentPlayer);
    const next = move(b, idx, currentPlayer);
    assertAiNeverLoses(next, currentPlayer === "X" ? "O" : "X", aiSymbol);
  } else {
    for (let i = 0; i < 9; i++) {
      if (b[i] === null) {
        const next = move(b, i, currentPlayer);
        assertAiNeverLoses(next, currentPlayer === "X" ? "O" : "X", aiSymbol);
      }
    }
  }
}

test("exhaustive proof: AI playing O never loses to any sequence of X moves", () => {
  assertAiNeverLoses(emptyBoard(), "X", "O");
});

test("exhaustive proof: AI playing X never loses to any sequence of O moves", () => {
  assertAiNeverLoses(emptyBoard(), "X", "X");
});
