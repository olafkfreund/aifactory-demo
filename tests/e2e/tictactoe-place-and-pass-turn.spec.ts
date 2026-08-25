// AC#2: Clicking an empty cell places the current player's mark and passes the
// turn.
//
// Target: games/tictactoe/index.html::render — the click handler mutates the
// board via TicTacToe.move(), flips currentPlayer, and render() paints each
// cell's mark and the "<player>'s turn" status. This test loads the page
// directly over file:// (no server, no build step), clicks empty cells, and
// asserts each click renders the acting player's mark and advances the status
// to the other player's turn.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under <spec_dir>/tests/e2e, and the game ships under the project worktree, so
// probe the known relative locations and use the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../games/tictactoe/index.html'),
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

test.describe('tic-tac-toe places mark and passes turn on empty-cell click (AC#2)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('clicking an empty cell places X and passes the turn to O', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Fresh game: X to move, target cell empty.
    await expect(status).toHaveText("X's turn");
    await expect(cells.nth(4)).toHaveText('');

    // Click the empty center cell: the current player's (X's) mark is placed.
    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('X');

    // The turn passes to the other player.
    await expect(status).toHaveText("O's turn");
  });

  test('the next click places O and passes the turn back to X', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X moves first, handing the turn to O.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // O clicks a different empty cell: O's mark lands there and the turn
    // passes back to X.
    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText('O');
    await expect(status).toHaveText("X's turn");
  });

  test('only the clicked cell is marked; the rest stay empty', async ({ page }) => {
    const cells = page.getByRole('gridcell');

    // A single move must not leak marks into other cells.
    await cells.nth(2).click();
    await expect(cells.nth(2)).toHaveText('X');
    for (let i = 0; i < 9; i++) {
      if (i === 2) continue;
      await expect(cells.nth(i)).toHaveText('');
    }
  });
});
