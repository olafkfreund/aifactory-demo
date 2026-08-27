// AC#5: A full board with no winner reports a draw.
// This unit test proves the rules-layer behaviour behind that AC: winner(board)
// returns "draw" for a full 9-cell board that has no completed line (no row,
// column, or diagonal is a single mark), and returns null while any cell is
// still empty (play continues).
import { winner } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

describe("winner() reports draw on a full board and null while cells remain empty", () => {
  // X O X
  // O O X
  // X X O
  // Full board; no row, column, or diagonal is a single mark → a draw.
  const fullNoWinner: Cell[] = ["X", "O", "X", "O", "O", "X", "X", "X", "O"];

  it('returns "draw" for a full board with no completed line', () => {
    expect(winner(fullNoWinner)).toBe("draw");
  });

  it('returns null for an empty board (play continues)', () => {
    const empty: Cell[] = [null, null, null, null, null, null, null, null, null];
    expect(winner(empty)).toBeNull();
  });

  it("returns null while a single empty cell remains and no line is complete", () => {
    // Same layout as the draw board but with the last cell still empty.
    const onePlayLeft: Cell[] = ["X", "O", "X", "O", "O", "X", "X", "X", null];
    expect(winner(onePlayLeft)).toBeNull();
  });
});
