// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build. This test loads the page over the
// file:// protocol (no HTTP server, no bundler) and asserts the static markup
// renders a 3x3 board (9 cells) and a "New game" control.
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

test.describe('tic-tac-toe playable over file:// (AC#1)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — proves no server and no build step is required to play.
    await page.goto(INDEX_URL);
  });

  test('opening index.html via file:// renders a 3x3 board with 9 cells', async ({ page }) => {
    // The board container is present and labelled as a grid.
    const board = page.getByRole('grid', { name: 'Tic-Tac-Toe board' });
    await expect(board).toBeVisible();

    // A 3x3 board is exactly 9 gridcells, all empty on first load.
    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
  });

  test('a "New game" control is present and enabled', async ({ page }) => {
    const newGame = page.getByRole('button', { name: 'New game' });
    await expect(newGame).toBeVisible();
    await expect(newGame).toBeEnabled();
  });

  test('page loads from static markup with no server (URL uses file:// scheme)', async ({ page }) => {
    // Guard the "no server" half of AC#1: the loaded document is a local file.
    expect(page.url().startsWith('file://')).toBe(true);
    await expect(page).toHaveTitle('Tic-Tac-Toe');
  });
});
