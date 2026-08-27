// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// Target: games/tictactoe/index.html::board — each board cell is a gridcell
// button whose click handler calls TicTacToe.move(board, i, currentPlayer). When
// the clicked cell is already occupied, move() returns the SAME board reference,
// so the handler early-returns: currentPlayer is not flipped and render() is not
// called again. The visible mark and the #status turn indicator therefore stay
// exactly as they were. This spec loads the page directly over file:// (no
// server, no build step), places a mark, then clicks that same occupied cell and
// asserts the mark is unchanged, the turn indicator does NOT advance, and the
// rejected click raises no uncaught page error.
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

test.describe('tic-tac-toe: clicking an occupied cell is a no-op (AC#3)', () => {
  // Collect any uncaught page errors so we can assert the no-op raised none.
  test.beforeEach(async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));
    (page as unknown as { __pageErrors: Error[] }).__pageErrors = pageErrors;

    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // render() paints all 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('re-clicking an occupied cell keeps its mark and does not advance the turn', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Fresh game: X to move.
    await expect(status).toHaveText("X's turn");

    // X takes the center cell; the turn passes to O.
    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // O clicks that SAME occupied cell: move() rejects it, the handler no-ops.
    await cells.nth(4).click();

    // The mark is untouched — still X, not overwritten by O or cleared.
    await expect(cells.nth(4)).toHaveText('X');
    // The turn indicator did NOT advance — still O to move.
    await expect(status).toHaveText("O's turn");

    // No other cell gained a mark from the rejected click.
    for (let i = 0; i < 9; i++) {
      if (i === 4) continue;
      await expect(cells.nth(i)).toHaveText('');
    }

    // The rejected click raised no uncaught page error.
    const pageErrors = (page as unknown as { __pageErrors: Error[] }).__pageErrors;
    expect(pageErrors).toEqual([]);
  });

  test('repeated clicks on occupied cells never overwrite marks or pass the turn', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X plays top-left, O plays top-middle: two occupied cells, X to move.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText('O');
    await expect(status).toHaveText("X's turn");

    // Click X's cell twice, then O's cell twice: all four are no-ops.
    await cells.nth(0).click();
    await cells.nth(0).click();
    await cells.nth(1).click();
    await cells.nth(1).click();

    // Marks are exactly as placed; occupied clicks never overwrote them.
    await expect(cells.nth(0)).toHaveText('X');
    await expect(cells.nth(1)).toHaveText('O');
    // The turn indicator never advanced past X — no occupied click passed the turn.
    await expect(status).toHaveText("X's turn");

    // A legal move on an empty cell still works after the rejected clicks.
    await cells.nth(2).click();
    await expect(cells.nth(2)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    const pageErrors = (page as unknown as { __pageErrors: Error[] }).__pageErrors;
    expect(pageErrors).toEqual([]);
  });
});
