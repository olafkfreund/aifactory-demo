// AC#7: A "New game" control resets to an empty board with X to move.
//
// This test drives games/tictactoe/index.html over the file:// protocol (no
// server, no build). It plays a few moves so the board is dirty and the turn
// has advanced to O, then clicks the "New game" control and asserts the reset:
// every one of the 9 cells is cleared and the status reads "X's turn" again.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under <spec_dir>/tests/e2e; the game ships under the project worktree, so
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

test.describe('tic-tac-toe "New game" resets the board (AC#7)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — proves the reset works with no server and no build step.
    await page.goto(INDEX_URL);
  });

  test('clicking New game clears every cell and returns to X to move', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);

    // Dirty the board: X takes cell 0, O takes cell 1. The turn is now back to
    // X, so play one more so the current player is O and marks are on the board.
    await cells.nth(0).click(); // X
    await cells.nth(1).click(); // O
    await cells.nth(4).click(); // X

    await expect(cells.nth(0)).toHaveText('X');
    await expect(cells.nth(1)).toHaveText('O');
    await expect(cells.nth(4)).toHaveText('X');
    await expect(page.getByRole('status')).toHaveText("O's turn");

    // Reset.
    await page.getByRole('button', { name: 'New game' }).click();

    // Every cell is empty again...
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }

    // ...and X is to move.
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });
});
