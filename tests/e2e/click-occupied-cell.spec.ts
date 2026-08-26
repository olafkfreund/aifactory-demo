// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// Loads games/tictactoe/index.html directly via file:// (no server, no build
// step), plays one move so a cell is occupied by X, then clicks that same
// occupied cell again. Asserts the mark is unchanged, the active player did not
// switch, and no error surfaced — i.e. the second click is a pure no-op.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. The test lives under
// <spec_dir>/tests/e2e and the game ships under the project worktree, so probe
// the known relative locations and use the first that exists on disk.
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

test.describe('tic-tac-toe: clicking an occupied cell is a no-op (AC#3)', () => {
  // Fail the test if the page raises any uncaught error while we interact.
  const pageErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    pageErrors.length = 0;
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    // file:// — proves no server and no build step is required to play.
    await page.goto(INDEX_URL);
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('re-clicking an occupied cell leaves its mark and the active player unchanged, with no error', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X plays cell 0; the turn passes to O.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // Click the SAME occupied cell again — this must do nothing.
    await cells.nth(0).click();

    // The occupied cell still holds X's mark: O did not overwrite it.
    await expect(cells.nth(0)).toHaveText('X');
    // No turn passed: it is still O to move.
    await expect(status).toHaveText("O's turn");
    // No other cell was affected — the rest of the board stays empty.
    for (let i = 1; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }

    // The rejected click raised no error anywhere on the page.
    expect(pageErrors).toEqual([]);
  });
});
