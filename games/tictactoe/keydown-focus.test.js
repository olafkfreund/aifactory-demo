/**
 * @jest-environment jsdom
 */
// AC#9: index.html registers a keydown handler on the grid that calls
// nextFocusIndex and moves focus to the returned cell.
//
// This loads the real index.html markup + its inline script into jsdom,
// focuses a cell, dispatches keydown arrow/Home/End events on the grid,
// and asserts document.activeElement lands on the cell nextFocusIndex
// returns. The expected target indexes (ArrowRight from 4 -> 5,
// ArrowDown from 4 -> 7, Home -> 0, End -> 8) are the values fixed by the
// nextFocusIndex contract; focus must follow them.
"use strict";

const fs = require("fs");
const path = require("path");

const { nextFocusIndex } = require("./game.js");

const HTML = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf8");

// The inline behaviour <script> is the only <script> tag with no attributes.
const INLINE_SCRIPT = HTML.match(/<script>([\s\S]*?)<\/script>/)[1];
// The body markup, minus the <script> tags (innerHTML never executes them).
const BODY_HTML = HTML.match(/<body>([\s\S]*)<\/body>/)[1].replace(
  /<script[\s\S]*?<\/script>/g,
  ""
);

// Rebuild the page and run its inline script fresh for each test so no
// focus/tabindex state leaks between cases.
function loadGame() {
  document.body.innerHTML = BODY_HTML;
  // The inline IIFE reads TicTacToe off the global scope, exactly like the
  // browser's <script src="game.js"> does.
  global.TicTacToe = require("./game.js");
  // Indirect eval executes the IIFE against the shared jsdom document.
  window.eval(INLINE_SCRIPT);
}

function cells() {
  return Array.from(document.querySelectorAll('#board button[role="gridcell"]'));
}

function pressKey(el, key) {
  el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

beforeEach(() => {
  loadGame();
});

afterEach(() => {
  delete global.TicTacToe;
  document.body.innerHTML = "";
});

describe("grid keydown handler moves focus via nextFocusIndex", () => {
  test("ArrowRight from cell 4 moves focus to cell 5", () => {
    const grid = cells();
    grid[4].focus();
    expect(document.activeElement).toBe(grid[4]);

    pressKey(grid[4], "ArrowRight");

    expect(nextFocusIndex(4, "ArrowRight")).toBe(5);
    expect(document.activeElement).toBe(grid[5]);
  });

  test("ArrowDown from cell 4 moves focus to cell 7", () => {
    const grid = cells();
    grid[4].focus();

    pressKey(grid[4], "ArrowDown");

    expect(nextFocusIndex(4, "ArrowDown")).toBe(7);
    expect(document.activeElement).toBe(grid[7]);
  });

  test("Home moves focus to the first cell (index 0)", () => {
    const grid = cells();
    grid[8].focus();

    pressKey(grid[8], "Home");

    expect(nextFocusIndex(8, "Home")).toBe(0);
    expect(document.activeElement).toBe(grid[0]);
  });

  test("End moves focus to the last cell (index 8)", () => {
    const grid = cells();
    grid[0].focus();

    pressKey(grid[0], "End");

    expect(nextFocusIndex(0, "End")).toBe(8);
    expect(document.activeElement).toBe(grid[8]);
  });

  test("a non-navigation key leaves focus on the current cell", () => {
    const grid = cells();
    grid[4].focus();

    pressKey(grid[4], "a");

    expect(nextFocusIndex(4, "a")).toBe(4);
    expect(document.activeElement).toBe(grid[4]);
  });
});
