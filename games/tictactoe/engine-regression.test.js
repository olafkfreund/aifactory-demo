// AC#7: All existing tests still pass (regression guard over the game engine).
//
// This mirrors the existing node:test engine suite as Jest tests so the core
// engine behaviour — createGame, makeMove validity/no-op, checkWinner, and
// draw detection — is pinned as a regression guard while the minimax opponent
// is added. The module under test is the CommonJS engine at ./game.js
// (same directory as this test); it exposes its API via module.exports.
"use strict";

const {
  createGame,
  checkWinner,
  isBoardFull,
  makeMove,
  WIN_LINES,
} = require("./game.js");

// Apply a sequence of cell indexes to a fresh game, alternating players.
function play(indexes) {
  let state = createGame();
  for (const index of indexes) {
    state = makeMove(state, index);
  }
  return state;
}

describe("createGame", () => {
  it("returns an empty board with X to move and no winner", () => {
    const state = createGame();
    expect(state.board).toEqual(new Array(9).fill(null));
    expect(state.currentPlayer).toBe("X");
    expect(state.winner).toBeNull();
    expect(state.winningLine).toBeNull();
    expect(state.isDraw).toBe(false);
  });
});

describe("makeMove validity", () => {
  it("placing a mark on an empty cell fills it and passes the turn", () => {
    const state = makeMove(createGame(), 4);
    expect(state.board[4]).toBe("X");
    expect(state.currentPlayer).toBe("O");
  });

  it("clicking an occupied cell is a no-op: no turn change, no error", () => {
    const afterFirst = makeMove(createGame(), 0); // X at 0, O to move
    const afterSecond = makeMove(afterFirst, 0); // O tries the same cell
    expect(afterSecond).toEqual(afterFirst);
    expect(afterSecond.board[0]).toBe("X");
    expect(afterSecond.currentPlayer).toBe("O");
  });

  it("an out-of-range index is rejected without throwing or mutating state", () => {
    const before = createGame();
    expect(() => makeMove(before, 9)).not.toThrow();
    expect(() => makeMove(before, -1)).not.toThrow();
    expect(makeMove(before, 9)).toEqual(before);
    expect(makeMove(before, -1)).toEqual(before);
  });

  it("play stops once a game is won: further clicks do nothing", () => {
    // X wins the top row on move 5 (index 2); O then tries to play cell 8.
    const wonState = play([0, 3, 1, 4, 2]);
    expect(wonState.winner).toBe("X");

    const afterExtraClick = makeMove(wonState, 8);
    expect(afterExtraClick).toEqual(wonState);
    expect(afterExtraClick.board[8]).toBeNull();
  });
});

describe("checkWinner", () => {
  it("reports no winner on an empty board", () => {
    expect(checkWinner(new Array(9).fill(null))).toEqual({
      winner: null,
      line: null,
    });
  });

  it("detects all 8 winning lines", () => {
    expect(WIN_LINES).toHaveLength(8);
    for (const line of WIN_LINES) {
      const board = new Array(9).fill(null);
      for (const index of line) board[index] = "X";
      const result = checkWinner(board);
      expect(result.winner).toBe("X");
      expect(result.line).toEqual(line);
    }
  });

  it("ends the game via makeMove and marks the winning line", () => {
    for (const line of WIN_LINES) {
      // X plays the three cells of `line`; O plays three other, non-winning cells.
      const others = Array.from({ length: 9 }, (_, i) => i).filter(
        (i) => !line.includes(i)
      );
      const moves = [line[0], others[0], line[1], others[1], line[2]];

      const state = play(moves);

      expect(state.winner).toBe("X");
      expect([...state.winningLine].sort()).toEqual([...line].sort());
    }
  });
});

describe("draw detection", () => {
  it("a full board with no three-in-a-row is a draw", () => {
    // X O X
    // X O O
    // O X X
    const state = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);

    expect(state.winner).toBeNull();
    expect(state.winningLine).toBeNull();
    expect(state.isDraw).toBe(true);
    expect(isBoardFull(state.board)).toBe(true);
  });

  it("play stops once a game is drawn: further clicks do nothing", () => {
    const drawnState = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
    expect(drawnState.isDraw).toBe(true);

    // Board is full, so reapplying a move must be rejected without changing state.
    const afterExtraClick = makeMove(drawnState, 8);
    expect(afterExtraClick).toEqual(drawnState);
  });

  it("isBoardFull is false until every cell is filled", () => {
    const board = new Array(9).fill(null);
    expect(isBoardFull(board)).toBe(false);
    board.fill("X");
    expect(isBoardFull(board)).toBe(true);
  });
});
