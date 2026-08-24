// Tests for the pure Tic Tac Toe engine, using the built-in node:test runner
// and node:assert/strict (zero external dependencies).
//
// Run with: node --test web/tictactoe/src/

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EMPTY,
  emptyBoard,
  winner,
  isDraw,
  status,
  availableMoves,
  applyMove,
  bestMove,
} from './engine.js';

// applyMove: invalid-move rejection ------------------------------------
test('applyMove rejects an out-of-range index and leaves the board unchanged', () => {
  const board = emptyBoard();
  assert.throws(() => applyMove(board, -1, 'X'), /out of range/);
  assert.throws(() => applyMove(board, 9, 'X'), /out of range/);
  assert.throws(() => applyMove(board, 1.5, 'X'), /out of range/);
  assert.deepEqual(board, emptyBoard());
});

test('applyMove rejects a move onto an occupied cell and does not mutate', () => {
  const board = applyMove(emptyBoard(), 0, 'X');
  const before = board.slice();
  assert.throws(() => applyMove(board, 0, 'O'), /occupied/);
  assert.deepEqual(board, before);
});

test('applyMove returns a new board without mutating the original', () => {
  const board = emptyBoard();
  const next = applyMove(board, 4, 'X');
  assert.equal(board[4], EMPTY);
  assert.equal(next[4], 'X');
  assert.notEqual(board, next);
});

// winner / isDraw / status: detection ----------------------------------
test('winner detects a win in every row, column, and diagonal', () => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    const board = emptyBoard();
    board[a] = 'X';
    board[b] = 'X';
    board[c] = 'X';
    assert.equal(winner(board), 'X');
    assert.equal(status(board), 'X');
  }
});

test('winner returns null and status is in_progress on a fresh board', () => {
  const board = emptyBoard();
  assert.equal(winner(board), null);
  assert.equal(isDraw(board), false);
  assert.equal(status(board), 'in_progress');
});

test('isDraw detects a full board with no three-in-a-row', () => {
  // X O X
  // X O O
  // O X X
  const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
  assert.equal(winner(board), null);
  assert.equal(isDraw(board), true);
  assert.equal(status(board), 'draw');
});

// bestMove: fast-feedback acceptance criteria --------------------------
test('bestMove takes an available one-ply winning move', () => {
  // X can win by playing index 2 to complete the top row.
  // X X _
  // O O _
  // _ _ _
  const board = ['X', 'X', EMPTY, 'O', 'O', EMPTY, EMPTY, EMPTY, EMPTY];
  assert.equal(bestMove(board, 'X'), 2);
});

test("bestMove blocks the opponent's immediate winning threat", () => {
  // O threatens to win at index 5 (completing the middle row). X cannot win
  // this ply, so it must block at 5.
  // X _ _
  // O O _
  // X _ _
  const board = ['X', EMPTY, EMPTY, 'O', 'O', EMPTY, 'X', EMPTY, EMPTY];
  assert.equal(bestMove(board, 'X'), 5);
});

test('bestMove returns centre (index 4) on an empty board', () => {
  assert.equal(bestMove(emptyBoard(), 'X'), 4);
});

test('bestMove returns null when no moves remain', () => {
  const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
  assert.equal(bestMove(board, 'X'), null);
});

// EXHAUSTIVE PROOF: the AI never loses ---------------------------------
//
// Recursively explore every possible sequence of opponent moves against the
// AI (which always plays bestMove). At each opponent turn we branch over ALL
// legal opponent replies; at each AI turn the AI plays its single chosen move.
// Every terminal position must be a draw or an AI win — never an AI loss.
//
// We run the search for both the AI-moves-first and opponent-moves-first
// cases, so the AI is proven unbeatable as either X or O.

/**
 * @param {string[]} board current position
 * @param {'X'|'O'} ai the mark the AI plays
 * @param {'X'|'O'} human the mark the opponent plays
 * @param {'ai'|'human'} turn whose move it is
 */
function assertAiNeverLoses(board, ai, human, turn) {
  const win = winner(board);
  if (win !== null) {
    assert.notEqual(win, human, `AI (${ai}) lost from position ${board.join('')}`);
    return;
  }
  if (isDraw(board)) return;

  if (turn === 'ai') {
    const move = bestMove(board, ai);
    assert.notEqual(move, null, 'AI must have a move while the game is in progress');
    assertAiNeverLoses(applyMove(board, move, ai), ai, human, 'human');
  } else {
    // Branch over every legal opponent reply.
    for (const move of availableMoves(board)) {
      assertAiNeverLoses(applyMove(board, move, human), ai, human, 'ai');
    }
  }
}

test('exhaustive proof: AI moving first (as X) never loses against any opponent', () => {
  assertAiNeverLoses(emptyBoard(), 'X', 'O', 'ai');
});

test('exhaustive proof: AI moving second (as O) never loses against any opponent', () => {
  assertAiNeverLoses(emptyBoard(), 'O', 'X', 'human');
});
