// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals.
// This unit test proves the rules-layer behaviour behind that AC: winner(board)
// returns the winning player ("X" or "O") for each of the 8 winning lines —
// the 3 rows, the 3 columns, and the 2 diagonals.
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

describe("winner detects all 8 winning lines", () => {
  describe("3 rows", () => {
    it.each(ROWS)("detects X winning on row [%i, %i, %i]", (a, b, c) => {
      expect(winner(boardWithLine([a, b, c], "X"))).toBe("X");
    });

    it.each(ROWS)("detects O winning on row [%i, %i, %i]", (a, b, c) => {
      expect(winner(boardWithLine([a, b, c], "O"))).toBe("O");
    });
  });

  describe("3 columns", () => {
    it.each(COLUMNS)("detects X winning on column [%i, %i, %i]", (a, b, c) => {
      expect(winner(boardWithLine([a, b, c], "X"))).toBe("X");
    });

    it.each(COLUMNS)("detects O winning on column [%i, %i, %i]", (a, b, c) => {
      expect(winner(boardWithLine([a, b, c], "O"))).toBe("O");
    });
  });

  describe("2 diagonals", () => {
    it.each(DIAGONALS)("detects X winning on diagonal [%i, %i, %i]", (a, b, c) => {
      expect(winner(boardWithLine([a, b, c], "X"))).toBe("X");
    });

    it.each(DIAGONALS)("detects O winning on diagonal [%i, %i, %i]", (a, b, c) => {
      expect(winner(boardWithLine([a, b, c], "O"))).toBe("O");
    });
  });

  it("covers exactly 8 distinct winning lines (3 rows + 3 columns + 2 diagonals)", () => {
    const allLines = [...ROWS, ...COLUMNS, ...DIAGONALS];
    expect(allLines).toHaveLength(8);
  });
});
