// AC#3: bestMove takes the centre on an empty board.
//
// On a fresh, empty 3x3 board every opening move scores identically under
// full-depth minimax, so the deterministic tie-break (centre first) must pick
// the centre cell, index 4.
import { describe, it, expect } from 'vitest';
import { createBoard } from '../src/engine';
import { bestMove } from '../src/ai';

describe('bestMove takes the centre on an empty board (AC#3)', () => {
  it('returns cell 4 (the centre) for X on an empty board', () => {
    expect(bestMove(createBoard(), 'X')).toBe(4);
  });

  it('returns cell 4 (the centre) for O on an empty board', () => {
    expect(bestMove(createBoard(), 'O')).toBe(4);
  });
});
