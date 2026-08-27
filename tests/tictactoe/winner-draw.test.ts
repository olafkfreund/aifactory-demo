// AC#5: A full board with no winner reports a draw.
//
// This unit test proves the rules-layer behaviour behind that AC: winner(board)
// returns "draw" for a completely filled 9-cell board that contains no winning
// line, and winningLine(board) returns null for that same board (no line won).
import { winner, winningLine } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

// A full board with every cell occupied and no completed line:
//   X | O | X
//   X | O | O
//   O | X | X
// Rows, columns, and both diagonals each contain a mix of X and O, so no line
// is won even though all 9 cells are filled.
const DRAW_BOARD: Cell[] = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];

describe("winner() on a full board with no winning line", () => {
  it("reports a draw", () => {
    expect(winner(DRAW_BOARD)).toBe("draw");
  });

  it("has no winning line", () => {
    expect(winningLine(DRAW_BOARD)).toBeNull();
  });

  it("uses a genuinely full board (no empty cells)", () => {
    expect(DRAW_BOARD.every((cell) => cell !== null)).toBe(true);
    expect(DRAW_BOARD).toHaveLength(9);
  });
});
