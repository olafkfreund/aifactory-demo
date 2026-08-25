// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// This E2E test drives games/tictactoe/index.html in a real browser, plays a
// deterministic winning sequence, and proves that exactly the three cells of
// the completed line are visibly highlighted in the DOM (the app marks them
// with the CSS class "win"). It asserts the count is 3 and that those cells
// carry the winning player's mark ("X").

import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import * as path from "node:path";
import * as fs from "node:fs";

// Resolve games/tictactoe/index.html regardless of where the runner mounts
// the repo. The test file lives at <spec>/tests/e2e/, the game may live under
// <spec>/games/... or <spec>/.worktree/games/... depending on the sandbox.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, "../../.worktree/games/tictactoe/index.html"),
    path.resolve(__dirname, "../../games/tictactoe/index.html"),
    path.resolve(__dirname, "../../../games/tictactoe/index.html"),
    path.resolve(process.cwd(), "games/tictactoe/index.html"),
    path.resolve(process.cwd(), ".worktree/games/tictactoe/index.html"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error(
    "Could not locate games/tictactoe/index.html; tried:\n" +
      candidates.join("\n")
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

test.describe("tic-tac-toe winning line is visibly marked (AC#4)", () => {
  test("the three winning cells are highlighted after X completes the top row", async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    // Deterministic playthrough: X takes the top row (0,1,2) and wins;
    // O plays harmless cells (3,4). Move order X,O,X,O,X.
    const cells = page.getByRole("gridcell");
    await expect(cells).toHaveCount(9);

    for (const index of [0, 3, 1, 4, 2]) {
      await cells.nth(index).click();
    }

    // The game must announce the win...
    await expect(page.getByRole("status")).toHaveText("X wins!");

    // ...and exactly the 3 cells of the winning line must be visibly marked.
    const winningCells = page.locator(".cell.win");
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(["X", "X", "X"]);
  });

  test("no cell is marked as winning while the game is still in progress", async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole("gridcell");
    // A couple of non-winning moves: X at 0, O at 4.
    await cells.nth(0).click();
    await cells.nth(4).click();

    // Play continues, so nothing should be highlighted yet.
    await expect(page.locator(".cell.win")).toHaveCount(0);
    await expect(page.getByRole("status")).toHaveText("X's turn");
  });

  test("a diagonal win marks its three cells", async ({ page }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole("gridcell");
    // Main diagonal win for X on cells 0,4,8. O plays 1,2.
    for (const index of [0, 1, 4, 2, 8]) {
      await cells.nth(index).click();
    }

    await expect(page.getByRole("status")).toHaveText("X wins!");

    const winningCells = page.locator(".cell.win");
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(["X", "X", "X"]);
  });
});
