/**
 * AC#6: Two-player mode still works unchanged when the toggle is off.
 *
 * These tests drive `Game` in 'two-player' mode and prove it behaves like a
 * plain hot-seat game: each human click places exactly one mark, the turn
 * alternates X -> O -> X, and the controller never injects an AI reply of its
 * own. This is the "toggle off" path that must remain unchanged after the
 * minimax opponent was added.
 *
 * NOTE: this project runs its unit suite with vitest (see package.json's
 * `vitest run` script and the sibling *.test.ts files), so we import the
 * describe/it/expect harness from 'vitest' and the module under test via the
 * same relative `../src/game` path the existing tests use.
 */

import { describe, it, expect } from 'vitest';
import { Game } from '../src/game';
import { availableMoves } from '../src/engine';

/** Count the marks currently on the board, so a click can be shown to add exactly one. */
function markCount(board: (string | null)[]): number {
  return board.filter((cell) => cell !== null).length;
}

describe('AC#6: two-player mode alternates X/O with no AI reply', () => {
  it('starts a two-player game on X with an empty board', () => {
    const game = new Game('two-player');
    const state = game.getState();

    expect(state.mode).toBe('two-player');
    expect(markCount(state.board)).toBe(0);
    expect(state.currentPlayer).toBe('X');
    expect(state.isOver).toBe(false);
  });

  it('adds exactly one mark per click, never an AI reply on top of it', () => {
    const game = new Game('two-player');

    game.handleCellClick(0);
    let state = game.getState();
    // Only the human's X should be present; the controller must not add O.
    expect(state.board[0]).toBe('X');
    expect(markCount(state.board)).toBe(1);
    expect(state.currentPlayer).toBe('O');

    game.handleCellClick(1);
    state = game.getState();
    expect(state.board[1]).toBe('O');
    expect(markCount(state.board)).toBe(2);
    expect(state.currentPlayer).toBe('X');
  });

  it('alternates X and O strictly across a sequence of clicks', () => {
    const game = new Game('two-player');
    const expectedMarks = ['X', 'O', 'X', 'O'];

    [0, 1, 2, 3].forEach((cell, i) => {
      game.handleCellClick(cell);
      expect(game.getState().board[cell]).toBe(expectedMarks[i]);
      // After n plies the mark count is exactly n: nothing extra injected.
      expect(markCount(game.getState().board)).toBe(i + 1);
    });

    // After four alternating human moves it is X's turn again.
    expect(game.getState().currentPlayer).toBe('X');
  });

  it('reaches a human-decided win with no AI moves injected', () => {
    const game = new Game('two-player');

    // X 0, O 3, X 1, O 4, X 2 -> X completes the top row in exactly 5 plies.
    for (const index of [0, 3, 1, 4, 2]) {
      game.handleCellClick(index);
    }

    const state = game.getState();
    expect(state.status).toBe('x_win');
    expect(state.isOver).toBe(true);
    // Five deliberate human moves and nothing else on the board.
    expect(markCount(state.board)).toBe(5);
  });

  it('ignores an occupied-cell click as a no-op', () => {
    const game = new Game('two-player');

    game.handleCellClick(4);
    game.handleCellClick(4); // occupied -> ignored, turn does not pass back

    const state = game.getState();
    expect(state.board[4]).toBe('X');
    expect(markCount(state.board)).toBe(1);
    expect(state.currentPlayer).toBe('O');
  });

  it('ignores clicks once the game is over', () => {
    const game = new Game('two-player');

    for (const index of [0, 3, 1, 4, 2]) {
      game.handleCellClick(index);
    }
    expect(game.getState().isOver).toBe(true);

    const remaining = availableMoves(game.getState().board);
    game.handleCellClick(remaining[0]);

    // No further mark is placed after the game ends.
    expect(markCount(game.getState().board)).toBe(5);
  });
});
