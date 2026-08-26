// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// This test loads games/tictactoe/index.html over the file:// protocol (no HTTP
// server, no bundler, no npm install of the app) and asserts that the static
// markup alone renders a playable starting state: a 9-cell (3x3) board, an
// "X's turn" status, and a "New game" control. If any of this required a server
// or a build step, loading over file:// would fail and these assertions would
// not hold.
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

test.describe('tic-tac-toe loads playable from file:// (AC#1)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — proves the game needs no server and no build step to open.
    await page.goto(INDEX_URL);
  });

  test('opens over file:// with no server or build step', async ({ page }) => {
    // The loaded document is a local file addressed by the file:// scheme, not
    // http(s): this is the "no server, no build" half of AC#1.
    expect(page.url().startsWith('file://')).toBe(true);
    await expect(page).toHaveTitle('Tic-Tac-Toe');
  });

  test('renders a 9-cell board on first load', async ({ page }) => {
    const board = page.getByRole('grid', { name: 'Tic-Tac-Toe board' });
    await expect(board).toBeVisible();

    // A 3x3 board is exactly 9 gridcells, all empty on first load.
    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
  });

  test('shows X to move on first load', async ({ page }) => {
    // A fresh game starts with X to play.
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });

  test('exposes an enabled "New game" control', async ({ page }) => {
    const newGame = page.getByRole('button', { name: 'New game' });
    await expect(newGame).toBeVisible();
    await expect(newGame).toBeEnabled();
  });
});
