// AC#3: Clicking an occupied cell does nothing (no turn passes, no error)
//
// applyMove on an occupied cell must return the SAME state object (a no-op),
// so currentPlayer does not change and the board is left untouched.
//
// Run from repo root with: npx jest games/tictactoe/game.applymove-occupied.test.js
"use strict";

const { newGame, applyMove } = require("./game.js");

describe("applyMove on an occupied cell keeps the turn", () => {
  test("returns the exact same state object (no-op)", () => {
    const state = applyMove(newGame(), 0); // X plays cell 0, O now to move
    const attempt = applyMove(state, 0); // O clicks the occupied cell 0
    expect(attempt).toBe(state); // same reference — nothing happened
  });

  test("currentPlayer does not change when the cell is occupied", () => {
    const state = applyMove(newGame(), 0); // X at 0, currentPlayer is now "O"
    const attempt = applyMove(state, 0);
    expect(attempt.currentPlayer).toBe("O");
  });

  test("the occupied cell keeps its original mark and no error is thrown", () => {
    const state = applyMove(newGame(), 4); // X at centre, O to move
    let attempt;
    expect(() => {
      attempt = applyMove(state, 4);
    }).not.toThrow();
    expect(attempt.board[4]).toBe("X");
  });
});
