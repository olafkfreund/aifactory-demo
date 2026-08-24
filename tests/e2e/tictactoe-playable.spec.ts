// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// This suite loads games/tictactoe/index.html straight off disk via a
// file:// URL (no dev server, no bundler/build step). It proves the page
// renders a 3x3 board (9 cells), a status line, and a "New game" control,
// and that those controls are interactive: clicking an empty cell places a
// mark and passes the turn, and "New game" resets to an empty board with X
// to move.

import { test, expect } from '@playwright/test';
import * as path from 'path';
import { pathToFileURL } from 'url';

// Repo-root-relative path to the game, resolved from this test file's
// location (tests/e2e/ -> ../../games/tictactoe/index.html). Using a
// file:// URL guarantees no server and no build step are involved.
const INDEX_HTML = path.resolve(__dirname, '../../games/tictactoe/index.html');
const FILE_URL = pathToFileURL(INDEX_HTML).toString();

test.describe('AC#1: index.html is a playable game with no server/build', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
  });

  test('loads over file:// and renders a 3x3 board, status line, and New game control', async ({ page }) => {
    // No server: the page was reached through a file:// URL.
    expect(FILE_URL.startsWith('file://')).toBe(true);

    // A 3x3 board => 3 rows and 3 columns => 9 interactive cells.
    const cells = page.locator('#board .cell');
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        await expect(cells.nth(i * 3 + j)).toBeVisible();
      }
    }

    // A status line reporting whose turn it is.
    const status = page.getByRole('status');
    await expect(status).toBeVisible();
    await expect(status).toHaveText("X's turn");

    // A "New game" control.
    await expect(page.getByRole('button', { name: 'New game' })).toBeVisible();
  });

  test('clicking an empty cell places the mark and passes the turn (interactive, no server)', async ({ page }) => {
    const status = page.getByRole('status');
    await expect(status).toHaveText("X's turn");

    // Interact with the board — this only works if the bundled inline
    // script and game.js loaded from disk with no build step.
    const firstCell = page.getByRole('button', { name: 'Cell 1' });
    await firstCell.click();

    await expect(firstCell).toHaveText('X');
    await expect(status).toHaveText("O's turn");
  });

  test('New game control resets to an empty board with X to move', async ({ page }) => {
    const status = page.getByRole('status');
    const firstCell = page.getByRole('button', { name: 'Cell 1' });

    await firstCell.click();
    await expect(firstCell).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    await page.getByRole('button', { name: 'New game' }).click();

    // Board is empty again and X is back on the move.
    await expect(firstCell).toHaveText('');
    await expect(status).toHaveText("X's turn");
    await expect(page.locator('#board .cell')).toHaveCount(9);
  });
});
