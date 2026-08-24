// Game constants
const WINNING_COMBINATIONS = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6]
];

/**
 * Create a new game state
 * @returns {Object} Initial game state with empty board
 */
function createGame() {
    return {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameOver: false,
        winner: null,
        winningLine: null
    };
}

/**
 * Check if a position is valid and empty
 * @param {Array} board - The game board
 * @param {number} index - The cell index (0-8)
 * @returns {boolean} True if the position is valid and empty
 */
function isValidMove(board, index) {
    return index >= 0 && index < 9 && board[index] === '';
}

/**
 * Check for a winner
 * @param {Array} board - The game board
 * @returns {Object|null} Object with winner and line if there's a winner, null otherwise
 */
function checkWinner(board) {
    for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], line: combination };
        }
    }
    return null;
}

/**
 * Check if the board is full
 * @param {Array} board - The game board
 * @returns {boolean} True if the board is full
 */
function isBoardFull(board) {
    return board.every(cell => cell !== '');
}

/**
 * Check if the game is a draw
 * @param {Array} board - The game board
 * @returns {boolean} True if the board is full and there's no winner
 */
function isDraw(board) {
    return isBoardFull(board) && !checkWinner(board);
}

/**
 * Make a move on the board
 * @param {Object} game - The game state
 * @param {number} index - The cell index (0-8)
 * @returns {Object} Updated game state
 */
function makeMove(game, index) {
    // If game is over or move is invalid, return unchanged
    if (game.gameOver || !isValidMove(game.board, index)) {
        return game;
    }

    // Create new board with the move
    const newBoard = [...game.board];
    newBoard[index] = game.currentPlayer;

    // Check for winner
    const winnerResult = checkWinner(newBoard);
    if (winnerResult) {
        return {
            ...game,
            board: newBoard,
            winner: winnerResult.winner,
            winningLine: winnerResult.line,
            gameOver: true
        };
    }

    // Check for draw
    if (isBoardFull(newBoard)) {
        return {
            ...game,
            board: newBoard,
            gameOver: true
        };
    }

    // Switch player
    const nextPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
    return {
        ...game,
        board: newBoard,
        currentPlayer: nextPlayer
    };
}

/**
 * Reset the game to initial state
 * @returns {Object} Initial game state
 */
function resetGame() {
    return createGame();
}

// Export functions for use in tests and UI
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createGame,
        isValidMove,
        checkWinner,
        isBoardFull,
        isDraw,
        makeMove,
        resetGame,
        WINNING_COMBINATIONS
    };
}
