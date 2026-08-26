// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// This test loads the UI over the file:// protocol (no HTTP server, no bundler,
// no npm install of the app) and proves it is INTERACTIVE end to end: the
// static markup renders a fresh 9-cell board with X to move, clicking an empty
// cell places a mark and passes the turn, and the "New game" control resets the
// board. If the game required a server or a build step, loading over file://
// would fail (e.g. game.js would not resolve) and these interactions would not
// work.
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

test.describe('tic-tac-toe index.html loads and is interactive over file:// (AC#1)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — proves no server and no build step is required to play.
    await page.goto(INDEX_URL);
  });

  test('loads over file:// with a playable starting board', async ({ page }) => {
    // "No server, no build" half of AC#1: the loaded document is a local file
    // addressed by the file:// scheme, not http(s).
    expect(page.url().startsWith('file://')).toBe(true);
    await expect(page).toHaveTitle('Tic-Tac-Toe');

    // The board container is present and labelled as a grid.
    const board = page.getByRole('grid', { name: 'Tic-Tac-Toe board' });
    await expect(board).toBeVisible();

    // A 3x3 board is exactly 9 empty gridcells, X to move on first load.
    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });

  test('is interactive: clicking cells places marks and passes the turn', async ({ page }) => {
    const cells = page.getByRole('gridcell');

    // X plays the top-left cell: mark appears and the turn passes to O.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(page.getByRole('status')).toHaveText("O's turn");

    // O plays the center cell: mark appears and the turn passes back to X.
    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('O');
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });

  test('New game control resets the board to the fresh playable state', async ({ page }) => {
    const cells = page.getByRole('gridcell');

    // Make a move so there is state to reset.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');

    // Reset via the "New game" button (interactive control, no reload needed).
    await page.getByRole('button', { name: 'New game' }).click();

    // Board is empty again and X is back on the move.
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });
});
