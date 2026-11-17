// AC#1: games/tictactoe/game.js exports undo(history), a pure function:
// given an array of boards (oldest first) it returns a new array without the
// last board. Verify undo(history) returns a new array without the last board
// for a multi-board history, leaving the input untouched.

const { undo } = require('../../games/tictactoe/game');

describe('undo', () => {
  const boardA = ['X', null, null, null, null, null, null, null, null];
  const boardB = ['X', 'O', null, null, null, null, null, null, null];
  const boardC = ['X', 'O', 'X', null, null, null, null, null, null];

  it('returns a new array without the last board for a multi-board history', () => {
    const history = [boardA, boardB, boardC];

    const result = undo(history);

    expect(result).toEqual([boardA, boardB]);
  });

  it('drops exactly the last board, keeping the earlier boards in order', () => {
    const history = [boardA, boardB, boardC];

    const result = undo(history);

    expect(result).toHaveLength(2);
  });

  it('returns a new array, not the same reference as the input', () => {
    const history = [boardA, boardB, boardC];

    const result = undo(history);

    expect(result).not.toBe(history);
  });

  it('leaves the input history untouched', () => {
    const history = [boardA, boardB, boardC];

    undo(history);

    expect(history).toEqual([boardA, boardB, boardC]);
  });

  it('does not change the length of the input history', () => {
    const history = [boardA, boardB, boardC];

    undo(history);

    expect(history).toHaveLength(3);
  });
});
