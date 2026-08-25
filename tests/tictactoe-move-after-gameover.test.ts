// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// Once a game is won or drawn, isGameOver(state) is true and move(state, index)
// must short-circuit to a pure no-op: it returns the SAME state reference (===),
// mutates no field of the state, and never throws. Crucially this holds even
// when the clicked cell is still EMPTY — proving the isGameOver gate runs BEFORE
// the occupied-cell check, not the other way around.
//
// The module under test is imported via the shared `app` root used by every
// subtask in this spec.
import { move, newGame, isGameOver } from "app/games/tictactoe/game";

// Drive a fresh game to an X win on the top row [0,1,2].
// X:0, O:3, X:1, O:4, X:2 -> X completes the top row. Cells 5,6,7,8 stay EMPTY.
function playToXWin() {
  let s = newGame();
  s = move(s, 0); // X -> 0
  s = move(s, 3); // O -> 3
  s = move(s, 1); // X -> 1
  s = move(s, 4); // O -> 4
  s = move(s, 2); // X -> 2, wins top row
  return s;
}

// Drive a fresh game to a full-board draw (no winner).
// Final layout:  X O X / X O O / O X X
function playToDraw() {
  let s = newGame();
  s = move(s, 0); // X
  s = move(s, 1); // O
  s = move(s, 2); // X
  s = move(s, 4); // O
  s = move(s, 3); // X
  s = move(s, 5); // O
  s = move(s, 7); // X
  s = move(s, 6); // O
  s = move(s, 8); // X -> board full, no winner => draw
  return s;
}

describe("move() is a no-op once the game is over (AC#6)", () => {
  it("isGameOver is true after a win", () => {
    const won = playToXWin();
    expect(isGameOver(won)).toBe(true);
  });

  it("isGameOver is true after a draw", () => {
    const drawn = playToDraw();
    expect(isGameOver(drawn)).toBe(true);
  });

  it("returns the exact same state reference when clicking an EMPTY cell after a win", () => {
    const won = playToXWin();
    expect(won.board[5]).toBeNull(); // cell 5 is genuinely empty
    const attempt = move(won, 5); // click after the game is decided
    expect(attempt).toBe(won); // identical reference => true no-op
  });

  it("does not fill the empty cell that was clicked after a win", () => {
    const won = playToXWin();
    const attempt = move(won, 6); // another empty, non-winning cell
    expect(attempt.board[6]).toBeNull(); // still empty, no mark placed
  });

  it("mutates no field of the winning state", () => {
    const won = playToXWin();
    const boardSnapshot = won.board.slice();
    const winnerBefore = won.winner;
    const currentBefore = won.currentPlayer;

    move(won, 7); // attempt a move on an empty cell after the win

    expect(won.board).toEqual(boardSnapshot); // board untouched
    expect(won.winner).toBe(winnerBefore); // winner untouched ("X")
    expect(won.currentPlayer).toBe(currentBefore); // turn untouched
    expect(won.isDraw).toBe(false); // still not a draw
  });

  it("does not throw when clicking after the game is over", () => {
    const won = playToXWin();
    expect(() => move(won, 8)).not.toThrow();
  });

  it("returns the exact same state reference when clicking after a draw", () => {
    const drawn = playToDraw();
    const attempt = move(drawn, 0);
    expect(attempt).toBe(drawn); // no-op even though the game is a draw
  });
});
