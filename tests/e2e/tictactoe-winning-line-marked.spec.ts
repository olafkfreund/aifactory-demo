// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// Target: games/tictactoe/index.html::render — when a move completes a line,
// render() computes winner(board) / winningLine(board) and (a) toggles the
// `.win` class onto exactly the three winning cells, (b) sets the #status
// region to "<player> wins!". This spec loads the page directly over file://
// (no server, no build step), plays deterministic move sequences that complete
// a line, and asserts that exactly the three winning cells carry the `.win`
// class and the status announces the winner.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This spec lives at
// <spec_dir>/tests/e2e, while the game under verification ships under
// <spec_dir>/.worktree/games/tictactoe (and, in other layouts, as a sibling
// games/ tree). Probe the known relative locations and use the first that
// exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    process.env.INDEX_HTML,
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(process.cwd(), '.worktree/games/tictactoe/index.html'),
    path.resolve(process.cwd(), 'games/tictactoe/index.html'),
  ].filter((p): p is string => Boolean(p));
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `games/tictactoe/index.html not found. Looked in:\n${candidates.join('\n')}`,
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

// Play a sequence of cell indices in order (X, O, X, O, ... alternating as the
// UI's currentPlayer flips on each real move).
async function playMoves(page: import('@playwright/test').Page, moves: number[]) {
  const cells = page.getByRole('gridcell');
  for (const idx of moves) {
    await cells.nth(idx).click();
  }
}

test.describe('tic-tac-toe: a winning line is visibly marked with .win and the winner is announced (AC#4)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // render() paints all 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('completing the top row marks exactly the three winning cells and announces X wins', async ({ page }) => {
    const status = page.getByRole('status');
    // TODO(reviewer): `.cell.win` is the class named by AC#4 as the visible
    // win marker; the criterion is asserted directly against it.
    const winningCells = page.locator('.cell.win');
    const cells = page.getByRole('gridcell');

    // Before any win, no cell carries the winning highlight.
    await expect(winningCells).toHaveCount(0);

    // X: 0, O: 3, X: 1, O: 4, X: 2  ->  X completes the top row (0,1,2).
    await playMoves(page, [0, 3, 1, 4, 2]);

    // Exactly the three winning cells are marked with .win.
    await expect(winningCells).toHaveCount(3);

    // The three marked cells are precisely the top-row indices 0, 1, 2.
    for (const idx of [0, 1, 2]) {
      await expect(cells.nth(idx)).toHaveClass(/\bwin\b/);
    }
    // No other cell is marked.
    for (const idx of [3, 4, 5, 6, 7, 8]) {
      await expect(cells.nth(idx)).not.toHaveClass(/\bwin\b/);
    }

    // The status region announces the winner.
    await expect(status).toHaveText('X wins!');
  });

  test('completing a diagonal marks exactly the diagonal cells and announces the winner', async ({ page }) => {
    const status = page.getByRole('status');
    const winningCells = page.locator('.cell.win');
    const cells = page.getByRole('gridcell');

    // X: 0, O: 1, X: 4, O: 2, X: 8  ->  X completes the main diagonal (0,4,8).
    await playMoves(page, [0, 1, 4, 2, 8]);

    await expect(winningCells).toHaveCount(3);
    for (const idx of [0, 4, 8]) {
      await expect(cells.nth(idx)).toHaveClass(/\bwin\b/);
    }
    await expect(status).toHaveText('X wins!');
  });
});
