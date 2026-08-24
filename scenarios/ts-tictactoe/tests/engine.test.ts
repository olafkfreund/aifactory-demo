import { describe, it, expect } from 'vitest';
import {
  createBoard,
  makeMove,
  winner,
  isDraw,
  status,
  currentPlayer,
  BOARD_SIZE,
  type Board,
  type Player,
} from '../src/engine';

/**
 * Play out a sequence of moves starting from a fresh board, letting the engine
 * derive whose turn it is at each step. Returns the resulting board.
 */
function playMoves(indices: number[]): Board {
  let board = createBoard();
  for (const index of indices) {
    board = makeMove(board, index, currentPlayer(board));
  }
  return board;
}

describe('createBoard / fresh board (AC#1)', () => {
  it('returns 9 empty cells', () => {
    const board = createBoard();
    expect(board).toHaveLength(BOARD_SIZE);
    expect(board.every((cell) => cell === null)).toBe(true);
  });

  it('reports status in_progress with no winner', () => {
    const board = createBoard();
    expect(status(board)).toBe('in_progress');
    expect(winner(board)).toBeNull();
    expect(isDraw(board)).toBe(false);
  });

  it('has X to move first', () => {
    expect(currentPlayer(createBoard())).toBe('X');
  });
});

describe('makeMove basics', () => {
  it('places a mark and returns a new board without mutating the original', () => {
    const board = createBoard();
    const next = makeMove(board, 4, 'X');

    expect(next[4]).toBe('X');
    // Original board is untouched.
    expect(board[4]).toBeNull();
    expect(next).not.toBe(board);
  });

  it('alternates the current player X then O then X (AC#5)', () => {
    let board = createBoard();
    expect(currentPlayer(board)).toBe('X');

    board = makeMove(board, 0, 'X');
    expect(currentPlayer(board)).toBe('O');

    board = makeMove(board, 1, 'O');
    expect(currentPlayer(board)).toBe('X');

    board = makeMove(board, 2, 'X');
    expect(currentPlayer(board)).toBe('O');
  });
});

describe('invalid moves are rejected and leave the board unchanged (AC#2)', () => {
  it('throws when placing on an occupied cell', () => {
    const board = makeMove(createBoard(), 4, 'X');
    const snapshot = [...board];

    expect(() => makeMove(board, 4, 'O')).toThrow();
    // Board unchanged.
    expect(board).toEqual(snapshot);
  });

  it('throws for an out-of-range index (too high)', () => {
    const board = createBoard();
    const snapshot = [...board];

    expect(() => makeMove(board, 9, 'X')).toThrow();
    expect(() => makeMove(board, 42, 'X')).toThrow();
    expect(board).toEqual(snapshot);
  });

  it('throws for a negative index', () => {
    const board = createBoard();
    const snapshot = [...board];

    expect(() => makeMove(board, -1, 'X')).toThrow();
    expect(board).toEqual(snapshot);
  });

  it('throws for a non-integer index', () => {
    const board = createBoard();
    expect(() => makeMove(board, 1.5, 'X')).toThrow();
  });
});

describe('wrong-turn moves are rejected (AC#5)', () => {
  it('rejects O moving first on a fresh board', () => {
    const board = createBoard();
    const snapshot = [...board];

    expect(() => makeMove(board, 0, 'O')).toThrow();
    expect(board).toEqual(snapshot);
  });

  it('rejects the same player moving twice in a row', () => {
    const board = makeMove(createBoard(), 0, 'X');
    const snapshot = [...board];

    // It is O's turn now; X may not move again.
    expect(() => makeMove(board, 1, 'X')).toThrow();
    expect(board).toEqual(snapshot);
  });

  it('rejects a move once the game is already over', () => {
    // X wins across the top row: X 0, O 3, X 1, O 4, X 2.
    const board = playMoves([0, 3, 1, 4, 2]);
    expect(status(board)).toBe('x_win');

    expect(() => makeMove(board, 5, 'O')).toThrow();
  });
});

describe('win detection across every line (AC#3)', () => {
  const lines: Array<{ name: string; cells: [number, number, number] }> = [
    { name: 'row 0', cells: [0, 1, 2] },
    { name: 'row 1', cells: [3, 4, 5] },
    { name: 'row 2', cells: [6, 7, 8] },
    { name: 'column 0', cells: [0, 3, 6] },
    { name: 'column 1', cells: [1, 4, 7] },
    { name: 'column 2', cells: [2, 5, 8] },
    { name: 'diagonal ↘', cells: [0, 4, 8] },
    { name: 'diagonal ↙', cells: [2, 4, 6] },
  ];

  for (const player of ['X', 'O'] as Player[]) {
    for (const { name, cells } of lines) {
      it(`detects ${player} winning on ${name}`, () => {
        const board: Board = createBoard();
        // The two off-line cells go to the opponent so counts stay legal.
        const opponent: Player = player === 'X' ? 'O' : 'X';
        const fillers = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(
          (i) => !cells.includes(i),
        );

        for (const c of cells) board[c] = player;
        // Give the opponent two filler cells so the position is plausible.
        board[fillers[0]] = opponent;
        board[fillers[1]] = opponent;

        expect(winner(board)).toBe(player);
        expect(status(board)).toBe(player === 'X' ? 'x_win' : 'o_win');
      });
    }
  }

  it('detects a win reached through legal alternating play', () => {
    // O wins the middle column: X 0, O 1, X 2, O 4, X 3, O 7.
    const board = playMoves([0, 1, 2, 4, 3, 7]);
    expect(winner(board)).toBe('O');
    expect(status(board)).toBe('o_win');
  });
});

describe('draw detection (AC#4)', () => {
  it('detects a full board with no three-in-a-row as a draw', () => {
    // A filled board with no three-in-a-row:
    //  X | O | X
    //  X | O | X
    //  O | X | O
    const board = playMoves([0, 1, 2, 4, 5, 8, 7, 6, 3]);

    expect(board.every((cell) => cell !== null)).toBe(true);
    expect(winner(board)).toBeNull();
    expect(isDraw(board)).toBe(true);
    expect(status(board)).toBe('draw');
  });

  it('does not report a draw while cells remain empty', () => {
    const board = playMoves([4, 0]);
    expect(isDraw(board)).toBe(false);
    expect(status(board)).toBe('in_progress');
  });
});
