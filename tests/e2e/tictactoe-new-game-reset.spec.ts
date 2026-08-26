// AC#7: A "New game" control resets to an empty board with X to move.
//
// Subtask new-game-resets-ui: verify that clicking "New game" after a game in
// progress clears every cell and sets the status back to X's turn.
//
// This test opens games/tictactoe/index.html directly via file:// (no server,
// no build step — AC#1). It plays an odd number of moves so the board carries
// marks and the turn has advanced to O, then clicks the "New game" control and
// asserts the UI resets: all 9 cells are empty and the status reads "X's turn".

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

test('New game clears all cells and resets status to X to move after a game in progress', async ({ page }) => {
  const cells = page.getByRole('gridcell');
  const newGame = page.getByRole('button', { name: 'New game' });
  const status = page.getByRole('status');

  // Play three moves (X -> O -> X) so the board is dirty and the turn has
  // advanced to O — this makes the reset back to X's turn observable.
  await cells.nth(0).click(); // X
  await cells.nth(4).click(); // O
  await cells.nth(8).click(); // X

  // Sanity: the board carries marks and the turn advanced past X before reset.
  await expect(cells.nth(0)).toHaveText('X');
  await expect(cells.nth(4)).toHaveText('O');
  await expect(cells.nth(8)).toHaveText('X');
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
