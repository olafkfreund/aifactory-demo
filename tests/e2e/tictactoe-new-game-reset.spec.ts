// AC#7: A "New game" control resets to an empty board with X to move.
//
// This E2E test drives games/tictactoe/index.html (games/tictactoe/index.html::new-game)
// in a real browser over the file:// protocol — no server, no build (AC#1). It
// drives the board into a decided, highlighted state (X wins the top row), then
// clicks "New game" and proves the reset is total:
//   - every one of the 9 cells is cleared (empty text),
//   - no win highlight remains (0 `.cell.win` cells),
//   - the status region returns to "X's turn".
// A second test resets from an in-progress board where the turn has passed to O,
// confirming the turn indicator is restored to X regardless of prior state.

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

test.describe('tic-tac-toe "New game" resets the board UI (AC#7)', () => {
  test('New game clears every cell, removes win highlights, and restores X\'s turn', async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');
    const newGame = page.getByRole('button', { name: 'New game' });

    await expect(cells).toHaveCount(9);

    // Drive X to a win on the top row (X: 0,1,2 / O: 3,4). This leaves the board
    // dirty, the game decided, and exactly 3 cells carrying the win highlight.
    for (const index of [0, 3, 1, 4, 2]) {
      await cells.nth(index).click();
    }
    await expect(status).toHaveText('X wins!');
    await expect(page.locator('.cell.win')).toHaveCount(3);

    // Reset via the "New game" control.
    await newGame.click();

    // Every cell is cleared...
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
    // ...no win highlight survives the reset...
    await expect(page.locator('.cell.win')).toHaveCount(0);
    // ...and control returns to X on a fresh board.
    await expect(status).toHaveText("X's turn");
  });

  test('New game restores X\'s turn from an in-progress board where O was next', async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');
    const newGame = page.getByRole('button', { name: 'New game' });

    // Play X -> O -> X, leaving marks on the board and the turn on O.
    await cells.nth(0).click(); // X
    await cells.nth(4).click(); // O
    await cells.nth(1).click(); // X
    await expect(status).toHaveText("O's turn");

    await newGame.click();

    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
    await expect(page.locator('.cell.win')).toHaveCount(0);
    await expect(status).toHaveText("X's turn");
  });
});
