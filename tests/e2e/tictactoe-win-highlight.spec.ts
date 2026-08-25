// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// This E2E test drives games/tictactoe/index.html (games/tictactoe/index.html::render)
// in a real browser over the file:// protocol — no server, no build. It plays a
// deterministic winning sequence and proves that a completed winning line
// highlights EXACTLY 3 `.cell.win` cells and that the status region shows the
// winner ("X wins!"). It also confirms that no cell is highlighted while play
// continues, so the "3" is a property of the win — not always-on decoration.

import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs';

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

test.describe('tic-tac-toe completed winning line is visibly highlighted (AC#4)', () => {
  test('a completed line highlights exactly 3 .cell.win cells and the status shows the winner', async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);

    // Deterministic playthrough (X,O,X,O,X): X completes the top row (0,1,2)
    // and wins; O plays two harmless off-line cells (3,4).
    for (const index of [0, 3, 1, 4, 2]) {
      await cells.nth(index).click();
    }

    // The status region shows the winner.
    await expect(page.getByRole('status')).toHaveText('X wins!');

    // Exactly the 3 cells of the completed line are highlighted, and they all
    // carry the winning player's mark.
    const winningCells = page.locator('.cell.win');
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(['X', 'X', 'X']);
  });

  test('no .cell.win exists while the game is still in progress', async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');
    // Two non-winning moves: X at 0, O at 4. Play continues.
    await cells.nth(0).click();
    await cells.nth(4).click();

    await expect(page.locator('.cell.win')).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });
});
