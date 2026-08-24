// AC#10: Enter and Space place a mark on the focused cell, so a full game is
// playable with the keyboard alone.
//
// This test boots the real markup + wiring from games/tictactoe/index.html
// inside the jsdom environment: it loads the pure engine (game.js) as
// window.TicTacToe, injects the page body, and runs index.html's inline
// script so the grid, roving tabindex, and keydown handler are all live.
// It then focuses a cell and activates it with a keyboard event only —
// no mouse click — proving handleCellClick is reachable from the keyboard.
"use strict";

const fs = require("fs");
const path = require("path");

const HTML_PATH = path.join(__dirname, "index.html");

// Load the page's DOM + behaviour into the current jsdom document.
// Returns the live cell buttons and the status live-region element.
function bootGame() {
  const html = fs.readFileSync(HTML_PATH, "utf8");

  // The pure engine exports via CommonJS under jest; expose it the same way
  // the browser <script src="game.js"> would, as window.TicTacToe.
  const TicTacToe = require("./game.js");
  window.TicTacToe = TicTacToe;

  // Inject only the page body markup, stripping the <script> tags so we can
  // run the inline wiring script ourselves against the freshly built DOM.
  const bodyHtml = html
    .match(/<body>([\s\S]*?)<\/body>/)[1]
    .replace(/<script[\s\S]*?<\/script>/g, "");
  document.body.innerHTML = bodyHtml;

  // Extract and run index.html's inline IIFE (the attribute-less <script>).
  const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  // Pass TicTacToe as a parameter so the closure resolves it regardless of
  // how the jsdom global object is wired.
  new Function("TicTacToe", inlineScript)(TicTacToe);

  const cells = Array.from(document.querySelectorAll('#board [role="gridcell"]'));
  const statusEl = document.getElementById("status");
  return { cells, statusEl };
}

// Dispatch a keydown for `key` on the currently focused cell, matching how a
// keyboard user activates it. The board's keydown listener sees the event via
// bubbling.
function pressKey(target, key) {
  const event = new window.KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
}

describe("keyboard activation places a mark on the focused cell (AC#10)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Enter on the focused cell places X's mark and advances the turn", () => {
    const { cells, statusEl } = bootGame();

    cells[4].focus();
    expect(document.activeElement).toBe(cells[4]);

    pressKey(cells[4], "Enter");

    expect(cells[4].textContent).toBe("X");
    expect(statusEl.textContent).toBe("O's turn");
  });

  test("Space on the focused cell places X's mark and advances the turn", () => {
    const { cells, statusEl } = bootGame();

    cells[0].focus();
    expect(document.activeElement).toBe(cells[0]);

    pressKey(cells[0], " ");

    expect(cells[0].textContent).toBe("X");
    expect(statusEl.textContent).toBe("O's turn");
  });

  test("Enter then Space on two cells alternates players, keyboard-only", () => {
    const { cells } = bootGame();

    cells[0].focus();
    pressKey(cells[0], "Enter"); // X plays cell 0

    cells[1].focus();
    pressKey(cells[1], " "); // O plays cell 1

    expect(cells[0].textContent).toBe("X");
    expect(cells[1].textContent).toBe("O");
  });
});
