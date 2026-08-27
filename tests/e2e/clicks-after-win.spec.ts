// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// Target: games/tictactoe/index.html::onCellClick (the per-cell click handler).
//
// This E2E test loads games/tictactoe/index.html directly off the filesystem
// (file:// URL — no dev server, no bundler, per AC#1). It plays a deterministic
// sequence so X wins the top row, then clicks cells while the game is decided
// and proves every click is a no-op in the UI:
//   - an empty cell stays empty (no mark placed, no turn passed),
//   - an occupied cell is not overwritten,
//   - the "X wins!" status is unchanged,
//   - the winning line stays highlighted (exactly three X cells), and
//   - the whole board is byte-for-byte identical to before the post-win clicks.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect } from "@playwright/test";

// Resolve games/tictactoe/index.html across the possible runner layouts without
// a server. This test file lives under <spec_dir>/tests/e2e; the game ships
// under the project worktree. Probe the known relative locations (env override
// wins) and use the first that exists on disk.
function resolveIndexUrl(): string {
  const candidates = [
    process.env.INDEX_HTML,
    path.resolve(__dirname, "..", "..", ".worktree", "games", "tictactoe", "index.html"),
    path.resolve(__dirname, "..", "..", "games", "tictactoe", "index.html"),
    path.resolve(__dirname, "..", "..", "..", "games", "tictactoe", "index.html"),
    path.resolve(process.cwd(), "games", "tictactoe", "index.html"),
    path.resolve(process.cwd(), "index.html"),
  ].filter((p): p is string => Boolean(p));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return pathToFileURL(candidate).href;
    }
  }
  throw new Error(
    `games/tictactoe/index.html not found. Looked in:\n${candidates.join("\n")}`,
  );
}

const INDEX_URL = resolveIndexUrl();

// Deterministic winning sequence: X plays the top row (0,1,2) and wins;
// O plays 3 and 4. After the win, cells 0..4 are filled and 5..8 are empty.
const WINNING_MOVES = [0, 3, 1, 4, 2];
const EMPTY_CELL_AFTER_WIN = 5;
const OCCUPIED_CELL_AFTER_WIN = 0;

test.describe("games/tictactoe/index.html: clicks after a win are ignored (AC#6)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(INDEX_URL);
  });

  test("clicking an empty cell after a win changes neither the board nor the winner status", async ({
    page,
  }) => {
    const cells = page.getByRole("gridcell");
    const status = page.getByRole("status");
    await expect(cells).toHaveCount(9);

    // Play the deterministic sequence to reach a decided game (X wins top row).
    for (const index of WINNING_MOVES) {
      await cells.nth(index).click();
    }

    // The game is decided: X wins and the winning line is visibly marked.
    await expect(status).toHaveText("X wins!");
    // TODO(review): .cell.win is a CSS-class selector; no role/testid exists for
    // the highlighted winning line, so this is the least-brittle option here.
    const winningCells = page.locator(".cell.win");
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(["X", "X", "X"]);

    // Snapshot the full board while the game is decided; cell 5 is still empty.
    const boardBefore = await cells.allTextContents();
    expect(boardBefore[EMPTY_CELL_AFTER_WIN]).toBe("");

    // Act: click an empty cell now that play has stopped — must be a no-op.
    await cells.nth(EMPTY_CELL_AFTER_WIN).click();

    // The empty cell stays empty — no mark placed, no turn passed.
    await expect(cells.nth(EMPTY_CELL_AFTER_WIN)).toHaveText("");
    // The status still declares the same winner (turn did not advance).
    await expect(status).toHaveText("X wins!");
    // The winning line is untouched: still exactly three highlighted X cells.
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(["X", "X", "X"]);
    // The whole board is byte-for-byte identical to before the click.
    const boardAfter = await cells.allTextContents();
    expect(boardAfter).toEqual(boardBefore);
  });

  test("clicking an occupied cell after a win never overwrites it or advances the game", async ({
    page,
  }) => {
    const cells = page.getByRole("gridcell");
    const status = page.getByRole("status");

    for (const index of WINNING_MOVES) {
      await cells.nth(index).click();
    }
    await expect(status).toHaveText("X wins!");

    const boardBefore = await cells.allTextContents();

    // Click an already-occupied winning cell — must not overwrite the mark.
    await cells.nth(OCCUPIED_CELL_AFTER_WIN).click();
    await expect(cells.nth(OCCUPIED_CELL_AFTER_WIN)).toHaveText("X");
    await expect(status).toHaveText("X wins!");

    // Board and winning line remain exactly as they were before the click.
    expect(await cells.allTextContents()).toEqual(boardBefore);
    await expect(page.locator(".cell.win")).toHaveText(["X", "X", "X"]);
  });

  test("hammering every remaining empty cell after a win raises no error and keeps the winner", async ({
    page,
  }) => {
    // Capture any runtime error so a "click after game over threw" regression is caught.
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    const cells = page.getByRole("gridcell");
    const status = page.getByRole("status");

    for (const index of WINNING_MOVES) {
      await cells.nth(index).click();
    }
    await expect(status).toHaveText("X wins!");

    // Hammer every remaining empty cell (5,6,7,8) after game over.
    for (const index of [5, 6, 7, 8]) {
      await cells.nth(index).click();
      await expect(cells.nth(index)).toHaveText("");
    }

    // Status remains the winner announcement; no draw, no turn change.
    await expect(status).toHaveText("X wins!");
    await expect(page.locator(".cell.win")).toHaveCount(3);
    // The ignored clicks raised no page or console error.
    expect(errors).toEqual([]);
  });
});
