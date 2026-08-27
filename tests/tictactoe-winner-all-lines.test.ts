// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
// This unit test proves the rules-layer behaviour behind that AC: for each of the
// eight winning triples, winner(board) reports the winning mark and
// winningLine(board) returns the exact three indices that completed the line.
import { emptyBoard, winner, winningLine } from "app/games/tictactoe/game";

type Cell = "X" | "O" | ".";

// Build a board from a compact array, using "." for empty cells.
function board(cells: Cell[]): Array<"X" | "O" | null> {
  return cells.map((c) => (c === "." ? null : c));
}

// All 8 winning lines: 3 rows, 3 columns, 2 diagonals. Each board is a legal-ish
// position in which X owns exactly one complete line.
const winningBoards: Array<{ name: string; cells: Cell[]; line: [number, number, number] }> = [
  { name: "row 0", cells: ["X", "X", "X", "O", "O", ".", ".", ".", "."], line: [0, 1, 2] },
  { name: "row 1", cells: ["O", "O", ".", "X", "X", "X", ".", ".", "."], line: [3, 4, 5] },
  { name: "row 2", cells: [".", ".", ".", "O", "O", ".", "X", "X", "X"], line: [6, 7, 8] },
  { name: "col 0", cells: ["X", "O", ".", "X", "O", ".", "X", ".", "."], line: [0, 3, 6] },
  { name: "col 1", cells: ["O", "X", ".", "O", "X", ".", ".", "X", "."], line: [1, 4, 7] },
  { name: "col 2", cells: [".", "O", "X", ".", "O", "X", ".", ".", "X"], line: [2, 5, 8] },
  { name: "diag main", cells: ["X", "O", ".", "O", "X", ".", ".", ".", "X"], line: [0, 4, 8] },
  { name: "diag anti", cells: [".", ".", "X", ".", "X", "O", "X", "O", "."], line: [2, 4, 6] },
];

describe("winner and winningLine detect a win across all 8 lines", () => {
  it.each(winningBoards)("detects the winner on $name", ({ cells }) => {
    expect(winner(board(cells))).toBe("X");
  });

  it.each(winningBoards)("returns the three winning indices on $name", ({ cells, line }) => {
    expect(winningLine(board(cells))).toEqual(line);
  });

  it("covers all 8 distinct winning lines exactly once", () => {
    const lines = winningBoards.map(({ line }) => line.join(","));
    expect(new Set(lines).size).toBe(8);
  });

  it("reports null winningLine and no winner on an empty board", () => {
    const empty = emptyBoard();

    expect(winner(empty)).toBeNull();
    expect(winningLine(empty)).toBeNull();
  });
});
