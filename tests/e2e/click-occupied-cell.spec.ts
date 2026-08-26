// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// Target: games/tictactoe/index.html::onCellClick — the per-cell click handler
// calls TicTacToe.move(board, i, currentPlayer). move() returns the SAME board
// reference when the cell is already occupied, so the handler's
// `if (next === board) return;` short-circuits: the board is not mutated, the
// current player is not flipped, and no re-render (and no error) occurs.
//
// This test loads the page straight off the filesystem (file:// URL, no dev
// server, no bundler), marks a cell, then clicks that already-occupied cell and
// asserts the board and the current player are unchanged and no page error was
// raised.
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

test.describe('tic-tac-toe: clicking an occupied cell is a no-op (AC#3)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('re-clicking an occupied cell leaves the mark and the current player unchanged', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Fresh game: X to move.
    await expect(status).toHaveText("X's turn");

    // X occupies the centre cell; the turn passes to O.
    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // O clicks the SAME (now occupied) cell: nothing changes.
    await cells.nth(4).click();

    // The mark stays X — it was not overwritten by O.
    await expect(cells.nth(4)).toHaveText('X');
    // The turn does NOT pass: it is still O's move.
    await expect(status).toHaveText("O's turn");
    // No JS error was raised by the no-op click.
    expect(pageErrors).toEqual([]);
  });

  test('an occupied-cell click does not disturb any other cell on the board', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X plays top-left, O plays top-middle.
    await cells.nth(0).click();
    await cells.nth(1).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(cells.nth(1)).toHaveText('O');
    // X to move again.
    await expect(status).toHaveText("X's turn");

    // X clicks the occupied top-left cell: a no-op.
    await cells.nth(0).click();

    // Both existing marks are untouched and it is still X's turn.
    await expect(cells.nth(0)).toHaveText('X');
    await expect(cells.nth(1)).toHaveText('O');
    await expect(status).toHaveText("X's turn");

    // Every other cell remains empty — the no-op leaked nothing.
    for (let i = 2; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
  });
});
