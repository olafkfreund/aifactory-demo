// AC#2: Clicking an empty cell places the current player's mark and passes the
// turn.
//
// Target: games/tictactoe/index.html::render — each board cell is a gridcell
// button whose click handler calls TicTacToe.move(board, i, currentPlayer),
// flips currentPlayer on a real move, and calls render(). render() paints the
// board's marks into the cells and updates the #status region to the next
// player's turn. This test loads the page directly over file:// (no server, no
// build step), clicks empty cells, and asserts render() shows the acting
// player's mark and advances the status to the other player's turn.
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

test.describe('tic-tac-toe: clicking an empty cell places a mark and passes the turn (AC#2)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // render() paints all 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('clicking an empty cell renders X, then passes the turn to O', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Fresh game: X to move, target cell empty.
    await expect(status).toHaveText("X's turn");
    await expect(cells.nth(4)).toHaveText('');

    // Click the empty center cell: the current player's (X's) mark is placed.
    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('X');

    // render() advances the status to the other player's turn.
    await expect(status).toHaveText("O's turn");
  });

  test('a subsequent click places O and passes the turn back to X', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X takes the top-left cell, handing the turn to O.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // O clicks a different empty cell: O's mark is placed and the turn passes
    // back to X.
    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText('O');
    await expect(status).toHaveText("X's turn");

    // The first mark is untouched — placing a new mark did not disturb the board.
    await expect(cells.nth(0)).toHaveText('X');
  });

  test('a single move marks exactly the clicked cell and no other', async ({ page }) => {
    const cells = page.getByRole('gridcell');

    // A single move must place exactly one mark and not leak into other cells.
    await cells.nth(2).click();
    await expect(cells.nth(2)).toHaveText('X');
    for (let i = 0; i < 9; i++) {
      if (i === 2) continue;
      await expect(cells.nth(i)).toHaveText('');
    }
  });
});
