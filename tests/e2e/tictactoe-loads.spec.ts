// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build. This test loads the file over the
// file:// protocol (no dev server) and asserts the initial render:
// a 9-cell board and the "X to move" status.
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

/**
 * Resolve games/tictactoe/index.html by walking up from this test file until
 * the file is found. Keeps the test independent of where the runner is rooted.
 */
function resolveIndexHtml(): string {
  let dir = __dirname;
  for (let i = 0; i < 12; i++) {
    const candidate = path.join(dir, 'games', 'tictactoe', 'index.html');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  throw new Error('Could not locate games/tictactoe/index.html');
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

test.describe('AC#1: tic-tac-toe index.html loads as a playable board over file://', () => {
  test('renders a 9-cell board with "X to move" status and no server', async ({ page }) => {
    // Loaded straight from disk — no build step, no HTTP server.
    expect(INDEX_URL.startsWith('file://')).toBe(true);

    await page.goto(INDEX_URL);
    expect(page.url().startsWith('file://')).toBe(true);

    // The board renders exactly 9 clickable cells.
    const cells = page.locator('#board button.cell'); // TODO(reviewer): no role/testid on generated cells; scoped CSS selector
    await expect(cells).toHaveCount(9);

    // Every cell starts empty on a fresh game.
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }

    // X moves first.
    await expect(page.locator('#status')).toHaveText('X to move');

    // The "New Game" control is available.
    await expect(page.getByRole('button', { name: 'New Game' })).toBeVisible();
  });
});
