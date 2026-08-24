// AC#5: A full board with no winner reports a draw.
//
// Proves move()/isBoardFull() report draw=true, winner=null, over=true once
// the board fills with no winning line.
"use strict";

const { createGame, move, isBoardFull } = require("./game.js");

// Drive a sequence of cell indices (alternating X/O) from a fresh game.
function play(indices) {
  let state = createGame();
  for (const index of indices) {
    state = move(state, index);
  }
  return state;
}

// A move order that fills the board with no three-in-a-row:
//   X O X
//   X O O
//   O X X
const DRAW_MOVES = [0, 1, 2, 4, 3, 5, 7, 6, 8];

describe("full board with no winner reports a draw", () => {
  test("move() fills every cell so isBoardFull() is true", () => {
    const state = play(DRAW_MOVES);
    expect(isBoardFull(state.board)).toBe(true);
  });

  test("move() reports draw=true on the full, winnerless board", () => {
    const state = play(DRAW_MOVES);
    expect(state.draw).toBe(true);
  });

  test("move() reports winner=null on a draw", () => {
    const state = play(DRAW_MOVES);
    expect(state.winner).toBeNull();
  });

  test("move() reports over=true on a draw", () => {
    const state = play(DRAW_MOVES);
    expect(state.over).toBe(true);
  });

  test("isBoardFull() is false while at least one cell is empty", () => {
    const board = [null, null, null, null, null, null, null, null, null];
    expect(isBoardFull(board)).toBe(false);
  });
});
