// Run with: node --test games/tictactoe/game.test.js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, move, WIN_LINES } = require("./game.js");

// Plays a sequence of cell indices alternating X/O starting from a fresh
// game, without any special handling — used by tests that just need to
// drive moves in and inspect the resulting state.
function play(indices) {
  let state = createGame();
  for (const index of indices) {
    state = move(state, index);
  }
  return state;
}

test("new game starts empty, X to move, not over", () => {
  const state = createGame();
  assert.deepEqual(state.board, Array(9).fill(null));
  assert.equal(state.current, "X");
  assert.equal(state.over, false);
  assert.equal(state.winner, null);
  assert.equal(state.draw, false);
});

test("clicking an empty cell places the mark and passes the turn", () => {
  const state = move(createGame(), 4);
  assert.equal(state.board[4], "X");
  assert.equal(state.current, "O");
  assert.equal(state.over, false);
});

test("clicking an occupied cell does nothing", () => {
  const afterFirst = move(createGame(), 0); // X at 0, turn -> O
  const afterSecond = move(afterFirst, 0); // O tries same cell
  assert.deepEqual(afterSecond.board, afterFirst.board);
  assert.equal(afterSecond.current, afterFirst.current, "turn must not pass");
  assert.equal(afterSecond.over, false);
});

test("out-of-range index is rejected without error", () => {
  const state = createGame();
  assert.doesNotThrow(() => move(state, -1));
  assert.doesNotThrow(() => move(state, 9));
  const after = move(state, 9);
  assert.deepEqual(after.board, state.board);
  assert.equal(after.current, state.current);
});

// Each entry plays X into a winning line while O plays elsewhere
// (cells not on the line), verifying every one of the 8 lines is detected.
const OFF_LINE_CELLS_POOL = Array.from({ length: 9 }, (_, i) => i);

for (const [lineIndex, line] of WIN_LINES.entries()) {
  test(`detects win on line ${lineIndex} (${line.join(",")})`, () => {
    const offLine = OFF_LINE_CELLS_POOL.filter((c) => !line.includes(c));
    // Interleave: X, O, X, O, X -> X completes the line on move 3.
    const moves = [line[0], offLine[0], line[1], offLine[1], line[2]];
    const state = play(moves);
    assert.equal(state.over, true);
    assert.equal(state.winner, "X");
    assert.deepEqual(state.line, line);
    assert.equal(state.draw, false);
  });
}

test("winning line is exposed for UI highlighting", () => {
  const state = play([0, 3, 1, 4, 2]); // X: 0,1,2 top row
  assert.deepEqual(state.line, [0, 1, 2]);
});

test("a full board with no winner reports a draw", () => {
  // X O X
  // X O O
  // O X X
  const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
  const state = play(moves);
  assert.equal(state.board.every((c) => c !== null), true);
  assert.equal(state.draw, true);
  assert.equal(state.winner, null);
  assert.equal(state.over, true);
});

test("play stops once a game is won; further clicks do nothing", () => {
  const won = play([0, 3, 1, 4, 2]); // X wins top row
  assert.equal(won.over, true);
  const after = move(won, 5);
  assert.deepEqual(after.board, won.board);
  assert.equal(after.current, won.current);
  assert.equal(after.winner, won.winner);
  assert.equal(after.over, true);
});

test("play stops once a game is drawn; further clicks do nothing", () => {
  const drawn = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
  assert.equal(drawn.draw, true);
  // Board is full, but even hypothetically re-clicking a cell must no-op.
  const after = move(drawn, 0);
  assert.deepEqual(after.board, drawn.board);
  assert.equal(after.draw, true);
  assert.equal(after.over, true);
});

test("New game resets to an empty board with X to move", () => {
  const played = play([0, 3, 1, 4, 2]);
  assert.equal(played.over, true);
  const fresh = createGame();
  assert.deepEqual(fresh.board, Array(9).fill(null));
  assert.equal(fresh.current, "X");
  assert.equal(fresh.over, false);
  assert.equal(fresh.winner, null);
  assert.equal(fresh.draw, false);
});
