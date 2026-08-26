// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// This browser test drives games/tictactoe/index.html through a real,
// deterministic winning playthrough and proves the render() logic adds the
// `.win` class to EXACTLY the three winning cells and sets the status to
// "<player> wins!". The unit lane (winner-all-lines.test.ts) covers the pure
// detection of all 8 lines; here we verify the UI mark-up of one completed win.
//
// Run from the repo root with:
//   npx playwright test games/tictactoe/tests/e2e/winning-line-highlight.spec.ts
import path from "node:path";
import { test, expect } from "@playwright/test";

// index.html lives two directories up from tests/e2e/. Open it directly over
// file:// — the game is a no-build, no-server page (AC#1).
const INDEX_URL = "file://" + path.join(__dirname, "..", "..", "index.html");

// Deterministic move order: X takes the top row (0,1,2) and wins on the third
// mark; O plays 3 and 4. Same clicks every run -> same winning line every run.
const MOVES = [0, 3, 1, 4, 2];
const WINNING_CELLS = [0, 1, 2];

test("completed win marks exactly the three winning cells and shows 'X wins!'", async ({ page }) => {
  await page.goto(INDEX_URL);

  // TODO(review): cells are <button class="cell" role="gridcell"> with no
  // accessible name at load, so a CSS locator is used to address them by index.
  const cells = page.locator(".cell");
  await expect(cells).toHaveCount(9);

  for (const index of MOVES) {
    await cells.nth(index).click();
  }

  // The winning line is visibly marked: exactly three cells carry `.win`.
  const winningCells = page.locator(".cell.win");
  await expect(winningCells).toHaveCount(3);
  await expect(winningCells).toHaveText(["X", "X", "X"]);

  // ...and they are precisely the three cells of the completed line (0,1,2),
  // no other cell gaining the highlight.
  for (let i = 0; i < 9; i++) {
    if (WINNING_CELLS.includes(i)) {
      await expect(cells.nth(i)).toHaveClass(/\bwin\b/);
    } else {
      await expect(cells.nth(i)).not.toHaveClass(/\bwin\b/);
    }
  }

  // The status reports the winner as "<player> wins!".
  await expect(page.locator("#status")).toHaveText("X wins!");
});
