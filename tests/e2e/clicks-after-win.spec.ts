// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// This browser test proves that AFTER a win, clicking further cells leaves the
// board and status unchanged: a still-empty cell gains no mark, no turn passes,
// the "<player> wins!" status is preserved, and exactly the three winning cells
// stay highlighted. It drives games/tictactoe/index.html (the render() flow) in
// a real browser.
//
// The game is a no-build page: it is opened directly from disk over file://
// with no dev server and no bundler (AC#1).
import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This test file lives
// under <spec_dir>/tests/e2e while the game ships under the project worktree, so
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

// Deterministic win: X takes the top row (0,1,2); O plays 3,4.
// Move order X,O,X,O,X leaves cells 5,6,7,8 empty after X wins.
const WINNING_MOVES = [0, 3, 1, 4, 2];
const EMPTY_CELLS_AFTER_WIN = [5, 6, 7, 8];

test.describe('AC#6: clicks after a win leave the board and status unchanged', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(INDEX_URL);
  });

  test('clicking an empty cell after a win freezes the board and keeps the winner status', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');
    await expect(cells).toHaveCount(9);

    // Play the deterministic sequence to reach a decided game (X wins).
    for (const index of WINNING_MOVES) {
      await cells.nth(index).click();
    }

    // The game is decided: X wins and the winning line is visibly marked.
    await expect(status).toHaveText('X wins!');
    await expect(page.locator('.cell.win')).toHaveText(['X', 'X', 'X']);

    // Snapshot the whole board while the game is decided.
    const boardBefore = await cells.allInnerTexts();
    await expect(cells.nth(EMPTY_CELLS_AFTER_WIN[0])).toHaveText('');

    // Act: click a still-empty cell now that play has stopped.
    await cells.nth(EMPTY_CELLS_AFTER_WIN[0]).click();

    // The cell stays empty — no mark placed, no turn passed.
    await expect(cells.nth(EMPTY_CELLS_AFTER_WIN[0])).toHaveText('');
    // The status is unchanged — still the same winner, not a turn or a draw.
    await expect(status).toHaveText('X wins!');
    // The board is byte-for-byte identical to its pre-click state.
    expect(await cells.allInnerTexts()).toEqual(boardBefore);
    // The winning line is untouched — still exactly the three original cells.
    await expect(page.locator('.cell.win')).toHaveText(['X', 'X', 'X']);
  });

  test('hammering every remaining empty cell after a win never advances play', async ({
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

    // Click every still-empty cell after game over — each must stay empty.
    for (const index of EMPTY_CELLS_AFTER_WIN) {
      await cells.nth(index).click();
      await expect(cells.nth(index)).toHaveText('');
    }

    // No mark ever appeared: the board still holds exactly the five win moves.
    const filled = (await cells.allInnerTexts()).filter((t) => t !== '');
    expect(filled).toEqual(['X', 'X', 'X', 'O', 'O']);

    // Board and status are unchanged; the winning line is still the three cells.
    expect(await cells.allInnerTexts()).toEqual(boardBefore);
    await expect(status).toHaveText('X wins!');
    await expect(page.locator('.cell.win')).toHaveCount(3);
  });
});
