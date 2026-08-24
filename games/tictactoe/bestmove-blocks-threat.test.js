// AC#2: `bestMove` blocks the opponent's immediate winning threat when it
// cannot win itself.
//
// bestMove returns the index of an optimal move for the player to move. When
// the opponent has two marks in a line (an immediate one-ply win threat) and
// the AI has no winning move of its own, the only move that avoids a loss is
// the blocking cell — so bestMove must return that cell.
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

describe("bestMove blocks the opponent's immediate winning threat", () => {
  it("takes the blocking cell when the opponent threatens a middle-row win and the AI cannot win itself", () => {
    // Board after X:0, O:3, X:6, O:4
    //   X . .
    //   O O .
    //   X . .
    // O holds 3 and 4 and threatens to win at index 5.
    // X (to move) has 0 and 6 but no one-ply win, so it must block at 5.
    const state = play([0, 3, 6, 4]);

    expect(state.currentPlayer).toBe("X");
    expect(state.winner).toBeNull();
    expect(bestMove(state)).toBe(5);
  });

  it("takes the blocking cell when the opponent threatens a column win and the AI cannot win itself", () => {
    // Board after X:1, O:0, X:2, O:3
    //   O X X
    //   O . .
    //   . . .
    // O holds 0 and 3 and threatens to win at index 6 (left column).
    // X (to move) has 1 and 2 but the third top-row cell (0) is O's, so X has
    // no one-ply win and must block at 6.
    const state = play([1, 0, 2, 3]);

    expect(state.currentPlayer).toBe("X");
    expect(state.winner).toBeNull();
    expect(bestMove(state)).toBe(6);
  });
});
