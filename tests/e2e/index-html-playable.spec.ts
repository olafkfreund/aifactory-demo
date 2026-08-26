// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// Target: games/tictactoe/index.html::body — the page is a single self-contained
// file (inline CSS/JS, game.js loaded as a sibling <script>, no CDN, no npm). It
// builds a 9-cell board on load and wires click handlers so a game is playable
// with nothing but a browser. This test loads the page over file:// (no dev
// server, no build step), asserts the 9-cell board renders, and proves it is
// interactive by clicking cells and watching marks land and the turn advance.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under tests/e2e; the game ships under games/tictactoe (and, in verification
// runs, under a .worktree copy), so probe the known relative locations and use
// the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(process.cwd(), 'games/tictactoe/index.html'),
    path.resolve(process.cwd(), '.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../.worktree/games/tictactoe/index.html'),
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

  test('opens over file:// and renders a 9-cell board', async ({ page }) => {
    // The page loaded from disk (file://) with no server involved.
    expect(INDEX_URL.startsWith('file://')).toBe(true);

    // The board and its heading render from the inline/self-contained markup.
    await expect(page.getByRole('heading', { name: 'Tic-Tac-Toe' })).toBeVisible();

    // Exactly 9 cells — a full tic-tac-toe grid — are built on load.
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
    // proof the inline game logic runs in the browser directly from the file.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('O');
    await expect(status).toHaveText("X's turn");

    // The "New game" control is present and resets the board to empty, X to move.
    const newGame = page.getByRole('button', { name: 'New game' });
    await expect(newGame).toBeVisible();
    await newGame.click();
    await expect(cells.nth(0)).toHaveText('');
    await expect(cells.nth(4)).toHaveText('');
    await expect(status).toHaveText("X's turn");
  });
});
