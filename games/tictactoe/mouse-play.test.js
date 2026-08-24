/**
 * @jest-environment jsdom
 */
// AC#14: The game still works exactly as before with a mouse.
//
// This suite loads the REAL inline controller script from index.html into a
// jsdom document (wiring it to the same game.js engine the page uses) and then
// drives it purely by clicking cells — the mouse path through handleCellClick.
// It verifies the pre-change behaviour is intact:
//   - clicking an empty cell places the current player's mark,
//   - turns alternate X -> O -> X,
//   - clicking an occupied cell is a no-op,
//   - a completed line is announced as a win and the winning cells highlight,
//   - a full board with no line is announced as a draw,
//   - "New game" resets the board and returns the turn to X.
"use strict";

const fs = require("fs");
const path = require("path");

// The pure engine index.html loads via <script src="game.js">.
const TicTacToe = require("./game.js");

// The inline controller <script> block (the one with no src attribute) that
// defines handleCellClick and wires up the click handlers.
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function bootGame() {
  document.body.innerHTML =
    '<h1>Tic-Tac-Toe</h1>' +
    '<div id="status" role="status" aria-live="polite"></div>' +
    '<div id="board" role="grid" aria-label="Tic-tac-toe board"></div>' +
    '<button id="new-game" type="button">New game</button>';
  // index.html references the engine through the global `TicTacToe`.
  global.TicTacToe = TicTacToe;
  window.TicTacToe = TicTacToe;
  // Execute the page's own inline controller against this jsdom document.
  new Function(inlineScript)();
}

function cells() {
  return Array.from(document.querySelectorAll(".cell"));
}

function clickCell(index) {
  cells()[index].click();
}

function statusText() {
  return document.getElementById("status").textContent;
}

beforeEach(() => {
  bootGame();
});

afterEach(() => {
  document.body.innerHTML = "";
  delete global.TicTacToe;
  delete window.TicTacToe;
  jest.restoreAllMocks();
});

test("the board renders nine clickable cells with X to move", () => {
  expect(cells()).toHaveLength(9);
  expect(statusText()).toBe("X's turn");
});

test("clicking an empty cell places X and passes the turn to O", () => {
  clickCell(4);
  expect(cells()[4].textContent).toBe("X");
  expect(statusText()).toBe("O's turn");
});

test("turns alternate as X and O click empty cells", () => {
  clickCell(0); // X
  clickCell(1); // O
  clickCell(2); // X
  expect(cells()[0].textContent).toBe("X");
  expect(cells()[1].textContent).toBe("O");
  expect(cells()[2].textContent).toBe("X");
  expect(statusText()).toBe("O's turn");
});

test("clicking an occupied cell is a no-op: mark and turn are unchanged", () => {
  clickCell(0); // X takes cell 0, now O's turn
  clickCell(0); // O clicks the occupied cell
  expect(cells()[0].textContent).toBe("X");
  expect(statusText()).toBe("O's turn");
});

test("completing a line via clicks announces the win and highlights the line", () => {
  // X: 0,1,2 (top row) — O: 3,4 (non-winning).
  clickCell(0); // X
  clickCell(3); // O
  clickCell(1); // X
  clickCell(4); // O
  clickCell(2); // X wins top row

  expect(statusText()).toBe("X wins!");
  expect(cells()[0].classList.contains("win")).toBe(true);
  expect(cells()[1].classList.contains("win")).toBe(true);
  expect(cells()[2].classList.contains("win")).toBe(true);
});

test("clicking after a win does nothing more", () => {
  [0, 3, 1, 4, 2].forEach(clickCell); // X wins top row
  expect(statusText()).toBe("X wins!");

  clickCell(8); // empty cell, but game is over
  expect(cells()[8].textContent).toBe("");
  expect(statusText()).toBe("X wins!");
});

test("filling the board with no line announces a draw", () => {
  // X O X / X O O / O X X — a full board with no three-in-a-row.
  [0, 1, 2, 4, 3, 5, 7, 6, 8].forEach(clickCell);
  expect(statusText()).toBe("Draw!");
});

test("New game clears every cell and returns the turn to X", () => {
  [0, 3, 1, 4, 2].forEach(clickCell); // X wins top row
  expect(statusText()).toBe("X wins!");

  document.getElementById("new-game").click();

  expect(cells().every((cell) => cell.textContent === "")).toBe(true);
  expect(cells().some((cell) => cell.classList.contains("win"))).toBe(false);
  expect(statusText()).toBe("X's turn");
});
