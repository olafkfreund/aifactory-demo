// AC#2: Clicking an empty cell places the current player's mark and passes
// the turn. These tests verify applyMove places the current player's mark on
// an empty cell and flips currentPlayer from X to O.
//
// Run from repo root with: npx jest games/tictactoe/game.test.js
"use strict";

const { newGame, applyMove } = require("./game.js");

describe("applyMove places the current player's mark and passes the turn", () => {
  test("places X's mark on the clicked empty cell", () => {
    const state = newGame();
    const next = applyMove(state, 4);
    expect(next.board[4]).toBe("X");
  });

  test("flips currentPlayer from X to O after the move", () => {
    const state = newGame();
    const next = applyMove(state, 4);
    expect(next.currentPlayer).toBe("O");
  });

  test("returns a new state and leaves the original board unchanged", () => {
    const state = newGame();
    const next = applyMove(state, 4);
    expect(next).not.toBe(state);
    expect(state.board[4]).toBe(null);
    expect(state.currentPlayer).toBe("X");
  });

  test("places the mark on whichever empty cell is clicked", () => {
    const state = newGame();
    const next = applyMove(state, 0);
    expect(next.board[0]).toBe("X");
    expect(next.currentPlayer).toBe("O");
  });
});
