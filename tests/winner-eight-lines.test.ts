// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// This unit test proves the rules-layer behaviour behind that AC: for each of
// the eight winning triples, winner(board) reports the winning mark and
// winningLine(board) returns the exact three indices that completed the line.
import { emptyBoard, winner, winningLine } from "app/games/tictactoe/game";

type Cell = "X" | "O" | ".";

// Build a board from a compact array, using "." for empty cells.
function board(cells: Cell[]): Array<"X" | "O" | null> {
  return cells.map((c) => (c === "." ? null : c));
}

// The 3 rows, 3 columns, and 2 diagonals — 8 winning lines in total.
// Each board is a legal-ish position in which X owns exactly one complete line.
const rows: Array<{ name: string; cells: Cell[]; line: [number, number, number] }> = [
  { name: "row 0", cells: ["X", "X", "X", "O", "O", ".", ".", ".", "."], line: [0, 1, 2] },
  { name: "row 1", cells: ["O", "O", ".", "X", "X", "X", ".", ".", "."], line: [3, 4, 5] },
  { name: "row 2", cells: [".", ".", ".", "O", "O", ".", "X", "X", "X"], line: [6, 7, 8] },
];

const columns: Array<{ name: string; cells: Cell[]; line: [number, number, number] }> = [
  { name: "col 0", cells: ["X", "O", ".", "X", "O", ".", "X", ".", "."], line: [0, 3, 6] },
  { name: "col 1", cells: ["O", "X", ".", "O", "X", ".", ".", "X", "."], line: [1, 4, 7] },
  { name: "col 2", cells: [".", "O", "X", ".", "O", "X", ".", ".", "X"], line: [2, 5, 8] },
];

const diagonals: Array<{ name: string; cells: Cell[]; line: [number, number, number] }> = [
  { name: "diag main", cells: ["X", "O", ".", "O", "X", ".", ".", ".", "X"], line: [0, 4, 8] },
  { name: "diag anti", cells: [".", ".", "X", ".", "X", "O", "X", "O", "."], line: [2, 4, 6] },
];

const allLines = [...rows, ...columns, ...diagonals];

describe("winner and winningLine detect a win across all 8 lines", () => {
  it.each(allLines)("winner() reports X on $name", ({ cells }) => {
    expect(winner(board(cells))).toBe("X");
  });

  it.each(allLines)("winningLine() returns the completed triple on $name", ({ cells, line }) => {
    expect(winningLine(board(cells))).toEqual(line);
  });

  it("covers 3 rows", () => {
    expect(rows).toHaveLength(3);
    for (const { cells, line } of rows) {
      expect(winner(board(cells))).toBe("X");
      expect(winningLine(board(cells))).toEqual(line);
    }
  });

  it("covers 3 columns", () => {
    expect(columns).toHaveLength(3);
    for (const { cells, line } of columns) {
      expect(winner(board(cells))).toBe("X");
      expect(winningLine(board(cells))).toEqual(line);
    }
  });

  it("covers 2 diagonals", () => {
    expect(diagonals).toHaveLength(2);
    for (const { cells, line } of diagonals) {
      expect(winner(board(cells))).toBe("X");
      expect(winningLine(board(cells))).toEqual(line);
    }
  });

  it("exercises exactly 8 distinct winning lines", () => {
    const distinct = new Set(allLines.map(({ line }) => line.join(",")));
    expect(distinct.size).toBe(8);
  });

  it("reports no winner and no winning line on an empty board", () => {
    const empty = emptyBoard();

    expect(winner(empty)).toBeNull();
    expect(winningLine(empty)).toBeNull();
  });
});
