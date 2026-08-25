// AC#7: A "New game" control resets to an empty board with X to move.
//
// This test loads games/tictactoe/index.html directly via file:// (no server,
// no build step), plays a few moves so the board carries marks and the turn has
// advanced, then clicks the "New game" control and asserts that every cell is
// cleared and the status returns to "X's turn".

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

test('New game control resets to an empty board with X to move', async ({ page }) => {
  const cells = page.getByRole('gridcell');
  const newGame = page.getByRole('button', { name: 'New game' });
  const status = page.getByRole('status');

  // Play a few moves so the board is no longer empty and X is no longer to move.
  await cells.nth(0).click(); // X
  await cells.nth(1).click(); // O
  await cells.nth(4).click(); // X

  // Sanity: marks are present before the reset.
  await expect(cells.nth(0)).toHaveText('X');
  await expect(cells.nth(1)).toHaveText('O');
  await expect(cells.nth(4)).toHaveText('X');

  // Click the "New game" control.
  await newGame.click();

  // Every one of the 9 cells is cleared back to empty.
  for (let i = 0; i < 9; i++) {
    await expect(cells.nth(i)).toHaveText('');
  }

  // The game returns to X to move.
  await expect(status).toHaveText("X's turn");
});
