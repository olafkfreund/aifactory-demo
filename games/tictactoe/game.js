// Winning combinations (indices for all 8 lines)
const WINNING_LINES = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal (top-left to bottom-right)
    [2, 4, 6]  // Diagonal (top-right to bottom-left)
];

// Create a new game state
function createGame() {
    return {
        board: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 'X',
        gameOver: false,
        winner: null,
        winningLine: null
    };
}

// Check for a winner and return {winner, line} or null
function checkWinner(board) {
    for (let line of WINNING_LINES) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], line };
        }
    }
    return null;
}

// Check for a draw
function checkDraw(board) {
    return board.every(cell => cell !== '');
}

// Make a move on the board
function makeMove(game, index) {
    // If game is over or cell is occupied, return false (invalid move)
    if (game.gameOver || game.board[index]) {
        return false;
    }

    // Place the mark
    game.board[index] = game.currentPlayer;

    // Check for winner
    const result = checkWinner(game.board);
    if (result) {
        game.gameOver = true;
        game.winner = result.winner;
        game.winningLine = result.line;
        return true;
    }

    // Check for draw
    if (checkDraw(game.board)) {
        game.gameOver = true;
        return true;
    }

    // Switch player
    game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
    return true;
}

// Reset the game
function resetGame(game) {
    game.board = ['', '', '', '', '', '', '', '', ''];
    game.currentPlayer = 'X';
    game.gameOver = false;
    game.winner = null;
    game.winningLine = null;
    return game;
}

// Export for Node.js and browsers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WINNING_LINES,
        createGame,
        checkWinner,
        checkDraw,
        makeMove,
        resetGame
    };
}
