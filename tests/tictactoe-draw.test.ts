// AC#5: A full board with no winner reports a draw.
// This unit test proves the rules-layer behaviour behind that AC: for a full
// 9-cell board with no completed line (no row, column, or diagonal is a single
// mark), winner(board) returns "draw" and winningLine(board) returns null.
import { winner, winningLine } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

describe("full board with no completed line reports a draw", () => {
  // X O X
  // X X O
  // O X O
  // No row, column, or diagonal shares a single mark → a draw.
  const fullNoWinner: Cell[] = ["X", "O", "X", "X", "X", "O", "O", "X", "O"];

  it('winner returns "draw" for a full board with no completed line', () => {
    expect(winner(fullNoWinner)).toBe("draw");
  });

  it("winningLine returns null for a full board with no completed line", () => {
    expect(winningLine(fullNoWinner)).toBeNull();
  });

  it('winner returns "draw" for a different full board with no completed line', () => {
    // O X O
    // X X O
    // X O X
    const otherDraw: Cell[] = ["O", "X", "O", "X", "X", "O", "X", "O", "X"];
    expect(winner(otherDraw)).toBe("draw");
    expect(winningLine(otherDraw)).toBeNull();
  });

  it('winner does not report a draw while an empty cell remains', () => {
    const incomplete: Cell[] = ["X", "O", "X", "X", "O", "O", "O", "X", null];
    expect(winner(incomplete)).toBeNull();
  });
});
