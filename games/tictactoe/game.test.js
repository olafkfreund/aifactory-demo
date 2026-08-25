// Run from repo root with: npx jest games/tictactoe/game.test.js
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

test("emptyBoard returns a fresh 9-cell board with no cells set", () => {
  const b = emptyBoard();
  expect(b).toEqual(Array(9).fill(null));
  expect(b.length).toBe(9);
});

test("move places the current player's mark and returns a NEW board", () => {
  const start = emptyBoard();
  const next = move(start, 4, "X");
  expect(next[4]).toBe("X");
  // original board is untouched (immutability)
  expect(start[4]).toBe(null);
  expect(next).not.toBe(start);
});

test("move rejects an occupied cell: no-op, same reference", () => {
  const afterFirst = move(emptyBoard(), 0, "X");
  const attempt = move(afterFirst, 0, "O");
  expect(attempt).toBe(afterFirst); // exact no-op, same reference
  expect(attempt[0]).toBe("X");
});

test("move rejects a move after the game is over", () => {
  // X wins the top row.
  let b = emptyBoard();
  b = move(b, 0, "X");
  b = move(b, 3, "O");
  b = move(b, 1, "X");
  b = move(b, 4, "O");
  b = move(b, 2, "X"); // completes top row, X wins
  expect(winner(b)).toBe("X");

  const attempt = move(b, 5, "O");
  expect(attempt).toBe(b); // no-op
  expect(attempt[5]).toBe(null);
});

test("move rejects an out-of-range index without error", () => {
  const b = emptyBoard();
  expect(move(b, -1, "X")).toBe(b);
  expect(move(b, 9, "X")).toBe(b);
  expect(move(b, 1.5, "X")).toBe(b);
});

// All 8 winning lines, verified via winner() and winningLine() directly.
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
    expect(winner(b)).toBe("X");
    expect(winningLine(b)).toEqual(line);
  });
}

test("all 8 winning lines are represented in WIN_LINES", () => {
  expect(WIN_LINES.length).toBe(8);
  for (const { line } of winningBoards) {
    expect(WIN_LINES.some((l) => l.join(",") === line.join(","))).toBe(true);
  }
});

test("a win is reachable through play and the winning line is reported", () => {
  let b = emptyBoard();
  const moves = [
    [0, "X"], [3, "O"], [1, "X"], [4, "O"], [2, "X"], // X wins top row
  ];
  for (const [i, p] of moves) b = move(b, i, p);
  expect(winner(b)).toBe("X");
  expect(winningLine(b)).toEqual([0, 1, 2]);
});

test("winner returns null while play continues", () => {
  const b = move(emptyBoard(), 0, "X");
  expect(winner(b)).toBe(null);
  expect(winningLine(b)).toBe(null);
});

test("a full board with no winner reports a draw", () => {
  // X O X / X O O / O X X  -> full board, no line for either player
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

// --- UI-facing state helpers (newGame/applyMove/isGameOver) ---

test("newGame starts with an empty board and X to move", () => {
  const state = newGame();
  expect(state.board).toEqual(Array(9).fill(null));
  expect(state.currentPlayer).toBe("X");
  expect(isGameOver(state)).toBe(false);
});

test("clicking an empty cell places the mark and passes the turn", () => {
  const state = newGame();
  const next = applyMove(state, 4);
  expect(next.board[4]).toBe("X");
  expect(next.currentPlayer).toBe("O");
  expect(state.board[4]).toBe(null);
});

test("clicking an occupied cell does nothing: no turn pass, no error", () => {
  const state = applyMove(newGame(), 0); // X at 0, O to move
  const attempt = applyMove(state, 0);
  expect(attempt).toBe(state); // exact no-op, same reference
  expect(attempt.board[0]).toBe("X");
  expect(attempt.currentPlayer).toBe("O");
});

test("play stops once decided: further clicks do nothing after a win", () => {
  let state = newGame();
  for (const m of [0, 3, 1, 4, 2]) state = applyMove(state, m); // X wins top row
  expect(isGameOver(state)).toBe(true);
  const after = applyMove(state, 5); // empty cell, but game is over
  expect(after).toBe(state);
  expect(after.board[5]).toBe(null);
});

test("play stops once decided: further clicks do nothing after a draw", () => {
  let state = newGame();
  for (const m of [0, 1, 2, 4, 3, 5, 7, 6, 8]) state = applyMove(state, m);
  expect(isGameOver(state)).toBe(true);
  const after = applyMove(state, 0); // occupied anyway, but also game-over
  expect(after).toBe(state);
});

test("New game resets to an empty board with X to move", () => {
  let state = newGame();
  for (const m of [0, 3, 1, 4, 2]) state = applyMove(state, m);
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

// bestMove: the minimax AI. Fast, targeted checks first; the exhaustive
// proof below is the acceptance criterion that actually matters.
describe("bestMove", () => {
  test("returns null once the game is decided", () => {
    let b = emptyBoard();
    for (const [i, p] of [[0, "X"], [3, "O"], [1, "X"], [4, "O"], [2, "X"]]) b = move(b, i, p);
    expect(bestMove(b, "O")).toBe(null);
  });

  test("takes the centre on an empty board", () => {
    expect(bestMove(emptyBoard(), "X")).toBe(4);
  });

  test("takes the winning move when one is available in one ply", () => {
    // X: 0, 1 already placed; O: 3, 4. X to move and can win at 2.
    const b = board(["X", "X", ".", "O", "O", ".", ".", ".", "."]);
    expect(bestMove(b, "X")).toBe(2);
  });

  test("blocks the opponent's immediate winning threat when it cannot win itself", () => {
    // O: 0, 1 already placed, threatening to win at 2. X: 3, 6 (no threat of its own).
    const b = board(["O", "O", ".", "X", ".", ".", "X", ".", "."]);
    expect(bestMove(b, "X")).toBe(2);
  });

  // Exhaustive proof it never loses: play the AI against EVERY possible
  // sequence of opponent moves (the opponent branches over every empty
  // cell at each of its turns; the AI always answers with bestMove). This
  // walks the full game tree, so if any path let the AI lose, it would be
  // found here. Run once with the AI moving first (as X) and once with the
  // AI moving second (as O).
  function assertAiNeverLoses(b, player, aiSymbol) {
    const result = winner(b);
    if (result !== null) {
      const opponentSymbol = aiSymbol === "X" ? "O" : "X";
      expect(result).not.toBe(opponentSymbol);
      return;
    }
    if (player === aiSymbol) {
      const idx = bestMove(b, player);
      assertAiNeverLoses(move(b, idx, player), player === "X" ? "O" : "X", aiSymbol);
    } else {
      for (let i = 0; i < 9; i++) {
        if (b[i] === null) {
          assertAiNeverLoses(move(b, i, player), player === "X" ? "O" : "X", aiSymbol);
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
});
