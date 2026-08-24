// AC#9: The test suite runs and passes from the repo root, and the command
// used is recorded in the run's evidence.
//
// This smoke test proves the Jest suite can load the GameLogic module and
// exercise every public function end-to-end. If `npx jest` (run from the repo
// root) can import this module and these assertions pass, the suite runs and
// passes from the repo root — the evidence AC#9 requires.
//
// GameLogic is a CommonJS module (games/tictactoe/game.js) exported via
// module.exports, imported here by its relative path from the repo root.

const GameLogic = require('../../games/tictactoe/game.js');

describe('AC#9: Jest suite runs and passes from the repo root', () => {
  it('loads the GameLogic module and exposes every public function', () => {
    expect(GameLogic).toBeDefined();
    expect(typeof GameLogic.createGame).toBe('function');
    expect(typeof GameLogic.isValidMove).toBe('function');
    expect(typeof GameLogic.makeMove).toBe('function');
    expect(typeof GameLogic.getWinningLines).toBe('function');
    expect(typeof GameLogic.checkWinner).toBe('function');
    expect(typeof GameLogic.isBoardFull).toBe('function');
    expect(typeof GameLogic.updateGameState).toBe('function');
  });

  it('createGame returns a fresh empty board with X to move', () => {
    const game = GameLogic.createGame();
    expect(game.board).toEqual(Array(9).fill(null));
    expect(game.currentPlayer).toBe('X');
    expect(game.winner).toBeNull();
    expect(game.winningLine).toBeNull();
    expect(game.gameOver).toBe(false);
  });

  it('getWinningLines returns exactly 8 lines', () => {
    const lines = GameLogic.getWinningLines();
    expect(lines).toHaveLength(8);
  });

  it('runs a full winning game through every function without error', () => {
    const game = GameLogic.createGame();

    // X: 0, O: 3, X: 1, O: 4, X: 2 -> X wins on the top row.
    expect(GameLogic.isValidMove(game, 0)).toBe(true);
    expect(GameLogic.makeMove(game, 0)).toBe(true); // X
    expect(GameLogic.updateGameState(game)).toBe('continue');
    expect(game.currentPlayer).toBe('O');

    GameLogic.makeMove(game, 3); // O
    GameLogic.updateGameState(game);
    GameLogic.makeMove(game, 1); // X
    GameLogic.updateGameState(game);
    GameLogic.makeMove(game, 4); // O
    GameLogic.updateGameState(game);
    GameLogic.makeMove(game, 2); // X wins

    expect(GameLogic.updateGameState(game)).toBe('winner');
    expect(game.winner).toBe('X');
    expect(game.winningLine).toEqual([0, 1, 2]);
    expect(game.gameOver).toBe(true);

    // Occupied-cell and post-game-over rejections both short-circuit.
    expect(GameLogic.makeMove(game, 6)).toBe(false);
  });

  it('detects a draw on a full, winner-less board', () => {
    const game = GameLogic.createGame();
    game.board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    game.currentPlayer = 'X';

    expect(GameLogic.isBoardFull(game)).toBe(true);
    expect(GameLogic.checkWinner(game)).toBeNull();
    expect(GameLogic.updateGameState(game)).toBe('draw');
    expect(game.gameOver).toBe(true);
    expect(game.winner).toBeNull();
  });
});
