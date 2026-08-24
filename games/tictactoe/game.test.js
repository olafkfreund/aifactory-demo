const GameLogic = require('./game.js');

describe('Tic Tac Toe Game Logic', () => {
    let game;

    beforeEach(() => {
        game = GameLogic.createGame();
    });

    describe('Game Initialization', () => {
        test('should create a new game with empty board', () => {
            expect(game.board).toEqual(Array(9).fill(null));
            expect(game.currentPlayer).toBe('X');
            expect(game.winner).toBeNull();
            expect(game.gameOver).toBe(false);
        });
    });

    describe('Move Validation', () => {
        test('should allow move on empty cell', () => {
            const result = GameLogic.makeMove(game, 0);
            expect(result).toBe(true);
            expect(game.board[0]).toBe('X');
        });

        test('should reject move on occupied cell', () => {
            GameLogic.makeMove(game, 0);
            const result = GameLogic.makeMove(game, 0);
            expect(result).toBe(false);
        });

        test('should reject move after game is over (winner)', () => {
            // X wins on top row
            GameLogic.makeMove(game, 0); // X
            GameLogic.makeMove(game, 3); // O
            GameLogic.makeMove(game, 1); // X
            GameLogic.makeMove(game, 4); // O
            GameLogic.makeMove(game, 2); // X wins
            GameLogic.updateGameState(game);

            expect(game.gameOver).toBe(true);
            const result = GameLogic.makeMove(game, 6);
            expect(result).toBe(false);
        });

        test('should reject move after game is over (draw)', () => {
            // Create a draw game state
            game.board = ['X', 'O', 'X', 'O', 'O', 'X', 'O', 'X', 'O'];
            game.gameOver = true;

            const result = GameLogic.makeMove(game, 0);
            expect(result).toBe(false);
        });
    });

    describe('Turn Management', () => {
        test('should start with X to move', () => {
            expect(game.currentPlayer).toBe('X');
        });

        test('should alternate turns between X and O', () => {
            GameLogic.makeMove(game, 0);
            GameLogic.updateGameState(game);
            expect(game.currentPlayer).toBe('O');

            GameLogic.makeMove(game, 1);
            GameLogic.updateGameState(game);
            expect(game.currentPlayer).toBe('X');
        });
    });

    describe('Win Detection - Rows', () => {
        test('should detect win on top row (0, 1, 2)', () => {
            game.board = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
            game.currentPlayer = 'X';
            const result = GameLogic.checkWinner(game);
            expect(result.winner).toBe('X');
            expect(result.winningLine).toEqual([0, 1, 2]);
        });

        test('should detect win on middle row (3, 4, 5)', () => {
            game.board = [null, 'O', 'O', 'X', 'X', 'X', null, null, null];
            game.currentPlayer = 'X';
            const result = GameLogic.checkWinner(game);
            expect(result.winner).toBe('X');
            expect(result.winningLine).toEqual([3, 4, 5]);
        });

        test('should detect win on bottom row (6, 7, 8)', () => {
            game.board = ['O', null, 'O', null, null, null, 'X', 'X', 'X'];
            game.currentPlayer = 'X';
            const result = GameLogic.checkWinner(game);
            expect(result.winner).toBe('X');
            expect(result.winningLine).toEqual([6, 7, 8]);
        });
    });

    describe('Win Detection - Columns', () => {
        test('should detect win on left column (0, 3, 6)', () => {
            game.board = ['X', 'O', 'O', 'X', 'O', null, 'X', null, null];
            game.currentPlayer = 'X';
            const result = GameLogic.checkWinner(game);
            expect(result.winner).toBe('X');
            expect(result.winningLine).toEqual([0, 3, 6]);
        });

        test('should detect win on middle column (1, 4, 7)', () => {
            game.board = ['O', 'X', 'O', 'O', 'X', null, null, 'X', null];
            game.currentPlayer = 'X';
            const result = GameLogic.checkWinner(game);
            expect(result.winner).toBe('X');
            expect(result.winningLine).toEqual([1, 4, 7]);
        });

        test('should detect win on right column (2, 5, 8)', () => {
            game.board = ['O', null, 'X', 'O', null, 'X', null, 'O', 'X'];
            game.currentPlayer = 'X';
            const result = GameLogic.checkWinner(game);
            expect(result.winner).toBe('X');
            expect(result.winningLine).toEqual([2, 5, 8]);
        });
    });

    describe('Win Detection - Diagonals', () => {
        test('should detect win on main diagonal (0, 4, 8)', () => {
            game.board = ['X', 'O', 'O', null, 'X', 'O', null, null, 'X'];
            game.currentPlayer = 'X';
            const result = GameLogic.checkWinner(game);
            expect(result.winner).toBe('X');
            expect(result.winningLine).toEqual([0, 4, 8]);
        });

        test('should detect win on anti-diagonal (2, 4, 6)', () => {
            game.board = ['O', null, 'X', 'O', 'X', null, 'X', null, 'O'];
            game.currentPlayer = 'X';
            const result = GameLogic.checkWinner(game);
            expect(result.winner).toBe('X');
            expect(result.winningLine).toEqual([2, 4, 6]);
        });
    });

    describe('Draw Detection', () => {
        test('should detect draw when board is full with no winner', () => {
            game.board = ['X', 'O', 'X', 'O', 'O', 'X', 'O', 'X', 'O'];
            const isFull = GameLogic.isBoardFull(game);
            expect(isFull).toBe(true);
            const result = GameLogic.checkWinner(game);
            expect(result).toBeNull();
        });

        test('should return draw status from updateGameState', () => {
            game.board = ['X', 'O', 'X', 'O', 'O', 'X', 'O', 'X', 'O'];
            game.currentPlayer = 'O';
            const result = GameLogic.updateGameState(game);
            expect(result).toBe('draw');
            expect(game.gameOver).toBe(true);
        });
    });

    describe('Game State Updates', () => {
        test('should update game state correctly after move when game continues', () => {
            GameLogic.makeMove(game, 0);
            const result = GameLogic.updateGameState(game);
            expect(result).toBe('continue');
            expect(game.gameOver).toBe(false);
            expect(game.currentPlayer).toBe('O');
        });

        test('should set gameOver to true when someone wins', () => {
            game.board = ['X', 'X', null, 'O', 'O', null, null, null, null];
            GameLogic.makeMove(game, 2);
            const result = GameLogic.updateGameState(game);
            expect(result).toBe('winner');
            expect(game.gameOver).toBe(true);
            expect(game.winner).toBe('X');
        });

        test('should record winning line when detected', () => {
            game.board = ['X', 'X', null, 'O', 'O', null, null, null, null];
            GameLogic.makeMove(game, 2);
            GameLogic.updateGameState(game);
            expect(game.winningLine).toEqual([0, 1, 2]);
        });
    });

    describe('Winning Lines Configuration', () => {
        test('should return all 8 winning lines', () => {
            const lines = GameLogic.getWinningLines();
            expect(lines.length).toBe(8);
            // Check for 3 rows
            expect(lines).toContainEqual([0, 1, 2]);
            expect(lines).toContainEqual([3, 4, 5]);
            expect(lines).toContainEqual([6, 7, 8]);
            // Check for 3 columns
            expect(lines).toContainEqual([0, 3, 6]);
            expect(lines).toContainEqual([1, 4, 7]);
            expect(lines).toContainEqual([2, 5, 8]);
            // Check for 2 diagonals
            expect(lines).toContainEqual([0, 4, 8]);
            expect(lines).toContainEqual([2, 4, 6]);
        });
    });

    describe('Full Game Scenarios', () => {
        test('should handle a complete game with X winning', () => {
            // X wins on diagonal
            GameLogic.makeMove(game, 0); // X at 0
            GameLogic.updateGameState(game);
            GameLogic.makeMove(game, 1); // O at 1
            GameLogic.updateGameState(game);
            GameLogic.makeMove(game, 4); // X at 4
            GameLogic.updateGameState(game);
            GameLogic.makeMove(game, 2); // O at 2
            GameLogic.updateGameState(game);
            GameLogic.makeMove(game, 8); // X at 8 - X wins on 0,4,8
            const result = GameLogic.updateGameState(game);

            expect(result).toBe('winner');
            expect(game.winner).toBe('X');
            expect(game.winningLine).toEqual([0, 4, 8]);
            expect(game.gameOver).toBe(true);
        });

        test('should handle a complete draw game', () => {
            // Create a draw board: no three in a row for either player
            // O | X | X
            // X | O | O
            // O | X | X
            game.board = ['O', 'X', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
            game.currentPlayer = 'X'; // After 8 moves, it should be X's turn

            const result = GameLogic.updateGameState(game);

            expect(result).toBe('draw');
            expect(game.gameOver).toBe(true);
            expect(game.winner).toBeNull();
        });

        test('should handle multiple games in sequence', () => {
            // First game
            GameLogic.makeMove(game, 0);
            GameLogic.updateGameState(game);
            GameLogic.makeMove(game, 1);
            GameLogic.updateGameState(game);
            GameLogic.makeMove(game, 3);
            GameLogic.updateGameState(game);
            GameLogic.makeMove(game, 4);
            GameLogic.updateGameState(game);
            GameLogic.makeMove(game, 6);
            GameLogic.updateGameState(game);

            expect(game.gameOver).toBe(true);

            // Reset for new game
            game = GameLogic.createGame();
            expect(game.board).toEqual(Array(9).fill(null));
            expect(game.gameOver).toBe(false);
            expect(game.winner).toBeNull();
        });
    });
});
