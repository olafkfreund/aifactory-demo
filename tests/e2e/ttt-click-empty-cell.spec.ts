// AC#2: Clicking an empty cell places the current player's mark and passes the
// turn. This test loads games/tictactoe/index.html directly via file:// (no
// server, no build step), clicks empty cells, and asserts each click renders
// the current player's mark and advances the status to the other player's turn.
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

test.describe('tic-tac-toe click empty cell places mark, passes turn (AC#2)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('clicking an empty cell renders X then passes the turn to O', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // On first load it is X's turn and the target cell is empty.
    await expect(status).toHaveText("X's turn");
    await expect(cells.nth(0)).toHaveText('');

    // Click the empty top-left cell: X's mark is placed there.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');

    // The turn passes to the other player.
    await expect(status).toHaveText("O's turn");
  });

  test('a subsequent click places O and passes the turn back to X', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X takes the top-left cell, handing the turn to O.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // O clicks a different empty cell: O's mark is placed and the turn
    // passes back to X.
    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText('O');
    await expect(status).toHaveText("X's turn");
  });
});
