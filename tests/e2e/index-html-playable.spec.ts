// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// Target: games/tictactoe/index.html::board — the page ships as a single
// self-contained file (inline CSS/JS, plus a sibling game.js loaded by a
// relative <script src="game.js">), so it must load over file:// with no dev
// server and no build step, render a 3x3 grid (9 cells), and be immediately
// playable. This test opens the file directly via a file:// URL, asserts the
// 3x3 board renders, and proves playability by clicking a cell and observing
// the mark placed plus the turn advancing.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This spec lives
// outside the game tree (specs/.../tests/e2e), and verification runs check out
// the project under a .worktree copy, so probe the known relative and
// cwd-based locations and use the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../games/tictactoe/index.html'),
    path.resolve(process.cwd(), '.worktree/games/tictactoe/index.html'),
    path.resolve(process.cwd(), 'games/tictactoe/index.html'),
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
  test('served from a file:// URL — no server, no build', () => {
    // Provenance guard: the page must be reachable as a plain file, not http(s).
    expect(INDEX_URL.startsWith('file://')).toBe(true);
  });

  test('renders a 3x3 board (9 cells) on load with no server or build', async ({ page }) => {
    // Open the file directly; no baseURL / dev server involved.
    await page.goto(INDEX_URL);

    // A 3x3 tic-tac-toe board is exactly 9 cells.
    await expect(page.getByRole('gridcell')).toHaveCount(9);

    // The board and controls are present and the game is ready to play.
    await expect(page.getByRole('grid', { name: 'Tic-Tac-Toe board' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New game' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });

  test('the board is playable straight from the file — a click marks and passes the turn', async ({ page }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Fresh game: 9 empty cells, X to move.
    await expect(cells).toHaveCount(9);
    await expect(status).toHaveText("X's turn");

    // Clicking an empty cell places X and passes the turn to O — proof the
    // inline JS and relative game.js loaded and run over file://.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");
  });
});
