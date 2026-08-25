// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// This Browser-lane test drives the real games/tictactoe/index.html page,
// plays a deterministic game to an X win (top row), then clicks empty cells
// and asserts the board in the UI is unchanged — no mark is placed, the turn
// does not pass, and the "X wins!" result stands.
//
// Target: games/tictactoe/index.html::board
// The page renders 9 <button class="cell" role="gridcell"> elements, a
// #status region, and a #new-game button (see index.html markup).

import fs from "node:fs";
import path from "node:path";
import { test, expect, Page } from "@playwright/test";

// Deterministic move order. X plays the top row (0,1,2) and wins on the third
// mark; O plays 3 and 4. Same moves every run -> same final board every run.
const WIN_MOVES = [0, 3, 1, 4, 2];

// Board as it appears in the DOM once X has completed the top row.
// Empty cells render as "" (empty textContent).
const BOARD_AFTER_WIN = ["X", "X", "X", "O", "O", "", "", "", ""];

// Empty cells remaining after the win — clicking any of these must be ignored.
const EMPTY_CELLS_AFTER_WIN = [5, 6, 7, 8];

// Resolve index.html by walking up from this test file until we find the
// games/tictactoe/index.html target, so the test is robust to where the
// runner mounts the project tree.
function resolveIndexUrl(): string {
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, "games", "tictactoe", "index.html");
    if (fs.existsSync(candidate)) return "file://" + candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error("Could not locate games/tictactoe/index.html from " + __dirname);
}

const INDEX_URL = resolveIndexUrl();

async function playToWin(page: Page): Promise<void> {
  const cells = page.getByRole("gridcell");
  for (const move of WIN_MOVES) {
    await cells.nth(move).click();
  }
  // Confirm the game really is decided before we probe post-win clicks.
  await expect(page.locator("#status")).toHaveText("X wins!");
  await expect(page.locator(".cell.win")).toHaveCount(3);
}

test.beforeEach(async ({ page }) => {
  await page.goto(INDEX_URL);
});

test("clicking an empty cell after a win does not change the board", async ({ page }) => {
  await playToWin(page);

  const cells = page.getByRole("gridcell");
  await expect(cells).toHaveText(BOARD_AFTER_WIN);

  // Click every empty cell; each click must be ignored (no mark placed).
  for (const idx of EMPTY_CELLS_AFTER_WIN) {
    await cells.nth(idx).click();
  }

  // Board is byte-for-byte the same as immediately after the win.
  await expect(cells).toHaveText(BOARD_AFTER_WIN);
  // The decided result stands — the turn never passed to O.
  await expect(page.locator("#status")).toHaveText("X wins!");
  await expect(page.locator(".cell.win")).toHaveCount(3);
});

test("clicking an already-winning cell after a win keeps its mark and result", async ({ page }) => {
  await playToWin(page);

  const cells = page.getByRole("gridcell");

  // Clicking an occupied winning cell after game over is also a no-op.
  await cells.nth(0).click();

  await expect(cells).toHaveText(BOARD_AFTER_WIN);
  await expect(page.locator("#status")).toHaveText("X wins!");
});
