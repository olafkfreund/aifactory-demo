// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// This test loads the page straight off the filesystem via a file:// URL — no
// dev server, no bundler, no build step — and proves the initial playable
// state that AC#1 promises:
//   - a 3x3 (9-cell) board is rendered
//   - the status line reads "X's turn" (X moves first)
//   - a "New game" control is present
//   - opening the file produces no console errors / page exceptions
//
// Target: games/tictactoe/index.html::body
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect, type ConsoleMessage } from "@playwright/test";

// The test runs from the repo root; the page lives at games/tictactoe/index.html.
// tests/e2e/tictactoe-open-playable.spec.ts  ->  games/tictactoe/index.html
const INDEX_HTML = path.resolve(
  __dirname,
  "..",
  "..",
  "games",
  "tictactoe",
  "index.html",
);
const INDEX_URL = pathToFileURL(INDEX_HTML).href;

test.describe("AC#1: games/tictactoe/index.html is playable from file:// (no server, no build)", () => {
  test("renders a 3x3 board, X-to-move status, and a New game control with no console errors", async ({
    page,
  }) => {
    // A file:// URL means no HTTP server is involved. Capture any load-time
    // console errors or uncaught page exceptions so we can assert a clean load.
    const consoleErrors: string[] = [];
    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    // No server, no build — open the file directly off disk.
    await page.goto(INDEX_URL);

    // A 3x3 board == 9 clickable cells rendered as gridcell buttons.
    const cells = page.getByRole("gridcell");
    await expect(cells).toHaveCount(9);

    // Every cell starts empty (nothing placed before the first move).
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText("");
    }

    // X moves first: the live status region announces "X's turn".
    await expect(page.getByRole("status")).toHaveText("X's turn");

    // A "New game" control is present and interactable.
    await expect(
      page.getByRole("button", { name: "New game" }),
    ).toBeVisible();

    // Opening the file produced no console errors or uncaught exceptions.
    expect(consoleErrors).toEqual([]);
  });
});
