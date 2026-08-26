// AC#4: the winning line is visibly marked.
//
// Target: games/tictactoe/index.html::render — the render() function toggles a
// `win` CSS class onto exactly the cells returned by winningLine(board) once a
// player wins. This E2E test drives index.html in a real browser over the
// file:// protocol (no server, no build), plays a deterministic winning
// sequence, and proves the three cells of the completed winning line are
// visibly highlighted (they gain the `.cell.win` class and its highlight
// style), while non-winning cells stay unmarked.

import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under <spec_dir>/tests/e2e; the game ships under the project worktree, so
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

test.describe('tic-tac-toe winning line is visibly highlighted in the UI (AC#4)', () => {
  test('the three cells of the completed winning line are highlighted', async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);

    // Deterministic playthrough (X, O, X, O, X): X completes the top row at
    // indices 0,1,2 and wins; O plays two harmless off-line cells (3,4).
    for (const index of [0, 3, 1, 4, 2]) {
      await cells.nth(index).click();
    }

    // The winner is announced.
    await expect(page.getByRole('status')).toHaveText('X wins!');

    // Exactly the three cells of the winning line carry the `win` class and all
    // hold the winning player's mark.
    const winningCells = page.locator('.cell.win');
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(['X', 'X', 'X']);

    // The highlight is the *specific* winning line (top row: 0,1,2), and it is
    // visually distinct — the highlight background colour is applied, proving
    // the mark is genuinely visible rather than only present in the class list.
    for (const index of [0, 1, 2]) {
      await expect(cells.nth(index)).toHaveClass(/\bwin\b/);
      await expect(cells.nth(index)).toHaveCSS(
        'background-color',
        'rgb(168, 230, 161)',
      );
    }
  });

  test('cells that are not part of the winning line are not highlighted', async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');

    // Same winning sequence: X wins on the top row (0,1,2); 3 and 4 are O's.
    for (const index of [0, 3, 1, 4, 2]) {
      await cells.nth(index).click();
    }

    await expect(page.getByRole('status')).toHaveText('X wins!');

    // Off-line cells that were played (3, 4) and untouched cells stay unmarked.
    for (const index of [3, 4, 5, 6, 7, 8]) {
      await expect(cells.nth(index)).not.toHaveClass(/\bwin\b/);
    }
  });

  test('no cell is highlighted while play is still in progress', async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');
    // Two non-winning moves: X at 0, O at 4. The game continues.
    await cells.nth(0).click();
    await cells.nth(4).click();

    await expect(page.locator('.cell.win')).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });
});
