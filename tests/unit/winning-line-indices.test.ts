// AC#4: the winning line is visibly marked — winningLine(board) returns the
// three indices that won. This unit test proves the rules-layer behaviour:
// winningLine returns exactly the three winning indices for each completed
// line (3 rows, 3 columns, 2 diagonals), and null while play continues.
import { winningLine } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

// Build a 9-cell board with `player` on the three `line` indices, rest empty.
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

describe("winningLine returns the three winning indices", () => {
  it.each(ALL_LINES)(
    "returns [%i, %i, %i] when X completes that line",
    (a, b, c) => {
      expect(winningLine(boardWithLine([a, b, c], "X"))).toEqual([a, b, c]);
    },
  );

  it.each(ALL_LINES)(
    "returns [%i, %i, %i] when O completes that line",
    (a, b, c) => {
      expect(winningLine(boardWithLine([a, b, c], "O"))).toEqual([a, b, c]);
    },
  );

  it("returns an array of exactly three indices for a completed line", () => {
    expect(winningLine(boardWithLine([0, 1, 2], "X"))).toHaveLength(3);
  });

  describe("null while play continues", () => {
    it("returns null for an empty board", () => {
      const empty: Cell[] = [null, null, null, null, null, null, null, null, null];
      expect(winningLine(empty)).toBeNull();
    });

    it("returns null when a line is only partially filled", () => {
      // Top row has two X marks; the third cell is still empty.
      const board: Cell[] = ["X", "X", null, null, null, null, null, null, null];
      expect(winningLine(board)).toBeNull();
    });

    it("returns null when a line is blocked by the other player", () => {
      // Top row: X X O — blocked, not a completed line.
      const board: Cell[] = ["X", "X", "O", null, null, null, null, null, null];
      expect(winningLine(board)).toBeNull();
    });

    it("returns null on a full board with no three-in-a-row", () => {
      // X O X / O X O / O X O — full, no completed line.
      const board: Cell[] = ["X", "O", "X", "O", "X", "O", "O", "X", "O"];
      expect(winningLine(board)).toBeNull();
    });
  });
});
