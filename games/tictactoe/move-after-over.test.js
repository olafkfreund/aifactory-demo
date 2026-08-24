// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// This verifies games/tictactoe/game.js::move — when called on a state that
// is already over (either won or drawn), move() must return the state
// unchanged so any click after the game is decided is a no-op.
//
// Note on imports: game.js is a UMD/CommonJS module (module.exports) that
// lives next to this test, so it is required relatively. The project's
// `app` package is the (Python) FastAPI service and does not contain this
// browser game module, so there is no `app`-rooted symbol to import here.
"use strict";

const { createGame, move } = require("./game.js");

// Drives a sequence of cell indices through move() from a fresh game,
// alternating turns implicitly via the game's own turn tracking.
function play(indices) {
  let state = createGame();
  for (const index of indices) {
    state = move(state, index);
  }
  return state;
}

describe("move() on a decided game is a no-op (AC#6)", () => {
  it("returns the won state unchanged when a further move is attempted", () => {
    const won = play([0, 3, 1, 4, 2]); // X completes the top row 0,1,2
    expect(won.over).toBe(true);
    expect(won.winner).toBe("X");

    const after = move(won, 5); // 5 is empty, but the game is already over

    expect(after).toBe(won); // same state object -> nothing changed
    expect(after.board).toEqual(won.board);
    expect(after.current).toBe(won.current);
    expect(after.winner).toBe(won.winner);
    expect(after.line).toEqual(won.line);
    expect(after.over).toBe(true);
    expect(after.draw).toBe(false);
  });

  it("does not pass the turn or mutate the board after a win", () => {
    const won = play([0, 3, 1, 4, 2]);
    const after = move(won, 8); // another empty cell

    expect(after.board[8]).toBeNull(); // move was not applied
    expect(after.current).toBe(won.current); // turn did not pass
  });

  it("returns the drawn state unchanged when a further move is attempted", () => {
    // X O X
    // X O O
    // O X X  -> full board, no winner
    const drawn = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
    expect(drawn.over).toBe(true);
    expect(drawn.draw).toBe(true);
    expect(drawn.winner).toBeNull();

    const after = move(drawn, 0); // re-clicking any cell must no-op

    expect(after).toBe(drawn); // same state object -> nothing changed
    expect(after.board).toEqual(drawn.board);
    expect(after.current).toBe(drawn.current);
    expect(after.draw).toBe(true);
    expect(after.over).toBe(true);
    expect(after.winner).toBeNull();
  });
});
