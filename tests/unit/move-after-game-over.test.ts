// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// Proves move() is a no-op once winner() is non-null. When the game has been
// decided — by a win (X or O) or by a draw — move() must return the ORIGINAL
// board unchanged: same reference and same contents, even when the targeted
// cell is genuinely empty and in range. The control case confirms the lock
// only engages once winner() stops returning null.
import { move, winner } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

describe("move() returns the original board once the game is over (AC#6)", () => {
  it("returns the same board reference for an empty cell after X wins", () => {
    // X owns the top row (0,1,2): winner() is "X", so the game is decided.
    const decided: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];
    expect(winner(decided)).toBe("X");

    const result = move(decided, 5, "O"); // cell 5 is in-range and empty

    expect(result).toBe(decided); // exact no-op: same reference back
  });

  it("does not mutate the board's contents after X wins", () => {
    const decided: Cell[] = ["X", "X", "X", "O", "O", null, null, null, null];
    expect(winner(decided)).toBe("X");

    const result = move(decided, 5, "O");

    expect(result).toEqual(["X", "X", "X", "O", "O", null, null, null, null]);
    expect(result[5]).toBeNull();
  });

  it("returns the same board reference for an empty cell after O wins", () => {
    // O owns the left column (0,3,6): the game is decided for O.
    const decided: Cell[] = ["O", "X", "X", "O", "X", null, "O", null, null];
    expect(winner(decided)).toBe("O");

    const result = move(decided, 7, "X");

    expect(result).toBe(decided);
    expect(result[7]).toBeNull();
  });

  it("returns the original board when the game is a draw", () => {
    // Full board with no completed line -> winner() === "draw".
    const draw: Cell[] = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    expect(winner(draw)).toBe("draw");

    const result = move(draw, 0, "O");

    expect(result).toBe(draw);
    expect(result).toEqual(["X", "O", "X", "X", "O", "O", "O", "X", "X"]);
  });

  it("still places a mark while the game is undecided (control case)", () => {
    // Guard: the no-op must only engage once winner() is non-null.
    const undecided: Cell[] = ["X", "O", null, null, null, null, null, null, null];
    expect(winner(undecided)).toBeNull();

    const result = move(undecided, 2, "X");

    expect(result).not.toBe(undecided);
    expect(result[2]).toBe("X");
  });
});
