// AC#7: A "New game" control resets to an empty board with X to move.
// This suite verifies newGame() returns a fresh all-null 9-cell board with
// currentPlayer set to "X" — the state a "New game" control resets to.
"use strict";

const { newGame } = require("./game.js");

describe("newGame", () => {
  test("returns a board of exactly 9 cells", () => {
    const state = newGame();
    expect(state.board).toHaveLength(9);
  });

  test("returns an all-null (empty) board", () => {
    const state = newGame();
    expect(state.board).toEqual(Array(9).fill(null));
  });

  test("sets currentPlayer to X (X moves first)", () => {
    const state = newGame();
    expect(state.currentPlayer).toBe("X");
  });

  test("every cell is null with no marks placed", () => {
    const state = newGame();
    expect(state.board.every((cell) => cell === null)).toBe(true);
  });

  test("returns a fresh state each call (no shared board reference)", () => {
    const first = newGame();
    const second = newGame();
    expect(second.board).not.toBe(first.board);
    first.board[0] = "X";
    expect(second.board[0]).toBe(null);
  });
});
