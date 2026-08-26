// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// Target: games/tictactoe/index.html::#board — the per-cell click handler calls
// TicTacToe.move(board, i, currentPlayer); move() rejects an already-occupied
// cell by returning the SAME board reference, so the handler's
// `if (next === board) return;` short-circuits: the mark stays put, the turn
// indicator does not advance, and no error is raised.
//
// This test loads the page straight off the filesystem (file:// URL, no dev
// server, no bundler), clicks an empty cell to occupy it, then clicks that same
// cell again and asserts the mark is unchanged and the turn indicator did not
// advance.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This spec lives under
// the run's spec_dir/tests/e2e, while the game under test ships inside the
// .worktree copy of the repo; probe the known relative locations and use the
// first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../.worktree/games/tictactoe/index.html'),
    path.resolve(process.cwd(), '.worktree/games/tictactoe/index.html'),
    path.resolve(process.cwd(), 'games/tictactoe/index.html'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `games/tictactoe/index.html not found. Looked in:\n${candidates.join('\n')}`,
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

test.describe('tic-tac-toe: clicking an occupied cell does nothing (AC#3)', () => {
  const pageErrors: Error[] = [];

  test.beforeEach(async ({ page }) => {
    // Capture any uncaught page error so we can assert the no-op raises none.
    pageErrors.length = 0;
    page.on('pageerror', (err) => pageErrors.push(err));

    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('clicking an occupied cell leaves its mark unchanged and does not pass the turn', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Fresh game: X to move.
    await expect(status).toHaveText("X's turn");

    // X occupies the centre cell; the turn passes to O.
    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // Click the SAME (now occupied) cell again: the mark stays X and the turn
    // indicator does not advance — it is still O's turn.
    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // Repeating the no-op click does not corrupt any other cell.
    for (let i = 0; i < 9; i++) {
      if (i === 4) continue;
      await expect(cells.nth(i)).toHaveText('');
    }

    // The no-op raised no uncaught error.
    expect(pageErrors).toEqual([]);
  });

  test('an occupied cell keeps its original owner even after the opponent moves', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X plays top-left, O plays top-middle.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText('O');
    await expect(status).toHaveText("X's turn");

    // X now clicks O's occupied cell: it must not be overwritten, and the turn
    // must stay with X (no turn passes on a rejected move).
    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText('O');
    await expect(status).toHaveText("X's turn");

    // X's own occupied cell is likewise unchanged and still does not pass turn.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("X's turn");

    expect(pageErrors).toEqual([]);
  });
});
