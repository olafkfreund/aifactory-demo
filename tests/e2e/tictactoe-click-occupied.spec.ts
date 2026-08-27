// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// Target: games/tictactoe/index.html::render
//
// This test loads games/tictactoe/index.html directly off the filesystem
// (file:// URL — no server, no build step), plays one move so a cell is
// occupied, then clicks that same occupied cell again. It asserts:
//   - the occupied cell keeps its original mark (never overwritten)
//   - the turn does NOT advance (status is unchanged)
//   - no page error / uncaught exception is raised by the stray click
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under <spec_dir>/tests/e2e; the game ships under the project worktree, so
// probe the known relative locations and use the first that exists on disk.
function resolveIndexUrl(): string {
  const candidates = [
    process.env.INDEX_HTML,
    path.resolve(__dirname, "../../.worktree/games/tictactoe/index.html"),
    path.resolve(__dirname, "../../games/tictactoe/index.html"),
    path.resolve(__dirname, "../../../games/tictactoe/index.html"),
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
// so a stray click that throws is caught instead of silently passing.
function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

test.describe("games/tictactoe/index.html: clicking an occupied cell is a no-op (AC#3)", () => {
  test("re-clicking an occupied cell keeps its mark, does not pass the turn, and raises no error", async ({
    page,
  }) => {
    const errors = trackPageErrors(page);

    // No server, no build — open the file directly.
    await page.goto(INDEX_URL);

    const cells = page.getByRole("gridcell");
    const status = page.getByRole("status");
    await expect(cells).toHaveCount(9);
    await expect(status).toHaveText("X's turn");

    // X plays the top-left cell; the turn passes to O.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText("X");
    await expect(status).toHaveText("O's turn");

    // Click the SAME occupied cell again — this must be a pure no-op: O cannot
    // overwrite X's mark, and the turn must not advance.
    await cells.nth(0).click();

    // The mark is unchanged (still X, never overwritten by O).
    await expect(cells.nth(0)).toHaveText("X");
    // The turn did not pass: it is still O to move.
    await expect(status).toHaveText("O's turn");
    // Every other cell remains empty; the stray click affected nothing.
    for (let i = 1; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText("");
    }

    // No error surfaced from the rejected click.
    expect(errors).toEqual([]);
  });

  test("an occupied cell stays put even after the opponent has moved elsewhere", async ({
    page,
  }) => {
    const errors = trackPageErrors(page);

    await page.goto(INDEX_URL);

    const cells = page.getByRole("gridcell");
    const status = page.getByRole("status");
    await expect(cells).toHaveCount(9);

    // X plays cell 0, then O plays cell 4 — a normal two-move opening.
    await cells.nth(0).click();
    await cells.nth(4).click();
    await expect(cells.nth(0)).toHaveText("X");
    await expect(cells.nth(4)).toHaveText("O");
    await expect(status).toHaveText("X's turn");

    // X now (mis)clicks O's occupied centre cell — the move must be rejected.
    await cells.nth(4).click();

    // The occupied cell still holds O; it was not overwritten by X.
    await expect(cells.nth(4)).toHaveText("O");
    // And it is still X's turn — the rejected click did not pass the turn.
    await expect(status).toHaveText("X's turn");
    // The rejected click raised no error.
    expect(errors).toEqual([]);
  });
});
