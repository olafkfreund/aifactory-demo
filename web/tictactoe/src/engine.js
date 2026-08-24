// Pure Tic Tac Toe game engine.
//
// A board is a length-9 array of cells. Each cell is either EMPTY ('') or a
// mark ('X' | 'O'). Cell indices map to the 3x3 grid as follows:
//
//   0 | 1 | 2
//  -----------
//   3 | 4 | 5
//  -----------
//   6 | 7 | 8
//
// All functions are pure: they never mutate their arguments and perform no DOM
// access or I/O.

/** The value of an empty cell. */
export const EMPTY = '';

/** The eight winning lines (rows, columns, diagonals). */
const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Candidate move order: centre first, then corners, then edges. This makes the
// minimax search tie-break equal-scored moves toward the centre and corners.
const MOVE_ORDER = [4, 0, 2, 6, 8, 1, 3, 5, 7];

/**
 * Create a fresh, empty 3x3 board.
 * @returns {string[]} a new board with nine EMPTY cells
 */
export function emptyBoard() {
  return [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY];
}

/**
 * Determine the winner of a board, if any.
 * @param {string[]} board
 * @returns {'X'|'O'|null} the winning mark, or null if there is no winner
 */
export function winner(board) {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] !== EMPTY && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

/**
 * Report whether a board is a draw (full with no winner).
 * @param {string[]} board
 * @returns {boolean}
 */
export function isDraw(board) {
  return winner(board) === null && board.every((cell) => cell !== EMPTY);
}

/**
 * Report the status of a board.
 * @param {string[]} board
 * @returns {'in_progress'|'draw'|'X'|'O'}
 */
export function status(board) {
  const win = winner(board);
  if (win !== null) return win;
  if (isDraw(board)) return 'draw';
  return 'in_progress';
}

/**
 * List the indices of all empty cells.
 * @param {string[]} board
 * @returns {number[]}
 */
export function availableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i += 1) {
    if (board[i] === EMPTY) moves.push(i);
  }
  return moves;
}

/**
 * Apply a mark to a board, returning a NEW board. The input board is not
 * mutated.
 * @param {string[]} board
 * @param {number} index the target cell (0-8)
 * @param {'X'|'O'} mark
 * @returns {string[]} the resulting board
 * @throws {Error} if the index is out of range or the cell is occupied
 */
export function applyMove(board, index, mark) {
  if (!Number.isInteger(index) || index < 0 || index >= board.length) {
    throw new Error(`Move index out of range: ${index}`);
  }
  if (board[index] !== EMPTY) {
    throw new Error(`Cell ${index} is already occupied`);
  }
  const next = board.slice();
  next[index] = mark;
  return next;
}

/**
 * Score a board from the perspective of `mark` using minimax.
 * Win = 10 - depth, loss = depth - 10, draw = 0. Preferring shallower wins and
 * deeper losses makes the AI win as fast as possible and delay losing.
 * @param {string[]} board
 * @param {'X'|'O'} mark the maximising player
 * @param {'X'|'O'} turn whose move it currently is
 * @param {number} depth plies from the root
 * @returns {number}
 */
function minimax(board, mark, turn, depth) {
  const win = winner(board);
  if (win === mark) return 10 - depth;
  if (win !== null) return depth - 10;
  if (isDraw(board)) return 0;

  const nextTurn = turn === 'X' ? 'O' : 'X';
  const maximising = turn === mark;
  let best = maximising ? -Infinity : Infinity;

  for (const index of MOVE_ORDER) {
    if (board[index] !== EMPTY) continue;
    const score = minimax(applyMove(board, index, turn), mark, nextTurn, depth + 1);
    if (maximising) {
      if (score > best) best = score;
    } else if (score < best) {
      best = score;
    }
  }
  return best;
}

/**
 * Choose the optimal move for `mark` on the given board.
 * Candidate cells are evaluated in the order centre, corners, edges so equal
 * scores tie-break toward the centre. Guarantees taking an immediate win,
 * blocking an immediate opposing win, taking centre on an empty board, and
 * never losing under optimal play.
 * @param {string[]} board
 * @param {'X'|'O'} mark
 * @returns {number|null} the chosen cell index, or null if no moves remain
 */
export function bestMove(board, mark) {
  const opponent = mark === 'X' ? 'O' : 'X';
  let bestIndex = null;
  let bestScore = -Infinity;

  for (const index of MOVE_ORDER) {
    if (board[index] !== EMPTY) continue;
    const score = minimax(applyMove(board, index, mark), mark, opponent, 1);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }
  return bestIndex;
}
