// Test suite for Tic Tac Toe Game

const { TicTacToeGame, WINNING_LINES } = require('./game.js');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        testsFailed++;
        throw new Error(message);
    } else {
        console.log(`✓ PASS: ${message}`);
        testsPassed++;
    }
}

function test(name, fn) {
    console.log(`\n📝 Test: ${name}`);
    try {
        fn();
    } catch (e) {
        // Error already logged by assert
    }
}

// Test 1: Basic game initialization
test('Game initializes with empty board', () => {
    const game = new TicTacToeGame();
    assert(game.board.every(cell => cell === null), 'Board is empty');
    assert(game.currentPlayer === 'X', 'X starts first');
    assert(game.gameOver === false, 'Game is not over');
    assert(game.winner === null, 'No winner');
});

// Test 2: Valid move is accepted
test('Valid move is accepted and turn passes', () => {
    const game = new TicTacToeGame();
    const result = game.makeMove(0);
    assert(result === true, 'Move returns true');
    assert(game.board[0] === 'X', 'X placed at index 0');
    assert(game.currentPlayer === 'O', 'Turn passed to O');
});

// Test 3: Occupied cell is rejected
test('Occupied cell is rejected', () => {
    const game = new TicTacToeGame();
    game.makeMove(0);
    const result = game.makeMove(0);
    assert(result === false, 'Move returns false');
    assert(game.board[0] === 'X', 'X still at index 0');
    assert(game.currentPlayer === 'O', 'Turn did not pass');
});

// Test 4-11: Test all 8 winning lines
const winningCases = [
    {
        name: 'Row 1 win (0-1-2)',
        moves: [0, 3, 1, 4, 2],
        winner: 'X',
        winLine: [0, 1, 2]
    },
    {
        name: 'Row 2 win (3-4-5)',
        moves: [3, 0, 4, 1, 5],
        winner: 'X',
        winLine: [3, 4, 5]
    },
    {
        name: 'Row 3 win (6-7-8)',
        moves: [6, 0, 7, 1, 8],
        winner: 'X',
        winLine: [6, 7, 8]
    },
    {
        name: 'Column 1 win (0-3-6)',
        moves: [0, 1, 3, 2, 6],
        winner: 'X',
        winLine: [0, 3, 6]
    },
    {
        name: 'Column 2 win (1-4-7)',
        moves: [1, 0, 4, 2, 7],
        winner: 'X',
        winLine: [1, 4, 7]
    },
    {
        name: 'Column 3 win (2-5-8)',
        moves: [2, 0, 5, 1, 8],
        winner: 'X',
        winLine: [2, 5, 8]
    },
    {
        name: 'Diagonal 1 win (0-4-8)',
        moves: [0, 1, 4, 2, 8],
        winner: 'X',
        winLine: [0, 4, 8]
    },
    {
        name: 'Diagonal 2 win (2-4-6)',
        moves: [2, 0, 4, 1, 6],
        winner: 'X',
        winLine: [2, 4, 6]
    }
];

winningCases.forEach(({ name, moves, winner, winLine }) => {
    test(name, () => {
        const game = new TicTacToeGame();
        for (let i = 0; i < moves.length; i++) {
            game.makeMove(moves[i]);
        }
        assert(game.gameOver === true, 'Game is over');
        assert(game.winner === winner, `Winner is ${winner}`);
        assert(JSON.stringify(game.winningLine.sort((a, b) => a - b)) === JSON.stringify(winLine.sort((a, b) => a - b)), `Winning line is [${winLine}]`);
    });
});

// Test 12: Draw detection
test('Draw is detected when board is full with no winner', () => {
    const game = new TicTacToeGame();
    // X X O
    // O O X
    // X O X
    const moves = [0, 2, 1, 3, 5, 4, 6, 7, 8];
    for (const move of moves) {
        game.makeMove(move);
    }
    assert(game.gameOver === true, 'Game is over');
    assert(game.winner === null, 'No winner');
});

// Test 13: Move after game over is rejected
test('Move after game over is rejected', () => {
    const game = new TicTacToeGame();
    // Set up a winning position
    const moves = [0, 3, 1, 4, 2];
    for (const move of moves) {
        game.makeMove(move);
    }
    assert(game.gameOver === true, 'Game is over');
    const result = game.makeMove(5);
    assert(result === false, 'Move returns false');
    assert(game.board[5] === null, 'Move was not made');
});

// Test 14: New game resets state
test('Reset starts a new game', () => {
    const game = new TicTacToeGame();
    game.makeMove(0);
    game.makeMove(1);
    game.reset();
    assert(game.board.every(cell => cell === null), 'Board is empty');
    assert(game.currentPlayer === 'X', 'X starts first');
    assert(game.gameOver === false, 'Game is not over');
    assert(game.winner === null, 'No winner');
});

// Test 15: Verify all 8 winning lines are defined
test('All 8 winning lines are defined', () => {
    assert(WINNING_LINES.length === 8, '8 winning lines defined');
    const expectedLines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]              // diagonals
    ];
    expectedLines.forEach((line, i) => {
        const found = WINNING_LINES.some(l => JSON.stringify(l) === JSON.stringify(line));
        assert(found, `Winning line [${line}] is defined`);
    });
});

// Print summary
console.log('\n' + '='.repeat(50));
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log('='.repeat(50));

if (testsFailed > 0) {
    process.exit(1);
}
