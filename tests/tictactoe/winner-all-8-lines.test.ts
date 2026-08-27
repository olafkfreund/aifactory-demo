// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// This unit test proves the rules-layer behaviour behind that AC: winner(board)
// returns the winning mark ("X" or "O") for each of the 8 winning lines — the
// 3 rows, the 3 columns, and the 2 diagonals.
import { winner } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

// Build a 9-cell board with `player` placed on the three `line` indices and
// every other cell empty (null).
function boardWithLine(line: [number, number, number], player: Cell): Cell[] {
  const board: Cell[] = [null, null, null, null, null, null, null, null, null];
  for (const idx of line) {
    board[idx] = player;
  }
  return board;
}

// The 3 rows.
const ROWS: Array<[number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];
// The 3 columns.
const COLUMNS: Array<[number, number, number]> = [
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];
// The 2 diagonals.
const DIAGONALS: Array<[number, number, number]> = [
  [0, 4, 8],
  [2, 4, 6],
];

describe("winner() detects all 8 winning lines", () => {
  describe("3 rows", () => {
    it.each(ROWS)("returns X for a row win on [%i, %i, %i]", (a, b, c) => {
      expect(winner(boardWithLine([a, b, c], "X"))).toBe("X");
    });

    it.each(ROWS)("returns O for a row win on [%i, %i, %i]", (a, b, c) => {
      expect(winner(boardWithLine([a, b, c], "O"))).toBe("O");
    });
  });

  describe("3 columns", () => {
    it.each(COLUMNS)("returns X for a column win on [%i, %i, %i]", (a, b, c) => {
      expect(winner(boardWithLine([a, b, c], "X"))).toBe("X");
    });

    it.each(COLUMNS)("returns O for a column win on [%i, %i, %i]", (a, b, c) => {
      expect(winner(boardWithLine([a, b, c], "O"))).toBe("O");
    });
  });

  describe("2 diagonals", () => {
    it.each(DIAGONALS)("returns X for a diagonal win on [%i, %i, %i]", (a, b, c) => {
      expect(winner(boardWithLine([a, b, c], "X"))).toBe("X");
    });

    it.each(DIAGONALS)("returns O for a diagonal win on [%i, %i, %i]", (a, b, c) => {
      expect(winner(boardWithLine([a, b, c], "O"))).toBe("O");
    });
  });

  it("covers exactly 8 distinct winning lines (3 rows + 3 columns + 2 diagonals)", () => {
    const allLines = [...ROWS, ...COLUMNS, ...DIAGONALS];
    expect(ROWS).toHaveLength(3);
    expect(COLUMNS).toHaveLength(3);
    expect(DIAGONALS).toHaveLength(2);
    expect(allLines).toHaveLength(8);
  });

  it("returns the winning mark on every one of the 8 lines in a single sweep", () => {
    const allLines = [...ROWS, ...COLUMNS, ...DIAGONALS];
    const results = allLines.map((line) => winner(boardWithLine(line, "X")));
    expect(results).toEqual(["X", "X", "X", "X", "X", "X", "X", "X"]);
  });
});
