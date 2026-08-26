// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// Target: games/tictactoe/index.html::board — the cell click handler calls
// TicTacToe.move(board, i, currentPlayer) and only advances play when move()
// returns a NEW board. For an already-occupied cell move() returns the SAME
// board reference, so the handler short-circuits: the mark must stay put, the
// turn indicator must not advance, and no uncaught error may surface.
//
// The page is a single self-contained file (inline JS with a game.js sibling),
// so this test drives it straight from disk via a file:// URL — no server, no
// build — matching AC#1's "open the file, play a game" contract.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This spec lives
// under specs/<id>/tests/e2e, while the game ships under games/tictactoe (and,
// in verification runs, under a .worktree copy), so probe the known relative
// locations and use the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(process.cwd(), '.worktree/games/tictactoe/index.html'),
    path.resolve(process.cwd(), 'games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../../games/tictactoe/index.html'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `games/tictactoe/index.html not found. Looked in:\n${candidates.join('\n')}`,
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

test.describe('tic-tac-toe occupied-cell click is a no-op (AC#3)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load; fresh game means X to move.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });

  test('clicking an already-marked cell leaves the mark and the turn unchanged', async ({ page }) => {
    // Surface any uncaught page error so a rejected click that throws fails.
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');
    const target = cells.nth(0);

    // X plays the top-left cell: mark placed, turn passes to O.
    await target.click();
    await expect(target).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // Click the SAME (now occupied) cell again — must be a no-op.
    await target.click();
    await expect(target).toHaveText('X'); // mark unchanged
    await expect(status).toHaveText("O's turn"); // turn did NOT advance

    // A second rejected click must not flip play back to X either.
    await target.click();
    await expect(target).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // None of the rejected clicks raised an uncaught error.
    expect(pageErrors).toHaveLength(0);
  });

  test('occupied-cell click does not consume the opponent\'s turn', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X plays cell 0 -> O's turn.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // O clicks the occupied cell 0 (no-op)...
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X'); // still X's mark, untouched
    await expect(status).toHaveText("O's turn"); // rejected click did not pass the turn

    // ...then legally plays an empty cell: O still had its turn to spend.
    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('O');
    await expect(status).toHaveText("X's turn");
  });
});
