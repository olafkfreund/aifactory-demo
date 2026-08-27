// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// Target: games/tictactoe/index.html::render — each cell's click handler calls
// TicTacToe.move(board, i, currentPlayer) and returns early when move() gives
// back the same board reference (an occupied cell OR a game that is already
// over). This browser test drives the no-build page over file://, plays a
// deterministic sequence in which X wins the top row, then clicks a REMAINING
// EMPTY cell. It proves the post-win click is a pure no-op: the empty cell
// stays empty, no turn passes, the winner announcement is unchanged, the three
// winning cells keep their `.win` highlight, and no page error is raised.
// The pure move-after-game-over rejection is covered by the unit lane
// (move-after-gameover.test.ts); here we verify the rendered UI behaviour.
//
// Run from the repo root with:
//   npx playwright test tests/e2e/tictactoe-click-after-win.spec.ts
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Resolve games/tictactoe/index.html without a dev server. This spec lives at
// <spec_dir>/tests/e2e, while the game under verification ships under
// <spec_dir>/.worktree/games/tictactoe (and, in other layouts, as a sibling
// games/ tree). Probe the known relative locations and use the first that
// exists on disk.
function resolveIndexUrl(): string {
  const candidates = [
    process.env.INDEX_HTML,
    path.resolve(__dirname, "../../.worktree/games/tictactoe/index.html"),
    path.resolve(__dirname, "../../games/tictactoe/index.html"),
    path.resolve(__dirname, "../../../games/tictactoe/index.html"),
    path.resolve(process.cwd(), ".worktree/games/tictactoe/index.html"),
    path.resolve(process.cwd(), "games/tictactoe/index.html"),
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

// Attach listeners that record any uncaught page exception or console error,
// so a stray post-win click that throws is caught instead of silently passing.
function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

// Deterministic sequence: X plays the top row (0, 1, 2) and wins; O plays two
// harmless cells (3, 4). Same clicks every run -> same decided game every run.
// After the win, cells 5, 6, 7 and 8 are still empty and must stay that way.
const WIN_MOVES = [0, 3, 1, 4, 2];
const WINNING_CELLS = [0, 1, 2];
const EMPTY_AFTER_WIN = [5, 6, 7, 8];

test.describe("games/tictactoe/index.html: play stops once the game is decided (AC#6)", () => {
  test("clicking a remaining empty cell after a win does not change the board or status", async ({
    page,
  }) => {
    const errors = trackPageErrors(page);

    // No server, no build — open the file directly.
    await page.goto(INDEX_URL);

    const cells = page.getByRole("gridcell");
    const status = page.getByRole("status");
    await expect(cells).toHaveCount(9);
    await expect(status).toHaveText("X's turn");

    // Play the deterministic sequence that ends with X completing the top row.
    for (const index of WIN_MOVES) {
      await cells.nth(index).click();
    }

    // The game is decided: X is announced as the winner and exactly the three
    // top-row cells carry the win highlight.
    await expect(status).toHaveText("X wins!");
    const winningCells = page.locator(".cell.win");
    await expect(winningCells).toHaveCount(3);

    // Click a REMAINING EMPTY cell after the win — this must be a pure no-op.
    await cells.nth(EMPTY_AFTER_WIN[0]).click();

    // The clicked cell is still empty; no mark was placed after game over.
    await expect(cells.nth(EMPTY_AFTER_WIN[0])).toHaveText("");
    // Every other still-empty cell also remains empty.
    for (const index of EMPTY_AFTER_WIN) {
      await expect(cells.nth(index)).toHaveText("");
    }

    // The status is unchanged: still "X wins!", the turn did not advance.
    await expect(status).toHaveText("X wins!");

    // The winning line is still highlighted on exactly its three cells.
    await expect(winningCells).toHaveCount(3);
    for (let i = 0; i < 9; i++) {
      if (WINNING_CELLS.includes(i)) {
        await expect(cells.nth(i)).toHaveClass(/\bwin\b/);
      } else {
        await expect(cells.nth(i)).not.toHaveClass(/\bwin\b/);
      }
    }

    // No error surfaced from the rejected post-win click.
    expect(errors).toEqual([]);
  });

  test("further clicks on every empty cell after a win are all rejected", async ({
    page,
  }) => {
    const errors = trackPageErrors(page);

    await page.goto(INDEX_URL);

    const cells = page.getByRole("gridcell");
    const status = page.getByRole("status");
    await expect(cells).toHaveCount(9);

    // X wins the top row via the same deterministic sequence.
    for (const index of WIN_MOVES) {
      await cells.nth(index).click();
    }
    await expect(status).toHaveText("X wins!");

    // Hammer every remaining empty cell — none may register a move.
    for (const index of EMPTY_AFTER_WIN) {
      await cells.nth(index).click();
      await expect(cells.nth(index)).toHaveText("");
    }

    // The board is frozen on the decided state: X's three winning marks, O's
    // two moves at 3 and 4, and the four post-win cells still empty.
    await expect(cells.nth(0)).toHaveText("X");
    await expect(cells.nth(1)).toHaveText("X");
    await expect(cells.nth(2)).toHaveText("X");
    await expect(cells.nth(3)).toHaveText("O");
    await expect(cells.nth(4)).toHaveText("O");

    // The winner announcement never changed.
    await expect(status).toHaveText("X wins!");
    // And no post-win click raised an error.
    expect(errors).toEqual([]);
  });
});
