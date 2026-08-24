import { describe, it, expect } from 'vitest';
import {
  createBoard,
  makeMove,
  currentPlayer,
  type Board,
} from '../src/engine';
import { bestMove } from '../src/ai';

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

describe('bestMove takes an immediate one-ply win', () => {
  it('completes the top row for X when the winning cell is open', () => {
    // X 0, O 3, X 1, O 4 -> X to move with 0,1 filled; 2 wins.
    const board = playMoves([0, 3, 1, 4]);
    expect(currentPlayer(board)).toBe('X');
    expect(bestMove(board, 'X')).toBe(2);
  });

  it('completes a diagonal for O when the winning cell is open', () => {
    // X 1, O 0, X 3, O 4, X 6 -> O to move with 0,4 filled; 8 wins.
    const board = playMoves([1, 0, 3, 4, 6]);
    expect(currentPlayer(board)).toBe('O');
    expect(bestMove(board, 'O')).toBe(8);
  });
});

describe("bestMove blocks the opponent's immediate winning threat", () => {
  it('blocks the top row when it cannot win itself', () => {
    // O threatens 0,1 -> 2. X has only the centre and cannot win in one ply.
    // X 4, O 0, X 8, O 1 -> X to move; must block at 2.
    const board = playMoves([4, 0, 8, 1]);
    expect(currentPlayer(board)).toBe('X');
    expect(bestMove(board, 'X')).toBe(2);
  });

  it('blocks a column when it cannot win itself', () => {
    // X threatens 0,3 -> 6. O to move with no one-ply win of its own.
    // X 0, O 4, X 3, O 5, X 8 -> X 0,3 filled; O to move must block at 6.
    const board = playMoves([0, 4, 3, 5, 8]);
    expect(currentPlayer(board)).toBe('O');
    expect(bestMove(board, 'O')).toBe(6);
  });
});

describe('bestMove opens with the centre', () => {
  it('returns the centre (index 4) on an empty board', () => {
    expect(bestMove(createBoard(), 'X')).toBe(4);
  });
});
