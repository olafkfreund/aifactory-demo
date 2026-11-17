// AC#4: game.test.js covers undo after several moves, and after a won game.
// undo(history): given an array of boards (oldest first) it returns a new
// array without the last board. Here we verify that after several moves and
// after a won game, undo removes only the last board.

const { undo } = require('../../games/tictactoe/game');

// An empty tic-tac-toe board (3x3 grid of empty cells).
const empty = () => [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

describe('undo after several moves', () => {
  // Build a history of several moves (oldest first).
  const board0 = empty();
  const board1 = [
    ['X', null, null],
    [null, null, null],
    [null, null, null],
  ];
  const board2 = [
    ['X', null, null],
    [null, 'O', null],
    [null, null, null],
  ];
  const board3 = [
    ['X', 'X', null],
    [null, 'O', null],
    [null, null, null],
  ];
  const history = [board0, board1, board2, board3];

  it('removes only the last board', () => {
    expect(undo(history)).toEqual([board0, board1, board2]);
  });

  it('returns a history one shorter than the input', () => {
    expect(undo(history)).toHaveLength(history.length - 1);
  });

  it('does not mutate the input history', () => {
    const input = [board0, board1, board2, board3];
    undo(input);
    expect(input).toHaveLength(4);
    expect(input).toEqual([board0, board1, board2, board3]);
  });

  it('returns a new array (not the same reference)', () => {
    const input = [board0, board1, board2, board3];
    expect(undo(input)).not.toBe(input);
  });
});

describe('undo after a won game', () => {
  // A full game where X wins the top row.
  const start = empty();
  const afterMove1 = [
    ['X', null, null],
    [null, null, null],
    [null, null, null],
  ];
  const afterMove2 = [
    ['X', null, null],
    ['O', null, null],
    [null, null, null],
  ];
  const afterMove3 = [
    ['X', 'X', null],
    ['O', null, null],
    [null, null, null],
  ];
  const afterMove4 = [
    ['X', 'X', null],
    ['O', 'O', null],
    [null, null, null],
  ];
  // X completes the top row and wins.
  const won = [
    ['X', 'X', 'X'],
    ['O', 'O', null],
    [null, null, null],
  ];
  const history = [start, afterMove1, afterMove2, afterMove3, afterMove4, won];

  it('removes the winning (last) board only', () => {
    expect(undo(history)).toEqual([
      start,
      afterMove1,
      afterMove2,
      afterMove3,
      afterMove4,
    ]);
  });

  it('leaves the board prior to the win as the new last board', () => {
    const result = undo(history);
    expect(result[result.length - 1]).toEqual(afterMove4);
  });

  it('returns a history one shorter than the input', () => {
    expect(undo(history)).toHaveLength(history.length - 1);
  });
});
