// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// Target: games/tictactoe/index.html::board — the page is fully self-contained
// (inline CSS/JS, game.js loaded as a sibling <script>, no CDN, no npm). It
// builds a 9-cell grid on load and wires click handlers so the game is playable
// with nothing but a browser. This test loads the page over the file:// scheme
// (no dev server, no bundler, no build step), asserts the 3x3 board renders,
// and proves interactivity by clicking cells and watching marks land and the
// turn advance.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under <spec_dir>/tests/e2e, and the game ships under the project checkout
// (a .worktree copy during verification runs), so probe the known relative
// locations and use the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../games/tictactoe/index.html'),
    path.resolve(process.cwd(), 'games/tictactoe/index.html'),
    path.resolve(process.cwd(), '.worktree/games/tictactoe/index.html'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `games/tictactoe/index.html not found. Looked in:\n${candidates.join('\n')}`,
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

test.describe('tic-tac-toe index.html is playable from file:// (AC#1)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// scheme — no HTTP server, no build step. If the page needed a
    // server or a bundler it could not load or run its scripts here.
    await page.goto(INDEX_URL);
  });

  test('opens over file:// and renders a fresh 9-cell board', async ({ page }) => {
    // The document was loaded from local disk with no server involved.
    expect(page.url().startsWith('file://')).toBe(true);
    await expect(page).toHaveTitle('Tic-Tac-Toe');

    // The board container renders from the self-contained markup.
    const board = page.getByRole('grid', { name: 'Tic-Tac-Toe board' });
    await expect(board).toBeVisible();

    // Exactly 9 cells — a complete 3x3 tic-tac-toe grid — are built on load.
    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);

    // A fresh board: every cell starts empty and X is to move.
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });

  test('the board is interactive with no server or build step', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Clicking a cell places the current player's mark and passes the turn —
    // proof the inline game logic runs directly in the browser from the file.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('O');
    await expect(status).toHaveText("X's turn");

    // The "New game" control is present, enabled, and resets to an empty board.
    const newGame = page.getByRole('button', { name: 'New game' });
    await expect(newGame).toBeVisible();
    await expect(newGame).toBeEnabled();
    await newGame.click();
    await expect(cells.nth(0)).toHaveText('');
    await expect(cells.nth(4)).toHaveText('');
    await expect(status).toHaveText("X's turn");
  });
});
