// AC#8: the test suite covers every function above — including move() edge
// cases. This lane pins the out-of-range / non-integer index behaviour of
// `move(board, index, player)`.
//
// move() is documented to be a no-op when the index is out of range. A no-op
// means: no exception is thrown, and the call returns the SAME board reference
// it was given, with no cell mutated. This holds for negative indices, indices
// greater than 8, and non-integer (fractional / non-number) indices.
//
// game.js is a CommonJS/UMD module; imported here via a relative path from
// tests/unit/ to games/tictactoe/game.js.
import { emptyBoard, move } from "../../games/tictactoe/game";

describe("move() rejects an out-of-range or non-integer index (AC#8)", () => {
  it("is a no-op for a negative index (-1): same board reference back", () => {
    const before = emptyBoard();
    const after = move(before, -1, "X");
    expect(after).toBe(before); // same reference: true no-op
  });

  it("is a no-op for a larger negative index (-5)", () => {
    const before = emptyBoard();
    const after = move(before, -5, "O");
    expect(after).toBe(before);
  });

  it("is a no-op for an index just above the top cell (9)", () => {
    const before = emptyBoard();
    const after = move(before, 9, "X");
    expect(after).toBe(before);
  });

  it("is a no-op for an index far above range (100)", () => {
    const before = emptyBoard();
    const after = move(before, 100, "O");
    expect(after).toBe(before);
  });

  it("is a no-op for a non-integer (fractional) index (2.5)", () => {
    const before = emptyBoard();
    const after = move(before, 2.5, "X");
    expect(after).toBe(before);
  });

  it("does not mutate any cell for an out-of-range index", () => {
    const before = emptyBoard();
    move(before, 9, "X");
    expect(before.every((cell) => cell === null)).toBe(true);
  });

  it("does not throw for an out-of-range index", () => {
    const before = emptyBoard();
    expect(() => move(before, -1, "X")).not.toThrow();
    expect(() => move(before, 9, "O")).not.toThrow();
  });

  it("still accepts the valid boundary indices 0 and 8", () => {
    const low = move(emptyBoard(), 0, "X");
    const high = move(emptyBoard(), 8, "O");
    expect(low[0]).toBe("X");
    expect(high[8]).toBe("O");
  });
});
