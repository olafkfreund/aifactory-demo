const {
  nextFocusIndex,
  createBoard,
  makeMove,
  getWinner,
  isBoardFull,
  getGameStatus,
} = require('./game');

describe('nextFocusIndex', () => {
  describe('Arrow key navigation', () => {
    describe('ArrowRight', () => {
      test('from 4, ArrowRight is 5', () => {
        expect(nextFocusIndex(4, 'ArrowRight')).toBe(5);
      });

      test('from 2, ArrowRight wraps to 0', () => {
        expect(nextFocusIndex(2, 'ArrowRight')).toBe(0);
      });

      test('from 5, ArrowRight wraps to 3', () => {
        expect(nextFocusIndex(5, 'ArrowRight')).toBe(3);
      });

      test('from 8, ArrowRight wraps to 6', () => {
        expect(nextFocusIndex(8, 'ArrowRight')).toBe(6);
      });
    });

    describe('ArrowLeft', () => {
      test('from 4, ArrowLeft is 3', () => {
        expect(nextFocusIndex(4, 'ArrowLeft')).toBe(3);
      });

      test('from 0, ArrowLeft wraps to 2', () => {
        expect(nextFocusIndex(0, 'ArrowLeft')).toBe(2);
      });

      test('from 3, ArrowLeft wraps to 5', () => {
        expect(nextFocusIndex(3, 'ArrowLeft')).toBe(5);
      });

      test('from 6, ArrowLeft wraps to 8', () => {
        expect(nextFocusIndex(6, 'ArrowLeft')).toBe(8);
      });
    });

    describe('ArrowDown', () => {
      test('from 4, ArrowDown is 7', () => {
        expect(nextFocusIndex(4, 'ArrowDown')).toBe(7);
      });

      test('from 6, ArrowDown wraps to 0', () => {
        expect(nextFocusIndex(6, 'ArrowDown')).toBe(0);
      });

      test('from 7, ArrowDown wraps to 1', () => {
        expect(nextFocusIndex(7, 'ArrowDown')).toBe(1);
      });

      test('from 8, ArrowDown wraps to 2', () => {
        expect(nextFocusIndex(8, 'ArrowDown')).toBe(2);
      });
    });

    describe('ArrowUp', () => {
      test('from 4, ArrowUp is 1', () => {
        expect(nextFocusIndex(4, 'ArrowUp')).toBe(1);
      });

      test('from 0, ArrowUp wraps to 6', () => {
        expect(nextFocusIndex(0, 'ArrowUp')).toBe(6);
      });

      test('from 1, ArrowUp wraps to 7', () => {
        expect(nextFocusIndex(1, 'ArrowUp')).toBe(7);
      });

      test('from 2, ArrowUp wraps to 8', () => {
        expect(nextFocusIndex(2, 'ArrowUp')).toBe(8);
      });
    });
  });

  describe('Home and End keys', () => {
    test('Home from any cell goes to 0', () => {
      for (let i = 0; i < 9; i++) {
        expect(nextFocusIndex(i, 'Home')).toBe(0);
      }
    });

    test('End from any cell goes to 8', () => {
      for (let i = 0; i < 9; i++) {
        expect(nextFocusIndex(i, 'End')).toBe(8);
      }
    });
  });

  describe('Unknown keys', () => {
    test('returns current index for unknown key', () => {
      expect(nextFocusIndex(4, 'Enter')).toBe(4);
      expect(nextFocusIndex(2, ' ')).toBe(2);
      expect(nextFocusIndex(7, 'x')).toBe(7);
    });

    test('returns current index for any other key from any cell', () => {
      for (let i = 0; i < 9; i++) {
        expect(nextFocusIndex(i, 'SomeRandomKey')).toBe(i);
      }
    });
  });
});

describe('createBoard', () => {
  test('creates an empty 9-cell board', () => {
    const board = createBoard();
    expect(board).toHaveLength(9);
    expect(board.every(cell => cell === '')).toBe(true);
  });
});

describe('makeMove', () => {
  test('places mark on empty cell', () => {
    const board = createBoard();
    const result = makeMove(board, 4, 'X');
    expect(result.error).toBeNull();
    expect(result.board[4]).toBe('X');
    expect(board[4]).toBe(''); // Original board unchanged
  });

  test('rejects move on occupied cell', () => {
    let board = createBoard();
    const first = makeMove(board, 4, 'X');
    board = first.board;
    const result = makeMove(board, 4, 'O');
    expect(result.error).toBe('Cell already occupied');
    expect(result.board).toBeNull();
  });

  test('rejects move on invalid index', () => {
    const board = createBoard();
    expect(makeMove(board, -1, 'X').error).toBe('Invalid cell index');
    expect(makeMove(board, 9, 'X').error).toBe('Invalid cell index');
  });

  test('rejects move by invalid player', () => {
    const board = createBoard();
    const result = makeMove(board, 4, 'Z');
    expect(result.error).toBe('Invalid player');
    expect(result.board).toBeNull();
  });
});

describe('getWinner', () => {
  test('detects row win', () => {
    const board = ['X', 'X', 'X', '', '', '', '', '', ''];
    expect(getWinner(board)).toBe('X');
  });

  test('detects column win', () => {
    const board = ['X', '', '', 'X', '', '', 'X', '', ''];
    expect(getWinner(board)).toBe('X');
  });

  test('detects diagonal win (top-left to bottom-right)', () => {
    const board = ['X', '', '', '', 'X', '', '', '', 'X'];
    expect(getWinner(board)).toBe('X');
  });

  test('detects diagonal win (top-right to bottom-left)', () => {
    const board = ['', '', 'X', '', 'X', '', 'X', '', ''];
    expect(getWinner(board)).toBe('X');
  });

  test('returns null for no winner', () => {
    const board = createBoard();
    expect(getWinner(board)).toBeNull();
  });

  test('detects O winner', () => {
    const board = ['O', 'O', 'O', '', '', '', '', '', ''];
    expect(getWinner(board)).toBe('O');
  });
});

describe('isBoardFull', () => {
  test('returns false for empty board', () => {
    const board = createBoard();
    expect(isBoardFull(board)).toBe(false);
  });

  test('returns false for partially filled board', () => {
    const board = createBoard();
    board[4] = 'X';
    expect(isBoardFull(board)).toBe(false);
  });

  test('returns true for full board', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    expect(isBoardFull(board)).toBe(true);
  });
});

describe('getGameStatus', () => {
  test('returns in_progress for new game', () => {
    const board = createBoard();
    expect(getGameStatus(board)).toBe('in_progress');
  });

  test('returns x_wins when X wins', () => {
    const board = ['X', 'X', 'X', '', '', '', '', '', ''];
    expect(getGameStatus(board)).toBe('x_wins');
  });

  test('returns o_wins when O wins', () => {
    const board = ['O', 'O', 'O', '', '', '', '', '', ''];
    expect(getGameStatus(board)).toBe('o_wins');
  });

  test('returns draw for full board with no winner', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    expect(getGameStatus(board)).toBe('draw');
  });

  test('returns in_progress for partially filled board without winner', () => {
    const board = ['X', 'O', '', '', 'X', '', '', '', ''];
    expect(getGameStatus(board)).toBe('in_progress');
  });
});
