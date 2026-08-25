// AC#7: A "New game" control resets to an empty board with X to move.
//
// This verifies the pure rule `newGame()` in games/tictactoe/game.js: calling
// it produces a fresh game state — an empty 9-cell board, X to move, and no
// decided outcome (winner/winningLine null, isDraw false). Because "New game"
// simply installs this state, isGameOver() over the result must report false.

/* eslint-disable @typescript-eslint/no-var-requires */
const game = require("../games/tictactoe/game.js");
const { newGame, isGameOver } = game;

describe("newGame() resets to a fresh, undecided game state (AC#7)", () => {
  it("returns an empty 9-cell board", () => {
    const state = newGame();

    expect(state.board).toEqual([null, null, null, null, null, null, null, null, null]);
    expect(state.board).toHaveLength(9);
  });

  it("sets X as the current player", () => {
    const state = newGame();

    expect(state.currentPlayer).toBe("X");
  });

  it("has no winner and no winning line", () => {
    const state = newGame();

    expect(state.winner).toBeNull();
    expect(state.winningLine).toBeNull();
  });

  it("is not a draw", () => {
    const state = newGame();

    expect(state.isDraw).toBe(false);
  });

  it("reports the game as not over", () => {
    const state = newGame();

    expect(isGameOver(state)).toBe(false);
  });

  it("returns a fresh, independent board on each call", () => {
    const first = newGame();
    const second = newGame();

    expect(second).not.toBe(first);
    expect(second.board).not.toBe(first.board);
    expect(second.board).toEqual(first.board);
  });
});
