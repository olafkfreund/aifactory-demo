// AC#2: bestMove blocks the opponent's immediate winning threat when it
// cannot win itself.
//
// When the opponent already has two marks on a line and an empty third cell
// that would complete it, and the AI has no one-ply win of its own, the only
// non-losing move is to take that third cell. This test builds such a
// position and asserts bestMove returns the blocking index.

import { bestMove } from "app/games/tictactoe/game.js";

type Cell = "X" | "O" | null;

interface GameState {
  board: Cell[];
  currentPlayer: "X" | "O";
  winner: Cell;
  winningLine: number[] | null;
  isDraw: boolean;
}

// Build a game state from a compact array ('.' for empty). The position here
// is mid-game and non-terminal, so winner/winningLine/isDraw are all falsy.
function stateFrom(cells: string[], currentPlayer: "X" | "O"): GameState {
  const board: Cell[] = cells.map((c) => (c === "." ? null : (c as Cell)));
  return {
    board,
    currentPlayer,
    winner: null,
    winningLine: null,
    isDraw: false,
  };
}

describe("bestMove blocks the opponent's immediate winning threat", () => {
  it("returns the blocking index when the opponent threatens an immediate win", () => {
    // O holds cells 3 and 4 and threatens to win at 5; X (to move) cannot
    // complete any line of its own this ply, so it must block at 5.
    const state = stateFrom(
      ["X", ".", ".", "O", "O", ".", ".", ".", "."],
      "X"
    );

    expect(bestMove(state)).toBe(5);
  });

  it("blocks a threatening column when it cannot win itself", () => {
    // O holds cells 0 and 3 and threatens to win at 6; X (to move) has only a
    // single mark and no immediate win, so the only non-losing reply is 6.
    const state = stateFrom(
      ["O", "X", ".", "O", ".", ".", ".", ".", "."],
      "X"
    );

    expect(bestMove(state)).toBe(6);
  });
});
