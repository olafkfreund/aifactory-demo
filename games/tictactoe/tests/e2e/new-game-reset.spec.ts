// AC#7: A "New game" control resets to an empty board with X to move.
//
// This test plays a few moves into the tic-tac-toe board, confirms the board
// is dirty and the turn has advanced, then clicks the "New game" control and
// asserts every cell is cleared and the status returns to "X's turn".
//
// The page is a single self-contained file (games/tictactoe/index.html) opened
// directly over file:// — no server, no build (AC#1).
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect } from "@playwright/test";

// index.html lives two directories up from this test file:
//   games/tictactoe/index.html   <-  games/tictactoe/tests/e2e/*.spec.ts
const INDEX_URL = pathToFileURL(
  path.join(__dirname, "..", "..", "index.html")
).toString();

test.beforeEach(async ({ page }) => {
  await page.goto(INDEX_URL);
});

test("New game resets to an empty board with X to move", async ({ page }) => {
  const status = page.getByRole("status");
  const cells = page.getByRole("gridcell");
  const newGame = page.getByRole("button", { name: "New game" });

  // Fresh game starts with X to move.
  await expect(status).toHaveText("X's turn");
  await expect(cells).toHaveCount(9);

  // Play a few moves: X -> O -> X, leaving marks on the board and the turn on O.
  await cells.nth(0).click(); // X
  await cells.nth(4).click(); // O
  await cells.nth(1).click(); // X
  await expect(cells.nth(0)).toHaveText("X");
  await expect(cells.nth(4)).toHaveText("O");
  await expect(cells.nth(1)).toHaveText("X");
  await expect(status).toHaveText("O's turn");

  // Reset via the "New game" control.
  await newGame.click();

  // Every cell is cleared...
  await expect(cells).toHaveCount(9);
  for (let i = 0; i < 9; i++) {
    await expect(cells.nth(i)).toHaveText("");
  }
  // ...and it is X's turn again.
  await expect(status).toHaveText("X's turn");
});

test("New game after a decided game returns control to X on an empty board", async ({
  page,
}) => {
  const status = page.getByRole("status");
  const cells = page.getByRole("gridcell");
  const newGame = page.getByRole("button", { name: "New game" });

  // Drive X to a win on the top row: X 0,1,2 / O 3,4.
  await cells.nth(0).click(); // X
  await cells.nth(3).click(); // O
  await cells.nth(1).click(); // X
  await cells.nth(4).click(); // O
  await cells.nth(2).click(); // X completes top row -> win
  await expect(status).toHaveText("X wins!");

  // New game clears the decided board and hands the turn back to X.
  await newGame.click();

  for (let i = 0; i < 9; i++) {
    await expect(cells.nth(i)).toHaveText("");
  }
  await expect(status).toHaveText("X's turn");
});
