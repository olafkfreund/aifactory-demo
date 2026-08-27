// AC#8: game.test.js covers every rules function above, including all 8 winning
// lines, the draw, the occupied-cell rejection, and the move-after-game-over
// rejection. This unit test fills the remaining ongoing-play coverage: it proves
// winner(board) and winningLine(board) both return null while play continues —
// on a fresh empty board and on a partially-filled mid-game board with no
// completed line — so the "null means play continues" branch is exercised.
import { emptyBoard, move, winner, winningLine } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

describe("winner and winningLine return null while play continues", () => {
  it("winner returns null on a fresh empty board", () => {
    expect(winner(emptyBoard())).toBeNull();
  });

  it("winningLine returns null on a fresh empty board", () => {
    expect(winningLine(emptyBoard())).toBeNull();
  });

  it("winner returns null after a single move (mid-game, no line)", () => {
    const midGame = move(emptyBoard(), 0, "X");
    expect(winner(midGame)).toBeNull();
  });

  it("winningLine returns null after a single move (mid-game, no line)", () => {
    const midGame = move(emptyBoard(), 0, "X");
    expect(winningLine(midGame)).toBeNull();
  });

  it("winner returns null on a partially-filled board with no completed line", () => {
    // X O .
    // . X .
    // . . O   -> in progress, no row/column/diagonal completed
    const midGame: Cell[] = ["X", "O", null, null, "X", null, null, null, "O"];
    expect(winner(midGame)).toBeNull();
  });

  it("winningLine returns null on a partially-filled board with no completed line", () => {
    const midGame: Cell[] = ["X", "O", null, null, "X", null, null, null, "O"];
    expect(winningLine(midGame)).toBeNull();
  });
});
