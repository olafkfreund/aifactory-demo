// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build (initial state).
//
// This unit test verifies GameLogic.createGame() produces the correct fresh
// starting state: an empty 9-cell board, currentPlayer 'X', no winner, no
// winning line, and gameOver false — the state a freshly-opened page renders.

// game.js is a plain CommonJS module (module.exports = GameLogic) located at
// games/tictactoe/game.js, imported here via a relative require.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const GameLogic = require('../../games/tictactoe/game');

describe('GameLogic.createGame — initial state (AC#1)', () => {
  it('returns a board of 9 cells', () => {
    const state = GameLogic.createGame();
    expect(state.board).toHaveLength(9);
  });

  it('returns a board with every cell empty (null)', () => {
    const state = GameLogic.createGame();
    expect(state.board).toEqual([null, null, null, null, null, null, null, null, null]);
  });

  it("sets the starting player to 'X'", () => {
    const state = GameLogic.createGame();
    expect(state.currentPlayer).toBe('X');
  });

  it('has no winner', () => {
    const state = GameLogic.createGame();
    expect(state.winner).toBeNull();
  });

  it('has no winning line', () => {
    const state = GameLogic.createGame();
    expect(state.winningLine).toBeNull();
  });

  it('is not game over', () => {
    const state = GameLogic.createGame();
    expect(state.gameOver).toBe(false);
  });

  it('returns a distinct board instance on each call (no shared state)', () => {
    const first = GameLogic.createGame();
    const second = GameLogic.createGame();
    expect(first.board).not.toBe(second.board);
  });
});
