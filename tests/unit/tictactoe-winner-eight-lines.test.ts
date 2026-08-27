// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// This unit test exercises the DOM-free rules: winner() must report the winning
// player and winningLine() must return the exact index triple for each of the
// 8 winning lines (3 rows, 3 columns, 2 diagonals).
import { winner, winningLine } from "../../games/tictactoe/game";

type Cell = "X" | "O" | null;

// Build a board from a compact array, using "." for empty cells.
function board(cells: string[]): Cell[] {
  return cells.map((c) => (c === "." ? null : (c as Cell)));
}

// The 8 winning lines: 3 rows, 3 columns, 2 diagonals. Each fixture places X
// on the winning triple and O elsewhere so X is the unambiguous winner.
const winningLines: Array<{ name: string; cells: string[]; line: number[] }> = [
  { name: "row 0", cells: ["X", "X", "X", "O", "O", ".", ".", ".", "."], line: [0, 1, 2] },
  { name: "row 1", cells: ["O", "O", ".", "X", "X", "X", ".", ".", "."], line: [3, 4, 5] },
  { name: "row 2", cells: [".", ".", ".", "O", "O", ".", "X", "X", "X"], line: [6, 7, 8] },
  { name: "column 0", cells: ["X", "O", ".", "X", "O", ".", "X", ".", "."], line: [0, 3, 6] },
  { name: "column 1", cells: ["O", "X", ".", "O", "X", ".", ".", "X", "."], line: [1, 4, 7] },
  { name: "column 2", cells: [".", "O", "X", ".", "O", "X", ".", ".", "X"], line: [2, 5, 8] },
  { name: "diagonal top-left to bottom-right", cells: ["X", "O", ".", "O", "X", ".", ".", ".", "X"], line: [0, 4, 8] },
  { name: "diagonal top-right to bottom-left", cells: [".", ".", "X", ".", "X", "O", "X", "O", "."], line: [2, 4, 6] },
];

describe("winner/winningLine detect a win on all 8 lines", () => {
  it("covers exactly 8 winning lines (3 rows, 3 columns, 2 diagonals)", () => {
    const rows = winningLines.filter((l) => l.name.startsWith("row"));
    const columns = winningLines.filter((l) => l.name.startsWith("column"));
    const diagonals = winningLines.filter((l) => l.name.startsWith("diagonal"));
    expect(winningLines).toHaveLength(8);
    expect(rows).toHaveLength(3);
    expect(columns).toHaveLength(3);
    expect(diagonals).toHaveLength(2);
  });

  for (const { name, cells, line } of winningLines) {
    it(`reports X as winner on ${name}`, () => {
      expect(winner(board(cells))).toBe("X");
    });

    it(`returns the winning index triple for ${name}`, () => {
      expect(winningLine(board(cells))).toEqual(line);
    });
  }

  it("detects an O win on a line as well as an X win", () => {
    // O completes the middle column; the winner must reflect the O marks.
    const b = board(["X", "O", "X", ".", "O", ".", ".", "O", "."]);
    expect(winner(b)).toBe("O");
    expect(winningLine(b)).toEqual([1, 4, 7]);
  });
});
