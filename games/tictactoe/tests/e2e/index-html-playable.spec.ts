// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// This test loads the page straight off the filesystem (file:// URL, no dev
// server, no bundler) and proves the initial rendered state:
//   - a 9-cell board is drawn
//   - the status line reads "X's turn" (X moves first)
//   - loading the page produces no console errors
//
// Target: games/tictactoe/index.html::board
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect, type ConsoleMessage } from "@playwright/test";

// The page lives two directories up from this test file:
//   games/tictactoe/tests/e2e/index-html-playable.spec.ts  ->  games/tictactoe/index.html
const INDEX_HTML = path.resolve(__dirname, "..", "..", "index.html");
const INDEX_URL = pathToFileURL(INDEX_HTML).href;

test.describe("games/tictactoe/index.html loads a playable board from file://", () => {
  test("renders a 9-cell board with X's turn status and no console errors", async ({
    page,
  }) => {
    // Capture any console errors emitted while the page loads and initialises.
    const consoleErrors: string[] = [];
    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    // A page-level exception (e.g. a ReferenceError) also counts as a load error.
    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    // No server, no build — open the file directly.
    await page.goto(INDEX_URL);

    // The board is drawn as 9 clickable cells (gridcell buttons).
    const cells = page.getByRole("gridcell");
    await expect(cells).toHaveCount(9);

    // X moves first: the status line announces "X's turn".
    await expect(page.getByRole("status")).toHaveText("X's turn");

    // Opening the file produced no console errors.
    expect(consoleErrors).toEqual([]);
  });
});
