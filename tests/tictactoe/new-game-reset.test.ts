// AC#7: A "New game" control resets to an empty board with X to move.
//
// The "New game" control resets state by calling GameLogic.createGame(), so
// this unit test verifies that createGame() yields a fresh, reset state: an
// empty 9-cell board, currentPlayer 'X', gameOver false, and winningLine null —
// regardless of any prior (decided) game state.

// game.js is a plain CommonJS module (module.exports = GameLogic) located at
// games/tictactoe/game.js, imported here via a relative require.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const GameLogic = require('../../games/tictactoe/game');

describe('GameLogic.createGame — New game reset (AC#7)', () => {
  it('resets to a fresh empty 9-cell board (all null)', () => {
    const state = GameLogic.createGame();
    expect(state.board).toEqual([null, null, null, null, null, null, null, null, null]);
  });

  it("resets the turn so X is to move", () => {
    const state = GameLogic.createGame();
    expect(state.currentPlayer).toBe('X');
  });

  it('resets gameOver to false', () => {
    const state = GameLogic.createGame();
    expect(state.gameOver).toBe(false);
  });

  it('resets winningLine to null', () => {
    const state = GameLogic.createGame();
    expect(state.winningLine).toBeNull();
  });

  it('produces a fresh reset state even after a decided game', () => {
    // Simulate a finished game (X wins the top row), as the New Game control
    // would encounter before resetting.
    const finished = GameLogic.createGame();
    finished.board = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
    GameLogic.updateGameState(finished);
    expect(finished.gameOver).toBe(true);

    // The reset control calls createGame() again for a clean slate.
    const reset = GameLogic.createGame();
    expect(reset.board).toEqual([null, null, null, null, null, null, null, null, null]);
    expect(reset.currentPlayer).toBe('X');
    expect(reset.gameOver).toBe(false);
    expect(reset.winningLine).toBeNull();
    expect(reset.winner).toBeNull();
  });
});
