/**
 * AC#8: The grid uses a roving tabindex — exactly one cell has tabindex="0"
 * and the other eight have tabindex="-1" at any time.
 *
 * games/tictactoe/index.html builds the nine cells at runtime via the inline
 * bootstrap script (which depends on TicTacToe from game.js) and manages focus
 * through setFocusedIndex(index): that helper sets tabIndex 0 on the focused
 * cell and -1 on every other cell. We load the page markup into jsdom, execute
 * game.js + the inline script, then assert the roving invariant at init and
 * again after arrow-key navigation moves focus across the grid.
 *
 * @jest-environment jsdom
 */
"use strict";

const fs = require("fs");
const path = require("path");

const HTML_PATH = path.join(__dirname, "index.html");
const GAME_JS_PATH = path.join(__dirname, "game.js");

// Read index.html, mount its <body> markup into the jsdom document, then run
// game.js (defines window.TicTacToe) and the page's inline script (builds the
// grid + wires the keydown handler). Inline <script> tags inserted via
// innerHTML never execute in jsdom, so we evaluate the sources ourselves via
// indirect eval (global scope, where `module` is undefined) to reproduce real
// browser bootstrapping.
function bootstrapPage() {
  const html = fs.readFileSync(HTML_PATH, "utf8");
  const gameJs = fs.readFileSync(GAME_JS_PATH, "utf8");

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) {
    throw new Error("index.html has no <body> element");
  }
  document.body.innerHTML = bodyMatch[1];

  const inlineScripts = [];
  const scriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRe.exec(html)) !== null) {
    if (m[1].trim()) inlineScripts.push(m[1]);
  }

  const indirectEval = eval;
  indirectEval(gameJs); // sets window.TicTacToe
  inlineScripts.forEach((src) => indirectEval(src)); // builds the grid
}

function cells() {
  return Array.from(document.getElementById("board").querySelectorAll("button"));
}

// Return the tabIndex of every cell, in board order.
function tabindexes() {
  return cells().map((btn) => btn.tabIndex);
}

describe("roving tabindex (AC#8)", () => {
  beforeEach(() => {
    bootstrapPage();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    delete window.TicTacToe;
  });

  test("at init exactly one cell has tabindex=0 and the other eight have tabindex=-1", () => {
    const values = tabindexes();
    expect(values).toHaveLength(9);
    expect(values.filter((t) => t === 0)).toHaveLength(1);
    expect(values.filter((t) => t === -1)).toHaveLength(8);
  });

  test("at init the single tabbable cell is the first cell (index 0)", () => {
    const values = tabindexes();
    expect(values[0]).toBe(0);
  });

  test("after ArrowRight navigation exactly one cell has tabindex=0 and eight have tabindex=-1", () => {
    const all = cells();
    all[0].focus();
    all[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    const values = tabindexes();
    expect(values.filter((t) => t === 0)).toHaveLength(1);
    expect(values.filter((t) => t === -1)).toHaveLength(8);
  });

  test("after ArrowRight the roving tabindex=0 moves to the newly focused cell (index 1)", () => {
    const all = cells();
    all[0].focus();
    all[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    const values = tabindexes();
    expect(values[1]).toBe(0);
    expect(values[0]).toBe(-1);
  });

  test("the single-zero invariant holds after a sequence of arrow moves", () => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "End", "Home"];
    for (const key of keys) {
      const current = cells().find((btn) => btn.tabIndex === 0);
      current.focus();
      current.dispatchEvent(new KeyboardEvent("keydown", { key: key, bubbles: true }));

      const values = tabindexes();
      expect(values.filter((t) => t === 0)).toHaveLength(1);
      expect(values.filter((t) => t === -1)).toHaveLength(8);
    }
  });
});
