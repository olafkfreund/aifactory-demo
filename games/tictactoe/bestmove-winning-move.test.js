// AC#1: `bestMove` takes the winning move when one is available in one ply.
// Proves that when the player to move has a one-ply win, bestMove returns the
// cell that completes their line rather than any other move.
"use strict";

const { createGame, makeMove, bestMove } = require("./game.js");

// Apply a sequence of cell indexes to a fresh game, alternating players.
function play(indexes) {
  let state = createGame();
  for (const index of indexes) {
    state = makeMove(state, index);
  }
  return state;
}

describe("bestMove takes the winning move when one is available in one ply", () => {
  it("returns the cell that completes X's top row (X to move)", () => {
    // X: 0,1 played, O: 3,4 played. X to move; X wins by taking 2 (top row).
    //   X X .
    //   O O .
    //   . . .
    const state = play([0, 3, 1, 4]);
    expect(state.currentPlayer).toBe("X");
    expect(bestMove(state)).toBe(2);
  });

  it("returns the cell that completes O's middle row (O to move)", () => {
    // X: 0,1,8 played, O: 3,4 played. O to move; O wins by taking 5 (middle row).
    //   X X .
    //   O O .
    //   . . X
    const state = play([0, 3, 1, 4, 8]);
    expect(state.currentPlayer).toBe("O");
    expect(bestMove(state)).toBe(5);
  });
});
