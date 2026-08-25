// AC#5: A full board with no winner reports a draw.
//
// This exercises the pure rules in games/tictactoe/game.js. A board that is
// completely filled (9 marks) but contains no completed line must be reported
// as full by `isBoardFull` (true) and as having no winner by `checkWinner`
// (winner null). Furthermore, when such a position is REACHED THROUGH PLAY via
// `move`, the resulting state must carry `isDraw` true and be treated as over
// by `isGameOver` (true).
//
// The module under test is imported via the shared `app` root used by every
// subtask in this spec.
import {
  isBoardFull,
  checkWinner,
  isGameOver,
  newGame,
  move,
} from "app/games/tictactoe/game";

type Cell = "X" | "O" | null;

// A completely filled board with NO three-in-a-row for either player:
//   X | O | X
//   X | O | O
//   O | X | X
// Rows/columns/diagonals are all mixed, so neither X nor O completes a line.
const FULL_DRAW_BOARD: Cell[] = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];

describe("isBoardFull() / checkWinner() on a full board with no winner (AC#5)", () => {
  it("reports the full board as full", () => {
    expect(isBoardFull(FULL_DRAW_BOARD)).toBe(true);
  });

  it("reports no winner on the full board", () => {
    const result = checkWinner(FULL_DRAW_BOARD);

    expect(result.winner).toBeNull();
    expect(result.line).toBeNull();
  });

  it("does not treat a board with an empty cell as full", () => {
    const almostFull: Cell[] = ["X", "O", "X", "X", "O", "O", "O", "X", null];

    expect(isBoardFull(almostFull)).toBe(false);
  });
});

describe("reaching a full no-winner board through play yields a draw (AC#5)", () => {
  // A legal alternating sequence (X first) that fills the board to FULL_DRAW_BOARD
  // without ever completing a line before the final move.
  //   X:0, O:1, X:2, O:4, X:3, O:5, X:7, O:6, X:8
  const DRAW_SEQUENCE = [0, 1, 2, 4, 3, 5, 7, 6, 8];

  function playToEnd() {
    return DRAW_SEQUENCE.reduce((state, index) => move(state, index), newGame());
  }

  it("fills every cell after the full sequence of moves", () => {
    const final = playToEnd();

    expect(isBoardFull(final.board)).toBe(true);
  });

  it("declares no winner when the board fills with no completed line", () => {
    const final = playToEnd();

    expect(final.winner).toBeNull();
    expect(final.winningLine).toBeNull();
  });

  it("sets isDraw true on the resulting state", () => {
    const final = playToEnd();

    expect(final.isDraw).toBe(true);
  });

  it("reports the game as over via isGameOver", () => {
    const final = playToEnd();

    expect(isGameOver(final)).toBe(true);
  });
});
