// AC#7: A "New game" control resets to an empty board with X to move.
//
// Target: games/tictactoe/index.html :: newGame (the #new-game button handler)
//
// This test opens games/tictactoe/index.html directly via file:// (no server,
// no build step), plays a couple of moves so the board carries marks and the
// turn has passed to O, then activates the "New game" control and asserts the
// board is empty again with X to move.

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

test('New game control clears the board and sets X as the player to move', async ({ page }) => {
  const cells = page.getByRole('gridcell');
  const newGame = page.getByRole('button', { name: 'New game' });
  const status = page.getByRole('status');

  // Fresh board: X starts.
  await expect(status).toHaveText("X's turn");

  // Play two moves so the board is dirty and the turn has passed back to O.
  await cells.nth(0).click(); // X
  await cells.nth(4).click(); // O
  await expect(cells.nth(0)).toHaveText('X');
  await expect(cells.nth(4)).toHaveText('O');
  await expect(status).toHaveText("X's turn"); // after X then O, it is X's turn again

  // Dirty it further so the turn indicator is provably not X before reset.
  await cells.nth(1).click(); // X
  await expect(status).toHaveText("O's turn");

  // Activate the "New game" control.
  await newGame.click();

  // The board resets to empty: all 9 cells cleared.
  for (let i = 0; i < 9; i++) {
    await expect(cells.nth(i)).toHaveText('');
  }

  // No winning highlight lingers from a prior game.
  await expect(page.locator('.cell.win')).toHaveCount(0);

  // X is the player to move on the reset board.
  await expect(status).toHaveText("X's turn");
});
