// AC#5: A full board with no winner reports a draw.
//
// This E2E test drives games/tictactoe/index.html in a real browser over the
// file:// protocol (no server, no build), plays a deterministic sequence that
// fills all 9 cells without ever completing a line, and asserts the status
// region (games/tictactoe/index.html::status) announces the draw. It also
// confirms no cell is highlighted as a winning cell, since a draw has no
// winning line.

import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import * as path from "node:path";
import * as fs from "node:fs";

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under <spec_dir>/tests/e2e, and the game ships under the project worktree, so
// probe the known relative locations and use the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, "../../.worktree/games/tictactoe/index.html"),
    path.resolve(__dirname, "../../games/tictactoe/index.html"),
    path.resolve(__dirname, "../../../games/tictactoe/index.html"),
    path.resolve(process.cwd(), "games/tictactoe/index.html"),
    path.resolve(process.cwd(), ".worktree/games/tictactoe/index.html"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `games/tictactoe/index.html not found. Looked in:\n${candidates.join("\n")}`,
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

test.describe("tic-tac-toe status reports a draw on a full board (AC#5)", () => {
  test("filling the board with no winner shows Draw in the status region", async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole("gridcell");
    await expect(cells).toHaveCount(9);

    // Deterministic draw. Marks alternate X,O,X,... over this click order,
    // producing the final board:
    //   X O X
    //   X O O
    //   O X X
    // No row, column, or diagonal is three-of-a-kind, so no win ever forms
    // and the full board resolves to a draw.
    const clickOrder = [0, 1, 2, 4, 3, 5, 7, 6, 8];
    for (const index of clickOrder) {
      await cells.nth(index).click();
    }

    // Every cell is filled — the board is full.
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).not.toHaveText("");
    }

    // The status region announces the draw.
    await expect(page.getByRole("status")).toHaveText("Draw!");

    // A draw has no winning line, so no cell is highlighted as a winner.
    await expect(page.locator(".cell.win")).toHaveCount(0);
  });
});
