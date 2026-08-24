// AC#4: Exhaustive proof it never loses — AI moving first (X) never loses
// against any opponent move sequence (draw or AI win only).
//
// Strategy: with the AI playing X (moving first), let the opponent (O) try
// EVERY legal reply at each of its turns. At every AI turn the AI plays
// bestMove. Recurse the full game tree and assert that no terminal state ever
// has the opponent as the winner.
"use strict";

const { createGame, makeMove, bestMove } = require("./game.js");

describe("AC#4: AI moving first (X) never loses against any opponent line", () => {
  // Walk the entire game tree with the AI as X and the opponent as O.
  // Returns the number of completed games inspected.
  function playOutAllOpponentLines(aiMark) {
    const opponentMark = aiMark === "X" ? "O" : "X";
    let gamesPlayed = 0;
    let aiLosses = 0;

    function recurse(state) {
      if (state.winner !== null || state.isDraw) {
        gamesPlayed++;
        if (state.winner === opponentMark) {
          aiLosses++;
        }
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
    return { gamesPlayed, aiLosses };
  }

  test("no opponent move sequence ever beats the AI when it moves first (X)", () => {
    const { aiLosses } = playOutAllOpponentLines("X");
    expect(aiLosses).toBe(0);
  });

  test("every reachable game against the AI (X) ends in an AI win or a draw", () => {
    const { gamesPlayed, aiLosses } = playOutAllOpponentLines("X");
    // Every completed game must be a non-loss for the AI.
    expect(aiLosses).toBe(0);
    // Sanity: the exhaustive walk actually inspected some finished games.
    expect(gamesPlayed).toBeGreaterThan(0);
  });
});
