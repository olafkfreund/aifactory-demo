/**
 * AC#4: Exhaustive proof it never loses — a test plays the AI against every
 * possible sequence of opponent moves and asserts the result is always a draw
 * or an AI win, never a loss.
 *
 * We recursively explore the ENTIRE game tree in which:
 *   - the AI (playing `aiPlayer`) always plays `bestMove`, and
 *   - the opponent explores EVERY legal reply at each of its turns.
 *
 * We do this from both starting configurations (AI moves first as X, opponent
 * moves first so the AI plays O). At every terminal position we assert the
 * outcome is never a loss for the AI: it must be a draw or an AI win.
 *
 * Because the AI's move is fully determined while the opponent branches on all
 * possibilities, this visits every game the AI could ever be forced into. If it
 * never loses across all of them, it is unbeatable.
 */
import { describe, it, expect } from '@jest/globals';
import {
  createBoard,
  currentPlayer,
  availableMoves,
  status,
  type Board,
  type Player,
} from '../src/engine';
import { bestMove } from '../src/ai';

const opponentOf = (player: Player): Player => (player === 'X' ? 'O' : 'X');

/**
 * Place `player`'s mark at `index` on a copy of `board`. This mirrors the
 * engine's move semantics for empty cells on in-progress boards; the terminal
 * check itself uses the engine's own `status`.
 */
function place(board: Board, index: number, player: Player): Board {
  const next = board.slice();
  next[index] = player;
  return next;
}

/**
 * Recursively verify that from `board`, with the AI playing `aiPlayer`, the AI
 * can never lose no matter how the opponent replies. Throws (via `expect`) on
 * an AI loss; returns normally otherwise.
 */
function assertNeverLoses(board: Board, aiPlayer: Player): void {
  const state = status(board);
  if (state !== 'in_progress') {
    const aiLoss = aiPlayer === 'X' ? 'o_win' : 'x_win';
    // The AI must never reach a terminal position where it has lost:
    // every leaf is a draw or an AI win.
    expect(state).not.toBe(aiLoss);
    return;
  }

  const toMove = currentPlayer(board);

  if (toMove === aiPlayer) {
    // The AI plays its single, optimal move.
    const move = bestMove(board, aiPlayer);
    expect(move).not.toBeNull();
    assertNeverLoses(place(board, move as number, aiPlayer), aiPlayer);
    return;
  }

  // The opponent explores every legal reply.
  const opponent = opponentOf(aiPlayer);
  for (const move of availableMoves(board)) {
    assertNeverLoses(place(board, move, opponent), aiPlayer);
  }
}

describe('exhaustive proof: the AI never loses against any opponent line', () => {
  it('never loses as X (AI moves first) against every opponent sequence', () => {
    assertNeverLoses(createBoard(), 'X');
  });

  it('never loses as O (opponent moves first) against every opponent sequence', () => {
    assertNeverLoses(createBoard(), 'O');
  });
});
