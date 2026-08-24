// AC#8: The test suite covers every engine function above, including
// isBoardFull and the out-of-range rejection path of makeMove.
//
// This file proves:
//   - isBoardFull returns false while any cell is still empty, and true
//     only once every one of the 9 cells is filled.
//   - makeMove rejects out-of-range indices (< 0, > 8, non-integer) as a
//     no-op that returns the state unchanged and does not mutate it.

import { isBoardFull, makeMove, createGame } from 'app/games/tictactoe/game';

describe('isBoardFull', () => {
  it('returns false for a fresh, entirely empty board', () => {
    const board = new Array(9).fill(null);
    expect(isBoardFull(board)).toBe(false);
  });

  it('returns false while at least one cell is still empty', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', null];
    expect(isBoardFull(board)).toBe(false);
  });

  it('returns false when only a single cell is filled', () => {
    const board = new Array(9).fill(null);
    board[4] = 'X';
    expect(isBoardFull(board)).toBe(false);
  });

  it('returns true only when every one of the 9 cells is filled', () => {
    const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(isBoardFull(board)).toBe(true);
  });
});

describe('makeMove out-of-range indices', () => {
  it('returns the same state object for a negative index', () => {
    const state = createGame();
    const result = makeMove(state, -1);
    expect(result).toBe(state);
  });

  it('returns the same state object for an index of 9 (one past the last cell)', () => {
    const state = createGame();
    const result = makeMove(state, 9);
    expect(result).toBe(state);
  });

  it('returns the same state object for a large out-of-range index', () => {
    const state = createGame();
    const result = makeMove(state, 100);
    expect(result).toBe(state);
  });

  it('rejects a non-integer index as a no-op', () => {
    const state = createGame();
    const result = makeMove(state, 2.5);
    expect(result).toBe(state);
  });

  it('does not mutate the board or pass the turn on an out-of-range index', () => {
    const state = createGame();
    makeMove(state, -1);
    expect(state.board).toEqual(new Array(9).fill(null));
    expect(state.currentPlayer).toBe('X');
  });
});
