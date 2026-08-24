// AC#7: A "New game" control resets to an empty board with X to move.
//
// createGame() is the pure reset used by the "New game" control. It must
// yield an all-null board with current="X", over=false, winner=null,
// draw=false — regardless of any game that came before it.
//
// game.js is a UMD module; under Node/Jest it exports via module.exports,
// so it is imported with a colocated relative require (same directory).
const { createGame, move } = require("./game.js");

describe("createGame — new game reset (AC#7)", () => {
  it("returns an all-null board of 9 cells", () => {
    const state = createGame();
    expect(state.board).toEqual([
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

  it("sets current to X to move first", () => {
    expect(createGame().current).toBe("X");
  });

  it("is not over", () => {
    expect(createGame().over).toBe(false);
  });

  it("has no winner", () => {
    expect(createGame().winner).toBe(null);
  });

  it("is not a draw", () => {
    expect(createGame().draw).toBe(false);
  });

  it("resets to a fresh empty state even after moves were played", () => {
    let state = createGame();
    // X wins the top row: X at 0,1,2 with O off-line at 3,4.
    for (const index of [0, 3, 1, 4, 2]) {
      state = move(state, index);
    }
    expect(state.over).toBe(true);

    const fresh = createGame();
    expect(fresh.board).toEqual(Array(9).fill(null));
    expect(fresh.current).toBe("X");
    expect(fresh.over).toBe(false);
    expect(fresh.winner).toBe(null);
    expect(fresh.draw).toBe(false);
  });
});
