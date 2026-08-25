// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// Subtask: click-occupied-cell-is-noop-in-ui — verify clicking an
// already-marked cell leaves the mark unchanged and does not advance the turn
// indicator. This test loads games/tictactoe/index.html directly via file://
// (no server, no build step), plays one move so a cell is occupied by X, then
// clicks that same occupied cell again and asserts the mark is unchanged, the
// turn status stays on the other player, and no console errors were emitted.
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

test.describe('tic-tac-toe occupied-cell click is a no-op (AC#3)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — proves no server and no build step is required to play.
    await page.goto(INDEX_URL);
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('clicking an occupied cell leaves its mark and the turn unchanged, with no error', async ({ page }) => {
    // Capture any runtime console errors: "does nothing (no error)" means the
    // no-op click must not throw or log.
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X plays cell 0; the turn passes to O.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // Click the SAME occupied cell again — this must do nothing.
    await cells.nth(0).click();

    // The occupied cell still holds X's mark (O did not overwrite it).
    await expect(cells.nth(0)).toHaveText('X');
    // The turn did not pass: it is still O to move.
    await expect(status).toHaveText("O's turn");
    // No other cell was affected — the rest of the board stays empty.
    for (let i = 1; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }

    // The no-op click produced no console/page errors.
    expect(consoleErrors).toEqual([]);
  });

  test('repeated clicks on an occupied cell never flip the turn back', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X plays cell 4 (center); the turn passes to O.
    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // Hammer the same occupied cell several times: still a no-op each time.
    await cells.nth(4).click();
    await cells.nth(4).click();
    await cells.nth(4).click();

    // Mark unchanged and it is still O's turn — no turn ever passed.
    await expect(cells.nth(4)).toHaveText('X');
    await expect(status).toHaveText("O's turn");
  });
});
