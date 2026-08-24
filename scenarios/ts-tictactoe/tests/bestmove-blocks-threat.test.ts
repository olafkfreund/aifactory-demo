/**
 * AC#2: bestMove blocks the opponent's immediate winning threat when it cannot
 * win itself.
 *
 * When the opponent has two marks on a line with the third cell open, and the
 * AI has no one-ply win of its own, bestMove must return the cell that blocks
 * that winning line. Full-depth minimax makes this fall out of optimal play:
 * failing to block loses next ply, which scores worse than any alternative.
 */

import {
  createBoard,
  makeMove,
  currentPlayer,
  type Board,
} from '../src/engine';
import { bestMove } from '../src/ai';

/**
 * Play a sequence of moves from a fresh board, letting the engine derive whose
 * turn it is at each step. Returns the resulting in-progress board.
 */
function playMoves(indices: number[]): Board {
  let board = createBoard();
  for (const index of indices) {
    board = makeMove(board, index, currentPlayer(board));
  }
  return board;
}

describe("bestMove blocks the opponent's immediate winning threat", () => {
  it('blocks the top row for X when it cannot win itself', () => {
    // O threatens 0,1 -> 2. X holds only 4 and 8 and has no one-ply win.
    // X 4, O 0, X 8, O 1 -> X to move; the only non-losing move is 2.
    const board = playMoves([4, 0, 8, 1]);
    expect(currentPlayer(board)).toBe('X');
    expect(bestMove(board, 'X')).toBe(2);
  });

  it('blocks a column for O when it cannot win itself', () => {
    // X threatens 0,3 -> 6. O to move with no one-ply win of its own.
    // X 0, O 4, X 3, O 5, X 8 -> O to move must block the left column at 6.
    const board = playMoves([0, 4, 3, 5, 8]);
    expect(currentPlayer(board)).toBe('O');
    expect(bestMove(board, 'O')).toBe(6);
  });
});
