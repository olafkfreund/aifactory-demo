// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// This browser test proves that once a player has won, clicking an empty
// cell in the UI does NOT place a mark, does NOT re-highlight or clear the
// winning line, and does NOT change the "<player> wins!" status.
//
// The game is a no-build page: it is opened directly from disk via file://
// (see games/tictactoe/evidence.spec.js for the same loading pattern).
"use strict";

import * as path from "node:path";
import { test, expect } from "@playwright/test";

// index.html lives two directories up from this test file
// (games/tictactoe/index.html).
const INDEX_URL =
  "file://" + path.join(__dirname, "..", "..", "index.html");

// Deterministic winning sequence: X plays the top row (0,1,2) and wins;
// O plays 3 and 4. Same order as the evidence playthrough.
const WINNING_MOVES = [0, 3, 1, 4, 2];

// After the win, cells 0..4 are filled (X:0,1,2  O:3,4). Cells 5..8 are empty.
const EMPTY_CELL_AFTER_WIN = 5;

test.describe("AC#6: clicks after a win are ignored in the UI", () => {
  test("clicking an empty cell after a win changes no cell and keeps the win status", async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole("gridcell");
    const status = page.getByRole("status");

    // Play the deterministic sequence to reach a decided game (X wins).
    for (const index of WINNING_MOVES) {
      await cells.nth(index).click();
    }

    // Sanity: the game is decided and the winning line is marked.
    await expect(status).toHaveText("X wins!");
    const winningCells = page.locator(".cell.win");
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(["X", "X", "X"]);

    // Snapshot the full board + status while the game is decided.
    const boardBefore = await cells.allTextContents();
    expect(boardBefore[EMPTY_CELL_AFTER_WIN]).toBe("");

    // Act: click an empty cell now that play has stopped.
    await cells.nth(EMPTY_CELL_AFTER_WIN).click();

    // The empty cell stays empty — no mark was placed.
    await expect(cells.nth(EMPTY_CELL_AFTER_WIN)).toHaveText("");

    // The status still declares the same winner (turn did not advance).
    await expect(status).toHaveText("X wins!");

    // The winning line is untouched: still exactly three highlighted X cells.
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(["X", "X", "X"]);

    // The whole board is byte-for-byte identical to before the click.
    const boardAfter = await cells.allTextContents();
    expect(boardAfter).toEqual(boardBefore);
  });
});
