// AC#7: A "New game" control resets to an empty board with X to move.
//
// Subtask: ui-new-game-resets-board — verify the "New game" button clears all
// marks and returns the status to "X's turn" after a game in progress.
//
// The page is a single self-contained file (games/tictactoe/index.html) opened
// directly over file:// — no server, no build (AC#1). We drive a few real moves
// through the UI so the board is dirty and the turn has advanced, click the
// "New game" control, and assert the board is empty and X is to move again.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect } from "@playwright/test";

// The game lives at games/tictactoe/index.html somewhere above this test file.
// Walk up from __dirname until we find it, so the test resolves regardless of
// how the runner lays the spec tests out relative to the project tree.
function resolveIndexHtml(): string {
  const rel = path.join("games", "tictactoe", "index.html");
  let dir = __dirname;
  for (let i = 0; i < 12; i++) {
    const candidate = path.join(dir, rel);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`Could not locate ${rel} above ${__dirname}`);
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).toString();

test.beforeEach(async ({ page }) => {
  await page.goto(INDEX_URL);
});

test("New game clears all marks and returns status to X's turn", async ({
  page,
}) => {
  const status = page.getByRole("status");
  const cells = page.getByRole("gridcell");
  const newGame = page.getByRole("button", { name: "New game" });

  // A fresh game shows a 9-cell board with X to move.
  await expect(cells).toHaveCount(9);
  await expect(status).toHaveText("X's turn");

  // Game in progress: X -> O -> X leaves marks and the turn resting on O.
  await cells.nth(0).click(); // X
  await cells.nth(4).click(); // O
  await cells.nth(2).click(); // X
  await expect(cells.nth(0)).toHaveText("X");
  await expect(cells.nth(4)).toHaveText("O");
  await expect(cells.nth(2)).toHaveText("X");
  await expect(status).toHaveText("O's turn");

  // Click "New game": every mark is cleared and it is X's turn again.
  await newGame.click();

  await expect(cells).toHaveCount(9);
  for (let i = 0; i < 9; i++) {
    await expect(cells.nth(i)).toHaveText("");
  }
  await expect(status).toHaveText("X's turn");
});

test("New game after a decided game resets to an empty board with X to move", async ({
  page,
}) => {
  const status = page.getByRole("status");
  const cells = page.getByRole("gridcell");
  const newGame = page.getByRole("button", { name: "New game" });

  // Drive X to a top-row win: X at 0,1,2 and O at 3,4.
  await cells.nth(0).click(); // X
  await cells.nth(3).click(); // O
  await cells.nth(1).click(); // X
  await cells.nth(4).click(); // O
  await cells.nth(2).click(); // X completes the top row -> win
  await expect(status).toHaveText("X wins!");

  // "New game" clears the decided board and hands the turn back to X.
  await newGame.click();

  for (let i = 0; i < 9; i++) {
    await expect(cells.nth(i)).toHaveText("");
  }
  await expect(status).toHaveText("X's turn");
});
