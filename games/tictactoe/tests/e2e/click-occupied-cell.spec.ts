// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// This exercises games/tictactoe/index.html's click handler + render():
// clicking an empty cell places the current player's mark and passes the
// turn; clicking that now-occupied cell must be a no-op — the mark stays,
// the turn indicator does not advance, and no error surfaces.
//
// The page is a single self-contained file (inline JS, game.js sibling), so
// the test drives it straight from disk via a file:// URL — no server, no
// build — matching AC#1's "open the file, play a game" contract.
"use strict";

import path from "node:path";
import { test, expect } from "@playwright/test";

// index.html lives two directories up from tests/e2e/.
const INDEX_URL =
  "file://" + path.join(__dirname, "..", "..", "index.html");

test.describe("AC#3 — occupied cell rejection", () => {
  test.beforeEach(async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", (err) => errors.push(err));
    // Expose the collected errors on the page context via a fixture-like
    // attachment so the test body can assert none occurred.
    (page as unknown as { _pageErrors: Error[] })._pageErrors = errors;
    await page.goto(INDEX_URL);
    // Fresh board: X to move.
    await expect(page.getByRole("status")).toHaveText("X's turn");
  });

  test("clicking an already-marked cell leaves the mark and the turn unchanged", async ({
    page,
  }) => {
    const status = page.getByRole("status");
    const cells = page.locator(".cell"); // TODO: 9 role=gridcell buttons; index-based access is intentional here.
    const target = cells.nth(0);

    // X plays the top-left cell: mark placed, turn passes to O.
    await target.click();
    await expect(target).toHaveText("X");
    await expect(status).toHaveText("O's turn");

    // Click the SAME (now occupied) cell again — must be a no-op.
    await target.click();

    // Mark is unchanged...
    await expect(target).toHaveText("X");
    // ...and the turn indicator did NOT advance (still O's turn, not back to X).
    await expect(status).toHaveText("O's turn");

    // A second occupied-cell click must not have flipped play back to X either.
    await target.click();
    await expect(target).toHaveText("X");
    await expect(status).toHaveText("O's turn");

    // No uncaught page error was raised by any of the rejected clicks.
    const errors = (page as unknown as { _pageErrors: Error[] })._pageErrors;
    expect(errors).toHaveLength(0);
  });

  test("occupied-cell click does not consume the opponent's turn", async ({
    page,
  }) => {
    const status = page.getByRole("status");
    const cells = page.locator(".cell"); // TODO: index-based access into the 9 gridcell buttons.

    // X plays cell 0 -> O's turn.
    await cells.nth(0).click();
    await expect(status).toHaveText("O's turn");

    // O clicks the occupied cell 0 (no-op), then legally plays empty cell 4.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText("X"); // still X's mark, untouched
    await expect(status).toHaveText("O's turn"); // rejected click did not pass the turn

    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText("O"); // O still had its turn to spend
    await expect(status).toHaveText("X's turn");
  });
});
