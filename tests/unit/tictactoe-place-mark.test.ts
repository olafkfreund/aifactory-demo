// AC#2: Clicking an empty cell places the current player's mark and passes the turn.
//
// Target: games/tictactoe/game.js::makeMove
// This verifies that makeMove on an empty cell writes the current player's mark
// into that cell and switches currentPlayer from X to O.
//
// The engine is a plain CommonJS module (module.exports); we require it by
// relative path, mirroring the existing games/tictactoe/game.test.js style.

/* eslint-disable @typescript-eslint/no-var-requires */
const { createGame, makeMove } = require("../../games/tictactoe/game.js");

describe("makeMove places a mark on an empty cell and passes the turn (AC#2)", () => {
  it("writes the current player's mark (X) into the clicked empty cell", () => {
    const state = createGame();
    expect(state.currentPlayer).toBe("X");

    const next = makeMove(state, 4);

    expect(next.board[4]).toBe("X");
  });

  it("switches currentPlayer from X to O after the move", () => {
    const next = makeMove(createGame(), 4);

    expect(next.currentPlayer).toBe("O");
  });

  it("leaves every other cell untouched when marking an empty cell", () => {
    const next = makeMove(createGame(), 0);

    expect(next.board[0]).toBe("X");
    const others = next.board.filter((_: unknown, i: number) => i !== 0);
    expect(others).toEqual(new Array(8).fill(null));
  });

  it("does not mutate the original state (returns a new state)", () => {
    const state = createGame();
    const next = makeMove(state, 8);

    expect(state.board[8]).toBeNull();
    expect(state.currentPlayer).toBe("X");
    expect(next.board[8]).toBe("X");
  });
});
