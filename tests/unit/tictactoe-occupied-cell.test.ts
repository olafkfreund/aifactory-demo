// @ts-nocheck
// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// This verifies makeMove on an already-filled cell returns the state
// unchanged: the existing mark is not overwritten, the turn does not pass,
// and no error is thrown.
//
// The engine under test is games/tictactoe/game.js — a dependency-free
// CommonJS module. It is imported by its real project path (there is no
// installed "app" package for this static browser game), which is the only
// import that resolves against the project tree.
import { createGame, makeMove } from "../../games/tictactoe/game.js";

describe("makeMove on an occupied cell is a no-op (AC#3)", () => {
  it("returns the state unchanged when the target cell is already filled", () => {
    const afterFirst = makeMove(createGame(), 0); // X plays cell 0, O to move
    const afterOccupied = makeMove(afterFirst, 0); // O tries the same cell
    expect(afterOccupied).toEqual(afterFirst);
  });

  it("does not overwrite the mark already in the occupied cell", () => {
    const afterFirst = makeMove(createGame(), 4); // X plays cell 4
    const afterOccupied = makeMove(afterFirst, 4); // O tries the same cell
    expect(afterOccupied.board[4]).toBe("X");
  });

  it("does not pass the turn when the cell is occupied", () => {
    const afterFirst = makeMove(createGame(), 0); // after X's move it is O's turn
    const afterOccupied = makeMove(afterFirst, 0);
    expect(afterOccupied.currentPlayer).toBe("O");
  });

  it("does not throw when clicking an occupied cell", () => {
    const afterFirst = makeMove(createGame(), 8); // X plays cell 8
    expect(() => makeMove(afterFirst, 8)).not.toThrow();
  });
});
