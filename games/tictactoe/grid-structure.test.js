/**
 * AC#7: Each of the nine cells is a real <button> carrying role="gridcell",
 * inside the role="grid" container.
 *
 * The board in games/tictactoe/index.html starts empty and is built at runtime
 * by the inline script (which depends on TicTacToe from game.js). So we load the
 * page markup into jsdom, execute game.js and the inline bootstrap script, then
 * inspect the resulting DOM: the #board container must expose role="grid" and
 * hold exactly nine <button> elements, each carrying role="gridcell".
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
// grid). Inline <script> tags inserted via innerHTML never execute in jsdom, so
// we evaluate the sources ourselves via indirect eval (global scope, where
// `module` is undefined) to reproduce real browser bootstrapping.
function bootstrapPage() {
  const html = fs.readFileSync(HTML_PATH, "utf8");
  const gameJs = fs.readFileSync(GAME_JS_PATH, "utf8");

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) {
    throw new Error("index.html has no <body> element");
  }
  document.body.innerHTML = bodyMatch[1];

  // The page's own inline script(s): <script> blocks with no src attribute.
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

describe("index.html grid structure (AC#7)", () => {
  beforeEach(() => {
    bootstrapPage();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    delete window.TicTacToe;
  });

  test("the #board container carries role=grid", () => {
    const board = document.getElementById("board");
    expect(board).not.toBeNull();
    expect(board.getAttribute("role")).toBe("grid");
  });

  test("the grid holds nine <button> elements", () => {
    const board = document.getElementById("board");
    const buttons = board.querySelectorAll("button");
    expect(buttons.length).toBe(9);
  });

  test("all nine grid cells are real <button> elements", () => {
    const board = document.getElementById("board");
    const cells = board.querySelectorAll('[role="gridcell"]');
    expect(cells.length).toBe(9);
    cells.forEach((cell) => {
      expect(cell.tagName).toBe("BUTTON");
    });
  });

  test("each of the nine cells carries role=gridcell inside the role=grid container", () => {
    const board = document.getElementById("board");
    expect(board.getAttribute("role")).toBe("grid");

    const buttons = board.querySelectorAll("button");
    expect(buttons.length).toBe(9);
    buttons.forEach((btn) => {
      expect(btn.getAttribute("role")).toBe("gridcell");
    });
  });
});
