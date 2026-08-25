// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// This test loads the page over the file:// protocol (no HTTP server, no
// bundler, no npm install of the app) and asserts the static markup renders a
// playable starting state: a 9-cell (3x3) board with X to move — and that the
// page produces NO console errors and NO uncaught page errors while loading.
// If the game required a server or a build step, loading over file:// would
// fail (e.g. game.js would not resolve) and these assertions would not hold.
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

test.describe('tic-tac-toe loads playable over file:// with no console errors (AC#1)', () => {
  test('renders a 9-cell board with X to move and no console errors', async ({ page }) => {
    // Collect console errors and uncaught page exceptions from the very first
    // load so a broken script (or a resource that fails to resolve without a
    // server) fails this test rather than passing silently.
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    // file:// — proves no server and no build step is required to play.
    await page.goto(INDEX_URL);

    // "No server" half of AC#1: the document is a local file, not http(s).
    expect(page.url().startsWith('file://')).toBe(true);
    await expect(page).toHaveTitle('Tic-Tac-Toe');

    // The board container is present and labelled as a grid.
    const board = page.getByRole('grid', { name: 'Tic-Tac-Toe board' });
    await expect(board).toBeVisible();

    // A 3x3 board is exactly 9 gridcells, all empty on first load.
    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }

    // A fresh game starts with X to play.
    await expect(page.getByRole('status')).toHaveText("X's turn");

    // No console errors and no uncaught exceptions during load.
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
