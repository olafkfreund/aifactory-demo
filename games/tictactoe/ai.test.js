// Run from the repo root with:
//   node --test games/tictactoe/ai.test.js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, makeMove, bestMove } = require("./game.js");

// Apply a sequence of cell indexes to a fresh game, alternating players.
function play(indexes) {
  let state = createGame();
  for (const index of indexes) {
    state = makeMove(state, index);
  }
  return state;
}

test("bestMove takes the winning move when one is available in one ply", () => {
  // X: 0,1 played, O: 3,4 played. X to move; X wins by taking 2 (top row).
  const state = play([0, 3, 1, 4]);
  assert.equal(state.currentPlayer, "X");
  assert.equal(bestMove(state), 2);
});

test("bestMove blocks the opponent's immediate winning threat when it cannot win itself", () => {
  // X: 0,4 played (no immediate win). O: 1,2 played, threatening to win at 0? No —
  // O has 1 and 2; the third cell of that row is 0, which is already X's, so pick a
  // genuine threat instead: O has 3 and 4... build one explicitly.
  // Board:
  //   X . .
  //   O O .
  //   X . .
  // O threatens to win at index 5. X cannot win this turn, so it must block.
  let state = createGame();
  state = makeMove(state, 0); // X
  state = makeMove(state, 3); // O
  state = makeMove(state, 6); // X
  state = makeMove(state, 4); // O -- O now has 3,4; threatens 5
  assert.equal(state.currentPlayer, "X");
  assert.equal(bestMove(state), 5);
});

test("bestMove takes the centre on an empty board", () => {
  const state = createGame();
  assert.equal(bestMove(state), 4);
});

test("bestMove returns null once the game is decided", () => {
  const won = play([0, 3, 1, 4, 2]); // X wins the top row
  assert.equal(won.winner, "X");
  assert.equal(bestMove(won), null);

  const drawn = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
  assert.equal(drawn.isDraw, true);
  assert.equal(bestMove(drawn), null);
});

// Exhaustive proof it never loses: play the AI against EVERY possible sequence
// of opponent moves (the opponent tries every legal reply at every one of its
// turns) and assert the result is always a draw or an AI win — never a loss.
// Run once with the AI moving first (as X) and once moving second (as O).
function assertAiNeverLoses(aiMark) {
  const opponentMark = aiMark === "X" ? "O" : "X";
  let gamesPlayed = 0;

  function recurse(state) {
    if (state.winner !== null || state.isDraw) {
      gamesPlayed++;
      assert.notEqual(
        state.winner,
        opponentMark,
        `AI (${aiMark}) lost with board ${JSON.stringify(state.board)}`
      );
      return;
    }

    if (state.currentPlayer === aiMark) {
      const move = bestMove(state);
      recurse(makeMove(state, move));
    } else {
      for (let i = 0; i < 9; i++) {
        if (state.board[i] === null) {
          recurse(makeMove(state, i));
        }
      }
    }
  }

  recurse(createGame());
  assert.ok(gamesPlayed > 0, "expected at least one completed game to be checked");
  return gamesPlayed;
}

test("exhaustive proof: AI moving first (X) never loses against any opponent move sequence", () => {
  assertAiNeverLoses("X");
});

test("exhaustive proof: AI moving second (O) never loses against any opponent move sequence", () => {
  assertAiNeverLoses("O");
});
