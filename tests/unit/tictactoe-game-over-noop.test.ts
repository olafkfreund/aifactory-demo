// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// These tests prove that `makeMove`, once a game has been won or drawn,
// treats any further move as a no-op: it returns a state equal in value to
// the decided state, the board is untouched, and the turn does not pass.

import { makeMove, createGame } from "app";

// Apply a sequence of cell indexes to a fresh game, alternating players.
function play(indexes: number[]) {
  let state = createGame();
  for (const index of indexes) {
    state = makeMove(state, index);
  }
  return state;
}

describe("makeMove is a no-op once the game is decided (AC#6)", () => {
  it("returns the won state unchanged when a further cell is clicked", () => {
    // X takes the top row (0,1,2) and wins on the fifth move.
    const wonState = play([0, 3, 1, 4, 2]);
    expect(wonState.winner).toBe("X");

    // Cell 8 is still empty, but the game is already over.
    const afterExtraClick = makeMove(wonState, 8);

    expect(afterExtraClick).toEqual(wonState);
  });

  it("does not fill the clicked cell after a win", () => {
    const wonState = play([0, 3, 1, 4, 2]);

    const afterExtraClick = makeMove(wonState, 8);

    expect(afterExtraClick.board[8]).toBeNull();
  });

  it("does not pass the turn after a win", () => {
    const wonState = play([0, 3, 1, 4, 2]);

    const afterExtraClick = makeMove(wonState, 8);

    expect(afterExtraClick.currentPlayer).toBe(wonState.currentPlayer);
  });

  it("returns the drawn state unchanged when a cell is clicked", () => {
    // Full board, no three-in-a-row:
    // X O X
    // X O O
    // O X X
    const drawnState = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
    expect(drawnState.isDraw).toBe(true);

    // Board is full; re-applying the last move must still be rejected.
    const afterExtraClick = makeMove(drawnState, 8);

    expect(afterExtraClick).toEqual(drawnState);
  });

  it("keeps the board and winner untouched after a draw", () => {
    const drawnState = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);

    const afterExtraClick = makeMove(drawnState, 8);

    expect(afterExtraClick.board).toEqual(drawnState.board);
    expect(afterExtraClick.winner).toBeNull();
  });
});
