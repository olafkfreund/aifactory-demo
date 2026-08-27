// AC#5: A full board with no winner reports a draw.
// This unit test proves the rules-layer behaviour behind that AC: winner(board)
// returns "draw" when all 9 cells are filled and no line (row, column, or
// diagonal) is complete. Boundary cases guard that a full board containing a
// winning line reports the winner (not a draw) and that a board with an empty
// cell reports null (play continues).
import { winner } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

describe("winner reports a draw on a full board with no completed line", () => {
  it('returns "draw" for a full board where no line is completed', () => {
    // X O X
    // X X O
    // O X O
    // No row, column, or diagonal is a single mark → a draw.
    const fullNoWinner: Cell[] = ["X", "O", "X", "X", "X", "O", "O", "X", "O"];
    expect(winner(fullNoWinner)).toBe("draw");
  });

  it('returns "draw" for a different full board with no completed line', () => {
    // O X O
    // X X O
    // X O X
    const fullNoWinner: Cell[] = ["O", "X", "O", "X", "X", "O", "X", "O", "X"];
    expect(winner(fullNoWinner)).toBe("draw");
  });

  it("does not report a draw when a full board still contains a winning line", () => {
    // X X X  (top row wins)
    // O O X
    // O X O
    const fullWithWinner: Cell[] = ["X", "X", "X", "O", "O", "X", "O", "X", "O"];
    expect(winner(fullWithWinner)).toBe("X");
  });

  it("does not report a draw while the board still has an empty cell", () => {
    const incomplete: Cell[] = ["X", "O", "X", "X", "O", "O", "O", "X", null];
    expect(winner(incomplete)).toBeNull();
  });
});
