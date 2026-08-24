// AC#8: test_game.py/game.test.js covers every function above, including all 8
// winning lines, the draw, the occupied-cell rejection, and the
// move-after-game-over rejection.
//
// This single suite exercises EVERY GameLogic function
// (createGame, isValidMove, makeMove, getWinningLines, checkWinner,
// isBoardFull, updateGameState) plus all 8 winning lines, the draw,
// the occupied-cell rejection, and the move-after-game-over rejection.
//
// Target: games/tictactoe/game.js::GameLogic (CommonJS module.exports).

// eslint-disable-next-line @typescript-eslint/no-var-requires
const GameLogic = require('../../games/tictactoe/game.js');

type GameState = {
  board: (string | null)[];
  currentPlayer: string;
  winner: string | null;
  winningLine: number[] | null;
  gameOver: boolean;
};

describe('GameLogic — comprehensive coverage (AC#8)', () => {
  let game: GameState;

  beforeEach(() => {
    game = GameLogic.createGame();
  });

  describe('createGame', () => {
    it('returns an empty 9-cell board with X to move and no winner', () => {
      expect(game.board).toEqual(Array(9).fill(null));
      expect(game.board.length).toBe(9);
      expect(game.currentPlayer).toBe('X');
      expect(game.winner).toBeNull();
      expect(game.winningLine).toBeNull();
      expect(game.gameOver).toBe(false);
    });
  });

  describe('getWinningLines', () => {
    it('returns exactly the 8 winning lines (3 rows, 3 columns, 2 diagonals)', () => {
      const lines = GameLogic.getWinningLines();
      expect(lines.length).toBe(8);
      expect(lines).toContainEqual([0, 1, 2]);
      expect(lines).toContainEqual([3, 4, 5]);
      expect(lines).toContainEqual([6, 7, 8]);
      expect(lines).toContainEqual([0, 3, 6]);
      expect(lines).toContainEqual([1, 4, 7]);
      expect(lines).toContainEqual([2, 5, 8]);
      expect(lines).toContainEqual([0, 4, 8]);
      expect(lines).toContainEqual([2, 4, 6]);
    });
  });

  describe('isValidMove', () => {
    it('returns true for an empty cell during play', () => {
      expect(GameLogic.isValidMove(game, 0)).toBe(true);
    });
  });

  describe('makeMove', () => {
    it('writes the current player mark on an empty cell and returns true', () => {
      const result = GameLogic.makeMove(game, 4);
      expect(result).toBe(true);
      expect(game.board[4]).toBe('X');
    });
  });

  describe('updateGameState — turn passing', () => {
    it('passes the turn from X to O when the game continues', () => {
      GameLogic.makeMove(game, 0);
      const status = GameLogic.updateGameState(game);
      expect(status).toBe('continue');
      expect(game.currentPlayer).toBe('O');
      expect(game.gameOver).toBe(false);
    });
  });

  // All 8 winning lines checked via checkWinner.
  describe('checkWinner — all 8 winning lines', () => {
    const winCases: Array<{ name: string; board: (string | null)[]; line: number[] }> = [
      { name: 'top row', board: ['X', 'X', 'X', 'O', 'O', null, null, null, null], line: [0, 1, 2] },
      { name: 'middle row', board: [null, 'O', 'O', 'X', 'X', 'X', null, null, null], line: [3, 4, 5] },
      { name: 'bottom row', board: ['O', null, 'O', null, null, null, 'X', 'X', 'X'], line: [6, 7, 8] },
      { name: 'left column', board: ['X', 'O', 'O', 'X', 'O', null, 'X', null, null], line: [0, 3, 6] },
      { name: 'middle column', board: ['O', 'X', 'O', 'O', 'X', null, null, 'X', null], line: [1, 4, 7] },
      { name: 'right column', board: ['O', null, 'X', 'O', null, 'X', null, 'O', 'X'], line: [2, 5, 8] },
      { name: 'main diagonal', board: ['X', 'O', 'O', null, 'X', 'O', null, null, 'X'], line: [0, 4, 8] },
      { name: 'anti-diagonal', board: ['O', null, 'X', 'O', 'X', null, 'X', null, 'O'], line: [2, 4, 6] },
    ];

    it.each(winCases)('detects a win on the $name ($line)', ({ board, line }) => {
      game.board = board;
      const result = GameLogic.checkWinner(game);
      expect(result).not.toBeNull();
      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual(line);
    });

    it('covers all 8 lines exactly once', () => {
      expect(winCases.length).toBe(8);
    });

    it('returns null when there is no winner', () => {
      game.board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(GameLogic.checkWinner(game)).toBeNull();
    });
  });

  describe('isBoardFull + updateGameState — draw', () => {
    it('reports a full board and a draw with gameOver true and no winner', () => {
      // Full board with no three-in-a-row for either player.
      game.board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      game.currentPlayer = 'X';
      expect(GameLogic.isBoardFull(game)).toBe(true);

      const status = GameLogic.updateGameState(game);
      expect(status).toBe('draw');
      expect(game.gameOver).toBe(true);
      expect(game.winner).toBeNull();
    });
  });

  describe('occupied-cell rejection (AC#3)', () => {
    it('rejects a move on an occupied cell without changing board or turn', () => {
      GameLogic.makeMove(game, 0);
      GameLogic.updateGameState(game); // X -> O
      expect(game.board[0]).toBe('X');
      expect(game.currentPlayer).toBe('O');

      expect(GameLogic.isValidMove(game, 0)).toBe(false);
      const result = GameLogic.makeMove(game, 0);
      expect(result).toBe(false);
      expect(game.board[0]).toBe('X'); // still X, not overwritten
      expect(game.currentPlayer).toBe('O'); // turn unchanged
    });
  });

  describe('move-after-game-over rejection (AC#6)', () => {
    it('rejects any move once gameOver is true (after a win)', () => {
      // X wins the top row.
      GameLogic.makeMove(game, 0); // X
      GameLogic.updateGameState(game);
      GameLogic.makeMove(game, 3); // O
      GameLogic.updateGameState(game);
      GameLogic.makeMove(game, 1); // X
      GameLogic.updateGameState(game);
      GameLogic.makeMove(game, 4); // O
      GameLogic.updateGameState(game);
      GameLogic.makeMove(game, 2); // X wins
      const status = GameLogic.updateGameState(game);

      expect(status).toBe('winner');
      expect(game.gameOver).toBe(true);
      expect(game.winner).toBe('X');
      expect(game.winningLine).toEqual([0, 1, 2]);

      expect(GameLogic.isValidMove(game, 6)).toBe(false);
      expect(GameLogic.makeMove(game, 6)).toBe(false);
      expect(game.board[6]).toBeNull();
    });
  });
});
