// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// This test loads games/tictactoe/index.html over the file:// protocol (no HTTP
// server, no bundler, no npm install of the app) and asserts the static page
// renders a playable starting state: a 3x3 (9-cell) board and a status line.
// If any of this required a server or a build step, loading over file:// would
// fail and these assertions would not hold.
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

test.describe('open games/tictactoe/index.html playable, no server (AC#1)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — proves the game needs no server and no build step to open.
    await page.goto(INDEX_URL);
  });

  test('loads over file:// with no server or build step', async ({ page }) => {
    // The document is a local file addressed by the file:// scheme, not http(s):
    // this is the "no server, no build" half of AC#1.
    expect(page.url().startsWith('file://')).toBe(true);
    await expect(page).toHaveTitle('Tic-Tac-Toe');
  });

  test('renders a 3x3 board and status on first load', async ({ page }) => {
    // The board is present and rendered from the static markup alone.
    const board = page.getByRole('grid', { name: 'Tic-Tac-Toe board' });
    await expect(board).toBeVisible();

    // A 3x3 board is exactly 9 gridcells, all empty on first load.
    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }

    // The status line renders a fresh game with X to move.
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });
});
