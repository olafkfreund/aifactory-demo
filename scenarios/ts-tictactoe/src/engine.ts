/**
 * Pure, DOM-free Tic-Tac-Toe game engine.
 *
 * The board is a flat array of 9 cells indexed 0..8:
 *
 *   0 | 1 | 2
 *  ---+---+---
 *   3 | 4 | 5
 *  ---+---+---
 *   6 | 7 | 8
 *
 * All functions are pure: they never mutate their inputs and never touch the
 * console or the DOM. `makeMove` returns a brand-new board on every call.
 */

/** The two players. X always moves first. */
export type Player = 'X' | 'O';

/** A single cell: a player's mark, or `null` when empty. */
export type Cell = Player | null;

/** A board is exactly 9 cells. */
export type Board = Cell[];

/** Overall game outcome. */
export type Status = 'in_progress' | 'x_win' | 'o_win' | 'draw';

/** Number of cells on a standard 3x3 board. */
export const BOARD_SIZE = 9;

/** All winning lines: three rows, three columns, two diagonals. */
export const WINNING_LINES: ReadonlyArray<readonly [number, number, number]> = [
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
  [2, 4, 6],
];

/** Create a fresh, empty board. */
export function createBoard(): Board {
  return Array<Cell>(BOARD_SIZE).fill(null);
}

/** True when `index` refers to a real cell on the board. */
function isValidIndex(index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < BOARD_SIZE;
}

/**
 * Whose turn it is. X moves first, then players alternate. The turn is derived
 * purely from the marks already on the board, so it is well-defined for any
 * legally-reachable position.
 */
export function currentPlayer(board: Board): Player {
  let xCount = 0;
  let oCount = 0;
  for (const cell of board) {
    if (cell === 'X') xCount++;
    else if (cell === 'O') oCount++;
  }
  return xCount === oCount ? 'X' : 'O';
}

/**
 * Place `player`'s mark at `index`, returning a NEW board.
 *
 * Rejects (throws) when:
 *  - `index` is out of range,
 *  - the target cell is already occupied,
 *  - the game is already over,
 *  - it is not `player`'s turn (turn order is enforced).
 *
 * The original board is never mutated.
 */
export function makeMove(board: Board, index: number, player: Player): Board {
  if (!isValidIndex(index)) {
    throw new Error(`Invalid cell index: ${index}`);
  }
  if (board[index] !== null) {
    throw new Error(`Cell ${index} is already occupied`);
  }
  if (status(board) !== 'in_progress') {
    throw new Error('Game is already over');
  }
  if (player !== currentPlayer(board)) {
    throw new Error(`It is not ${player}'s turn`);
  }

  const next = board.slice();
  next[index] = player;
  return next;
}

/** The player with three-in-a-row, or `null` if there is no winner. */
export function winner(board: Board): Player | null {
  for (const [a, b, c] of WINNING_LINES) {
    const mark = board[a];
    if (mark !== null && mark === board[b] && mark === board[c]) {
      return mark;
    }
  }
  return null;
}

/** True when every cell is filled and there is no winner. */
export function isDraw(board: Board): boolean {
  return winner(board) === null && board.every((cell) => cell !== null);
}

/** The overall game status. */
export function status(board: Board): Status {
  const win = winner(board);
  if (win === 'X') return 'x_win';
  if (win === 'O') return 'o_win';
  if (isDraw(board)) return 'draw';
  return 'in_progress';
}

/** The list of empty cell indices where a move is currently legal. */
export function availableMoves(board: Board): number[] {
  const moves: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) moves.push(i);
  }
  return moves;
}
