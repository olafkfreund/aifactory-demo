// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// Target: games/tictactoe/index.html::render. On every real move the page's
// render() recomputes winner(board)/winningLine(board), toggles the `.win`
// class onto exactly the three cells of the completed line, and sets the
// #status region to "<player> wins!". This spec loads the page directly over
// file:// (no server, no build step), plays deterministic winning sequences
// across a row, a column, and both diagonals, and asserts that exactly the
// three winning cells carry the `.win` highlight and the status announces the
// winner.

import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs';

// Resolve games/tictactoe/index.html without a dev server. This spec lives at
// <spec_dir>/tests/e2e while the game ships under the project checkout, so
// probe the known relative locations and use the first that exists on disk.
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

// Play a sequence of cell indices in order. The UI alternates currentPlayer
// (X, O, X, O, ...) on each real move, so the winning player is X whenever an
// odd number of X moves completes the line.
async function playMoves(
  page: import('@playwright/test').Page,
  moves: number[],
): Promise<void> {
  const cells = page.getByRole('gridcell');
  for (const idx of moves) {
    await cells.nth(idx).click();
  }
}

test.describe('tic-tac-toe: the winning line is visibly marked and the winner is announced (AC#4)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // render() paints all 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('completing the top row marks exactly the three winning cells and announces X wins', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');
    const winningCells = page.locator('.cell.win');

    // No cell carries the winning highlight before a line is completed.
    await expect(winningCells).toHaveCount(0);

    // X:0, O:3, X:1, O:4, X:2  ->  X completes the top row (0,1,2).
    await playMoves(page, [0, 3, 1, 4, 2]);

    // Exactly the three winning cells are highlighted, and they are the top row.
    await expect(winningCells).toHaveCount(3);
    for (const idx of [0, 1, 2]) {
      await expect(cells.nth(idx)).toHaveClass(/\bwin\b/);
    }
    // No off-line cell is highlighted.
    for (const idx of [3, 4, 5, 6, 7, 8]) {
      await expect(cells.nth(idx)).not.toHaveClass(/\bwin\b/);
    }

    // The status region announces the winner.
    await expect(page.getByRole('status')).toHaveText('X wins!');
    await expect(winningCells).toHaveText(['X', 'X', 'X']);
  });

  test('completing a column marks exactly the three column cells and announces X wins', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');
    const winningCells = page.locator('.cell.win');

    // X:0, O:1, X:3, O:2, X:6  ->  X completes the left column (0,3,6).
    await playMoves(page, [0, 1, 3, 2, 6]);

    await expect(winningCells).toHaveCount(3);
    for (const idx of [0, 3, 6]) {
      await expect(cells.nth(idx)).toHaveClass(/\bwin\b/);
    }
    await expect(page.getByRole('status')).toHaveText('X wins!');
  });

  test('completing the main diagonal marks exactly the diagonal cells and announces X wins', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');
    const winningCells = page.locator('.cell.win');

    // X:0, O:1, X:4, O:2, X:8  ->  X completes the main diagonal (0,4,8).
    await playMoves(page, [0, 1, 4, 2, 8]);

    await expect(winningCells).toHaveCount(3);
    for (const idx of [0, 4, 8]) {
      await expect(cells.nth(idx)).toHaveClass(/\bwin\b/);
    }
    await expect(page.getByRole('status')).toHaveText('X wins!');
  });

  test('completing the anti-diagonal marks exactly the anti-diagonal cells and announces X wins', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');
    const winningCells = page.locator('.cell.win');

    // X:2, O:0, X:4, O:1, X:6  ->  X completes the anti-diagonal (2,4,6).
    await playMoves(page, [2, 0, 4, 1, 6]);

    await expect(winningCells).toHaveCount(3);
    for (const idx of [2, 4, 6]) {
      await expect(cells.nth(idx)).toHaveClass(/\bwin\b/);
    }
    await expect(page.getByRole('status')).toHaveText('X wins!');
  });

  test('no cell is highlighted while play continues', async ({ page }) => {
    const winningCells = page.locator('.cell.win');

    // Two non-winning moves: X at 0, O at 4. The game is still in progress.
    await playMoves(page, [0, 4]);

    await expect(winningCells).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });
});
