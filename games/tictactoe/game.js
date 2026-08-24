// Tic Tac Toe Game Logic

const WINNING_LINES = [
    [0, 1, 2], // row 1
    [3, 4, 5], // row 2
    [6, 7, 8], // row 3
    [0, 3, 6], // col 1
    [1, 4, 7], // col 2
    [2, 5, 8], // col 3
    [0, 4, 8], // diagonal 1
    [2, 4, 6]  // diagonal 2
];

class TicTacToeGame {
    constructor() {
        this.reset();
    }

    reset() {
        this.board = [null, null, null, null, null, null, null, null, null];
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        this.winningLine = [];
    }

    makeMove(index) {
        // Reject if game is over
        if (this.gameOver) {
            return false;
        }

        // Reject if cell is occupied
        if (this.board[index] !== null) {
            return false;
        }

        // Make the move
        this.board[index] = this.currentPlayer;
        this.checkGameStatus();

        // Pass turn if game is not over
        if (!this.gameOver) {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }

        return true;
    }

    checkGameStatus() {
        // Check for winner
        for (let line of WINNING_LINES) {
            const [a, b, c] = line;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winner = this.board[a];
                this.winningLine = line;
                this.gameOver = true;
                return;
            }
        }

        // Check for draw
        if (this.board.every(cell => cell !== null)) {
            this.gameOver = true;
            return;
        }
    }

    getState() {
        return {
            board: [...this.board],
            currentPlayer: this.currentPlayer,
            gameOver: this.gameOver,
            winner: this.winner,
            winningLine: [...this.winningLine]
        };
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TicTacToeGame, WINNING_LINES };
}
