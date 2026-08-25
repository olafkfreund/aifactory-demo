// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked. This unit test proves the rules-layer
// behaviour behind that AC: winningLine(board) returns the three winning indices
// for each of the 8 winning lines, and null when no line is complete.
import { winningLine } from "app/games/tictactoe/game";

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
const ALL_LINES: Array<[number, number, number]> = [...ROWS, ...COLUMNS, ...DIAGONALS];

describe("winningLine returns the three winning indices", () => {
  describe("3 rows", () => {
    it.each(ROWS)("returns [%i, %i, %i] for X on that row", (a, b, c) => {
      expect(winningLine(boardWithLine([a, b, c], "X"))).toEqual([a, b, c]);
    });

    it.each(ROWS)("returns [%i, %i, %i] for O on that row", (a, b, c) => {
      expect(winningLine(boardWithLine([a, b, c], "O"))).toEqual([a, b, c]);
    });
  });

  describe("3 columns", () => {
    it.each(COLUMNS)("returns [%i, %i, %i] for X on that column", (a, b, c) => {
      expect(winningLine(boardWithLine([a, b, c], "X"))).toEqual([a, b, c]);
    });

    it.each(COLUMNS)("returns [%i, %i, %i] for O on that column", (a, b, c) => {
      expect(winningLine(boardWithLine([a, b, c], "O"))).toEqual([a, b, c]);
    });
  });

  describe("2 diagonals", () => {
    it.each(DIAGONALS)("returns [%i, %i, %i] for X on that diagonal", (a, b, c) => {
      expect(winningLine(boardWithLine([a, b, c], "X"))).toEqual([a, b, c]);
    });

    it.each(DIAGONALS)("returns [%i, %i, %i] for O on that diagonal", (a, b, c) => {
      expect(winningLine(boardWithLine([a, b, c], "O"))).toEqual([a, b, c]);
    });
  });

  it("covers exactly 8 distinct winning lines (3 rows + 3 columns + 2 diagonals)", () => {
    expect(ALL_LINES).toHaveLength(8);
  });

  describe("null when no line is complete", () => {
    it("returns null for an empty board", () => {
      const empty: Cell[] = [null, null, null, null, null, null, null, null, null];
      expect(winningLine(empty)).toBeNull();
    });

    it("returns null when marks do not complete any line", () => {
      // X O X / O X O / O X O — full board, no three-in-a-row.
      const board: Cell[] = ["X", "O", "X", "O", "X", "O", "O", "X", "O"];
      expect(winningLine(board)).toBeNull();
    });

    it("returns null when a line is only partially filled", () => {
      // Two of three cells on the top row match; the third is empty.
      const board: Cell[] = ["X", "X", null, null, null, null, null, null, null];
      expect(winningLine(board)).toBeNull();
    });

    it("returns null when a line is blocked by the other player", () => {
      // Top row: X X O — blocked, not a winning line.
      const board: Cell[] = ["X", "X", "O", null, null, null, null, null, null];
      expect(winningLine(board)).toBeNull();
    });
  });
});
