// AC#2: Clicking an empty cell places the current player's mark and passes the turn.
//
// move() on an empty cell must write the current player's mark into that cell
// and flip `current` from "X" to "O" without ending the game.
//
// game.js is a UMD/CommonJS module (module.exports = factory()) that lives in
// this same directory, so it is imported with a relative require — the same way
// the existing games/tictactoe/game.test.js resolves it.
"use strict";

const { createGame, move } = require("./game.js");

describe("move() on an empty cell (AC#2)", () => {
  it("writes X's mark into the clicked empty cell", () => {
    const state = move(createGame(), 4);
    expect(state.board[4]).toBe("X");
  });

  it("passes the turn from X to O", () => {
    const state = move(createGame(), 4);
    expect(state.current).toBe("O");
  });

  it("does not end the game after a single move", () => {
    const state = move(createGame(), 0);
    expect(state.over).toBe(false);
    expect(state.winner).toBeNull();
    expect(state.draw).toBe(false);
  });

  it("leaves all other cells untouched", () => {
    const state = move(createGame(), 4);
    const others = state.board.filter((_, i) => i !== 4);
    expect(others).toEqual(Array(8).fill(null));
  });

  it("returns a new state object without mutating the input", () => {
    const start = createGame();
    const next = move(start, 0);
    expect(next).not.toBe(start);
    expect(start.board[0]).toBeNull();
    expect(start.current).toBe("X");
  });
});
