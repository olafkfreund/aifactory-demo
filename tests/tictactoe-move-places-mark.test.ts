// AC#2: Clicking an empty cell places the current player's mark and passes the turn.
//
// This verifies the pure rule `move(state, index)` in games/tictactoe/game.js:
// applying a move on an EMPTY cell must return a NEW state object whose board
// carries the current player's mark at that index, with the turn handed to the
// other player — while the original state object is left completely unchanged.

/* eslint-disable @typescript-eslint/no-var-requires */
const game = require("../games/tictactoe/game.js");
const { newGame, move } = game;

describe("move() places the current player's mark and passes the turn (AC#2)", () => {
  it("places X's mark on the chosen empty cell", () => {
    const state = newGame();
    const next = move(state, 4);

    expect(next.board[4]).toBe("X");
  });

  it("passes the turn to O after X moves", () => {
    const state = newGame();
    const next = move(state, 4);

    expect(next.currentPlayer).toBe("O");
  });

  it("places O's mark and passes the turn back to X on the following move", () => {
    const afterX = move(newGame(), 0);
    const afterO = move(afterX, 1);

    expect(afterO.board[1]).toBe("O");
    expect(afterO.currentPlayer).toBe("X");
  });

  it("returns a NEW state object (does not mutate or reuse the original)", () => {
    const state = newGame();
    const next = move(state, 2);

    expect(next).not.toBe(state);
    expect(next.board).not.toBe(state.board);
  });

  it("leaves the original state unchanged after the move", () => {
    const state = newGame();
    move(state, 6);

    expect(state.board[6]).toBeNull();
    expect(state.currentPlayer).toBe("X");
    expect(state.board).toEqual([null, null, null, null, null, null, null, null, null]);
  });

  it("changes only the targeted cell, leaving every other cell empty", () => {
    const next = move(newGame(), 3);
    const expectedBoard = [null, null, null, "X", null, null, null, null, null];

    expect(next.board).toEqual(expectedBoard);
  });

  it("does not declare a winner or draw for a single opening move", () => {
    const next = move(newGame(), 0);

    expect(next.winner).toBeNull();
    expect(next.winningLine).toBeNull();
    expect(next.isDraw).toBe(false);
  });
});
