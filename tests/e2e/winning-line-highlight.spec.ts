// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// Target: games/tictactoe/index.html::render — after each move, render()
// recomputes winningLine(board) and toggles the CSS class "win" on exactly the
// three cells that form the completed line. That class carries a distinct green
// background/border (.cell.win) so the winning line is visibly marked in the UI.
//
// This browser test plays a deterministic game to a known win, then proves the
// three winning cells (and only those three) carry the "win" highlight and are
// rendered with a visibly different background than the untouched cells.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under <spec_dir>/tests/e2e; the game ships under the project checkout (a
// .worktree copy during verification runs), so probe the known relative
// locations and use the first that exists on disk.
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

test.describe('tic-tac-toe UI visibly marks the winning line (AC#4)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(INDEX_URL);
  });

  test('marks exactly the three winning cells when a line completes', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');

    // Deterministic play: X takes the top row while O plays elsewhere.
    // X:0, O:3, X:1, O:4, X:2 -> X completes the top row (indices 0,1,2).
    await cells.nth(0).click(); // X
    await cells.nth(3).click(); // O
    await cells.nth(1).click(); // X
    await cells.nth(4).click(); // O

    // Before the winning move, nothing is highlighted.
    await expect(page.locator('.cell.win')).toHaveCount(0);

    await cells.nth(2).click(); // X completes the top row -> win

    // The status confirms the win was detected.
    await expect(page.getByRole('status')).toHaveText('X wins!');

    // Exactly three cells carry the winning highlight, and they are the top row.
    const winningCells = page.locator('.cell.win');
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(['X', 'X', 'X']);
    await expect(cells.nth(0)).toHaveClass(/\bwin\b/);
    await expect(cells.nth(1)).toHaveClass(/\bwin\b/);
    await expect(cells.nth(2)).toHaveClass(/\bwin\b/);

    // A non-winning cell that O played is NOT marked.
    await expect(cells.nth(3)).not.toHaveClass(/\bwin\b/);
  });

  test('winning cells are rendered visibly distinct from unmarked cells', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');

    // Same deterministic win: X takes the top row.
    await cells.nth(0).click(); // X
    await cells.nth(3).click(); // O
    await cells.nth(1).click(); // X
    await cells.nth(4).click(); // O
    await cells.nth(2).click(); // X wins top row

    await expect(page.locator('.cell.win')).toHaveCount(3);

    // The "win" highlight is a visible change, not just a class name: the
    // winning cell's background differs from an unmarked cell's background.
    const winBg = await cells
      .nth(0)
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const plainBg = await cells
      .nth(3)
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(winBg).not.toBe(plainBg);
  });
});
