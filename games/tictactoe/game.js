// Game logic - exported for both browser and Node.js testing
const GameLogic = {
    // Initialize a new game state
    createGame() {
        return {
            board: Array(9).fill(null),
            currentPlayer: 'X',
            winner: null,
            winningLine: null,
            gameOver: false
        };
    },

    // Check if a position is valid
    isValidMove(gameState, position) {
        if (gameState.gameOver) return false;
        if (gameState.board[position] !== null) return false;
        return true;
    },

    // Make a move on the board
    makeMove(gameState, position) {
        if (!this.isValidMove(gameState, position)) {
            return false;
        }
        gameState.board[position] = gameState.currentPlayer;
        return true;
    },

    // Get all winning line combinations (8 lines)
    getWinningLines() {
        return [
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
    },

    // Check for a winner and return the winning line if found
    checkWinner(gameState) {
        const lines = this.getWinningLines();
        for (let line of lines) {
            const [a, b, c] = line;
            if (gameState.board[a] &&
                gameState.board[a] === gameState.board[b] &&
                gameState.board[a] === gameState.board[c]) {
                return {
                    winner: gameState.board[a],
                    winningLine: line
                };
            }
        }
        return null;
    },

    // Check if the board is full (draw)
    isBoardFull(gameState) {
        return gameState.board.every(cell => cell !== null);
    },

    // Update game state after a move
    updateGameState(gameState) {
        const result = this.checkWinner(gameState);
        if (result) {
            gameState.winner = result.winner;
            gameState.winningLine = result.winningLine;
            gameState.gameOver = true;
            return 'winner';
        }
        if (this.isBoardFull(gameState)) {
            gameState.gameOver = true;
            return 'draw';
        }
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        return 'continue';
    }
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameLogic;
}
