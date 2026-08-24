// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// Verifies that games/tictactoe/game.js::move, when given an index whose
// cell is already filled, returns a state with an IDENTICAL board and the
// SAME current player, and throws no error (a pure no-op).
"use strict";

const { createGame, move } = require("./game.js");

describe("move() on an already-occupied cell (AC#3)", () => {
  it("does not throw when the target cell is already filled", () => {
    const afterFirst = move(createGame(), 4); // X plays center, turn -> O
    expect(() => move(afterFirst, 4)).not.toThrow();
  });

  it("returns an identical board when the cell is occupied", () => {
    const afterFirst = move(createGame(), 0); // X at 0, turn -> O
    const afterSecond = move(afterFirst, 0); // O tries the same cell
    expect(afterSecond.board).toEqual(afterFirst.board);
  });

  it("does not pass the turn when the cell is occupied", () => {
    const afterFirst = move(createGame(), 0); // X at 0, turn -> O
    const afterSecond = move(afterFirst, 0); // O tries the same cell
    expect(afterSecond.current).toBe(afterFirst.current);
  });

  it("keeps the game live (not over, no winner, no draw) after the no-op", () => {
    const afterFirst = move(createGame(), 8); // X at 8, turn -> O
    const afterSecond = move(afterFirst, 8); // O tries the same cell
    expect(afterSecond.over).toBe(false);
    expect(afterSecond.winner).toBeNull();
    expect(afterSecond.draw).toBe(false);
  });

  it("no-ops on a cell occupied by the current player's own mark", () => {
    // X at 0 (turn -> O), O at 1 (turn -> X). X now clicks its own cell 0.
    const afterX = move(createGame(), 0);
    const afterO = move(afterX, 1);
    const afterReclick = move(afterO, 0);
    expect(afterReclick.board).toEqual(afterO.board);
    expect(afterReclick.current).toBe(afterO.current);
  });
});
