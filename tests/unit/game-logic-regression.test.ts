// AC#7: All existing tests still pass.
//
// Regression coverage for the PURE tic-tac-toe game logic that existed
// before the minimax AI was added: newGame, move (place / turn-pass /
// no-op), checkWinner across all 8 winning lines, isBoardFull, draw
// detection, isGameOver, and immutability of prior state. Adding bestMove
// must not have changed any of this behaviour.
//
// The module under test is a UMD/CommonJS module (games/tictactoe/game.js);
// jest resolves it via its `.js` extension from the project root.
import {
  newGame,
  move,
  checkWinner,
  isBoardFull,
  isGameOver,
} from "../../games/tictactoe/game";

type Cell = "X" | "O" | null;

// Build a board from a compact array, using '.' for empty cells.
function board(cells: string[]): Cell[] {
  return cells.map((c) => (c === "." ? null : (c as Cell)));
}

describe("newGame", () => {
  it("starts with an empty 9-cell board, X to move, nothing decided", () => {
    const state = newGame();
    expect(state.board).toEqual(new Array(9).fill(null));
    expect(state.currentPlayer).toBe("X");
    expect(state.winner).toBeNull();
    expect(state.winningLine).toBeNull();
    expect(state.isDraw).toBe(false);
    expect(isGameOver(state)).toBe(false);
  });
});

describe("move: placing marks and passing the turn", () => {
  it("places the current mark on an empty cell and passes the turn to O", () => {
    const next = move(newGame(), 4);
    expect(next.board[4]).toBe("X");
    expect(next.currentPlayer).toBe("O");
  });

  it("leaves the original state untouched (immutability)", () => {
    const state = newGame();
    move(state, 4);
    expect(state.board[4]).toBeNull();
    expect(state.currentPlayer).toBe("X");
  });

  it("is an exact no-op (same reference) when the cell is already occupied", () => {
    const state = move(newGame(), 0); // X at 0, O to move
    const attempt = move(state, 0);
    expect(attempt).toBe(state);
    expect(attempt.board[0]).toBe("X");
    expect(attempt.currentPlayer).toBe("O");
  });

  it("rejects an out-of-range index without error and returns the same state", () => {
    const state = newGame();
    expect(move(state, -1)).toBe(state);
    expect(move(state, 9)).toBe(state);
  });

  it("rejects a non-integer index without error and returns the same state", () => {
    const state = newGame();
    expect(move(state, 1.5)).toBe(state);
  });
});

describe("checkWinner: all 8 winning lines", () => {
  const winningBoards = [
    { name: "row 0", cells: ["X", "X", "X", "O", "O", ".", ".", ".", "."], line: [0, 1, 2] },
    { name: "row 1", cells: ["O", "O", ".", "X", "X", "X", ".", ".", "."], line: [3, 4, 5] },
    { name: "row 2", cells: [".", ".", ".", "O", "O", ".", "X", "X", "X"], line: [6, 7, 8] },
    { name: "col 0", cells: ["X", "O", ".", "X", "O", ".", "X", ".", "."], line: [0, 3, 6] },
    { name: "col 1", cells: ["O", "X", ".", "O", "X", ".", ".", "X", "."], line: [1, 4, 7] },
    { name: "col 2", cells: [".", "O", "X", ".", "O", "X", ".", ".", "X"], line: [2, 5, 8] },
    { name: "diag main", cells: ["X", "O", ".", "O", "X", ".", ".", ".", "X"], line: [0, 4, 8] },
    { name: "diag anti", cells: [".", ".", "X", ".", "X", "O", "X", "O", "."], line: [2, 4, 6] },
  ];

  it.each(winningBoards)("detects the winning line for $name", ({ cells, line }) => {
    const result = checkWinner(board(cells));
    expect(result.winner).toBe("X");
    expect(result.line).toEqual(line);
  });

  it("reports no winner on an empty board", () => {
    const result = checkWinner(board([".", ".", ".", ".", ".", ".", ".", ".", "."]));
    expect(result.winner).toBeNull();
    expect(result.line).toBeNull();
  });
});

describe("win reachable through play", () => {
  it("records the winner and winning line and ends the game", () => {
    let state = newGame();
    for (const m of [0, 3, 1, 4, 2]) state = move(state, m); // X takes top row
    expect(state.winner).toBe("X");
    expect(state.winningLine).toEqual([0, 1, 2]);
    expect(isGameOver(state)).toBe(true);
  });

  it("ignores further clicks once a win is decided (same reference)", () => {
    let state = newGame();
    for (const m of [0, 3, 1, 4, 2]) state = move(state, m);
    const after = move(state, 5); // empty cell, but game is already over
    expect(after).toBe(state);
    expect(after.board[5]).toBeNull();
  });
});

describe("draw detection", () => {
  it("a full board with no line reports isBoardFull true and no winner", () => {
    const full = board(["X", "O", "X", "X", "O", "O", "O", "X", "X"]);
    expect(isBoardFull(full)).toBe(true);
    expect(checkWinner(full).winner).toBeNull();
  });

  it("reaches a draw through play: full board, no winner, isDraw true, game over", () => {
    let state = newGame();
    const order = [0, 1, 2, 4, 3, 5, 7, 6, 8];
    for (const m of order) state = move(state, m);
    expect(state.board.every((c: Cell) => c !== null)).toBe(true);
    expect(state.winner).toBeNull();
    expect(state.isDraw).toBe(true);
    expect(isGameOver(state)).toBe(true);
  });

  it("ignores further clicks once a draw is decided (same reference)", () => {
    let state = newGame();
    for (const m of [0, 1, 2, 4, 3, 5, 7, 6, 8]) state = move(state, m);
    expect(state.isDraw).toBe(true);
    const after = move(state, 0);
    expect(after).toBe(state);
  });
});

describe("isBoardFull", () => {
  it("returns false while any cell is still empty", () => {
    expect(isBoardFull(board(["X", "O", "X", ".", ".", ".", ".", ".", "."]))).toBe(false);
  });
});
