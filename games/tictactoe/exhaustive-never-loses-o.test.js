// AC#4: Exhaustive proof it never loses — AI moving second (O) never loses
// against any opponent move sequence.
//
// With the AI playing O (moving second), we play bestMove for the AI against
// EVERY legal opponent (X) move sequence — the opponent tries every empty cell
// at each of its turns — and assert every completed game ends in a draw or an
// AI win. The opponent mark (X) must never be the winner.

"use strict";

const { createGame, makeMove, bestMove } = require("./game.js");

describe("AC#4: AI moving second (O) never loses against any opponent line", () => {
  // Recursively expand the full game tree: the AI (O) plays its single optimal
  // move; the opponent (X) branches over every legal move. Returns the number
  // of terminal games checked and asserts the AI never loses along the way.
  function playAllOpponentLines(aiMark) {
    const opponentMark = aiMark === "X" ? "O" : "X";
    let gamesPlayed = 0;

    function recurse(state) {
      if (state.winner !== null || state.isDraw) {
        gamesPlayed++;
        expect(state.winner).not.toBe(opponentMark);
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
    return gamesPlayed;
  }

  it("never loses as O against every legal opponent (X) move sequence", () => {
    const gamesPlayed = playAllOpponentLines("O");
    expect(gamesPlayed).toBeGreaterThan(0);
  });
});
