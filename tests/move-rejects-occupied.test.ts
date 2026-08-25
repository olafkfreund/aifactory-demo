// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
// move(board, index, player) must return the board unchanged — no new board,
// no mutation, and no throw — when the target cell is already occupied.

import { move } from 'app/games/tictactoe/game';

describe('move rejects an already-occupied cell (AC#3)', () => {
  it('returns the same board reference when the target cell is occupied', () => {
    const board = ['X', null, null, null, null, null, null, null, null];

    const result = move(board, 0, 'O');

    // Returning the identical reference proves no new board was produced,
    // i.e. the turn did not pass.
    expect(result).toBe(board);
  });

  it('leaves the board contents unchanged when the cell is occupied', () => {
    const board = [null, 'X', null, null, 'O', null, null, null, null];

    const result = move(board, 4, 'X');

    expect(result).toEqual([null, 'X', null, null, 'O', null, null, null, null]);
  });

  it('does not overwrite an existing mark with the new player', () => {
    const board = [null, null, null, null, null, null, null, null, 'X'];

    const result = move(board, 8, 'O');

    expect(result[8]).toBe('X');
  });

  it('does not mutate the original board array', () => {
    const board = ['O', null, null, null, null, null, null, null, null];

    move(board, 0, 'X');

    expect(board).toEqual(['O', null, null, null, null, null, null, null, null]);
  });

  it('does not throw when the target cell is occupied', () => {
    const board = ['X', 'O', null, null, null, null, null, null, null];

    expect(() => move(board, 1, 'X')).not.toThrow();
  });
});
