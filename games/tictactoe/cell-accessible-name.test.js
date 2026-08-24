/**
 * @jest-environment jsdom
 */
//
// AC#11: Each cell's accessible name states its position and contents,
//        e.g. "row 2, column 3, empty".
//
// The target is `games/tictactoe/index.html::positionLabel`, a helper defined
// inside the page's inline IIFE (not exported). It feeds each cell button's
// aria-label via render(): `positionLabel(i) + ", " + (mark || "empty")`.
// To exercise the REAL code, this test loads game.js and the page's inline
// <script> into the jsdom environment, then reads the resulting aria-labels
// straight off the rendered cell buttons — first on an empty board, then
// after a move mutates one cell's contents.
//
// Run from the repo root with:
//   npx jest games/tictactoe/cell-accessible-name.test.js
"use strict";

const fs = require("fs");
const path = require("path");

// Indirect eval runs code in the global scope so game.js can attach
// window.TicTacToe and the inline script can see it as a global.
const globalEval = eval; // eslint-disable-line no-eval

function loadGameIntoDom() {
  const dir = __dirname;
  const gameSource = fs.readFileSync(path.join(dir, "game.js"), "utf8");
  const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");

  // The page has two <script> tags: `<script src="game.js">` (has an
  // attribute) and the inline `<script>` block (none). Match the attribute-
  // free opening tag so we grab the inline script verbatim.
  const inlineMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!inlineMatch) {
    throw new Error("Could not find the inline <script> block in index.html");
  }
  const inlineSource = inlineMatch[1];

  // Minimal faithful DOM the inline script wires itself to.
  document.body.innerHTML =
    '<h1>Tic-Tac-Toe</h1>' +
    '<div id="status" role="status" aria-live="polite"></div>' +
    '<div id="board" role="grid" aria-label="Tic-tac-toe board"></div>' +
    '<button id="new-game" type="button">New game</button>';

  globalEval(gameSource); // defines window.TicTacToe
  globalEval(inlineSource); // builds the board + renders aria-labels
}

function cellButtons() {
  return Array.from(document.querySelectorAll("#board button"));
}

beforeEach(() => {
  loadGameIntoDom();
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("cell accessible name states position and contents (AC#11)", () => {
  test("renders nine cell buttons", () => {
    expect(cellButtons()).toHaveLength(9);
  });

  test('the cell at row 2, column 3 is labelled "row 2, column 3, empty" on a fresh board', () => {
    // Row 2, column 3 => index (2-1)*3 + (3-1) = 5.
    const cells = cellButtons();
    expect(cells[5].getAttribute("aria-label")).toBe("row 2, column 3, empty");
  });

  test("every empty cell's accessible name states its own row, column and 'empty'", () => {
    const expected = [
      "row 1, column 1, empty",
      "row 1, column 2, empty",
      "row 1, column 3, empty",
      "row 2, column 1, empty",
      "row 2, column 2, empty",
      "row 2, column 3, empty",
      "row 3, column 1, empty",
      "row 3, column 2, empty",
      "row 3, column 3, empty",
    ];
    const labels = cellButtons().map((btn) => btn.getAttribute("aria-label"));
    expect(labels).toEqual(expected);
  });

  test("the accessible name updates to reflect the mark after a move", () => {
    const cells = cellButtons();
    // Center cell is row 2, column 2 (index 4); empty before the move.
    expect(cells[4].getAttribute("aria-label")).toBe("row 2, column 2, empty");

    cells[4].dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

    // X (first player) is placed; the accessible name now states the contents.
    expect(cells[4].getAttribute("aria-label")).toBe("row 2, column 2, X");
  });
});
