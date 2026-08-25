// AC#5: A full board with no winner reports a draw.
//
// This E2E test drives games/tictactoe/index.html in a real browser, plays a
// deterministic full-board sequence that produces no winning line, and proves
// that the UI (a) announces a draw via the status region and (b) highlights no
// winning cells (zero .cell.win elements). All 9 cells are filled but no line
// is three-of-a-kind, so play ends in a draw.

import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import * as path from "node:path";
import * as fs from "node:fs";

// Resolve games/tictactoe/index.html regardless of where the runner mounts the
// repo. The test file lives at <spec>/tests/e2e/, and the game ships under the
// project worktree, so probe the known relative locations and use the first
// that exists on disk. No dev server: the page loads over file://.
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

test.describe("tic-tac-toe full board reports a draw (AC#5)", () => {
  test("filling the board with no winner shows Draw and highlights no cells", async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole("gridcell");
    await expect(cells).toHaveCount(9);

    // Deterministic draw. Marks alternate X,O,X,... over this click order:
    //   X O X
    //   X O O
    //   O X X
    // X -> 0,2,3,7,8 ; O -> 1,4,5,6. No line is three-of-a-kind, so no win
    // ever forms and the full board resolves to a draw.
    const clickOrder = [0, 1, 2, 4, 3, 5, 7, 6, 8];
    for (const index of clickOrder) {
      await cells.nth(index).click();
    }

    // Every cell is filled...
    await expect(cells.nth(0)).toHaveText("X");
    await expect(cells.nth(1)).toHaveText("O");
    await expect(cells.nth(2)).toHaveText("X");
    await expect(cells.nth(3)).toHaveText("X");
    await expect(cells.nth(4)).toHaveText("O");
    await expect(cells.nth(5)).toHaveText("O");
    await expect(cells.nth(6)).toHaveText("O");
    await expect(cells.nth(7)).toHaveText("X");
    await expect(cells.nth(8)).toHaveText("X");

    // ...the status announces a draw...
    await expect(page.getByRole("status")).toHaveText("Draw!");

    // ...and no winning line is highlighted.
    await expect(page.locator(".cell.win")).toHaveCount(0);
  });
});
