// AC#7: A "New game" control resets to an empty board with X to move.
//
// emptyBoard() is the pure reset primitive behind that control: it must hand
// back a fresh 9-cell board with every cell null (nothing marked, so X is free
// to take the first turn), and a distinct array on each call so a reset never
// aliases a prior game's board.
import { emptyBoard } from "app/games/tictactoe/game";

describe("emptyBoard", () => {
  it("returns a board of exactly 9 cells", () => {
    expect(emptyBoard()).toHaveLength(9);
  });

  it("initialises all 9 cells to null (the blank reset state)", () => {
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

  it("leaves no cell occupied, so X may move first", () => {
    const occupied = emptyBoard().filter((cell) => cell !== null);

    expect(occupied).toHaveLength(0);
  });

  it("returns a fresh, independent array on each call so a reset never aliases the old board", () => {
    const first = emptyBoard();
    const second = emptyBoard();

    expect(second).not.toBe(first);

    first[0] = "X";
    expect(second[0]).toBeNull();
  });
});
