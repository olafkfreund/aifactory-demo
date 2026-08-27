// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// This suite proves that move() is a no-op once winner() is non-null: even
// when the targeted cell is genuinely empty and in range, move() must return
// the SAME board (same reference and same contents). The lock applies whether
// the game was decided by a win (X or O) or by a draw.
import { move, winner } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

describe("move() is rejected after the game is over (AC#6)", () => {
  it("returns the same board reference for an empty cell after X wins", () => {
    // X owns the top row (0,1,2): the game is decided.
    const decided: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];
    expect(winner(decided)).toBe("X");

    const emptyTarget = 5; // in-range and genuinely empty
    const result = move(decided, emptyTarget, "O");

    expect(result).toBe(decided); // exact no-op: same reference
  });

  it("leaves the targeted empty cell empty after O wins", () => {
    // O owns the top row: the game is decided.
    const decided: Cell[] = ["O", "O", "O", "X", "X", null, null, null, null];
    expect(winner(decided)).toBe("O");

    const result = move(decided, 8, "X");

    expect(result).toEqual(decided);
    expect(result[8]).toBeNull();
  });

  it("returns the same board reference when the game is a draw", () => {
    // Full board with no completed line -> winner() === "draw".
    const draw: Cell[] = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    expect(winner(draw)).toBe("draw");

    const result = move(draw, 0, "O");

    expect(result).toBe(draw);
  });

  it("still places a mark while the game is undecided (control case)", () => {
    // Guard: the no-op only engages once winner() is non-null.
    const undecided: Cell[] = ["X", "O", null, null, null, null, null, null, null];
    expect(winner(undecided)).toBeNull();

    const result = move(undecided, 2, "X");

    expect(result).not.toBe(undecided);
    expect(result[2]).toBe("X");
  });
});
