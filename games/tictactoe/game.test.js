const assert = require('assert');
const {
    createGame,
    isValidMove,
    checkWinner,
    isBoardFull,
    isDraw,
    makeMove,
    resetGame,
    WINNING_COMBINATIONS
} = require('./game.js');

let testsPassed = 0;
let testsFailed = 0;

// Test helper
function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
        testsPassed++;
    } catch (error) {
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
        testsFailed++;
    }
}

// ===== Game Initialization Tests =====
test('createGame initializes empty board', () => {
    const game = createGame();
    assert.deepEqual(game.board, Array(9).fill(''));
});

test('createGame sets current player to X', () => {
    const game = createGame();
    assert.strictEqual(game.currentPlayer, 'X');
});

test('createGame sets gameOver to false', () => {
    const game = createGame();
    assert.strictEqual(game.gameOver, false);
});

test('createGame sets winner to null', () => {
    const game = createGame();
    assert.strictEqual(game.winner, null);
});

// ===== Valid Move Tests =====
test('isValidMove returns true for empty cells', () => {
    const board = Array(9).fill('');
    assert.strictEqual(isValidMove(board, 0), true);
    assert.strictEqual(isValidMove(board, 4), true);
    assert.strictEqual(isValidMove(board, 8), true);
});

test('isValidMove returns false for occupied cells', () => {
    const board = Array(9).fill('');
    board[0] = 'X';
    board[4] = 'O';
    assert.strictEqual(isValidMove(board, 0), false);
    assert.strictEqual(isValidMove(board, 4), false);
});

test('isValidMove returns false for invalid indices', () => {
    const board = Array(9).fill('');
    assert.strictEqual(isValidMove(board, -1), false);
    assert.strictEqual(isValidMove(board, 9), false);
    assert.strictEqual(isValidMove(board, 10), false);
});

// ===== Move Making Tests =====
test('makeMove places X on empty cell', () => {
    let game = createGame();
    game = makeMove(game, 0);
    assert.strictEqual(game.board[0], 'X');
});

test('makeMove switches player after valid move', () => {
    let game = createGame();
    game = makeMove(game, 0);
    assert.strictEqual(game.currentPlayer, 'O');
});

test('makeMove ignores occupied cell', () => {
    let game = createGame();
    game = makeMove(game, 0);  // X plays at 0
    const boardBefore = [...game.board];
    const playerBefore = game.currentPlayer;
    game = makeMove(game, 0);  // Try to play at 0 again
    assert.deepEqual(game.board, boardBefore);
    assert.strictEqual(game.currentPlayer, playerBefore);
});

test('makeMove ignores moves after game over', () => {
    // Win scenario: X wins with top row
    let game = createGame();
    game = makeMove(game, 0);  // X: 0
    game = makeMove(game, 3);  // O: 3
    game = makeMove(game, 1);  // X: 1
    game = makeMove(game, 4);  // O: 4
    game = makeMove(game, 2);  // X: 2 (X wins)
    assert.strictEqual(game.gameOver, true);

    const boardBefore = [...game.board];
    game = makeMove(game, 5);  // Try to move after game over
    assert.deepEqual(game.board, boardBefore);
});

// ===== Winning Line Tests =====
test('Row 0 (0, 1, 2) detected as winning line', () => {
    const board = ['X', 'X', 'X', '', '', '', '', '', ''];
    const result = checkWinner(board);
    assert.strictEqual(result.winner, 'X');
    assert.deepEqual(result.line, [0, 1, 2]);
});

test('Row 1 (3, 4, 5) detected as winning line', () => {
    const board = ['', '', '', 'O', 'O', 'O', '', '', ''];
    const result = checkWinner(board);
    assert.strictEqual(result.winner, 'O');
    assert.deepEqual(result.line, [3, 4, 5]);
});

test('Row 2 (6, 7, 8) detected as winning line', () => {
    const board = ['', '', '', '', '', '', 'X', 'X', 'X'];
    const result = checkWinner(board);
    assert.strictEqual(result.winner, 'X');
    assert.deepEqual(result.line, [6, 7, 8]);
});

test('Column 0 (0, 3, 6) detected as winning line', () => {
    const board = ['X', '', '', 'X', '', '', 'X', '', ''];
    const result = checkWinner(board);
    assert.strictEqual(result.winner, 'X');
    assert.deepEqual(result.line, [0, 3, 6]);
});

test('Column 1 (1, 4, 7) detected as winning line', () => {
    const board = ['', 'O', '', '', 'O', '', '', 'O', ''];
    const result = checkWinner(board);
    assert.strictEqual(result.winner, 'O');
    assert.deepEqual(result.line, [1, 4, 7]);
});

