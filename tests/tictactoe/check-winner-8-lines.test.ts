// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// This suite verifies GameLogic.checkWinner detects a win on each of the 8
// winning lines and returns the correct winner and winningLine.
//
// The module under test (games/tictactoe/game.js) is a CommonJS module that
// does `module.exports = GameLogic`, so it is loaded via a relative require
// from the repo-root test layout (tests/tictactoe -> games/tictactoe).

// eslint-disable-next-line @typescript-eslint/no-var-requires
const GameLogic = require('../../games/tictactoe/game');

type Cell = 'X' | 'O' | null;

interface GameState {
  board: Cell[];
  currentPlayer: 'X' | 'O';
  winner: Cell;
  winningLine: number[] | null;
  gameOver: boolean;
}

// Build a fresh game state whose board has `mark` placed on every index in
// `line`; all other cells stay empty.
function boardWithLine(line: number[], mark: 'X' | 'O'): GameState {
  const state: GameState = GameLogic.createGame();
  for (const index of line) {
    state.board[index] = mark;
  }
  return state;
}

// The 8 winning lines: 3 rows, 3 columns, 2 diagonals.
const ROWS: Array<[string, number[]]> = [
  ['top row', [0, 1, 2]],
  ['middle row', [3, 4, 5]],
  ['bottom row', [6, 7, 8]],
];

const COLUMNS: Array<[string, number[]]> = [
  ['left column', [0, 3, 6]],
  ['middle column', [1, 4, 7]],
  ['right column', [2, 5, 8]],
];

const DIAGONALS: Array<[string, number[]]> = [
  ['main diagonal', [0, 4, 8]],
  ['anti diagonal', [2, 4, 6]],
];

const ALL_LINES = [...ROWS, ...COLUMNS, ...DIAGONALS];

describe('checkWinner detects a win on all 8 lines (AC#4)', () => {
  it('covers exactly 8 winning lines: 3 rows, 3 columns, 2 diagonals', () => {
    expect(ROWS).toHaveLength(3);
    expect(COLUMNS).toHaveLength(3);
    expect(DIAGONALS).toHaveLength(2);
    expect(ALL_LINES).toHaveLength(8);
  });

  describe.each(ALL_LINES)('%s %j', (_name, line) => {
    it('returns X as the winner when X completes the line', () => {
      const state = boardWithLine(line, 'X');
      const result = GameLogic.checkWinner(state);
      expect(result).not.toBeNull();
      expect(result.winner).toBe('X');
    });

    it('returns the completed line as the winningLine', () => {
      const state = boardWithLine(line, 'X');
      const result = GameLogic.checkWinner(state);
      expect(result.winningLine).toEqual(line);
    });

    it('returns O as the winner when O completes the line', () => {
      const state = boardWithLine(line, 'O');
      const result = GameLogic.checkWinner(state);
      expect(result).not.toBeNull();
      expect(result.winner).toBe('O');
      expect(result.winningLine).toEqual(line);
    });
  });

  it('returns null when no line is complete on an empty board', () => {
    const state: GameState = GameLogic.createGame();
    expect(GameLogic.checkWinner(state)).toBeNull();
  });

  it('returns null when a full board has no winning line (draw)', () => {
    const state: GameState = GameLogic.createGame();
    // A known draw layout: no row/column/diagonal is a single mark.
    state.board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(GameLogic.checkWinner(state)).toBeNull();
  });
});
