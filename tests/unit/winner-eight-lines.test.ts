// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// This unit test proves the rules-layer behaviour behind that AC:
//   - winner(board) returns the winning player ("X" or "O") for each of the
//     8 winning lines (3 rows, 3 columns, 2 diagonals).
//   - winningLine(board) returns the exact three indices that won, so the UI
//     can visibly mark the line.
import { winner, winningLine } from "app/games/tictactoe/game";

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

// The 8 winning lines: 3 rows, 3 columns, 2 diagonals.
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
const ALL_LINES: Array<[number, number, number]> = [
  ...ROWS,
  ...COLUMNS,
  ...DIAGONALS,
];

describe("winner() detects a win on all 8 lines", () => {
  it.each(ROWS)("returns X for a win on row [%i, %i, %i]", (a, b, c) => {
    expect(winner(boardWithLine([a, b, c], "X"))).toBe("X");
  });

  it.each(COLUMNS)("returns X for a win on column [%i, %i, %i]", (a, b, c) => {
    expect(winner(boardWithLine([a, b, c], "X"))).toBe("X");
  });

  it.each(DIAGONALS)("returns X for a win on diagonal [%i, %i, %i]", (a, b, c) => {
    expect(winner(boardWithLine([a, b, c], "X"))).toBe("X");
  });

  it.each(ROWS)("returns O for a win on row [%i, %i, %i]", (a, b, c) => {
    expect(winner(boardWithLine([a, b, c], "O"))).toBe("O");
  });

  it.each(COLUMNS)("returns O for a win on column [%i, %i, %i]", (a, b, c) => {
    expect(winner(boardWithLine([a, b, c], "O"))).toBe("O");
  });

  it.each(DIAGONALS)("returns O for a win on diagonal [%i, %i, %i]", (a, b, c) => {
    expect(winner(boardWithLine([a, b, c], "O"))).toBe("O");
  });
});

describe("winningLine() marks the exact three winning indices", () => {
  it.each(ALL_LINES)(
    "returns the winning indices [%i, %i, %i] for an X win on that line",
    (a, b, c) => {
      expect(winningLine(boardWithLine([a, b, c], "X"))).toEqual([a, b, c]);
    }
  );

  it.each(ALL_LINES)(
    "returns the winning indices [%i, %i, %i] for an O win on that line",
    (a, b, c) => {
      expect(winningLine(boardWithLine([a, b, c], "O"))).toEqual([a, b, c]);
    }
  );
});

describe("the 8 winning lines are exactly 3 rows, 3 columns, 2 diagonals", () => {
  it("counts 3 rows", () => {
    expect(ROWS).toHaveLength(3);
  });

  it("counts 3 columns", () => {
    expect(COLUMNS).toHaveLength(3);
  });

  it("counts 2 diagonals", () => {
    expect(DIAGONALS).toHaveLength(2);
  });

  it("counts 8 winning lines in total", () => {
    expect(ALL_LINES).toHaveLength(8);
  });
});
