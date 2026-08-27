// AC#7: A "New game" control resets to an empty board with X to move.
//
// Subtask ui-new-game-resets-board: verify the "New game" button
// (games/tictactoe/index.html::newGameBtn — id="new-game") clears all marks,
// removes any winning highlight, and sets the status to X's turn.
//
// This test opens games/tictactoe/index.html directly via file:// (no server,
// no build step — AC#1). It plays a full game to an X win on the top row so the
// board carries marks AND a winning-line highlight is visible, then clicks
// "New game" and asserts the UI fully resets.

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

test('New game clears marks, removes the winning highlight, and resets status to X to move', async ({ page }) => {
  const cells = page.getByRole('gridcell');
  const newGame = page.getByRole('button', { name: 'New game' });
  const status = page.getByRole('status');

  // Drive the game to an X win on the top row (0,1,2):
  // X:0, O:3, X:1, O:4, X:2 -> X wins.
  await cells.nth(0).click(); // X
  await cells.nth(3).click(); // O
  await cells.nth(1).click(); // X
  await cells.nth(4).click(); // O
  await cells.nth(2).click(); // X wins

  // Sanity: the game is decided and the winning line is visibly marked.
  await expect(status).toHaveText('X wins!');
  // TODO(reviewer): the winning highlight is only exposed via the `.win` CSS
  // class on the three winning cells; there is no ARIA/testid hook for it, so a
  // CSS-class locator is the only way to assert the highlight is present/removed.
  const winHighlight = page.locator('.cell.win');
  await expect(winHighlight).toHaveCount(3);

  // Click the "New game" control.
  await newGame.click();

  // Every one of the 9 cells is cleared back to empty.
  await expect(cells).toHaveCount(9);
  for (let i = 0; i < 9; i++) {
    await expect(cells.nth(i)).toHaveText('');
  }

  // The winning highlight is removed — no cell carries the `.win` class.
  await expect(winHighlight).toHaveCount(0);

  // The status resets to X to move.
  await expect(status).toHaveText("X's turn");
});
