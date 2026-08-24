// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
// Verifies isValidMove/makeMove return false on an occupied cell, leaving the
// board and currentPlayer unchanged and raising no error.
//
// Import root per spec: the module under test is imported from the `app` root
// (do NOT prefix with `src.`), matching every other subtask in this spec.

const GameLogic = require('app/games/tictactoe/game');

describe('Occupied cell rejection (AC#3)', () => {
  let game: any;

  beforeEach(() => {
    game = GameLogic.createGame();
    // Occupy cell 0 with the current player's mark (X).
    GameLogic.makeMove(game, 0);
  });

  test('isValidMove returns false for an already-occupied cell', () => {
    expect(GameLogic.isValidMove(game, 0)).toBe(false);
  });

  test('makeMove returns false when targeting an occupied cell', () => {
    const result = GameLogic.makeMove(game, 0);
    expect(result).toBe(false);
  });

  test('makeMove on an occupied cell leaves the board unchanged', () => {
    const boardBefore = [...game.board];
    GameLogic.makeMove(game, 0);
    expect(game.board).toEqual(boardBefore);
    // The originally-placed mark is still intact.
    expect(game.board[0]).toBe('X');
  });

  test('makeMove on an occupied cell does not pass the turn', () => {
    const playerBefore = game.currentPlayer;
    GameLogic.makeMove(game, 0);
    expect(game.currentPlayer).toBe(playerBefore);
  });

  test('rejecting an occupied-cell move raises no error', () => {
    expect(() => GameLogic.isValidMove(game, 0)).not.toThrow();
    expect(() => GameLogic.makeMove(game, 0)).not.toThrow();
  });
});
