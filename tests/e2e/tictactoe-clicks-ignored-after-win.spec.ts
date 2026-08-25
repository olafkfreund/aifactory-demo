// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// This E2E test drives games/tictactoe/index.html in a real browser. It plays a
// deterministic sequence so X wins the top row, then clicks a still-empty cell.
// It proves the click is ignored: the board is unchanged, the clicked cell stays
// empty (no mark, no turn passed), the status keeps announcing the winner, and
// the winning line remains exactly the three original cells.
import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
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

test.describe('tic-tac-toe ignores clicks after a win (AC#6)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(INDEX_URL);
  });

  test('clicking a remaining empty cell after a win changes neither the board nor the status', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);

    // Deterministic win: X takes the top row (0,1,2); O plays 3,4.
    // Move order X,O,X,O,X leaves cells 5,6,7,8 empty after X wins.
    for (const index of [0, 3, 1, 4, 2]) {
      await cells.nth(index).click();
    }

    // The game is decided: X wins and the winning line is marked.
    await expect(page.getByRole('status')).toHaveText('X wins!');
    await expect(page.locator('.cell.win')).toHaveText(['X', 'X', 'X']);

    // Snapshot every cell's text; the whole board must be frozen after the win.
    const boardBefore = await cells.allInnerTexts();

    // Cell 8 is still empty and was never part of the winning line.
    await expect(cells.nth(8)).toHaveText('');

    // Click the empty cell after game over — it must do nothing.
    await cells.nth(8).click();

    // The cell stays empty: no mark placed, no turn passed.
    await expect(cells.nth(8)).toHaveText('');
    // Winner status is unchanged (still the win, not a turn or a draw).
    await expect(page.getByRole('status')).toHaveText('X wins!');
    // The board is identical to its pre-click state.
    expect(await cells.allInnerTexts()).toEqual(boardBefore);
    // The winning line is still exactly the three original cells.
    await expect(page.locator('.cell.win')).toHaveText(['X', 'X', 'X']);
  });

  test('clicking every remaining empty cell after a win never advances the game', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');

    // Same deterministic win for X on the top row.
    for (const index of [0, 3, 1, 4, 2]) {
      await cells.nth(index).click();
    }
    await expect(page.getByRole('status')).toHaveText('X wins!');

    // Click every remaining empty cell (5,6,7,8) after game over.
    for (const index of [5, 6, 7, 8]) {
      await cells.nth(index).click();
      await expect(cells.nth(index)).toHaveText('');
    }

    // Status remains the winner announcement; no draw, no turn change.
    await expect(page.getByRole('status')).toHaveText('X wins!');
    await expect(page.locator('.cell.win')).toHaveCount(3);
  });
});
