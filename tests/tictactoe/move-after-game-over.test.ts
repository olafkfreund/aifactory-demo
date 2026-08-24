// AC#6: Play stops once the game is decided; further clicks do nothing.
// Verify isValidMove/makeMove return false once gameOver is true, so moves
// after a win or draw are ignored.
//
// The module under test is games/tictactoe/game.js, exported via module.exports
// as the GameLogic object. It is imported here relative to the repo root.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const GameLogic = require('../../games/tictactoe/game.js');

describe('GameLogic move-after-game-over rejection (AC#6)', () => {
  describe('after a win (gameOver === true)', () => {
    it('isValidMove returns false for an otherwise-empty cell', () => {
      const game = GameLogic.createGame();
      // X wins the top row.
      game.board = ['X', 'X', 'X', null, null, null, null, null, null];
      GameLogic.updateGameState(game);

      expect(game.gameOver).toBe(true);
      // Cell 4 is empty but play has stopped.
      expect(GameLogic.isValidMove(game, 4)).toBe(false);
    });

    it('makeMove returns false and leaves the board unchanged', () => {
      const game = GameLogic.createGame();
      game.board = ['X', 'X', 'X', null, null, null, null, null, null];
      GameLogic.updateGameState(game);

      const boardBefore = [...game.board];
      const result = GameLogic.makeMove(game, 4);

      expect(result).toBe(false);
      expect(game.board).toEqual(boardBefore);
    });
  });

  describe('after a draw (gameOver === true)', () => {
    it('isValidMove returns false once the board is a full draw', () => {
      const game = GameLogic.createGame();
      // Full board with no winner.
      game.board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      GameLogic.updateGameState(game);

      expect(game.gameOver).toBe(true);
      expect(game.winner).toBeNull();
      expect(GameLogic.isValidMove(game, 0)).toBe(false);
    });

    it('makeMove returns false without raising an error after a draw', () => {
      const game = GameLogic.createGame();
      game.board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      GameLogic.updateGameState(game);

      const boardBefore = [...game.board];
      const result = GameLogic.makeMove(game, 0);

      expect(result).toBe(false);
      expect(game.board).toEqual(boardBefore);
    });
  });

  it('isValidMove returns false for any position when gameOver is set directly', () => {
    const game = GameLogic.createGame();
    game.gameOver = true;

    for (let position = 0; position < 9; position++) {
      expect(GameLogic.isValidMove(game, position)).toBe(false);
    }
  });
});
