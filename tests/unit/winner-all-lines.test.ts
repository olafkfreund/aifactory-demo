// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals.
//
// This unit test proves that winner(board) returns the correct player ("X" or
// "O") for a completed line on every one of the 8 winning lines: the 3 rows,
// the 3 columns, and the 2 diagonals. Each line is exercised for both players
// so a bug affecting only one mark is caught.
import { winner } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

// Build a 9-cell board with `player` placed on the three `line` indices and
// all other cells empty (null).
function boardWithLine(line: [number, number, number], player: Cell): Cell[] {
  const board: Cell[] = [null, null, null, null, null, null, null, null, null];
  for (const idx of line) {
    board[idx] = player;
  }
  return board;
}

// The 8 winning lines, grouped so the counts (3 rows, 3 columns, 2 diagonals)
// are explicit.
const ROWS: Array<[number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];
const COLUMNS: Array<[number, number, number]> = [
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];
const DIAGONALS: Array<[number, number, number]> = [
  [0, 4, 8],
  [2, 4, 6],
];

describe("winner() returns the winning player on each of the 3 rows", () => {
  it.each(ROWS)("returns X for a win on row [%i, %i, %i]", (a, b, c) => {
    expect(winner(boardWithLine([a, b, c], "X"))).toBe("X");
  });

  it.each(ROWS)("returns O for a win on row [%i, %i, %i]", (a, b, c) => {
    expect(winner(boardWithLine([a, b, c], "O"))).toBe("O");
  });

  it("covers exactly 3 rows", () => {
    expect(ROWS).toHaveLength(3);
  });
});

describe("winner() returns the winning player on each of the 3 columns", () => {
  it.each(COLUMNS)("returns X for a win on column [%i, %i, %i]", (a, b, c) => {
    expect(winner(boardWithLine([a, b, c], "X"))).toBe("X");
  });

  it.each(COLUMNS)("returns O for a win on column [%i, %i, %i]", (a, b, c) => {
    expect(winner(boardWithLine([a, b, c], "O"))).toBe("O");
  });

  it("covers exactly 3 columns", () => {
    expect(COLUMNS).toHaveLength(3);
  });
});

describe("winner() returns the winning player on each of the 2 diagonals", () => {
  it.each(DIAGONALS)("returns X for a win on diagonal [%i, %i, %i]", (a, b, c) => {
    expect(winner(boardWithLine([a, b, c], "X"))).toBe("X");
  });

  it.each(DIAGONALS)("returns O for a win on diagonal [%i, %i, %i]", (a, b, c) => {
    expect(winner(boardWithLine([a, b, c], "O"))).toBe("O");
  });

  it("covers exactly 2 diagonals", () => {
    expect(DIAGONALS).toHaveLength(2);
  });
});

describe("the winning lines total 8 across rows, columns and diagonals", () => {
  it("counts 8 winning lines in total", () => {
    expect([...ROWS, ...COLUMNS, ...DIAGONALS]).toHaveLength(8);
  });
});
