// AC#7: A "New game" control resets to an empty board with X to move.
//
// Subtask creategame-resets-empty-x: verify createGame returns an empty
// 9-cell board with currentPlayer "X", no winner, no winningLine, and
// isDraw false — the fresh state a "New game" control restores.
//
// The game engine is a plain CommonJS module (games/tictactoe/game.js with
// module.exports). Jest is invoked from the repo root, so we require it via
// the relative path from tests/unit/.

/* eslint-disable @typescript-eslint/no-var-requires */
const { createGame } = require("../../games/tictactoe/game.js") as {
  createGame: () => {
    board: Array<string | null>;
    currentPlayer: string;
    winner: string | null;
    winningLine: number[] | null;
    isDraw: boolean;
  };
};

describe("createGame — New game reset (AC#7)", () => {
  it("returns a board of exactly 9 cells", () => {
    expect(createGame().board).toHaveLength(9);
  });

  it("returns an empty board (every cell null)", () => {
    expect(createGame().board).toEqual(new Array(9).fill(null));
  });

  it("sets X as the player to move", () => {
    expect(createGame().currentPlayer).toBe("X");
  });

  it("has no winner", () => {
    expect(createGame().winner).toBeNull();
  });

  it("has no winning line", () => {
    expect(createGame().winningLine).toBeNull();
  });

  it("is not a draw", () => {
    expect(createGame().isDraw).toBe(false);
  });

  it("returns a fresh, fully-reset state matching the new-game contract", () => {
    expect(createGame()).toEqual({
      board: new Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
      winningLine: null,
      isDraw: false,
    });
  });
});
