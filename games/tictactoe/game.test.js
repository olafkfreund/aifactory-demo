// Run from repo root with: npx jest or node --test games/tictactoe/game.test.js
"use strict";

const {
  WIN_LINES,
  emptyBoard,
  move,
  winner,
  winningLine,
  availableMoves,
  nextFocusIndex,
  bestMove,
} = require("./game.js");

// Build a board from a compact array, using '.' for empty cells.
function board(cells) {
  return cells.map((c) => (c === "." ? null : c));
}

it("emptyBoard returns a fresh 9-cell board", () => {
  expect(emptyBoard()).toEqual(Array(9).fill(null));
  // Each call returns its own array, not a shared reference.
  expect(emptyBoard()).not.toBe(emptyBoard());
});

it("clicking an empty cell places the mark and returns a NEW board", () => {
  const b = emptyBoard();
  const next = move(b, 4, "X");
  expect(next[4]).toBe("X");
  expect(b[4]).toBe(null); // original board is untouched (immutability)
});

it("clicking an occupied cell does nothing: no-op, same reference", () => {
  const b = move(emptyBoard(), 0, "X");
  const attempt = move(b, 0, "O");
  expect(attempt).toBe(b);
  expect(attempt[0]).toBe("X");
});

it("out-of-range index is rejected without error", () => {
  const b = emptyBoard();
  expect(move(b, -1, "X")).toBe(b);
  expect(move(b, 9, "X")).toBe(b);
  expect(move(b, 1.5, "X")).toBe(b);
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
  it(`winner/winningLine detect winning line: ${name}`, () => {
    const b = board(cells);
    expect(winner(b)).toBe("X");
    expect(winningLine(b)).toEqual(line);
  });
}

it("all 8 winning lines are represented in WIN_LINES", () => {
  expect(WIN_LINES.length).toBe(8);
  for (const { line } of winningBoards) {
    expect(WIN_LINES.some((l) => l.join(",") === line.join(","))).toBe(true);
  }
});

it("winner/winningLine return null while play continues", () => {
  expect(winner(emptyBoard())).toBe(null);
  expect(winningLine(emptyBoard())).toBe(null);
});

it("a win is reachable through play and the winning line is reported", () => {
  let b = emptyBoard();
  // X: 0,1,2 (top row) ; O: 3,4
  const moves = [
    [0, "X"], [3, "O"], [1, "X"], [4, "O"], [2, "X"],
  ];
  for (const [i, p] of moves) b = move(b, i, p);
  expect(winner(b)).toBe("X");
  expect(winningLine(b)).toEqual([0, 1, 2]);
});

it("a full board with no winner reports a draw", () => {
  // X O X / X O O / O X X -> full board, no line for either player
  const cells = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
  const full = board(cells);
  expect(winner(full)).toBe("draw");
  expect(winningLine(full)).toBe(null);

  // Reach it through play: X and O alternate filling exactly this board.
  let b = emptyBoard();
  const order = [
    [0, "X"], [1, "O"], [2, "X"], [4, "O"], [3, "X"],
    [5, "O"], [7, "X"], [6, "O"], [8, "X"],
  ];
  for (const [i, p] of order) b = move(b, i, p);
  expect(b).toEqual(full);
  expect(winner(b)).toBe("draw");
});

it("play stops once decided: a move after a win is rejected", () => {
  let b = emptyBoard();
  for (const [i, p] of [[0, "X"], [3, "O"], [1, "X"], [4, "O"], [2, "X"]]) b = move(b, i, p);
  expect(winner(b)).toBe("X");
  const after = move(b, 5, "O"); // empty cell, but game is over
  expect(after).toBe(b);
  expect(after[5]).toBe(null);
});

it("play stops once decided: a move after a draw is rejected", () => {
  let b = emptyBoard();
  for (const [i, p] of [
    [0, "X"], [1, "O"], [2, "X"], [4, "O"], [3, "X"],
    [5, "O"], [7, "X"], [6, "O"], [8, "X"],
  ]) {
    b = move(b, i, p);
  }
  expect(winner(b)).toBe("draw");
  const after = move(b, 0, "X"); // occupied anyway, but also game-over
  expect(after).toBe(b);
});

it("New game resets to an empty board with X to move (no persisted state)", () => {
  let b = emptyBoard();
  for (const [i, p] of [[0, "X"], [3, "O"], [1, "X"], [4, "O"], [2, "X"]]) b = move(b, i, p);
  expect(winner(b)).toBe("X");

  const reset = emptyBoard();
  expect(reset).toEqual(Array(9).fill(null));
  expect(winner(reset)).toBe(null);
});

// nextFocusIndex: keyboard navigation for the 3x3 grid.
it("nextFocusIndex moves right/left within a row and up/down within a column", () => {
  expect(nextFocusIndex(4, "ArrowRight")).toBe(5);
  expect(nextFocusIndex(4, "ArrowLeft")).toBe(3);
  expect(nextFocusIndex(4, "ArrowUp")).toBe(1);
  expect(nextFocusIndex(4, "ArrowDown")).toBe(7);
});

it("nextFocusIndex wraps at the edges", () => {
  expect(nextFocusIndex(2, "ArrowRight")).toBe(0);
  expect(nextFocusIndex(0, "ArrowLeft")).toBe(2);
  expect(nextFocusIndex(0, "ArrowUp")).toBe(6);
  expect(nextFocusIndex(6, "ArrowDown")).toBe(0);
});

it("nextFocusIndex: Home returns 0 and End returns 8 from any cell", () => {
  for (let i = 0; i < 9; i++) {
    expect(nextFocusIndex(i, "Home")).toBe(0);
    expect(nextFocusIndex(i, "End")).toBe(8);
  }
});

it("nextFocusIndex returns the current index unchanged for any other key", () => {
  expect(nextFocusIndex(4, "Enter")).toBe(4);
  expect(nextFocusIndex(0, " ")).toBe(0);
  expect(nextFocusIndex(7, "a")).toBe(7);
  expect(nextFocusIndex(3, "Tab")).toBe(3);
});

// bestMove: the minimax AI (out of scope for this issue's acceptance
// criteria, but already present in the codebase and exercised by the UI —
// kept covered here since it now lives on the required board-based API).
it("bestMove returns null once the game is decided", () => {
  let b = emptyBoard();
  for (const [i, p] of [[0, "X"], [3, "O"], [1, "X"], [4, "O"], [2, "X"]]) b = move(b, i, p);
  expect(bestMove(b, "O")).toBe(null);
});

it("bestMove takes the centre on an empty board", () => {
  expect(bestMove(emptyBoard(), "X")).toBe(4);
});

it("bestMove takes the winning move when one is available in one ply", () => {
  // X: 0, 1 already placed; O: 3, 4. X to move and can win at 2.
  const b = board(["X", "X", ".", "O", "O", ".", ".", ".", "."]);
  expect(bestMove(b, "X")).toBe(2);
});

it("bestMove blocks the opponent's immediate winning threat when it cannot win itself", () => {
  // O: 0, 1 already placed, threatening to win at 2. X: 3, 6 (no threat of its own).
  const b = board(["O", "O", ".", "X", ".", ".", "X", ".", "."]);
  expect(bestMove(b, "X")).toBe(2);
});

// Exhaustive proof it never loses: play the AI against EVERY possible
// sequence of opponent moves. Run once with the AI moving first (as X) and
// once with the AI moving second (as O).
function assertAiNeverLoses(b, currentPlayer, aiSymbol) {
  const result = winner(b);
  if (result) {
    const opponentSymbol = aiSymbol === "X" ? "O" : "X";
    expect(result).not.toBe(opponentSymbol);
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

it("exhaustive proof: AI playing O never loses to any sequence of X moves", () => {
  assertAiNeverLoses(emptyBoard(), "X", "O");
});

it("exhaustive proof: AI playing X never loses to any sequence of O moves", () => {
  assertAiNeverLoses(emptyBoard(), "X", "X");
});

// availableMoves: returns indices of empty cells, or empty array if game is over.
it("availableMoves on an empty board returns all 9 indices", () => {
  const moves = availableMoves(emptyBoard());
  expect(moves).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
});

it("availableMoves on a partly filled board returns only empty cell indices", () => {
  // X at 0, O at 4, empty everywhere else
  const b = board(["X", ".", ".", ".", "O", ".", ".", ".", "."]);
  const moves = availableMoves(b);
  expect(moves).toEqual([1, 2, 3, 5, 6, 7, 8]);
});

it("availableMoves on a won board returns an empty array", () => {
  // X wins with top row
  const b = board(["X", "X", "X", "O", "O", ".", ".", ".", "."]);
  expect(winner(b)).toBe("X");
  expect(availableMoves(b)).toEqual([]);
});

it("availableMoves on a drawn board returns an empty array", () => {
  // Full board with no winner (draw)
  const b = board(["X", "O", "X", "X", "O", "O", "O", "X", "X"]);
  expect(winner(b)).toBe("draw");
  expect(availableMoves(b)).toEqual([]);
});
