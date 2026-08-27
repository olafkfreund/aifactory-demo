// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// Target: games/tictactoe/index.html::board
//
// This test loads games/tictactoe/index.html directly off the filesystem
// (file:// URL — no dev server, no bundler, per AC#1). It plays a deterministic
// sequence so X wins the top row, then clicks cells after the game is decided
// and asserts every click is ignored in the UI:
//   - an empty cell stays empty (no mark is placed),
//   - the "X wins!" status is unchanged (the turn never advances),
//   - the winning line stays highlighted,
//   - the whole board is byte-for-byte identical to before the clicks, and
//   - no page or console error is raised by the ignored clicks.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect } from "@playwright/test";

// Resolve games/tictactoe/index.html across the possible runner layouts without
// a server. The test file lives under <spec_dir>/tests/e2e; the game ships under
// the project worktree. Probe the known relative locations (env override wins)
// and use the first that exists on disk.
function resolveIndexUrl(): string {
  const candidates = [
    process.env.INDEX_HTML,
    path.resolve(__dirname, "..", "..", ".worktree", "games", "tictactoe", "index.html"),
    path.resolve(__dirname, "..", "..", "games", "tictactoe", "index.html"),
    path.resolve(__dirname, "..", "..", "..", "games", "tictactoe", "index.html"),
    path.resolve(__dirname, "..", "..", "index.html"),
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
  test("clicking cells after the game is decided leaves the board unchanged and raises no error", async ({
    page,
  }) => {
    // Capture any runtime error so a "click after game over threw" regression is caught.
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    // file:// — proves no server and no build step is required to play (AC#1).
    await page.goto(INDEX_URL);

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

    // Act 1: click an empty cell now that play has stopped — must be a no-op.
    await cells.nth(EMPTY_CELL_AFTER_WIN).click();
    await expect(cells.nth(EMPTY_CELL_AFTER_WIN)).toHaveText("");
    // The status still declares the same winner (turn did not advance).
    await expect(status).toHaveText("X wins!");

    // Act 2: click an already-occupied winning cell — also a no-op, no overwrite.
    await cells.nth(OCCUPIED_CELL_AFTER_WIN).click();
    await expect(cells.nth(OCCUPIED_CELL_AFTER_WIN)).toHaveText("X");
    await expect(status).toHaveText("X wins!");

    // The winning line is untouched: still exactly three highlighted X cells.
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(["X", "X", "X"]);

    // The whole board is identical to before the post-win clicks.
    const boardAfter = await cells.allTextContents();
    expect(boardAfter).toEqual(boardBefore);

    // The ignored clicks raised no page or console error.
    expect(errors).toEqual([]);
  });
});
