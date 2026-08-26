// AC#2: Clicking an empty cell places the current player's mark and passes
// the turn.
//
// This test loads games/tictactoe/index.html straight off the filesystem
// (file:// URL, no dev server, no bundler) and drives the board through the UI:
//   - the game starts on X's turn with an empty board
//   - clicking an empty cell writes "X" into that cell
//   - the turn passes to O (status now reads "O's turn")
//   - clicking a second empty cell writes "O" and passes the turn back to X
//
// Target: games/tictactoe/index.html::board
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect } from "@playwright/test";

// Resolve index.html across the possible runner layouts (the test file may live
// beside the game under games/tictactoe/tests/e2e, or under a top-level
// tests/e2e run from the repo/spec root). An explicit env override wins.
function resolveIndexUrl(): string {
  const candidates = [
    process.env.INDEX_HTML,
    path.resolve(__dirname, "..", "..", "index.html"),
    path.resolve(__dirname, "..", "..", "games", "tictactoe", "index.html"),
    path.resolve(process.cwd(), "games", "tictactoe", "index.html"),
    path.resolve(process.cwd(), "index.html"),
  ].filter((p): p is string => Boolean(p));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return pathToFileURL(candidate).href;
    }
  }
  // Fall back to the co-located layout so the failure names a concrete path.
  return pathToFileURL(path.resolve(__dirname, "..", "..", "index.html")).href;
}

const INDEX_URL = resolveIndexUrl();

test.describe("games/tictactoe/index.html: clicking an empty cell places a mark and passes the turn", () => {
  test("placing X then O writes each mark and hands the turn to the other player", async ({
    page,
  }) => {
    // No server, no build — open the file directly.
    await page.goto(INDEX_URL);

    const cells = page.getByRole("gridcell");
    await expect(cells).toHaveCount(9);

    // X moves first.
    await expect(page.getByRole("status")).toHaveText("X's turn");

    // Click an empty cell: the current player's mark (X) is placed there.
    const firstCell = cells.nth(0);
    await expect(firstCell).toHaveText("");
    await firstCell.click();
    await expect(firstCell).toHaveText("X");

    // The turn passes to the other player.
    await expect(page.getByRole("status")).toHaveText("O's turn");

    // Click a second empty cell: now O's mark is placed and the turn passes back.
    const secondCell = cells.nth(1);
    await expect(secondCell).toHaveText("");
    await secondCell.click();
    await expect(secondCell).toHaveText("O");
    await expect(page.getByRole("status")).toHaveText("X's turn");

    // The first mark is untouched — placing a new mark did not disturb the board.
    await expect(firstCell).toHaveText("X");
  });
});
