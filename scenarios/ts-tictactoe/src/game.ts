/**
 * Framework-free Tic-Tac-Toe game controller.
 *
 * This module ties the pure engine (`./engine`) and the minimax AI (`./ai`)
 * together into a small, stateful controller that a UI layer can drive without
 * knowing anything about game rules. It holds the current board and the active
 * game mode and exposes three operations:
 *
 *  - `newGame(mode)`      - reset to an empty board in the given mode,
 *  - `handleCellClick(i)` - apply a human move (and, in 'vs-ai' mode, the
 *                           computer's reply),
 *  - `getState()`         - read the current board, status and turn.
 *
 * It performs no DOM access and logs nothing, so it is fully unit-testable.
 *
 * In 'two-player' mode the controller simply alternates X/O through the engine,
 * exactly like a plain hot-seat game. In 'vs-ai' mode the human always plays X
 * and moves first; after each valid human move, if the game is still in
 * progress, the controller computes O's reply with `bestMove` and applies it.
 */

import {
  Board,
  Player,
  Status,
  createBoard,
  currentPlayer,
  makeMove,
  status,
} from './engine';
import { bestMove } from './ai';

/** How the game is being played. */
export type Mode = 'two-player' | 'vs-ai';

/** The mark the AI controls in 'vs-ai' mode. The human plays X and moves first. */
const AI_PLAYER: Player = 'O';

/** A read-only snapshot of the controller's current state. */
export interface GameState {
  /** The current board (a fresh copy, safe for the caller to inspect). */
  board: Board;
  /** The active game mode. */
  mode: Mode;
  /** The overall game outcome. */
  status: Status;
  /** Whose turn it is next. */
  currentPlayer: Player;
  /** True once the game has ended (a win or a draw). */
  isOver: boolean;
}

/**
 * Stateful Tic-Tac-Toe controller. Construct one, optionally passing the
 * starting mode (defaults to 'two-player'), then drive it with
 * `handleCellClick` and read it with `getState`.
 */
export class Game {
  private board: Board;
  private mode: Mode;

  constructor(mode: Mode = 'two-player') {
    this.mode = mode;
    this.board = createBoard();
  }

  /** Start a fresh game in `mode`, clearing the board. */
  newGame(mode: Mode): void {
    this.mode = mode;
    this.board = createBoard();
  }

  /**
   * Apply the move for the cell at `index`.
   *
   * In 'two-player' mode this places the current player's mark and hands the
   * turn to the other player. In 'vs-ai' mode this places the human's (X's)
   * mark and, if the game is still in progress, immediately plays the AI's (O's)
   * optimal reply.
   *
   * The click is ignored (a no-op) when the game is already over, when it is not
   * a human's turn, or when the target cell is occupied or out of range.
   */
  handleCellClick(index: number): void {
    if (status(this.board) !== 'in_progress') {
      return;
    }

    const human = currentPlayer(this.board);

    // In 'vs-ai' mode only the human (X) may click; ignore clicks made while it
    // is the AI's turn.
    if (this.mode === 'vs-ai' && human === AI_PLAYER) {
      return;
    }

    // Reject illegal clicks (occupied or out-of-range cells) without throwing,
    // so a stray UI click is simply a no-op.
    let afterHuman: Board;
    try {
      afterHuman = makeMove(this.board, index, human);
    } catch {
      return;
    }
    this.board = afterHuman;

    if (this.mode !== 'vs-ai') {
      return;
    }

    // Let the AI respond if the human's move did not end the game.
    if (status(this.board) !== 'in_progress') {
      return;
    }

    const aiIndex = bestMove(this.board, AI_PLAYER);
    if (aiIndex === null) {
      return;
    }
    this.board = makeMove(this.board, aiIndex, AI_PLAYER);
  }

  /** A snapshot of the current game state. The board is a defensive copy. */
  getState(): GameState {
    const currentStatus = status(this.board);
    return {
      board: this.board.slice(),
      mode: this.mode,
      status: currentStatus,
      currentPlayer: currentPlayer(this.board),
      isOver: currentStatus !== 'in_progress',
    };
  }
}
