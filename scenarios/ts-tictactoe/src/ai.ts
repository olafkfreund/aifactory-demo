/**
 * Unbeatable Tic-Tac-Toe AI.
 *
 * `bestMove` runs a full-depth minimax search over the entire 3x3 game tree and
 * returns the optimal move for the player to act. Because the tree is tiny
 * (at most 9! leaves) an exhaustive search is instantaneous and provably
 * optimal: the AI never loses.
 *
 * Scoring is depth-aware so the AI prefers faster wins and slower losses:
 *   - a win is worth `+10 - depth` (win sooner => higher score),
 *   - a loss is worth `-10 + depth` (lose later => higher score),
 *   - a draw is worth `0`.
 *
 * Tie-breaking is deterministic: among equally-scored moves the centre is
 * preferred first, then the lowest cell index. This keeps behaviour testable.
 *
 * All functions are pure: they never mutate their inputs and never touch the
 * console or the DOM.
 */

import {
  Board,
  Player,
  availableMoves,
  status,
  winner,
} from './engine';

/** The centre cell of a 3x3 board. */
const CENTER = 4;

/** The opponent of `player`. */
function opponent(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}

/**
 * Place `player`'s mark at `index` on a copy of `board`, without the turn-order
 * and game-over checks that `engine.makeMove` enforces. The search only ever
 * calls this for empty cells on in-progress boards, so the guards are
 * unnecessary here and their absence keeps the recursion simple and fast.
 */
function place(board: Board, index: number, player: Player): Board {
  const next = board.slice();
  next[index] = player;
  return next;
}

/**
 * Minimax score of `board` from the perspective of `aiPlayer`, assuming both
 * sides play optimally. `toMove` is the player whose turn it is at this node
 * and `depth` is the number of plies already played from the root.
 */
function minimax(
  board: Board,
  aiPlayer: Player,
  toMove: Player,
  depth: number,
): number {
  const win = winner(board);
  if (win !== null) {
    return win === aiPlayer ? 10 - depth : depth - 10;
  }
  if (status(board) === 'draw') {
    return 0;
  }

  const moves = availableMoves(board);
  const maximizing = toMove === aiPlayer;
  let best = maximizing ? -Infinity : Infinity;

  for (const move of moves) {
    const score = minimax(
      place(board, move, toMove),
      aiPlayer,
      opponent(toMove),
      depth + 1,
    );
    best = maximizing ? Math.max(best, score) : Math.min(best, score);
  }

  return best;
}

/**
 * The optimal move for `player` on `board`, chosen by full-depth minimax.
 *
 * Returns the cell index to play, or `null` when there is no legal move (the
 * board is full or the game is already decided).
 *
 * Guarantees, all of which fall out of exhaustive optimal play:
 *  - takes an immediate one-ply win when one is available,
 *  - blocks the opponent's immediate winning threat when it cannot win itself,
 *  - plays the centre on an empty board.
 *
 * Ties are broken deterministically: centre first, then lowest index.
 */
export function bestMove(board: Board, player: Player): number | null {
  if (status(board) !== 'in_progress') {
    return null;
  }

  const moves = availableMoves(board);
  if (moves.length === 0) {
    return null;
  }

  let bestScore = -Infinity;
  let bestIndex = moves[0];

  for (const move of moves) {
    const score = minimax(
      place(board, move, player),
      player,
      opponent(player),
      1,
    );

    if (
      score > bestScore ||
      (score === bestScore && move === CENTER && bestIndex !== CENTER)
    ) {
      bestScore = score;
      bestIndex = move;
    }
  }

  return bestIndex;
}
