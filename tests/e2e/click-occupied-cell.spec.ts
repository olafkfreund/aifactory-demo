// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// Target: games/tictactoe/index.html::board — the cell click handler calls
// TicTacToe.move(board, i, currentPlayer) and, when that returns the SAME board
// reference (occupied cell or game over), returns early without flipping
// currentPlayer or re-rendering. This test loads the page directly over file://
// (no server, no build step), places a mark, then clicks that now-occupied cell
// and asserts the mark is unchanged, the turn indicator does not advance, and no
// uncaught page error is raised.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This test file lives
// under the spec's tests/e2e tree, which sits alongside (not inside) the project
// checkout, so probe the known relative + cwd-based locations and use the first
// that exists on disk.
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

test.describe('tic-tac-toe clicking an occupied cell is a no-op (AC#3)', () => {
  let pageErrors: Error[];

  test.beforeEach(async ({ page }) => {
    // Capture any uncaught page error so a rejected click that throws is caught.
    pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load; fresh game has X to move.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });

  test('clicking an already-marked cell leaves the mark and turn unchanged and raises no error', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');
    const target = cells.nth(0);

    // X plays the top-left cell: mark placed, turn passes to O.
    await target.click();
    await expect(target).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // Click the SAME (now occupied) cell again — must be a no-op.
    await target.click();
    await expect(target).toHaveText('X'); // mark unchanged (still X, not O)
    await expect(status).toHaveText("O's turn"); // turn did NOT advance

    // A further occupied-cell click must not flip play back to X either.
    await target.click();
    await expect(target).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // None of the rejected clicks raised an uncaught page error.
    expect(pageErrors).toHaveLength(0);
  });

  test('an occupied-cell click does not consume the current player\'s turn', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X plays cell 0 -> O's turn.
    await cells.nth(0).click();
    await expect(status).toHaveText("O's turn");

    // O clicks the occupied cell 0 (no-op): mark stays X, turn stays O's.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // O still has its turn to spend on a legal, empty cell.
    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('O');
    await expect(status).toHaveText("X's turn");

    // No uncaught page error surfaced across the rejected + legal clicks.
    expect(pageErrors).toHaveLength(0);
  });
});
