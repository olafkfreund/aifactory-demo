// AC#8: the test file covers every exported function including all 8 winning
// lines, the draw, the occupied-cell rejection, and the move-after-game-over
// rejection. AC#9: the suite runs and passes from the repo root.
//
// This file rounds out coverage by pinning down `move()` immutability: applying
// a move must NEVER mutate the input state (its board array in particular) and
// must return a DISTINCT new board array. It also exercises every exported pure
// function (newGame, move, checkWinner, isBoardFull, isGameOver, WIN_LINES) so
// the whole module is touched when the suite runs from repo root.

/* eslint-disable @typescript-eslint/no-var-requires */
const game = require("../games/tictactoe/game.js");
const { newGame, move, checkWinner, isBoardFull, isGameOver, WIN_LINES } = game;

const EMPTY_BOARD = [null, null, null, null, null, null, null, null, null];

describe("move() returns a new immutable board (AC#8/#9)", () => {
  it("does not mutate the input state's board array", () => {
    const state = newGame();
    const boardBefore = state.board.slice();

    move(state, 4);

    expect(state.board).toEqual(boardBefore);
  });

  it("leaves the exact same board array reference on the original state", () => {
    const state = newGame();
    const originalBoardRef = state.board;

    move(state, 0);

    expect(state.board).toBe(originalBoardRef);
    expect(state.board).toEqual(EMPTY_BOARD);
  });

  it("returns a board that is a distinct array from the input board", () => {
    const state = newGame();
    const next = move(state, 5);

    expect(next.board).not.toBe(state.board);
  });

  it("returns a brand-new state object, never the same reference", () => {
    const state = newGame();
    const next = move(state, 8);

    expect(next).not.toBe(state);
  });

  it("does not change the original state's currentPlayer", () => {
    const state = newGame();

    move(state, 3);

    expect(state.currentPlayer).toBe("X");
  });

  it("keeps successive moves independent (no shared mutable board)", () => {
    const first = move(newGame(), 0);
    const second = move(first, 1);

    // Placing O at index 1 must not have retroactively altered `first`.
    expect(first.board[1]).toBeNull();
    expect(first.board).not.toBe(second.board);
  });
});

describe("every exported pure function is reachable from repo root (AC#8)", () => {
  it("newGame() produces a fresh empty game with X to move", () => {
    const state = newGame();

    expect(state.board).toEqual(EMPTY_BOARD);
    expect(state.currentPlayer).toBe("X");
    expect(state.winner).toBeNull();
    expect(state.winningLine).toBeNull();
    expect(state.isDraw).toBe(false);
  });

  it("WIN_LINES contains exactly the 8 winning lines", () => {
    expect(WIN_LINES).toEqual([
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]);
  });

  it("checkWinner() reports no winner on an empty board", () => {
    expect(checkWinner(EMPTY_BOARD)).toEqual({ winner: null, line: null });
  });

  it("checkWinner() reports the winner and winning line on a completed row", () => {
    const board = ["X", "X", "X", null, null, null, null, null, null];

    expect(checkWinner(board)).toEqual({ winner: "X", line: [0, 1, 2] });
  });

  it("isBoardFull() is false for an empty board and true for a full one", () => {
    const full = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];

    expect(isBoardFull(EMPTY_BOARD)).toBe(false);
    expect(isBoardFull(full)).toBe(true);
  });

  it("isGameOver() is false on a fresh game and true once a winner exists", () => {
    const fresh = newGame();
    const decided = { ...fresh, winner: "X" };

    expect(isGameOver(fresh)).toBe(false);
    expect(isGameOver(decided)).toBe(true);
  });
});
