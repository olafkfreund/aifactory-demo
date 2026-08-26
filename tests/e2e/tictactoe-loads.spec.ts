// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build.
//
// This test loads the page over the file:// protocol (no HTTP server, no
// bundler, no npm install of the app) and proves the initial rendered state:
//   - the document opens over file:// (not http(s)) — no server required
//   - a 9-cell (3x3) board is drawn
//   - the status line reads "X's turn" (X moves first)
//   - loading the page produces no console errors or page exceptions
//
// If any of this required a server or a build step, loading over file:// would
// fail and these assertions would not hold.
//
// Target: games/tictactoe/index.html::body
import { test, expect, type ConsoleMessage } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This test file lives
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

test.describe('games/tictactoe/index.html loads a playable board from file:// (AC#1)', () => {
  test('renders a 9-cell board with X to move and no console errors', async ({
    page,
  }) => {
    // Capture any console errors emitted while the page loads and initialises.
    const consoleErrors: string[] = [];
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    // A page-level exception (e.g. a ReferenceError) also counts as a load error.
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    // No server, no build — open the file directly over file://.
    await page.goto(INDEX_URL);

    // Guard the "no server, no build" half of AC#1: the loaded document is a
    // local file addressed by the file:// scheme, not http(s).
    expect(page.url().startsWith('file://')).toBe(true);

    // The board is drawn as 9 clickable cells (gridcell buttons).
    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);

    // X moves first: the status line announces "X's turn".
    await expect(page.getByRole('status')).toHaveText("X's turn");

    // Opening the file produced no console errors or page exceptions.
    expect(consoleErrors).toEqual([]);
  });
});
