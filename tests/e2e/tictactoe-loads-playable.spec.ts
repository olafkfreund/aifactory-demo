// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// This test loads the page straight off the filesystem (file:// URL — no dev
// server, no bundler, no build step) and proves the board renders as a 3x3
// grid of nine clickable cells:
//   - the board is laid out as 3 rows x 3 columns
//   - there are exactly nine (9) cells
//   - every cell is a clickable, enabled button
//   - loading the page produces no console/page errors
//
// Target: games/tictactoe/index.html::board
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect, type ConsoleMessage } from "@playwright/test";

// Locate games/tictactoe/index.html relative to this test file. Depending on
// how the sandbox lays the project out, the game may sit under a `.worktree/`
// copy or directly under the repo root — resolve the first candidate that
// exists so the file:// load works with no server and no build.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, "..", "..", ".worktree", "games", "tictactoe", "index.html"),
    path.resolve(__dirname, "..", "..", "games", "tictactoe", "index.html"),
    path.resolve(__dirname, "..", "..", "..", "games", "tictactoe", "index.html"),
    path.resolve(__dirname, "..", "..", "..", ".worktree", "games", "tictactoe", "index.html"),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error(
      "Could not locate games/tictactoe/index.html. Tried:\n" + candidates.join("\n"),
    );
  }
  return found;
}

test.describe("games/tictactoe/index.html loads a playable 3x3 board from file://", () => {
  test("renders a 3x3 board of nine clickable cells with no server or build", async ({
    page,
  }) => {
    // Any console error or page-level exception during load counts as a failure
    // to "just open the file and play".
    const loadErrors: string[] = [];
    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() === "error") {
        loadErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      loadErrors.push(err.message);
    });

    // No server, no build — open the file directly via a file:// URL.
    const indexUrl = pathToFileURL(resolveIndexHtml()).href;
    expect(indexUrl.startsWith("file://")).toBe(true);
    await page.goto(indexUrl);

    // The board container is present.
    const board = page.getByRole("grid", { name: "Tic-Tac-Toe board" });
    await expect(board).toBeVisible();

    // The board is laid out as a 3x3 grid: 3 rows...
    const rows = board.getByRole("row");
    await expect(rows).toHaveCount(3);
    // ...each with 3 columns.
    for (let r = 0; r < 3; r++) {
      await expect(rows.nth(r).getByRole("gridcell")).toHaveCount(3);
    }

    // Exactly nine (9) cells overall, and every one is a clickable, enabled button.
    const cells = page.getByRole("gridcell");
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toBeEnabled();
    }

    // Proof they are genuinely clickable with no server/build: clicking the
    // first empty cell places a mark (X moves first).
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText("X");

    // Opening the file produced no console or page errors.
    expect(loadErrors).toEqual([]);
  });
});
