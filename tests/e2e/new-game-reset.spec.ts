// AC#7: A "New game" control resets to an empty board with X to move.
//
// Target: games/tictactoe/index.html :: #new-game (the "New game" button handler)
//
// This test opens games/tictactoe/index.html directly via file:// (no server,
// no build step — AC#1), plays a few moves so the board carries marks and the
// turn has advanced past X, then clicks the "New game" control and verifies:
//   - all 9 cells are empty
//   - no .win highlight remains
//   - the status reads "X's turn"

import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';

// index.html lives at games/tictactoe/index.html relative to the repo root.
const INDEX_HTML = pathToFileURL(
  path.resolve(process.cwd(), 'games', 'tictactoe', 'index.html'),
).href;

test.beforeEach(async ({ page }) => {
  await page.goto(INDEX_HTML);
  // The board renders its 9 gridcells on load.
  await expect(page.getByRole('gridcell')).toHaveCount(9);
});

test('New game resets to an empty board with X to move', async ({ page }) => {
  const cells = page.getByRole('gridcell');
  const newGame = page.getByRole('button', { name: 'New game' });
  const status = page.getByRole('status');

  // Fresh board: X starts.
  await expect(status).toHaveText("X's turn");

  // Play some moves (X -> O -> X) so the board is dirty and the turn
  // indicator has provably advanced past X before the reset.
  await cells.nth(0).click(); // X
  await cells.nth(4).click(); // O
  await cells.nth(1).click(); // X
  await expect(cells.nth(0)).toHaveText('X');
  await expect(cells.nth(4)).toHaveText('O');
  await expect(cells.nth(1)).toHaveText('X');
  await expect(status).toHaveText("O's turn");

  // Click the "New game" control.
  await newGame.click();

  // All 9 cells are empty.
  await expect(cells).toHaveCount(9);
  for (let i = 0; i < 9; i++) {
    await expect(cells.nth(i)).toHaveText('');
  }

  // No .win highlight remains.
  await expect(page.locator('.cell.win')).toHaveCount(0);

  // The status reads "X's turn".
  await expect(status).toHaveText("X's turn");
});

test('New game after a win clears the highlight and returns the turn to X', async ({ page }) => {
  const cells = page.getByRole('gridcell');
  const newGame = page.getByRole('button', { name: 'New game' });
  const status = page.getByRole('status');

  // Drive X to a win on the top row: X at 0,1,2 / O at 3,4.
  await cells.nth(0).click(); // X
  await cells.nth(3).click(); // O
  await cells.nth(1).click(); // X
  await cells.nth(4).click(); // O
  await cells.nth(2).click(); // X completes the top row -> win
  await expect(status).toHaveText('X wins!');
  // The winning line is highlighted before the reset.
  await expect(page.locator('.cell.win')).toHaveCount(3);

  // New game clears the decided board and hands the turn back to X.
  await newGame.click();

  for (let i = 0; i < 9; i++) {
    await expect(cells.nth(i)).toHaveText('');
  }
  // No .win highlight remains.
  await expect(page.locator('.cell.win')).toHaveCount(0);
  // The status reads "X's turn".
  await expect(status).toHaveText("X's turn");
});
