// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// This test loads the page straight off the filesystem (file:// URL, no dev
// server, no bundler) and proves it renders a playable 3x3 board:
//   - a 9-cell (3x3) board is drawn
//   - the status line reads "X's turn" (X moves first)
//   - loading the page produces no console errors
//   - the board is actually playable: clicking an empty cell places a mark
//
// Target: games/tictactoe/index.html::board
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect, type ConsoleMessage } from "@playwright/test";

// Resolve games/tictactoe/index.html without assuming a single repo layout:
// try each candidate location and use the first that exists. This keeps the
// test robust whether it runs from the spec dir, a worktree, or the repo root.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, "..", "..", "games", "tictactoe", "index.html"),
    path.resolve(__dirname, "..", "..", ".worktree", "games", "tictactoe", "index.html"),
    path.resolve(process.cwd(), "games", "tictactoe", "index.html"),
    path.resolve(process.cwd(), ".worktree", "games", "tictactoe", "index.html"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    "Could not locate games/tictactoe/index.html. Looked in:\n" +
      candidates.join("\n")
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

test.describe("games/tictactoe/index.html is playable from a file:// URL", () => {
  test("renders a 3x3 board with X's turn and no console errors", async ({
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

    // No server, no build — open the file directly off the filesystem.
    await page.goto(INDEX_URL);

    // The board is drawn as a 3x3 grid of 9 clickable cells (gridcell buttons).
    const cells = page.getByRole("gridcell");
    await expect(cells).toHaveCount(9);

    // X moves first: the status line announces "X's turn".
    await expect(page.getByRole("status")).toHaveText("X's turn");

    // Opening the file produced no console errors.
    expect(consoleErrors).toEqual([]);
  });

  test("board is playable: clicking an empty cell places a mark", async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole("gridcell");
    await expect(cells).toHaveCount(9);

    // Every cell starts empty.
    const firstCell = cells.first();
    await expect(firstCell).toHaveText("");

    // Clicking the empty cell places the first player's mark — the game responds
    // to input with no server and no build step.
    await firstCell.click();
    await expect(firstCell).toHaveText("X");

    // And the turn passes to O.
    await expect(page.getByRole("status")).toHaveText("O's turn");
  });
});
