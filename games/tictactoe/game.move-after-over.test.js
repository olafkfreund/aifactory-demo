// AC#6: Play stops once the game is decided; further clicks do nothing.
// This suite proves move() returns the board UNCHANGED (same reference,
// no cell mutated) once winner() is non-null — both when a player has won
// and when the board is a full-board draw.
//
// Run from repo root with: npx jest games/tictactoe/game.move-after-over.test.js
"use strict";

const { emptyBoard, move, winner } = require("./game.js");

// Build a board from a compact array, using '.' for empty cells.
function board(cells) {
  return cells.map((c) => (c === "." ? null : c));
}

describe("move() is rejected once the game is over (AC#6)", () => {
  test("after a win, move() returns the same board reference (no-op)", () => {
    // X completes the top row and wins.
    const won = board(["X", "X", "X", "O", "O", ".", ".", ".", "."]);
    expect(winner(won)).toBe("X");

    const attempt = move(won, 5, "O"); // 5 is empty, but the game is decided
    expect(attempt).toBe(won); // exact no-op, same reference
  });

  test("after a win, the target empty cell stays null (board unchanged)", () => {
    const won = board(["X", "X", "X", "O", "O", ".", ".", ".", "."]);
    expect(winner(won)).toBe("X");

    const attempt = move(won, 7, "O");
    expect(attempt[7]).toBe(null);
    expect(attempt).toEqual(won);
  });

  test("after a draw, move() returns the same full board reference (no-op)", () => {
    // X O X / X O O / O X X -> full board, no winning line for either player.
    const drawn = board(["X", "O", "X", "X", "O", "O", "O", "X", "X"]);
    expect(winner(drawn)).toBe("draw");

    const attempt = move(drawn, 0, "O"); // occupied and game-over
    expect(attempt).toBe(drawn); // exact no-op, same reference
    expect(attempt).toEqual(drawn);
  });

  test("a win reached through play locks out any further move", () => {
    let b = emptyBoard();
    const moves = [
      [0, "X"], [3, "O"], [1, "X"], [4, "O"], [2, "X"], // X wins top row
    ];
    for (const [i, p] of moves) b = move(b, i, p);
    expect(winner(b)).toBe("X");

    const after = move(b, 6, "O"); // empty cell, but play has stopped
    expect(after).toBe(b);
    expect(after[6]).toBe(null);
  });

  test("while play continues, move() is NOT rejected (control: winner is null)", () => {
    const b = move(emptyBoard(), 0, "X");
    expect(winner(b)).toBe(null);

    const next = move(b, 1, "O");
    expect(next).not.toBe(b); // a real move produces a new board
    expect(next[1]).toBe("O");
  });
});
