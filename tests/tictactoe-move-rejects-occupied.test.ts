// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// move(state, index) must treat an already-occupied cell as a pure no-op:
// it returns the SAME state reference (===), does not overwrite the existing
// mark, does not pass the turn, and never throws. Out-of-range and
// non-integer indices are rejected the same way.
//
// The module under test is imported via the shared `app` root used by every
// subtask in this spec.
import { move, newGame } from "app/games/tictactoe/game";

describe("move() rejects an occupied cell (AC#3)", () => {
  it("returns the exact same state reference when the target cell is occupied", () => {
    const afterX = move(newGame(), 0); // X plays index 0, O to move
    const attempt = move(afterX, 0); // O tries the occupied cell
    expect(attempt).toBe(afterX); // identical reference, a true no-op
  });

  it("does not overwrite the existing mark", () => {
    const afterX = move(newGame(), 0); // X at index 0
    const attempt = move(afterX, 0); // O attempts the same cell
    expect(attempt.board[0]).toBe("X"); // still X, not overwritten by O
  });

  it("does not pass the turn when the move is rejected", () => {
    const afterX = move(newGame(), 0); // now O to move
    const attempt = move(afterX, 0); // rejected
    expect(attempt.currentPlayer).toBe("O"); // still O's turn
  });

  it("does not throw when clicking an occupied cell", () => {
    const afterX = move(newGame(), 4);
    expect(() => move(afterX, 4)).not.toThrow();
  });

  it("rejects an out-of-range negative index without error, returning the same state", () => {
    const state = newGame();
    expect(move(state, -1)).toBe(state);
  });

  it("rejects an out-of-range high index (9) without error, returning the same state", () => {
    const state = newGame();
    expect(move(state, 9)).toBe(state);
  });

  it("rejects a non-integer index (1.5) without error, returning the same state", () => {
    const state = newGame();
    expect(move(state, 1.5)).toBe(state);
  });
});
