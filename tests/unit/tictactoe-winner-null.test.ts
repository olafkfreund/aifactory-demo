// AC#8: the test suite covers every function above, including the state where
// play continues. This unit test proves the rules-layer behaviour behind that
// AC: both winner(board) and winningLine(board) return null on an empty board
// and on an in-progress board that has no completed line — the signal that the
// game is neither won nor drawn and play must continue.
import { winner, winningLine, emptyBoard } from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

describe("winner and winningLine return null while play continues", () => {
  it("winner returns null on a fresh empty board", () => {
    expect(winner(emptyBoard())).toBeNull();
  });

  it("winningLine returns null on a fresh empty board", () => {
    expect(winningLine(emptyBoard())).toBeNull();
  });

  it("winner returns null after a single opening move (no line, empties remain)", () => {
    // X . .
    // . . .
    // . . .
    const oneMove: Cell[] = ["X", null, null, null, null, null, null, null, null];
    expect(winner(oneMove)).toBeNull();
  });

  it("winningLine returns null after a single opening move", () => {
    const oneMove: Cell[] = ["X", null, null, null, null, null, null, null, null];
    expect(winningLine(oneMove)).toBeNull();
  });

  it("winner returns null on a mid-game board with no completed line", () => {
    // X O X
    // . O .
    // . . .
    const inProgress: Cell[] = ["X", "O", "X", null, "O", null, null, null, null];
    expect(winner(inProgress)).toBeNull();
  });

  it("winningLine returns null on a mid-game board with no completed line", () => {
    // X O X
    // . O .
    // . . .
    const inProgress: Cell[] = ["X", "O", "X", null, "O", null, null, null, null];
    expect(winningLine(inProgress)).toBeNull();
  });

  it("winner returns null on a nearly-full board with one empty cell and no winner", () => {
    // X O X
    // X O O
    // O X .
    const almostFull: Cell[] = ["X", "O", "X", "X", "O", "O", "O", "X", null];
    expect(winner(almostFull)).toBeNull();
  });

  it("winningLine returns null on a nearly-full board with no completed line", () => {
    // X O X
    // X O O
    // O X .
    const almostFull: Cell[] = ["X", "O", "X", "X", "O", "O", "O", "X", null];
    expect(winningLine(almostFull)).toBeNull();
  });
});
