// AC#3: bestMove takes the centre on an empty board.
//
// On a fresh, empty board every move is minimax-equivalent (all lead to a
// draw under optimal play), so a well-behaved AI should break the tie in
// favour of the strongest square: the centre, index 4. This test builds a
// fresh game state and asserts bestMove returns exactly 4.

import { bestMove, newGame } from "app/games/tictactoe/game.js";

type Cell = "X" | "O" | null;

interface GameState {
  board: Cell[];
  currentPlayer: "X" | "O";
  winner: Cell;
  winningLine: number[] | null;
  isDraw: boolean;
}

describe("AC#3: bestMove takes the centre on an empty board", () => {
  it("returns index 4 (the centre) for a fresh empty board", () => {
    const state: GameState = newGame();

    expect(bestMove(state)).toBe(4);
  });

  it("returns index 4 for an explicitly-constructed empty board", () => {
    // Same criterion, expressed without relying on newGame's shape: an all-null
    // board with X to move must resolve to the centre.
    const state: GameState = {
      board: [null, null, null, null, null, null, null, null, null],
      currentPlayer: "X",
      winner: null,
      winningLine: null,
      isDraw: false,
    };

    expect(bestMove(state)).toBe(4);
  });
});
