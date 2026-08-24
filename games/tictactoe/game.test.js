const { WINNING_LINES, createGame, checkWinner, checkDraw, makeMove, resetGame } = require('./game.js');

describe('Tic Tac Toe Game', () => {
    let game;

    beforeEach(() => {
        game = createGame();
    });

    describe('Game initialization', () => {
        test('should create an empty board', () => {
            expect(game.board).toEqual(['', '', '', '', '', '', '', '', '']);
        });

        test('should start with X as current player', () => {
            expect(game.currentPlayer).toBe('X');
        });

        test('should not be game over at start', () => {
            expect(game.gameOver).toBe(false);
        });

        test('should have no winner at start', () => {
            expect(game.winner).toBeNull();
        });
    });

    describe('makeMove function', () => {
        test('should place X on an empty cell', () => {
            const result = makeMove(game, 0);
            expect(result).toBe(true);
            expect(game.board[0]).toBe('X');
        });

        test('should switch to O after X moves', () => {
            makeMove(game, 0);
            expect(game.currentPlayer).toBe('O');
        });

        test('should not allow move on occupied cell', () => {
            makeMove(game, 0);
            const result = makeMove(game, 0);
            expect(result).toBe(false);
            expect(game.board[0]).toBe('X');
        });

        test('should not allow move after game is over', () => {
            // Set up a winning position for X
            game.board = ['X', 'X', 'X', '', '', '', '', '', ''];
            game.gameOver = true;
            const result = makeMove(game, 3);
            expect(result).toBe(false);
        });
    });

    describe('Win detection - Rows', () => {
        test('should detect X win on top row (0-1-2)', () => {
            makeMove(game, 0); // X
            makeMove(game, 3); // O
            makeMove(game, 1); // X
            makeMove(game, 4); // O
            makeMove(game, 2); // X - WIN
            expect(game.winner).toBe('X');
            expect(game.winningLine).toEqual([0, 1, 2]);
            expect(game.gameOver).toBe(true);
        });

        test('should detect O win on middle row (3-4-5)', () => {
            makeMove(game, 0); // X
            makeMove(game, 3); // O
            makeMove(game, 1); // X
            makeMove(game, 4); // O
            makeMove(game, 6); // X
            makeMove(game, 5); // O - WIN
            expect(game.winner).toBe('O');
            expect(game.winningLine).toEqual([3, 4, 5]);
            expect(game.gameOver).toBe(true);
        });

        test('should detect X win on bottom row (6-7-8)', () => {
            makeMove(game, 6); // X
            makeMove(game, 0); // O
            makeMove(game, 7); // X
            makeMove(game, 1); // O
            makeMove(game, 8); // X - WIN
            expect(game.winner).toBe('X');
            expect(game.winningLine).toEqual([6, 7, 8]);
            expect(game.gameOver).toBe(true);
        });
    });

    describe('Win detection - Columns', () => {
        test('should detect X win on left column (0-3-6)', () => {
            makeMove(game, 0); // X
            makeMove(game, 1); // O
            makeMove(game, 3); // X
            makeMove(game, 2); // O
            makeMove(game, 6); // X - WIN
            expect(game.winner).toBe('X');
            expect(game.winningLine).toEqual([0, 3, 6]);
            expect(game.gameOver).toBe(true);
        });

        test('should detect O win on middle column (1-4-7)', () => {
            makeMove(game, 0); // X
            makeMove(game, 1); // O
            makeMove(game, 3); // X
            makeMove(game, 4); // O
            makeMove(game, 2); // X
            makeMove(game, 7); // O - WIN
            expect(game.winner).toBe('O');
            expect(game.winningLine).toEqual([1, 4, 7]);
            expect(game.gameOver).toBe(true);
        });

        test('should detect X win on right column (2-5-8)', () => {
            makeMove(game, 2); // X
            makeMove(game, 0); // O
            makeMove(game, 5); // X
            makeMove(game, 1); // O
            makeMove(game, 8); // X - WIN
            expect(game.winner).toBe('X');
            expect(game.winningLine).toEqual([2, 5, 8]);
            expect(game.gameOver).toBe(true);
        });
    });

    describe('Win detection - Diagonals', () => {
        test('should detect X win on main diagonal (0-4-8)', () => {
            makeMove(game, 0); // X
            makeMove(game, 1); // O
            makeMove(game, 4); // X
            makeMove(game, 2); // O
            makeMove(game, 8); // X - WIN
            expect(game.winner).toBe('X');
            expect(game.winningLine).toEqual([0, 4, 8]);
            expect(game.gameOver).toBe(true);
        });

        test('should detect O win on anti-diagonal (2-4-6)', () => {
            makeMove(game, 0); // X
            makeMove(game, 2); // O
            makeMove(game, 1); // X
            makeMove(game, 4); // O
            makeMove(game, 3); // X
            makeMove(game, 6); // O - WIN
            expect(game.winner).toBe('O');
            expect(game.winningLine).toEqual([2, 4, 6]);
            expect(game.gameOver).toBe(true);
        });
    });

    describe('Draw detection', () => {
        test('should detect a draw (full board, no winner)', () => {
            // X O X
            // O X X
            // O X O
            game.board = ['X', 'O', 'X', 'O', 'X', 'X', 'O', 'X', 'O'];
            expect(checkDraw(game.board)).toBe(true);
        });

        test('should detect game over as draw with full board', () => {
            makeMove(game, 0); // X
            makeMove(game, 1); // O
            makeMove(game, 2); // X
            makeMove(game, 3); // O
            makeMove(game, 5); // X
            makeMove(game, 4); // O
            makeMove(game, 6); // X
            makeMove(game, 8); // O
            makeMove(game, 7); // X - Draw
            expect(game.gameOver).toBe(true);
            expect(game.winner).toBeNull();
        });

        test('should not allow moves after draw', () => {
            // Set up a draw board
            game.board = ['X', 'O', 'X', 'O', 'X', 'X', 'O', 'X', 'O'];
            game.gameOver = true;
            const result = makeMove(game, 0);
            expect(result).toBe(false);
        });
    });

    describe('checkWinner function', () => {
        test('should return null for empty board', () => {
            expect(checkWinner(game.board)).toBeNull();
        });

        test('should return null for incomplete lines', () => {
            game.board[0] = 'X';
            game.board[1] = 'X';
            expect(checkWinner(game.board)).toBeNull();
        });

        test('should find all 8 winning lines', () => {
            const lines = WINNING_LINES;
            expect(lines.length).toBe(8);

            // Test each winning line can be detected
            lines.forEach((line, idx) => {
                const testBoard = ['', '', '', '', '', '', '', '', ''];
                const [a, b, c] = line;
                testBoard[a] = 'X';
                testBoard[b] = 'X';
                testBoard[c] = 'X';
                const result = checkWinner(testBoard);
                expect(result).not.toBeNull();
                expect(result.winner).toBe('X');
                expect(result.line).toEqual(line);
            });
        });
    });

    describe('resetGame function', () => {
        test('should reset board to empty', () => {
            game.board[0] = 'X';
            game.board[4] = 'O';
            resetGame(game);
            expect(game.board).toEqual(['', '', '', '', '', '', '', '', '']);
        });

        test('should reset currentPlayer to X', () => {
            game.currentPlayer = 'O';
            resetGame(game);
            expect(game.currentPlayer).toBe('X');
        });

        test('should reset gameOver to false', () => {
            game.gameOver = true;
            resetGame(game);
            expect(game.gameOver).toBe(false);
        });

        test('should clear winner and winningLine', () => {
            game.winner = 'X';
            game.winningLine = [0, 1, 2];
            resetGame(game);
            expect(game.winner).toBeNull();
            expect(game.winningLine).toBeNull();
        });
    });

    describe('Integration tests', () => {
        test('full game sequence with X winning', () => {
            expect(game.currentPlayer).toBe('X');
            makeMove(game, 0); // X
            expect(game.currentPlayer).toBe('O');
            makeMove(game, 3); // O
            expect(game.currentPlayer).toBe('X');
            makeMove(game, 1); // X
            expect(game.currentPlayer).toBe('O');
            makeMove(game, 4); // O
            expect(game.gameOver).toBe(false);
            makeMove(game, 2); // X - WIN
            expect(game.gameOver).toBe(true);
            expect(game.winner).toBe('X');
            expect(game.winningLine).toEqual([0, 1, 2]);
        });

        test('no moves allowed after game ends', () => {
            // Create winning position
            game.board = ['X', 'X', 'X', '', '', '', '', '', ''];
            game.gameOver = true;
            game.winner = 'X';
            game.winningLine = [0, 1, 2];

            const result = makeMove(game, 3);
            expect(result).toBe(false);
            expect(game.board[3]).toBe('');
        });
    });
});
