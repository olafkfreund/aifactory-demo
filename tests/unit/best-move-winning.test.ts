// AC#1: `bestMove` takes the winning move when one is available in one ply.
//
// This test drives the pure game logic in games/tictactoe/game.js. It builds
// positions where the player to move has an immediate (one-ply) winning
// completion and asserts that bestMove returns exactly that completing index —
// even when a block is simultaneously available (winning outranks blocking).

// The module under test is a UMD/CommonJS module (games/tictactoe/game.js),
// loaded via require so it works regardless of TS module interop settings.
declare function require(path: string): any;

const { newGame, checkWinner, isBoardFull, bestMove } = require("../../.worktree/games/tictactoe/game.js");

// Build a board from a compact array, using '.' for empty cells.
function board(cells: string[]): (string | null)[] {
  return cells.map((c) => (c === "." ? null : c));
}

// Build a full game state (not just a board) for exercising bestMove
// directly against a hand-picked position.
function stateFrom(cells: string[], currentPlayer: string) {
  const b = board(cells);
  const result = checkWinner(b);
  return {
    board: b,
    currentPlayer,
    winner: result.winner,
    winningLine: result.line,
    isDraw: !result.winner && isBoardFull(b),
  };
}

describe("AC#1: bestMove takes the winning move when one is available in one ply", () => {
  it("completes X's two-in-a-row for the immediate win", () => {
    // X has two in a row (0,1); cell 2 completes the top row.
    const state = stateFrom(["X", "X", ".", "O", "O", ".", ".", ".", "."], "X");
    expect(bestMove(state)).toBe(2);
  });

  it("prefers taking its own win over blocking the opponent's threat", () => {
    // X can win at 2 (0,1); O also threatens 5 (3,4). Winning beats blocking.
    const state = stateFrom(["X", "X", ".", "O", "O", ".", ".", ".", "."], "X");
    expect(bestMove(state)).toBe(2);
  });

  it("completes a diagonal one-ply win for X", () => {
    // X occupies the 0,4 diagonal; index 8 completes 0-4-8.
    const state = stateFrom(["X", "O", "O", ".", "X", ".", ".", ".", "."], "X");
    expect(bestMove(state)).toBe(8);
  });

  it("takes the one-ply win when the AI is playing O", () => {
    // O has two in a column (0,3); cell 6 completes 0-3-6.
    const state = stateFrom(["O", "X", "X", "O", "X", ".", ".", ".", "."], "O");
    expect(bestMove(state)).toBe(6);
  });
});
