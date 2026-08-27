// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
// move() on an occupied cell must be a no-op: it returns the SAME board
// reference (proving no new board / no turn pass), preserves the existing
// mark, does not mutate the original array, and never throws.

import { move } from 'app/games/tictactoe/game';

describe('move() rejects an already-occupied cell (AC#3)', () => {
  it('returns the same board reference (no new board, no turn passes)', () => {
    const board = ['X', null, null, null, null, null, null, null, null];

    const result = move(board, 0, 'O');

    expect(result).toBe(board);
  });

  it('preserves the existing mark rather than overwriting it', () => {
    const board = [null, null, null, null, 'X', null, null, null, null];

    const result = move(board, 4, 'O');

    expect(result[4]).toBe('X');
  });

  it('leaves the whole board unchanged when the cell is occupied', () => {
    const board = [null, 'X', null, null, 'O', null, null, null, null];

    const result = move(board, 1, 'O');

    expect(result).toEqual([null, 'X', null, null, 'O', null, null, null, null]);
  });

  it('does not mutate the original board array', () => {
    const board = ['O', null, null, null, null, null, null, null, null];

    move(board, 0, 'X');

    expect(board).toEqual(['O', null, null, null, null, null, null, null, null]);
  });

  it('does not throw when clicking an occupied cell', () => {
    const board = ['X', 'O', null, null, null, null, null, null, null];

    expect(() => move(board, 1, 'X')).not.toThrow();
  });
});
