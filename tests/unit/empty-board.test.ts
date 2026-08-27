// AC#7: A "New game" control resets to an empty board with X to move.
// emptyBoard() is the pure reset state: a fresh 9-cell board of nulls that
// the UI's "New game" control installs before X takes the first turn.
import { emptyBoard } from "../../games/tictactoe/game";

describe("emptyBoard", () => {
  it("returns a board with exactly 9 cells", () => {
    expect(emptyBoard()).toHaveLength(9);
  });

  it("fills every cell with null (the reset state, no marks placed)", () => {
    expect(emptyBoard()).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
  });

  it("has no occupied cells, so X is free to move first", () => {
    const occupied = emptyBoard().filter((cell) => cell !== null);
    expect(occupied).toHaveLength(0);
  });

  it("returns a fresh array each call so a reset does not share state", () => {
    const first = emptyBoard();
    const second = emptyBoard();
    expect(second).not.toBe(first);

    first[0] = "X";
    expect(second[0]).toBeNull();
  });
});
