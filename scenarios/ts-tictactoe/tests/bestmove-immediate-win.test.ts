/**
 * AC#1: bestMove takes the winning move when one is available in one ply.
 *
 * These tests verify that `bestMove` returns the cell that completes
 * three-in-a-row whenever a one-ply win exists for the player to act.
 */

import {
  createBoard,
  makeMove,
  currentPlayer,
  status,
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

describe('bestMove takes an immediate one-ply win (AC#1)', () => {
  it('completes the top row for X at cell 2 when it is the winning move', () => {
    // X 0, O 3, X 1, O 4 -> X to move holding 0,1; playing 2 wins the top row.
    const board = playMoves([0, 3, 1, 4]);
    expect(currentPlayer(board)).toBe('X');
    expect(status(board)).toBe('in_progress');
    expect(bestMove(board, 'X')).toBe(2);
  });

  it('completes the main diagonal for O at cell 8 when it is the winning move', () => {
    // X 1, O 0, X 3, O 4, X 6 -> O to move holding 0,4; playing 8 wins the diagonal.
    const board = playMoves([1, 0, 3, 4, 6]);
    expect(currentPlayer(board)).toBe('O');
    expect(status(board)).toBe('in_progress');
    expect(bestMove(board, 'O')).toBe(8);
  });

  it('the returned cell actually produces a win when played', () => {
    // X 0, O 3, X 1, O 4 -> X to move; the chosen cell must finish the game as x_win.
    const board = playMoves([0, 3, 1, 4]);
    const move = bestMove(board, 'X');
    expect(move).not.toBeNull();
    const finished = makeMove(board, move as number, 'X');
    expect(status(finished)).toBe('x_win');
  });
});
