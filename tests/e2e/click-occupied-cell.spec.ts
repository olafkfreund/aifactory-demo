// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// Target: games/tictactoe/index.html::onCellClick — each cell's click handler
// calls TicTacToe.move(board, i, currentPlayer). move() rejects an already-marked
// cell by returning the SAME board reference, so the handler's `if (next === board)
// return;` guard short-circuits: no mark is overwritten, currentPlayer does not
// flip, and no re-render (and no error) occurs. This test loads the page directly
// over file:// (no server, no build step per AC#1), then clicks an occupied cell
// and asserts the board and active player are unchanged and no page error fires.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This spec lives
// under the spec dir's tests/e2e tree while the game under test ships inside
// the checkout (a .worktree copy in verification runs, or a plain
// games/tictactoe tree otherwise), so probe the known relative locations and
// use the first that exists on disk.
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

  test('re-clicking an occupied cell leaves the mark and active player unchanged', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X takes the center cell; the turn passes to O.
    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // O now clicks the SAME (occupied) cell: nothing should change. The mark
    // stays X and the turn is still O's — no turn passes.
    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('X');
    await expect(status).toHaveText("O's turn");
  });

  test('clicking an occupied cell does not overwrite the mark or spill into other cells', async ({ page }) => {
    const cells = page.getByRole('gridcell');

    // X plays top-left; O plays top-middle.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText('O');

    // X (now to move) clicks O's occupied cell: the O mark must not be
    // overwritten, and no other cell may gain a mark.
    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText('O');
    await expect(cells.nth(0)).toHaveText('X');
    for (let i = 2; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
  });

  test('clicking an occupied cell raises no page error', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Capture any uncaught page error so an occupied-cell click can be proven
    // silent (AC#3: "no error").
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    // X takes a corner, then X-to-be O clicks the same occupied cell.
    await cells.nth(8).click();
    await expect(cells.nth(8)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    await cells.nth(8).click();

    // Still X's mark, still O's turn, and no error surfaced.
    await expect(cells.nth(8)).toHaveText('X');
    await expect(status).toHaveText("O's turn");
    expect(pageErrors).toEqual([]);
  });
});
