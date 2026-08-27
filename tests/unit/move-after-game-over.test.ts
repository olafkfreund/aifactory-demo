// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// This suite verifies that move() is a no-op once winner() is non-null:
// whether the game was decided by a win (X, O) or a draw, move() must
// return the board unchanged (same reference, same contents), even when a
// legal-looking empty cell is targeted.

import { move, winner } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

describe("move() rejects moves after the game is over (AC#6)", () => {
  it("returns the same board reference when X has already won", () => {
    // X owns the top row (0,1,2) — game is decided.
    const decided: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];
    expect(winner(decided)).toBe("X");

    const emptyIndex = 5; // a genuinely empty, in-range cell
    const result = move(decided, emptyIndex, "O");

    expect(result).toBe(decided);
  });

  it("does not mutate or fill the targeted empty cell after a win", () => {
    const decided: Cell[] = ["O", "O", "O", "X", "X", null, null, null, null];
    expect(winner(decided)).toBe("O");

    const result = move(decided, 8, "X");

    // Board contents are unchanged; the empty cell stays empty.
    expect(result).toEqual(decided);
    expect(result[8]).toBeNull();
  });

  it("returns the same board reference when the game is a draw", () => {
    // Full board, no winning line -> winner() === "draw", game decided.
    const draw: Cell[] = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    expect(winner(draw)).toBe("draw");

    const result = move(draw, 0, "O");

    expect(result).toBe(draw);
    expect(result).toEqual(draw);
  });

  it("still allows a move while the game is undecided (control case)", () => {
    // Sanity guard: the no-op only kicks in once winner() is non-null.
    const undecided: Cell[] = ["X", "O", null, null, null, null, null, null, null];
    expect(winner(undecided)).toBeNull();

    const result = move(undecided, 2, "X");

    expect(result).not.toBe(undecided);
    expect(result[2]).toBe("X");
  });
});
