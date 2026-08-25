// AC#7: A "New game" control resets to an empty board with X to move.
//
// This test opens games/tictactoe/index.html directly via file:// (no server,
// no build step). It plays several moves so the board carries marks and the
// turn has advanced past X, then clicks the "New game" control and asserts the
// UI resets: all 9 cells are cleared and the status reports "X's turn".

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

test('New game button clears all cells and resets the status to X to move', async ({ page }) => {
  const cells = page.getByRole('gridcell');
  const newGame = page.getByRole('button', { name: 'New game' });
  const status = page.getByRole('status');

  // Play an odd number of moves so the board is dirty and it is O's turn,
  // making the reset back to X's turn observable.
  await cells.nth(2).click(); // X
  await cells.nth(3).click(); // O
  await cells.nth(6).click(); // X

  // Sanity: the board carries marks and the turn advanced past X before reset.
  await expect(cells.nth(2)).toHaveText('X');
  await expect(cells.nth(3)).toHaveText('O');
  await expect(cells.nth(6)).toHaveText('X');
  await expect(status).toHaveText("O's turn");

  // Click the "New game" control.
  await newGame.click();

  // Every one of the 9 cells is cleared back to empty.
  await expect(cells).toHaveCount(9);
  for (let i = 0; i < 9; i++) {
    await expect(cells.nth(i)).toHaveText('');
  }

  // The status resets to X to move.
  await expect(status).toHaveText("X's turn");
});
