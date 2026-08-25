// AC#5: A full board with no winner reports a draw.
//
// Verifies winner() returns "draw" for a full 9-cell board that contains no
// completed line, and null for a not-yet-full board.
"use strict";

const { winner, winningLine, emptyBoard, move } = require("./game.js");

// Build a board from a compact array, using '.' for empty cells.
function board(cells) {
  return cells.map((c) => (c === "." ? null : c));
}

describe("winner reports draw on a full board with no winning line", () => {
  test("a full 9-cell board with no completed line reports a draw", () => {
    // X O X / X O O / O X X  -> all 9 cells filled, no line for either player.
    const full = board(["X", "O", "X", "X", "O", "O", "O", "X", "X"]);
    expect(winningLine(full)).toBe(null);
    expect(winner(full)).toBe("draw");
  });

  test("draw is reached through legal alternating play", () => {
    let b = emptyBoard();
    const order = [
      [0, "X"], [1, "O"], [2, "X"], [4, "O"], [3, "X"],
      [5, "O"], [7, "X"], [6, "O"], [8, "X"],
    ];
    for (const [i, p] of order) b = move(b, i, p);
    expect(b.every((cell) => cell !== null)).toBe(true);
    expect(winner(b)).toBe("draw");
  });

  test("a board with an empty cell is not a draw while play can continue", () => {
    const notFull = board(["X", "O", "X", "X", "O", "O", "O", "X", "."]);
    expect(winner(notFull)).toBe(null);
  });
});
