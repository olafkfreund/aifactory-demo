// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// This exercises the pure rule `checkWinner(board)` in games/tictactoe/game.js.
// For every one of the 8 winning lines, a board whose three cells carry the same
// mark must be reported as a win: checkWinner returns the correct winner ('X' or
// 'O') AND the exact winning triple (the three indices). WIN_LINES must contain
// EXACTLY those 8 lines — 3 rows, 3 columns, 2 diagonals — which is the data the
// UI reads to visibly mark the winning line.
//
// The module under test is imported via the shared `app` root used by every
// subtask in this spec.
import { checkWinner, WIN_LINES } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

// A blank 9-cell board.
function emptyBoard(): Cell[] {
  return [null, null, null, null, null, null, null, null, null];
}

// Place `mark` on each index of `line`, leaving all other cells empty.
function boardWithLine(line: number[], mark: Cell): Cell[] {
  const board = emptyBoard();
  for (const idx of line) {
    board[idx] = mark;
  }
  return board;
}

// The 8 winning lines, grouped so the test can prove the 3/3/2 breakdown.
const ROWS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];
const COLUMNS = [
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];
const DIAGONALS = [
  [0, 4, 8],
  [2, 4, 6],
];
const ALL_LINES: Array<{ kind: string; line: number[] }> = [
  ...ROWS.map((line) => ({ kind: "row", line })),
  ...COLUMNS.map((line) => ({ kind: "column", line })),
  ...DIAGONALS.map((line) => ({ kind: "diagonal", line })),
];

describe("checkWinner() detects a win on all 8 lines (AC#4)", () => {
  it.each(ALL_LINES)(
    "detects X winning on the %s line $line and returns that winning triple",
    ({ line }) => {
      const result = checkWinner(boardWithLine(line, "X"));

      expect(result.winner).toBe("X");
      expect(result.line).toEqual(line);
    }
  );

  it.each(ALL_LINES)(
    "detects O winning on the %s line $line and returns that winning triple",
    ({ line }) => {
      const result = checkWinner(boardWithLine(line, "O"));

      expect(result.winner).toBe("O");
      expect(result.line).toEqual(line);
    }
  );

  it("reports no winner and no line on an empty board", () => {
    const result = checkWinner(emptyBoard());

    expect(result.winner).toBeNull();
    expect(result.line).toBeNull();
  });

  it("reports no winner when a line is only partially filled", () => {
    const board = emptyBoard();
    board[0] = "X";
    board[1] = "X"; // no third mark — not a completed line
    const result = checkWinner(board);

    expect(result.winner).toBeNull();
    expect(result.line).toBeNull();
  });
});

describe("WIN_LINES contains exactly the 8 winning lines (AC#4)", () => {
  it("has exactly 8 lines", () => {
    expect(WIN_LINES).toHaveLength(8);
  });

  it("is made up of 3 rows, 3 columns, and 2 diagonals", () => {
    const asKeys = (lines: number[][]) => lines.map((l) => l.join(","));
    const present = new Set(asKeys(WIN_LINES as number[][]));

    const rowKeys = asKeys(ROWS);
    const columnKeys = asKeys(COLUMNS);
    const diagonalKeys = asKeys(DIAGONALS);

    expect(rowKeys.filter((k) => present.has(k))).toHaveLength(3);
    expect(columnKeys.filter((k) => present.has(k))).toHaveLength(3);
    expect(diagonalKeys.filter((k) => present.has(k))).toHaveLength(2);
  });

  it("contains exactly those 8 lines and no others", () => {
    const expected = ALL_LINES.map(({ line }) => line.join(",")).sort();
    const actual = (WIN_LINES as number[][]).map((l) => l.join(",")).sort();

    expect(actual).toEqual(expected);
  });
});
