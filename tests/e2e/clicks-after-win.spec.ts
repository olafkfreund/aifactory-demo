// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// This E2E test drives games/tictactoe/index.html in a real browser with no
// server and no build. It plays a deterministic sequence so X wins the top
// row, then clicks the cells that are still empty. It proves each click is
// ignored: the board is unchanged, the clicked cells stay empty (no mark
// placed, no turn passed), the status keeps announcing the same winner, and
// the winning line remains exactly the three original cells.
import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This test file lives
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

// Deterministic win: X takes the top row (0,1,2); O plays 3 and 4.
// Move order X,O,X,O,X leaves cells 5,6,7,8 empty after X wins.
const WINNING_MOVES = [0, 3, 1, 4, 2];
const EMPTY_CELLS_AFTER_WIN = [5, 6, 7, 8];

test.describe('AC#6: clicks after a win are no-ops in the UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(INDEX_URL);
  });

  test('clicking a remaining empty cell after a win changes neither the board nor the status', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');
    await expect(cells).toHaveCount(9);

    // Play the deterministic sequence to reach a decided game (X wins).
    for (const index of WINNING_MOVES) {
      await cells.nth(index).click();
    }

    // The game is decided: X wins and the winning line is marked.
    await expect(status).toHaveText('X wins!');
    await expect(page.locator('.cell.win')).toHaveText(['X', 'X', 'X']);

    // Snapshot the full board while the game is decided; it must stay frozen.
    const boardBefore = await cells.allInnerTexts();
    await expect(cells.nth(EMPTY_CELLS_AFTER_WIN[0])).toHaveText('');

    // Act: click an empty cell now that play has stopped.
    await cells.nth(EMPTY_CELLS_AFTER_WIN[0]).click();

    // The clicked cell stays empty: no mark placed, no turn passed.
    await expect(cells.nth(EMPTY_CELLS_AFTER_WIN[0])).toHaveText('');
    // The status still declares the same winner (no turn, no draw).
    await expect(status).toHaveText('X wins!');
    // The whole board is identical to its pre-click state.
    expect(await cells.allInnerTexts()).toEqual(boardBefore);
    // The winning line is still exactly the three original cells.
    await expect(page.locator('.cell.win')).toHaveText(['X', 'X', 'X']);
  });

  test('clicking every remaining empty cell after a win never advances the game', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Same deterministic win for X on the top row.
    for (const index of WINNING_MOVES) {
      await cells.nth(index).click();
    }
    await expect(status).toHaveText('X wins!');

    const boardBefore = await cells.allInnerTexts();

    // Click every remaining empty cell after game over — each must be a no-op.
    for (const index of EMPTY_CELLS_AFTER_WIN) {
      await cells.nth(index).click();
      await expect(cells.nth(index)).toHaveText('');
    }

    // Status remains the winner announcement; no draw, no turn change.
    await expect(status).toHaveText('X wins!');
    // The board never moved off its post-win snapshot.
    expect(await cells.allInnerTexts()).toEqual(boardBefore);
    // The winning line is untouched: still exactly three highlighted cells.
    await expect(page.locator('.cell.win')).toHaveCount(3);
  });
});
