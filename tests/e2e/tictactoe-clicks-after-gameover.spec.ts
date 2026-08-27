// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// Target: games/tictactoe/index.html::render — every cell is a gridcell button
// whose click handler calls TicTacToe.move(board, i, currentPlayer). Once the
// game is decided, move() returns the same board reference, so the handler's
// `if (next === board) return;` short-circuits: no mark is placed, the turn is
// not passed, and render() is never re-run. This E2E test drives the page over
// file:// (no server, no build step), plays a deterministic winning sequence so
// X wins, then clicks the still-empty cells after game over and proves the UI
// ignores them — no new marks appear and the status stays on the winner.
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Resolve games/tictactoe/index.html without a dev server. This spec lives at
// <spec_dir>/tests/e2e, while the game under verification ships under
// <spec_dir>/.worktree/games/tictactoe (and, in other layouts, as a sibling
// games/ tree). Probe the known relative locations and use the first that
// exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    process.env.INDEX_HTML,
    path.resolve(__dirname, "../../.worktree/games/tictactoe/index.html"),
    path.resolve(__dirname, "../../games/tictactoe/index.html"),
    path.resolve(process.cwd(), ".worktree/games/tictactoe/index.html"),
    path.resolve(process.cwd(), "games/tictactoe/index.html"),
  ].filter((p): p is string => Boolean(p));
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `games/tictactoe/index.html not found. Looked in:\n${candidates.join("\n")}`,
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

// Deterministic win: X takes the top row (0,1,2); O plays 3,4. The move order
// X,O,X,O,X leaves cells 5,6,7,8 empty after X completes the top row and wins.
const WIN_SEQUENCE = [0, 3, 1, 4, 2];
const EMPTY_AFTER_WIN = [5, 6, 7, 8];

test.describe("tic-tac-toe ignores clicks once the game is decided (AC#6)", () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    await expect(page.getByRole("gridcell")).toHaveCount(9);
  });

  test("a click on an empty cell after a win places no mark and keeps the winner status", async ({
    page,
  }) => {
    const cells = page.getByRole("gridcell");
    const status = page.getByRole("status");

    // Play the deterministic sequence so X wins on the top row.
    for (const index of WIN_SEQUENCE) {
      await cells.nth(index).click();
    }

    // The game is decided: the status announces the winner (not a turn).
    await expect(status).toHaveText("X wins!");
    await expect(page.locator(".cell.win")).toHaveText(["X", "X", "X"]);

    // Snapshot the frozen board; nothing below may change it.
    const boardAfterWin = await cells.allInnerTexts();

    // Cell 7 is still empty and was never part of the winning line.
    await expect(cells.nth(7)).toHaveText("");

    // Click the empty cell after game over — the UI must ignore it.
    await cells.nth(7).click();

    // No mark placed (turn did not pass), status still on the winner.
    await expect(cells.nth(7)).toHaveText("");
    await expect(status).toHaveText("X wins!");
    // Board is byte-for-byte identical to its pre-click state.
    expect(await cells.allInnerTexts()).toEqual(boardAfterWin);
    // The winning highlight is unchanged: still exactly the three X cells.
    await expect(page.locator(".cell.win")).toHaveText(["X", "X", "X"]);
  });

  test("hammering every remaining empty cell after a win never advances the game", async ({
    page,
  }) => {
    const cells = page.getByRole("gridcell");
    const status = page.getByRole("status");

    for (const index of WIN_SEQUENCE) {
      await cells.nth(index).click();
    }
    await expect(status).toHaveText("X wins!");

    // Click every open cell that remains after the win — each is a no-op.
    for (const index of EMPTY_AFTER_WIN) {
      await cells.nth(index).click();
      await expect(cells.nth(index)).toHaveText("");
    }

    // Status stays on the winner; no turn change, no draw.
    await expect(status).toHaveText("X wins!");
    // The winning line is still exactly the three original cells.
    await expect(page.locator(".cell.win")).toHaveText(["X", "X", "X"]);
  });
});
