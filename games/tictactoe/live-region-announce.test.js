/**
 * AC#12: The live region announces the turn change and the final result.
 *
 * These tests load games/tictactoe/index.html into jsdom, wire up the real
 * game engine (game.js) and the page's inline controller, then drive moves by
 * clicking cells. They assert the aria-live status region (#status) updates to
 * the current player's turn between moves and to the win/draw result once the
 * game is decided — exactly what render() writes into the live region.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const INDEX_HTML = path.join(__dirname, "index.html");

// Boot the page the same way a browser would: install the game engine on
// window, mount index.html's body markup, then run its inline controller
// script. Returns handles to the live region and the nine cell buttons.
function bootGame() {
  const html = fs.readFileSync(INDEX_HTML, "utf8");

  // The inline controller is the <script> block without a src attribute.
  const scriptBlocks = [
    ...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi),
  ];
  const inlineScript = scriptBlocks[scriptBlocks.length - 1][1];

  // Mount the body markup, stripped of its <script> tags.
  const body = html.match(/<body>([\s\S]*?)<\/body>/i)[1];
  document.body.innerHTML = body.replace(/<script[\s\S]*?<\/script>/gi, "");

  // Expose the engine as the page expects (window.TicTacToe).
  window.TicTacToe = require("./game.js");

  // Run the inline IIFE with the globals it references.
  // eslint-disable-next-line no-new-func
  new Function("window", "document", "TicTacToe", inlineScript)(
    window,
    document,
    window.TicTacToe
  );

  return {
    statusEl: document.getElementById("status"),
    cells: Array.from(document.querySelectorAll("#board button")),
  };
}

function play(cells, indexes) {
  for (const index of indexes) {
    cells[index].click();
  }
}

afterEach(() => {
  jest.resetModules();
  document.body.innerHTML = "";
  delete window.TicTacToe;
});

describe("live region announcements (AC#12)", () => {
  test("the status element is a polite live region", () => {
    const { statusEl } = bootGame();
    expect(statusEl.getAttribute("aria-live")).toBe("polite");
  });

  test("announces X's turn at the start of the game", () => {
    const { statusEl } = bootGame();
    expect(statusEl.textContent).toBe("X's turn");
  });

  test("announces the turn change after a move", () => {
    const { statusEl, cells } = bootGame();
    play(cells, [4]); // X moves; turn passes to O
    expect(statusEl.textContent).toBe("O's turn");
  });

  test("announces the winner as the final result", () => {
    const { statusEl, cells } = bootGame();
    // X takes the top row: X0 O3 X1 O4 X2 -> X wins.
    play(cells, [0, 3, 1, 4, 2]);
    expect(statusEl.textContent).toBe("X wins!");
  });

  test("announces a draw as the final result", () => {
    const { statusEl, cells } = bootGame();
    // A full board with no line: ends in a draw.
    play(cells, [0, 1, 2, 4, 3, 5, 7, 6, 8]);
    expect(statusEl.textContent).toBe("Draw!");
  });
});
