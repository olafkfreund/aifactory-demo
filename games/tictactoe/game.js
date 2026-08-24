class TicTacToe {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameOver = false;
    this.focusedCell = 0;

    this.boardEl = document.getElementById('board');
    this.statusEl = document.getElementById('gameStatus');
    this.turnDisplayEl = document.getElementById('turnDisplay');
    this.resultDisplayEl = document.getElementById('resultDisplay');
    this.resetBtn = document.getElementById('resetBtn');

    this.initBoard();
    this.attachEventListeners();
    this.updateDisplay();
  }

  initBoard() {
    this.boardEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.setAttribute('tabindex', i === 0 ? '0' : '-1');
      cell.setAttribute('aria-label', this.getAriaLabel(i));
      cell.textContent = this.board[i] || '';

      cell.addEventListener('click', (e) => this.handleCellClick(i));
      cell.addEventListener('keydown', (e) => this.handleKeydown(e, i));

      this.boardEl.appendChild(cell);
    }
    this.focusedCell = 0;
  }

  getAriaLabel(index) {
    const row = Math.floor(index / 3) + 1;
    const col = (index % 3) + 1;
    const content = this.board[index] ? `${this.board[index]}` : 'empty';
    return `Row ${row}, Column ${col}, ${content}`;
  }

  updateAriaLabels() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
      cell.setAttribute('aria-label', this.getAriaLabel(index));
    });
  }

  attachEventListeners() {
    this.resetBtn.addEventListener('click', () => this.reset());
  }

  handleKeydown(e, index) {
    const rows = 3;
    const cols = 3;
    const row = Math.floor(index / cols);
    const col = index % cols;

    let newIndex = null;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (row > 0) newIndex = index - cols;
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (row < rows - 1) newIndex = index + cols;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (col > 0) newIndex = index - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (col < cols - 1) newIndex = index + 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.handleCellClick(index);
        return;
    }

    if (newIndex !== null) {
      this.focusedCell = newIndex;
      this.updateFocus();
    }
  }

  updateFocus() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
      cell.setAttribute('tabindex', index === this.focusedCell ? '0' : '-1');
      if (index === this.focusedCell) {
        cell.focus();
      }
    });
  }

  handleCellClick(index) {
    if (this.board[index] || this.gameOver) return;

    this.board[index] = this.currentPlayer;
    this.focusedCell = index;
    this.updateCell(index);

    const winner = this.checkWinner();
    if (winner) {
      this.gameOver = true;
      this.announceResult(`${winner} wins!`);
    } else if (this.board.every(cell => cell !== null)) {
      this.gameOver = true;
      this.announceResult("It's a draw!");
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      this.announceTurn();
    }

    this.updateDisplay();
  }

  updateCell(index) {
    const cells = document.querySelectorAll('.cell');
    cells[index].textContent = this.board[index];
    cells[index].setAttribute('aria-label', this.getAriaLabel(index));
    cells[index].disabled = true;
  }

  announceResult(message) {
    this.statusEl.textContent = message;
  }

  announceTurn() {
    this.statusEl.textContent = `${this.currentPlayer}'s turn.`;
  }

  updateDisplay() {
    this.updateAriaLabels();
    if (!this.gameOver) {
      this.turnDisplayEl.textContent = `${this.currentPlayer}'s Turn`;
      this.resultDisplayEl.textContent = '';
    } else {
      this.turnDisplayEl.textContent = '';
      if (this.checkWinner()) {
        this.resultDisplayEl.textContent = `🎉 ${this.checkWinner()} Wins!`;
      } else {
        this.resultDisplayEl.textContent = "It's a Draw!";
      }
    }
  }

  checkWinner() {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return this.board[a];
      }
    }

    return null;
  }

  reset() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameOver = false;
    this.focusedCell = 0;
    this.initBoard();
    this.statusEl.textContent = "Game started. X's turn.";
    this.updateDisplay();
  }
}

// Initialize the game when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new TicTacToe();
});
