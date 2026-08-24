// Run from the repo root with:
//   node --test games/tictactoe/game.test.js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, checkWinner, isBoardFull, makeMove, WIN_LINES } = require("./game.js");

// Apply a sequence of cell indexes to a fresh game, alternating players.
function play(indexes) {
  let state = createGame();
  for (const index of indexes) {
    state = makeMove(state, index);
  }
  return state;
}

test("createGame returns an empty board with X to move and no winner", () => {
  const state = createGame();
  assert.deepEqual(state.board, new Array(9).fill(null));
  assert.equal(state.currentPlayer, "X");
  assert.equal(state.winner, null);
  assert.equal(state.winningLine, null);
  assert.equal(state.isDraw, false);
});

test("placing a mark on an empty cell fills it and passes the turn", () => {
  const state = makeMove(createGame(), 4);
  assert.equal(state.board[4], "X");
  assert.equal(state.currentPlayer, "O");
});

test("clicking an occupied cell is a no-op: no turn change, no error", () => {
  const afterFirst = makeMove(createGame(), 0); // X at 0, O to move
  const afterSecond = makeMove(afterFirst, 0); // O tries the same cell
  assert.deepEqual(afterSecond, afterFirst);
  assert.equal(afterSecond.board[0], "X");
  assert.equal(afterSecond.currentPlayer, "O");
});

test("an out-of-range index is rejected without throwing or mutating state", () => {
  const before = createGame();
  assert.doesNotThrow(() => makeMove(before, 9));
  assert.doesNotThrow(() => makeMove(before, -1));
  const after = makeMove(before, 9);
  assert.deepEqual(after, before);
});

test("checkWinner reports no winner on an empty board", () => {
  assert.deepEqual(checkWinner(new Array(9).fill(null)), { winner: null, line: null });
});

test("all 8 winning lines are detected", () => {
  for (const line of WIN_LINES) {
    const board = new Array(9).fill(null);
    for (const index of line) board[index] = "X";
    const result = checkWinner(board);
    assert.equal(result.winner, "X");
    assert.deepEqual(result.line, line);
  }
});

test("each of the 8 winning lines ends the game via makeMove and marks the line", () => {
  for (const line of WIN_LINES) {
    // X plays the three cells of `line`; O plays three other, non-winning cells.
    const others = Array.from({ length: 9 }, (_, i) => i).filter((i) => !line.includes(i));
    const moves = [line[0], others[0], line[1], others[1], line[2]];

    const state = play(moves);

    assert.equal(state.winner, "X");
    assert.deepEqual([...state.winningLine].sort(), [...line].sort());
  }
});

test("a full board with no three-in-a-row is a draw", () => {
  // X O X
  // X O O
  // O X X
  const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
  const state = play(moves);

  assert.equal(state.winner, null);
  assert.equal(state.winningLine, null);
  assert.equal(state.isDraw, true);
  assert.equal(isBoardFull(state.board), true);
});

test("play stops once a game is won: further clicks do nothing", () => {
  // X wins the top row on move 5 (index 2); O then tries to play cell 8.
  const moves = [0, 3, 1, 4, 2];
  const wonState = play(moves);
  assert.equal(wonState.winner, "X");

  const afterExtraClick = makeMove(wonState, 8);
  assert.deepEqual(afterExtraClick, wonState);
  assert.equal(afterExtraClick.board[8], null);
});

test("play stops once a game is drawn: further clicks do nothing", () => {
  const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
  const drawnState = play(moves);
  assert.equal(drawnState.isDraw, true);

  // Board is full, so there is no empty cell left to click — reapplying the
  // last move must still be rejected without changing state.
  const afterExtraClick = makeMove(drawnState, 8);
  assert.deepEqual(afterExtraClick, drawnState);
});

test("isBoardFull is false until every cell is filled", () => {
  const board = new Array(9).fill(null);
  assert.equal(isBoardFull(board), false);
  board.fill("X");
  assert.equal(isBoardFull(board), true);
});

test("New game resets to an empty board with X to move", () => {
  const played = play([0, 1, 2, 4, 3]); // X has won
  const reset = createGame();
  assert.deepEqual(reset.board, new Array(9).fill(null));
  assert.equal(reset.currentPlayer, "X");
  assert.equal(reset.winner, null);
  assert.notDeepEqual(reset, played);
});
