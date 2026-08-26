// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// This test loads the page over the file:// protocol (no HTTP server, no
// bundler, no npm install of the app) and proves it is genuinely playable off
// the filesystem:
//   - a 9-cell (3x3) board is rendered, all cells empty on first load
//   - X moves first, and clicking cells lets X and O alternate turns
//   - loading and playing produce NO console errors and NO uncaught page errors
// If the game required a server or a build step, loading over file:// would
// fail (e.g. game.js would not resolve) and these assertions would not hold.
//
// Target: games/tictactoe/index.html::board
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

test.describe('games/tictactoe/index.html is playable over file:// with no build (AC#1)', () => {
  test('renders a 9-cell board and alternates X and O on clicks, no console errors', async ({
    page,
  }) => {
    // Fail the test on any console error or uncaught exception during load/play
    // rather than passing silently on a broken script.
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    // No server, no build — open the file directly.
    await page.goto(INDEX_URL);

    // "No server" half of AC#1: the document is a local file, not http(s).
    expect(page.url().startsWith('file://')).toBe(true);

    // A 3x3 board is exactly 9 gridcells, all empty on first load.
    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);

    // X moves first.
    await expect(page.getByRole('status')).toHaveText("X's turn");

    // Playable: X moves, then O moves — the marks and status alternate.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(page.getByRole('status')).toHaveText("O's turn");

    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText('O');
    await expect(page.getByRole('status')).toHaveText("X's turn");

    // A third move returns the turn to X's mark, confirming the alternation.
    await cells.nth(2).click();
    await expect(cells.nth(2)).toHaveText('X');
    await expect(page.getByRole('status')).toHaveText("O's turn");

    // No console errors and no uncaught exceptions during load or play.
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
