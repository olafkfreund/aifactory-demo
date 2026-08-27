// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// This spec loads games/tictactoe/index.html straight off the filesystem over a
// file:// URL (no HTTP server, no bundler, no npm install of the app) and proves
// the initial rendered state:
//   - the page is addressed by the file:// scheme (the "no server" half)
//   - a playable 3x3 board renders as exactly 9 empty gridcells
//   - the status line announces "X's turn" (X moves first)
//   - opening the file emits no console errors or page exceptions
// If any of this required a server or a build step, loading over file:// would
// fail and these assertions would not hold.
//
// Target: games/tictactoe/index.html::board
import { test, expect, type ConsoleMessage } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This spec lives
// under <spec_dir>/tests/e2e, and verification runs check out the project under
// a .worktree copy, so probe the known relative and cwd-based locations and use
// the first that exists on disk.
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

test.describe('games/tictactoe/index.html is playable from file:// (AC#1)', () => {
  test('is served from a file:// URL — no server, no build', async ({ page }) => {
    await page.goto(INDEX_URL);

    // The "no server" half of AC#1: the document is a plain local file, not
    // http(s), and it still loaded and titled itself from static markup alone.
    expect(page.url().startsWith('file://')).toBe(true);
    await expect(page).toHaveTitle('Tic-Tac-Toe');
  });

  test('renders a playable 3x3 board with X to move and no console errors', async ({
    page,
  }) => {
    // Any console error or uncaught page exception while loading/initialising
    // counts as a failure to open cleanly with no build step.
    const errors: string[] = [];
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    // No server, no build — open the file directly.
    await page.goto(INDEX_URL);

    // The board renders from the static page and is exactly 9 empty cells.
    await expect(
      page.getByRole('grid', { name: 'Tic-Tac-Toe board' }),
    ).toBeVisible();
    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }

    // X moves first: the status line announces "X's turn".
    await expect(page.getByRole('status')).toHaveText("X's turn");

    // Opening the file produced no console errors or page exceptions.
    expect(errors).toEqual([]);
  });

  test('is immediately playable — a click marks a cell and passes the turn', async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Fresh game: 9 cells, X to move.
    await expect(cells).toHaveCount(9);
    await expect(status).toHaveText("X's turn");

    // Clicking an empty cell places X and passes the turn to O — proof the
    // inline JS and the relative game.js loaded and ran over file://.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");
  });
});
