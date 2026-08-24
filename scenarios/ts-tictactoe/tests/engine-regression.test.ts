/**
 * AC#7: All existing tests still pass.
 *
 * Regression coverage for the core, DOM-free engine functions
 * (makeMove, winner, status, availableMoves). Adding the minimax AI must not
 * change any pre-existing engine behaviour, so these tests re-assert the
 * engine's contract independently of the AI work.
 *
 * The engine module is imported using the same resolvable relative path every
 * existing engine test in this project uses (`../src/engine`).
 */
import {
  createBoard,
  makeMove,
  winner,
  status,
  availableMoves,
  currentPlayer,
  BOARD_SIZE,
  type Board,
  type Player,
} from '../src/engine';

/**
 * Play out a sequence of moves from a fresh board, deriving whose turn it is at
 * each step. Returns the resulting board.
 */
function playMoves(indices: number[]): Board {
  let board = createBoard();
  for (const index of indices) {
    board = makeMove(board, index, currentPlayer(board));
  }
  return board;
}

describe('engine regression: makeMove (AC#7)', () => {
  it('places a mark and returns a new board without mutating the original', () => {
    const board = createBoard();
    const next = makeMove(board, 4, 'X');

    expect(next[4]).toBe('X');
    expect(board[4]).toBeNull();
    expect(next).not.toBe(board);
  });

  it('throws when placing on an occupied cell and leaves the board unchanged', () => {
    const board = makeMove(createBoard(), 4, 'X');
    const snapshot = [...board];

    expect(() => makeMove(board, 4, 'O')).toThrow();
    expect(board).toEqual(snapshot);
  });

  it('throws for an out-of-range index', () => {
    const board = createBoard();
    expect(() => makeMove(board, 9, 'X')).toThrow();
    expect(() => makeMove(board, -1, 'X')).toThrow();
  });

  it('rejects a move made out of turn', () => {
    const board = createBoard();
    expect(() => makeMove(board, 0, 'O')).toThrow();
  });

  it('rejects a move once the game is already over', () => {
    // X wins the top row: X 0, O 3, X 1, O 4, X 2.
    const board = playMoves([0, 3, 1, 4, 2]);
    expect(() => makeMove(board, 5, 'O')).toThrow();
  });
});

describe('engine regression: winner (AC#7)', () => {
  it('returns null on a fresh board', () => {
    expect(winner(createBoard())).toBeNull();
  });

  it('detects X winning across the top row', () => {
    const board = playMoves([0, 3, 1, 4, 2]);
    expect(winner(board)).toBe('X');
  });

  it('detects O winning through legal alternating play', () => {
    // O wins the middle column: X 0, O 1, X 2, O 4, X 3, O 7.
    const board = playMoves([0, 1, 2, 4, 3, 7]);
    expect(winner(board)).toBe('O');
  });

  it('returns null for a drawn full board', () => {
    const board = playMoves([0, 1, 2, 4, 5, 8, 7, 6, 3]);
    expect(winner(board)).toBeNull();
  });
});

describe('engine regression: status (AC#7)', () => {
  it('reports in_progress for a fresh board', () => {
    expect(status(createBoard())).toBe('in_progress');
  });

  it('reports x_win when X has three in a row', () => {
    const board = playMoves([0, 3, 1, 4, 2]);
    expect(status(board)).toBe('x_win');
  });

  it('reports o_win when O has three in a row', () => {
    const board = playMoves([0, 1, 2, 4, 3, 7]);
    expect(status(board)).toBe('o_win');
  });

  it('reports draw for a full board with no winner', () => {
    const board = playMoves([0, 1, 2, 4, 5, 8, 7, 6, 3]);
    expect(status(board)).toBe('draw');
  });
});

describe('engine regression: availableMoves (AC#7)', () => {
  it('lists all cells on a fresh board', () => {
    expect(availableMoves(createBoard())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('omits occupied cells in ascending index order', () => {
    const board = playMoves([4, 0, 8]);
    expect(availableMoves(board)).toEqual([1, 2, 3, 5, 6, 7]);
  });

  it('returns an empty list when the board is full', () => {
    const board = playMoves([0, 1, 2, 4, 5, 8, 7, 6, 3]);
    expect(availableMoves(board)).toEqual([]);
    expect(availableMoves(board)).toHaveLength(BOARD_SIZE - BOARD_SIZE);
  });

  it('never lists more cells than the board holds', () => {
    const moves = availableMoves(createBoard());
    expect(moves.length).toBeLessThanOrEqual(BOARD_SIZE);
  });
});
