import { describe, it, expect } from 'vitest';
import { Game } from '../src/game';
import { availableMoves } from '../src/engine';

/**
 * Count the marks currently on a controller's board, so tests can assert how
 * many plies have actually been played after a click.
 */
function markCount(board: (string | null)[]): number {
  return board.filter((cell) => cell !== null).length;
}

describe('two-player mode alternates X/O with no AI interference', () => {
  it('places exactly one mark per click and hands the turn to the other player', () => {
    const game = new Game('two-player');

    expect(game.getState().currentPlayer).toBe('X');

    game.handleCellClick(0);
    let state = game.getState();
    // A single human move: X placed, and it is now O's turn. The AI must not
    // have moved on top of the human's click.
    expect(state.board[0]).toBe('X');
    expect(markCount(state.board)).toBe(1);
    expect(state.currentPlayer).toBe('O');

    game.handleCellClick(1);
    state = game.getState();
    expect(state.board[1]).toBe('O');
    expect(markCount(state.board)).toBe(2);
    expect(state.currentPlayer).toBe('X');
  });

  it('lets a full hot-seat game reach a human-decided win with no AI moves', () => {
    const game = new Game('two-player');

    // X 0, O 3, X 1, O 4, X 2 -> X completes the top row.
    for (const index of [0, 3, 1, 4, 2]) {
      game.handleCellClick(index);
    }

    const state = game.getState();
    expect(state.status).toBe('x_win');
    expect(state.isOver).toBe(true);
    // Five deliberate moves, nothing injected by an AI.
    expect(markCount(state.board)).toBe(5);
  });

  it('ignores illegal and post-game clicks without mutating the board', () => {
    const game = new Game('two-player');

    game.handleCellClick(0);
    // Clicking an occupied cell is a no-op.
    game.handleCellClick(0);
    let state = game.getState();
    expect(markCount(state.board)).toBe(1);
    expect(state.currentPlayer).toBe('O');

    // Out-of-range clicks are ignored too.
    game.handleCellClick(99);
    game.handleCellClick(-1);
    state = game.getState();
    expect(markCount(state.board)).toBe(1);
  });
});

describe('vs-ai mode plays a computer reply after the human move', () => {
  it('answers a human move with an AI move while the game is in progress', () => {
    const game = new Game('vs-ai');

    game.handleCellClick(0);
    const state = game.getState();
    // The human's X and the AI's O should both be on the board.
    expect(state.board[0]).toBe('X');
    expect(markCount(state.board)).toBe(2);
    // After X then O, it is X's (the human's) turn again.
    expect(state.currentPlayer).toBe('X');
    expect(state.status).toBe('in_progress');
  });

  it('does not attempt an AI reply after the human move ends the game', () => {
    const game = new Game('vs-ai');

    // Play a full game by always taking the first available cell for the human;
    // the AI replies each turn. The game must reach a terminal position without
    // the controller throwing (which it would if it tried to move on a full or
    // finished board).
    while (!game.getState().isOver) {
      const moves = availableMoves(game.getState().board);
      game.handleCellClick(moves[0]);
    }

    const state = game.getState();
    expect(state.isOver).toBe(true);
    // The AI is unbeatable, so the human (X) can never win this line.
    expect(state.status).not.toBe('x_win');
  });

  it('ignores clicks once the game is over', () => {
    const game = new Game('vs-ai');
    // Play until the game ends, always taking the first available cell.
    while (!game.getState().isOver) {
      const moves = availableMoves(game.getState().board);
      game.handleCellClick(moves[0]);
    }

    const before = game.getState();
    expect(before.isOver).toBe(true);
    const countBefore = markCount(before.board);

    // Any further click is a no-op.
    const remaining = availableMoves(before.board);
    game.handleCellClick(remaining[0] ?? 0);
    expect(markCount(game.getState().board)).toBe(countBefore);
  });
});

describe('the AI never loses through the controller path', () => {
  /**
   * Re-drive a fresh vs-ai controller by replaying the exact sequence of human
   * clicks. Each click also re-applies the AI's deterministic O reply, so the
   * resulting position is fully reproducible from the human move order alone.
   */
  function driveHumanMoves(humanMoves: number[]): Game {
    const game = new Game('vs-ai');
    for (const move of humanMoves) {
      game.handleCellClick(move);
    }
    return game;
  }

  /**
   * Exhaustively explore every human line against the controller. The human
   * plays X (and moves first); after each human click the controller injects
   * the AI's O reply. Because the human branches on every legal cell while the
   * AI's move is fully determined, this visits every game the AI could be
   * forced into. At every terminal position we assert the human (X) never wins.
   *
   * `humanMoves` is the exact click sequence that produced the current state,
   * threaded through so each branch can be reproduced from scratch.
   */
  function assertControllerNeverLoses(humanMoves: number[]): void {
    const game = driveHumanMoves(humanMoves);
    const state = game.getState();

    if (state.isOver) {
      // The AI plays O, so an AI loss would show up as an X win.
      expect(state.status).not.toBe('x_win');
      return;
    }

    // Only the human (X) chooses here; the AI's reply is applied inside the
    // controller during handleCellClick.
    expect(state.currentPlayer).toBe('X');
    for (const move of availableMoves(state.board)) {
      assertControllerNeverLoses([...humanMoves, move]);
    }
  }

  it('never lets the human (X) win in vs-ai mode against any line', () => {
    assertControllerNeverLoses([]);
  });
});
