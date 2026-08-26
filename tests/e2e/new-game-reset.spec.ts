// AC#7: A "New game" control resets to an empty board with X to move.
//
// Target: games/tictactoe/index.html :: newGame (the #new-game button handler)
//
// This test opens games/tictactoe/index.html directly via file:// (no server,
// no build step — AC#1), plays a few moves so the board carries marks and the
// turn has advanced past X, then activates the "New game" control and asserts
// every cell is cleared and X is the player to move again.

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

test('New game control clears all marks and sets X as the player to move', async ({ page }) => {
  const cells = page.getByRole('gridcell');
  const newGame = page.getByRole('button', { name: 'New game' });
  const status = page.getByRole('status');

  // Fresh board: X starts.
  await expect(status).toHaveText("X's turn");

  // Play three moves (X -> O -> X) so the board is dirty and the turn
  // indicator is provably not X before the reset.
  await cells.nth(0).click(); // X
  await cells.nth(4).click(); // O
  await cells.nth(1).click(); // X
  await expect(cells.nth(0)).toHaveText('X');
  await expect(cells.nth(4)).toHaveText('O');
  await expect(cells.nth(1)).toHaveText('X');
  await expect(status).toHaveText("O's turn");

  // Activate the "New game" control.
  await newGame.click();

  // The board resets to empty: all 9 cells cleared.
  await expect(cells).toHaveCount(9);
  for (let i = 0; i < 9; i++) {
    await expect(cells.nth(i)).toHaveText('');
  }

  // No winning highlight lingers from a prior game.
  await expect(page.locator('.cell.win')).toHaveCount(0);

  // X is the player to move on the reset board.
  await expect(status).toHaveText("X's turn");
});

test('New game after a decided game returns control to X on an empty board', async ({ page }) => {
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

  // New game clears the decided board and hands the turn back to X.
  await newGame.click();

  for (let i = 0; i < 9; i++) {
    await expect(cells.nth(i)).toHaveText('');
  }
  await expect(page.locator('.cell.win')).toHaveCount(0);
  await expect(status).toHaveText("X's turn");
});
