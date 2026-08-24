// AC#7: A "New game" control resets to an empty board with X to move.
// Target: games/tictactoe/index.html::resetGame
//
// This test drives the game in a real browser: it makes a few moves so the
// board is non-empty and the turn indicator has advanced, then clicks the
// "New Game" control and asserts every cell is cleared and the status is
// restored to "X to move".

import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'url';
import * as path from 'path';

// The game is a static HTML file; load it directly via file:// so the test
// needs no dev server. Resolved relative to this spec file's location.
const GAME_URL = pathToFileURL(
  path.resolve(__dirname, '../../games/tictactoe/index.html'),
).href;

test.beforeEach(async ({ page }) => {
  await page.goto(GAME_URL);
});

test('New Game control clears every cell and restores "X to move"', async ({ page }) => {
  const status = page.locator('#status');
  // TODO(reviewer): cells are unlabelled <button> elements; scope by #board so
  // the "New Game" button is excluded. No role/testid available on the cells.
  const cells = page.locator('#board button');

  // Sanity: game starts empty with X to move.
  await expect(status).toHaveText('X to move');
  await expect(cells).toHaveCount(9);

  // Play a few moves so the board is dirty and the turn has advanced.
  await cells.nth(0).click(); // X
  await cells.nth(1).click(); // O
  await cells.nth(4).click(); // X

  // Confirm the board is genuinely non-empty before resetting.
  await expect(cells.nth(0)).toHaveText('X');
  await expect(cells.nth(1)).toHaveText('O');
  await expect(cells.nth(4)).toHaveText('X');
  await expect(status).toHaveText('O to move');

  // Trigger resetGame() via the "New Game" control.
  await page.getByRole('button', { name: 'New Game' }).click();

  // Every cell must be cleared.
  await expect(cells).toHaveCount(9);
  for (let i = 0; i < 9; i++) {
    await expect(cells.nth(i)).toHaveText('');
  }

  // And the status must be back to "X to move".
  await expect(status).toHaveText('X to move');
});
