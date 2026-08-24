/**
 * Tic-Tac-Toe Game Logic
 *
 * Board layout (indices 0-8):
 * 0 | 1 | 2
 * ---------
 * 3 | 4 | 5
 * ---------
 * 6 | 7 | 8
 */

/**
 * Determines the next focus index based on arrow key navigation
 * within a 3x3 grid with wrapping at edges.
 *
 * @param {number} current - Current cell index (0-8)
 * @param {string} key - Key name (ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, End)
 * @returns {number} Next cell index (0-8)
 */
function nextFocusIndex(current, key) {
  const row = Math.floor(current / 3);
  const col = current % 3;

  switch (key) {
    case 'ArrowRight':
      return row * 3 + (col + 1) % 3;
    case 'ArrowLeft':
      return row * 3 + ((col - 1 + 3) % 3);
    case 'ArrowDown':
      return ((row + 1) % 3) * 3 + col;
    case 'ArrowUp':
      return ((row - 1 + 3) % 3) * 3 + col;
    case 'Home':
      return 0;
    case 'End':
      return 8;
    default:
      return current;
  }
}

/**
 * Initializes a new game board
 * @returns {Array<string>} Array of 9 cells, each empty (''), 'X', or 'O'
 */
function createBoard() {
  return Array(9).fill('');
}

/**
 * Places a mark on the board at the given index
 * @param {Array<string>} board - Current board state
 * @param {number} index - Cell index (0-8)
 * @param {string} player - 'X' or 'O'
 * @returns {{board: Array<string>, error: null} | {board: null, error: string}}
 */
function makeMove(board, index, player) {
  if (index < 0 || index > 8) {
    return { board: null, error: 'Invalid cell index' };
  }
  if (board[index] !== '') {
    return { board: null, error: 'Cell already occupied' };
  }
  if (player !== 'X' && player !== 'O') {
    return { board: null, error: 'Invalid player' };
  }

  const newBoard = [...board];
  newBoard[index] = player;
  return { board: newBoard, error: null };
}

/**
 * Checks if there's a winner
 * @param {Array<string>} board - Current board state
 * @returns {string|null} 'X', 'O', or null
 */
function getWinner(board) {
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

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

/**
 * Checks if the board is full (draw)
 * @param {Array<string>} board - Current board state
 * @returns {boolean}
 */
function isBoardFull(board) {
  return board.every(cell => cell !== '');
}

/**
 * Gets the game status
 * @param {Array<string>} board - Current board state
 * @returns {string} 'in_progress', 'x_wins', 'o_wins', or 'draw'
 */
function getGameStatus(board) {
  const winner = getWinner(board);
  if (winner) {
    return winner === 'X' ? 'x_wins' : 'o_wins';
  }
  if (isBoardFull(board)) {
    return 'draw';
  }
  return 'in_progress';
}

// Export for use in Node/Jest and in browsers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    nextFocusIndex,
    createBoard,
    makeMove,
    getWinner,
    isBoardFull,
    getGameStatus,
  };
}
