// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// This test loads the page straight off the filesystem (file:// URL, no dev
// server, no bundler) and proves the initial rendered, playable state:
//   - a 9-cell board is drawn
//   - the status line reads "X's turn" (X moves first)
//   - a cell is actually clickable and places a mark (proving the game is live)
//   - loading the page produces no console errors
//
// Target: games/tictactoe/index.html::body
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect, type ConsoleMessage } from "@playwright/test";

// The index.html can live at a few locations depending on where the runner is
// invoked from (spec root, worktree, or project root). Probe the likely spots
// and use the first one that exists — no server, no build step involved.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, "..", "..", "games", "tictactoe", "index.html"),
    path.resolve(
      __dirname,
      "..",
      "..",
      ".worktree",
      "games",
      "tictactoe",
      "index.html",
    ),
    path.resolve(process.cwd(), "games", "tictactoe", "index.html"),
    path.resolve(
      process.cwd(),
      ".worktree",
      "games",
      "tictactoe",
      "index.html",
    ),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    "Could not locate games/tictactoe/index.html. Tried:\n" +
      candidates.join("\n"),
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

test.describe("games/tictactoe/index.html is playable when opened from file://", () => {
  test("renders a 9-cell playable board with X's turn and no console errors", async ({
    page,
  }) => {
    // Capture any console errors emitted while the page loads and initialises.
    const consoleErrors: string[] = [];
    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    // A page-level exception (e.g. a ReferenceError from a missing bundle) also
    // counts as a load failure.
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

    // The board is genuinely playable straight off the filesystem: clicking an
    // empty cell places the mark and advances the turn — proving game.js loaded
    // and wired up without any build step.
    await cells.first().click();
    await expect(cells.first()).toHaveText("X");
    await expect(page.getByRole("status")).toHaveText("O's turn");

    // Opening the file produced no console errors.
    expect(consoleErrors).toEqual([]);
  });
});
