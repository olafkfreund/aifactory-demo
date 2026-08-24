// AC#3: `bestMove` takes the centre on an empty board.
//
// A fresh game has an empty 3x3 board (all nine cells null) with X to move.
// Every opening move scores equally (perfect play draws), so bestMove must
// break the tie in favour of the centre cell, index 4.
const { createGame, bestMove } = require("./game.js");

describe("bestMove — opening move on an empty board (AC#3)", () => {
  it("returns index 4 (centre) for a fresh empty board", () => {
    const state = createGame();

    expect(bestMove(state)).toBe(4);
  });

  it("returns the centre for an explicitly empty board with X to move", () => {
    const state = {
      board: new Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
      winningLine: null,
      isDraw: false,
    };

    expect(bestMove(state)).toBe(4);
  });
});
