class TicTacToe {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameOver = false;
    this.winner = null;
    this.initializeUI();
    this.bindEvents();
  }

  initializeUI() {
    this.boardElement = document.getElementById('board');
    this.statusElement = document.getElementById('status');
    this.resetButton = document.getElementById('reset');
  }

  bindEvents() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.addEventListener('click', () => this.handleCellClick(cell));
    });
    this.resetButton.addEventListener('click', () => this.reset());
  }

  handleCellClick(cell) {
    const index = parseInt(cell.dataset.index);
    if (this.board[index] === null && !this.gameOver) {
      this.makeMove(index);
      this.updateUI();
    }
  }

  makeMove(index) {
    this.board[index] = this.currentPlayer;

    const result = this.checkGameState();
    if (result.winner) {
      this.gameOver = true;
      this.winner = result.winner;
    } else if (result.draw) {
      this.gameOver = true;
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }
  }

  checkGameState() {
    const winningLines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const line of winningLines) {
      const [a, b, c] = line;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return { winner: this.board[a] };
      }
    }

    if (this.board.every(cell => cell !== null)) {
      return { draw: true };
    }

    return {};
  }

  updateUI() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
      const value = this.board[index];
      cell.textContent = value || '';
      cell.classList.remove('x', 'o');
      if (value === 'X') {
        cell.classList.add('x');
      } else if (value === 'O') {
        cell.classList.add('o');
      }
    });

    if (this.gameOver) {
      if (this.winner) {
        this.statusElement.textContent = `${this.winner} wins! 🎉`;
        this.statusElement.style.color = this.winner === 'X' ? '#667eea' : '#764ba2';
      } else {
        this.statusElement.textContent = `It's a draw!`;
        this.statusElement.style.color = '#999';
      }
    } else {
      this.statusElement.textContent = `Current player: ${this.currentPlayer}`;
      this.statusElement.style.color = this.currentPlayer === 'X' ? '#667eea' : '#764ba2';
    }
  }

  reset() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameOver = false;
    this.winner = null;
    this.updateUI();
  }

  // Public API for testing/automation
  play(index) {
    if (this.board[index] === null && !this.gameOver) {
      this.makeMove(index);
      this.updateUI();
      return true;
    }
    return false;
  }

  getState() {
    return {
      board: [...this.board],
      currentPlayer: this.currentPlayer,
      gameOver: this.gameOver,
      winner: this.winner,
    };
  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.game = new TicTacToe();
  window.game.updateUI();
});
