// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is returned.
//
// This suite proves checkWinner (and makeMove) detects a three-in-a-row on
// each of the 3 rows, 3 columns, and 2 diagonals (8 lines total) and reports
// the indices of the winning line.

import {
  checkWinner,
  makeMove,
  createGame,
  WIN_LINES,
} from "../../games/tictactoe/game";

type Cell = "X" | "O" | null;
type Line = [number, number, number];

// The 8 winning lines, grouped by geometry so the criterion's counts are
// asserted explicitly: 3 rows, 3 columns, 2 diagonals.
const ROWS: Line[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];
const COLUMNS: Line[] = [
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];
const DIAGONALS: Line[] = [
  [0, 4, 8],
  [2, 4, 6],
];
const ALL_LINES: Line[] = [...ROWS, ...COLUMNS, ...DIAGONALS];

function emptyBoard(): Cell[] {
  return new Array(9).fill(null) as Cell[];
}

// Apply a sequence of cell indexes to a fresh game, alternating players.
function play(indexes: number[]) {
  let state = createGame();
  for (const index of indexes) {
    state = makeMove(state, index);
  }
  return state;
}

describe("checkWinner detects a win on all 8 lines", () => {
  it("groups the winning lines as 3 rows, 3 columns, and 2 diagonals (8 total)", () => {
    expect(ROWS).toHaveLength(3);
    expect(COLUMNS).toHaveLength(3);
    expect(DIAGONALS).toHaveLength(2);
    expect(ALL_LINES).toHaveLength(8);
    expect(WIN_LINES).toHaveLength(8);
  });

  it.each(ROWS)("detects a win on row [%i, %i, %i]", (a, b, c) => {
    const line: Line = [a, b, c];
    const board = emptyBoard();
    for (const index of line) board[index] = "X";

    const result = checkWinner(board);

    expect(result.winner).toBe("X");
    expect([...result.line].sort()).toEqual([...line].sort());
  });

  it.each(COLUMNS)("detects a win on column [%i, %i, %i]", (a, b, c) => {
    const line: Line = [a, b, c];
    const board = emptyBoard();
    for (const index of line) board[index] = "O";

    const result = checkWinner(board);

    expect(result.winner).toBe("O");
    expect([...result.line].sort()).toEqual([...line].sort());
  });

  it.each(DIAGONALS)("detects a win on diagonal [%i, %i, %i]", (a, b, c) => {
    const line: Line = [a, b, c];
    const board = emptyBoard();
    for (const index of line) board[index] = "X";

    const result = checkWinner(board);

    expect(result.winner).toBe("X");
    expect([...result.line].sort()).toEqual([...line].sort());
  });
});

describe("makeMove ends the game and marks the winning line for each of the 8 lines", () => {
  it.each(ALL_LINES)(
    "line [%i, %i, %i] ends the game with the winning line reported",
    (a, b, c) => {
      const line: Line = [a, b, c];
      // X plays the three cells of `line`; O plays three other, non-winning cells.
      const others = Array.from({ length: 9 }, (_, i) => i).filter(
        (i) => !line.includes(i),
      );
      const moves = [line[0], others[0], line[1], others[1], line[2]];

      const state = play(moves);

      expect(state.winner).toBe("X");
      expect([...state.winningLine].sort()).toEqual([...line].sort());
    },
  );
});