test('Column 2 (2, 5, 8) detected as winning line', () => {
    const board = ['', '', 'X', '', '', 'X', '', '', 'X'];
    const result = checkWinner(board);
    assert.strictEqual(result.winner, 'X');
    assert.deepEqual(result.line, [2, 5, 8]);
});

test('Diagonal 1 (0, 4, 8) detected as winning line', () => {
    const board = ['O', '', '', '', 'O', '', '', '', 'O'];
    const result = checkWinner(board);
    assert.strictEqual(result.winner, 'O');
    assert.deepEqual(result.line, [0, 4, 8]);
});

test('Diagonal 2 (2, 4, 6) detected as winning line', () => {
    const board = ['', '', 'X', '', 'X', '', 'X', '', ''];
    const result = checkWinner(board);
    assert.strictEqual(result.winner, 'X');
    assert.deepEqual(result.line, [2, 4, 6]);
});

test('No winner returns null', () => {
    const board = ['X', 'O', '', '', '', '', '', '', ''];
    const result = checkWinner(board);
    assert.strictEqual(result, null);
});

// ===== Game End Tests =====
test('Draw is detected when board is full with no winner', () => {
    const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    assert.strictEqual(isDraw(board), true);
});

test('isBoardFull returns true for full board', () => {
    const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    assert.strictEqual(isBoardFull(board), true);
});

test('isBoardFull returns false for partial board', () => {
    const board = ['X', '', '', '', '', '', '', '', ''];
    assert.strictEqual(isBoardFull(board), false);
});

test('Game ends on winner detection', () => {
    let game = createGame();
    game = makeMove(game, 0);  // X: 0
    game = makeMove(game, 3);  // O: 3
    game = makeMove(game, 1);  // X: 1
    game = makeMove(game, 4);  // O: 4
    game = makeMove(game, 2);  // X: 2 (X wins)
    assert.strictEqual(game.gameOver, true);
    assert.strictEqual(game.winner, 'X');
});

test('Game ends on draw', () => {
    // Create a draw scenario
    let game = createGame();
    game = makeMove(game, 0);  // X: 0
    game = makeMove(game, 1);  // O: 1
    game = makeMove(game, 2);  // X: 2
    game = makeMove(game, 3);  // O: 3
    game = makeMove(game, 5);  // X: 5
    game = makeMove(game, 4);  // O: 4
    game = makeMove(game, 6);  // X: 6
    game = makeMove(game, 8);  // O: 8
    game = makeMove(game, 7);  // X: 7 (board full, no winner)
    assert.strictEqual(game.gameOver, true);
    assert.strictEqual(game.winner, null);
});

// ===== Reset Game Tests =====
test('resetGame returns to initial state', () => {
    let game = createGame();
    game = makeMove(game, 0);
    game = makeMove(game, 1);
    game = resetGame();

    const initialGame = createGame();
    assert.deepEqual(game, initialGame);
});

test('resetGame clears board after moves', () => {
    let game = createGame();
    game = makeMove(game, 0);
    game = makeMove(game, 1);
    game = resetGame();

    assert.deepEqual(game.board, Array(9).fill(''));
});

// ===== Complex Game Scenario Tests =====
test('Complex game scenario: X wins row 1', () => {
    let game = createGame();
    game = makeMove(game, 3);  // X: 3
    game = makeMove(game, 0);  // O: 0
    game = makeMove(game, 4);  // X: 4
    game = makeMove(game, 1);  // O: 1
    game = makeMove(game, 5);  // X: 5 (X wins row 1)

    assert.strictEqual(game.gameOver, true);
    assert.strictEqual(game.winner, 'X');
    assert.deepEqual(game.winningLine, [3, 4, 5]);
});

test('Complex game scenario: O wins column', () => {
    let game = createGame();
    game = makeMove(game, 0);  // X: 0
    game = makeMove(game, 1);  // O: 1
    game = makeMove(game, 2);  // X: 2
    game = makeMove(game, 4);  // O: 4
    game = makeMove(game, 3);  // X: 3
    game = makeMove(game, 7);  // O: 7 (O wins column 1)

    assert.strictEqual(game.gameOver, true);
    assert.strictEqual(game.winner, 'O');
    assert.deepEqual(game.winningLine, [1, 4, 7]);
});

// ===== Test Summary =====
console.log('\n' + '='.repeat(40));
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log('='.repeat(40));

process.exit(testsFailed > 0 ? 1 : 0);
