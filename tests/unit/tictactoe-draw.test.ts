// AC#5: A full board with no winner reports a draw.
//
// Subtask: full-board-reports-draw
// Verify a full board with no three-in-a-row sets isDraw true, winner null,
// winningLine null, and isBoardFull true.
//
// Target: games/tictactoe/game.js::makeMove
//
// The tic-tac-toe engine is a CommonJS module (module.exports), so it is
// consumed here with require against the module under test.

const { createGame, isBoardFull, makeMove } = require("../../games/tictactoe/game.js");

// Apply a sequence of cell indexes to a fresh game, alternating players.
function play(indexes: number[]) {
  let state = createGame();
  for (const index of indexes) {
    state = makeMove(state, index);
  }
  return state;
}

describe("makeMove — full board with no winner reports a draw (AC#5)", () => {
  // Final board (X to move first), no three-in-a-row on any line:
  //   X O X
  //   X O O
  //   O X X
  const DRAW_MOVES = [0, 1, 2, 4, 3, 5, 7, 6, 8];

  it("sets isDraw true once the board fills with no winner", () => {
    const state = play(DRAW_MOVES);
    expect(state.isDraw).toBe(true);
  });

  it("reports no winner on the drawn board", () => {
    const state = play(DRAW_MOVES);
    expect(state.winner).toBeNull();
  });

  it("reports no winningLine on the drawn board", () => {
    const state = play(DRAW_MOVES);
    expect(state.winningLine).toBeNull();
  });

  it("leaves the board full when the game is a draw", () => {
    const state = play(DRAW_MOVES);
    expect(isBoardFull(state.board)).toBe(true);
  });
});
