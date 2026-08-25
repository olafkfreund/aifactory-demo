// AC#7: A "New game" control resets to an empty board with X to move.
//
// This test opens games/tictactoe/index.html directly over file:// (no server,
// no build step), plays several moves so the board carries marks and the turn
// has advanced past X, then clicks the "New game" control and proves the reset:
// every one of the 9 cells is cleared and the status returns to "X's turn".

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under <spec_dir>/tests/e2e, and the game ships under the project worktree, so
// probe the known relative locations and use the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../games/tictactoe/index.html'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `games/tictactoe/index.html not found. Looked in:\n${candidates.join('\n')}`,
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

test.describe('tic-tac-toe "New game" reset (AC#7)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('New game clears all marks and returns the status to X to move', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const newGame = page.getByRole('button', { name: 'New game' });
    const status = page.getByRole('status');

    // Play a sequence of moves so the board is non-empty and the turn has
    // advanced. X, O, X, O — after four moves it would be X's turn again, so
    // stop after three (X, O, X) to leave the turn on O before the reset.
    await cells.nth(0).click(); // X
    await cells.nth(3).click(); // O
    await cells.nth(1).click(); // X

    // Sanity: the marks are present and it is O's turn before the reset, so a
    // passing reset assertion cannot be satisfied by an already-empty board.
    await expect(cells.nth(0)).toHaveText('X');
    await expect(cells.nth(3)).toHaveText('O');
    await expect(cells.nth(1)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // Click the "New game" control.
    await newGame.click();

    // Every one of the 9 cells is cleared back to empty.
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }

    // The game returns to X to move.
    await expect(status).toHaveText("X's turn");
  });
});
