// AC#6: games/tictactoe/game.test.js covers every nextFocusIndex case and
// passes under `npx jest`. The nextFocusIndex suite below exercises:
//   AC#2 — arrow moves within a row/column: from 4, ArrowRight=5, ArrowLeft=3,
//          ArrowUp=1, ArrowDown=7.
//   AC#3 — edge wrapping: from 2 ArrowRight=0; from 0 ArrowLeft=2;
//          from 0 ArrowUp=6; from 6 ArrowDown=0.
//   AC#4 — Home returns 0 and End returns 8, from any cell (0-8).
//   AC#5 — any other key returns the current index unchanged.
// The remaining tests exercise the pure game engine the same module exports.
//
// Run from the repo root with:
//   npx jest games/tictactoe/game.test.js
"use strict";

const { createGame, checkWinner, isBoardFull, makeMove, nextFocusIndex, WIN_LINES } = require("./game.js");

// Apply a sequence of cell indexes to a fresh game, alternating players.
function play(indexes) {
  let state = createGame();
  for (const index of indexes) {
    state = makeMove(state, index);
  }
  return state;
}

test("createGame returns an empty board with X to move and no winner", () => {
  const state = createGame();
  expect(state.board).toEqual(new Array(9).fill(null));
  expect(state.currentPlayer).toBe("X");
  expect(state.winner).toBe(null);
  expect(state.winningLine).toBe(null);
  expect(state.isDraw).toBe(false);
});

test("placing a mark on an empty cell fills it and passes the turn", () => {
  const state = makeMove(createGame(), 4);
  expect(state.board[4]).toBe("X");
  expect(state.currentPlayer).toBe("O");
});

test("clicking an occupied cell is a no-op: no turn change, no error", () => {
  const afterFirst = makeMove(createGame(), 0); // X at 0, O to move
  const afterSecond = makeMove(afterFirst, 0); // O tries the same cell
  expect(afterSecond).toEqual(afterFirst);
  expect(afterSecond.board[0]).toBe("X");
  expect(afterSecond.currentPlayer).toBe("O");
});

test("an out-of-range index is rejected without throwing or mutating state", () => {
  const before = createGame();
  expect(() => makeMove(before, 9)).not.toThrow();
  expect(() => makeMove(before, -1)).not.toThrow();
  const after = makeMove(before, 9);
  expect(after).toEqual(before);
});

test("checkWinner reports no winner on an empty board", () => {
  expect(checkWinner(new Array(9).fill(null))).toEqual({ winner: null, line: null });
});

test("all 8 winning lines are detected", () => {
  for (const line of WIN_LINES) {
    const board = new Array(9).fill(null);
    for (const index of line) board[index] = "X";
    const result = checkWinner(board);
    expect(result.winner).toBe("X");
    expect(result.line).toEqual(line);
  }
});

test("each of the 8 winning lines ends the game via makeMove and marks the line", () => {
  for (const line of WIN_LINES) {
    // X plays the three cells of `line`; O plays three other, non-winning cells.
    const others = Array.from({ length: 9 }, (_, i) => i).filter((i) => !line.includes(i));
    const moves = [line[0], others[0], line[1], others[1], line[2]];

    const state = play(moves);

    expect(state.winner).toBe("X");
    expect([...state.winningLine].sort()).toEqual([...line].sort());
  }
});

test("a full board with no three-in-a-row is a draw", () => {
  // X O X
  // X O O
  // O X X
  const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
  const state = play(moves);

  expect(state.winner).toBe(null);
  expect(state.winningLine).toBe(null);
  expect(state.isDraw).toBe(true);
  expect(isBoardFull(state.board)).toBe(true);
});

test("play stops once a game is won: further clicks do nothing", () => {
  // X wins the top row on move 5 (index 2); O then tries to play cell 8.
  const moves = [0, 3, 1, 4, 2];
  const wonState = play(moves);
  expect(wonState.winner).toBe("X");

  const afterExtraClick = makeMove(wonState, 8);
  expect(afterExtraClick).toEqual(wonState);
  expect(afterExtraClick.board[8]).toBe(null);
});

test("play stops once a game is drawn: further clicks do nothing", () => {
  const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
  const drawnState = play(moves);
  expect(drawnState.isDraw).toBe(true);

  // Board is full, so there is no empty cell left to click — reapplying the
  // last move must still be rejected without changing state.
  const afterExtraClick = makeMove(drawnState, 8);
  expect(afterExtraClick).toEqual(drawnState);
});

test("isBoardFull is false until every cell is filled", () => {
  const board = new Array(9).fill(null);
  expect(isBoardFull(board)).toBe(false);
  board.fill("X");
  expect(isBoardFull(board)).toBe(true);
});

test("New game resets to an empty board with X to move", () => {
  const played = play([0, 1, 2, 4, 3]); // X has won
  const reset = createGame();
  expect(reset.board).toEqual(new Array(9).fill(null));
  expect(reset.currentPlayer).toBe("X");
  expect(reset.winner).toBe(null);
  expect(reset).not.toEqual(played);
});

describe("nextFocusIndex", () => {
  // AC#2: moves right/left within a row and up/down within a column.
  test("ArrowRight from 4 moves right within the row to 5", () => {
    expect(nextFocusIndex(4, "ArrowRight")).toBe(5);
  });

  test("ArrowLeft from 4 moves left within the row to 3", () => {
    expect(nextFocusIndex(4, "ArrowLeft")).toBe(3);
  });

  test("ArrowUp from 4 moves up within the column to 1", () => {
    expect(nextFocusIndex(4, "ArrowUp")).toBe(1);
  });

  test("ArrowDown from 4 moves down within the column to 7", () => {
    expect(nextFocusIndex(4, "ArrowDown")).toBe(7);
  });

  // AC#3: wraps at the edges.
  test("ArrowRight from 2 wraps to the start of the row at 0", () => {
    expect(nextFocusIndex(2, "ArrowRight")).toBe(0);
  });

  test("ArrowLeft from 0 wraps to the end of the row at 2", () => {
    expect(nextFocusIndex(0, "ArrowLeft")).toBe(2);
  });

  test("ArrowUp from 0 wraps to the bottom of the column at 6", () => {
    expect(nextFocusIndex(0, "ArrowUp")).toBe(6);
  });

  test("ArrowDown from 6 wraps to the top of the column at 0", () => {
    expect(nextFocusIndex(6, "ArrowDown")).toBe(0);
  });

  // AC#4: Home returns 0 and End returns 8, from any cell.
  test("Home returns 0 from any cell", () => {
    for (let index = 0; index <= 8; index++) {
      expect(nextFocusIndex(index, "Home")).toBe(0);
    }
  });

  test("End returns 8 from any cell", () => {
    for (let index = 0; index <= 8; index++) {
      expect(nextFocusIndex(index, "End")).toBe(8);
    }
  });

  // AC#5: any other key returns the current index unchanged.
  test("returns the current index unchanged for any other key", () => {
    expect(nextFocusIndex(4, "Tab")).toBe(4);
    expect(nextFocusIndex(0, "a")).toBe(0);
    expect(nextFocusIndex(8, "Enter")).toBe(8);
    expect(nextFocusIndex(3, " ")).toBe(3);
    expect(nextFocusIndex(5, "Escape")).toBe(5);
  });
});
