// AC#2: Clicking an empty cell places the current player's mark and passes the
// turn.
//
// Target: games/tictactoe/index.html::render — each cell's click handler calls
// TicTacToe.move(board, i, currentPlayer), flips currentPlayer between "X" and
// "O", and render() paints each cell's textContent and the "<player>'s turn"
// status. This test loads the page directly over file:// (no server, no build
// step), clicks empty cells, and asserts each click renders the acting player's
// mark and advances the status to the other player's turn.
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

test.describe('tic-tac-toe empty-cell click renders mark and alternates players (AC#2)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('clicking an empty cell renders X then updates the status to O', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Fresh game: X to move and the target cell is empty.
    await expect(status).toHaveText("X's turn");
    await expect(cells.nth(4)).toHaveText('');

    // Click the empty center cell: the current player's (X's) mark is rendered.
    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('X');

    // The status advances to the other player's turn.
    await expect(status).toHaveText("O's turn");
  });

  test('the next empty-cell click renders O and passes the turn back to X', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X moves first, handing the turn to O.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // O clicks a different empty cell: O's mark is rendered there and the
    // status passes back to X.
    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText('O');
    await expect(status).toHaveText("X's turn");
  });

  test('players alternate X and O across successive empty-cell clicks', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Click four distinct empty cells; marks must alternate X, O, X, O and the
    // status must announce the next player after each move.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText('O');
    await expect(status).toHaveText("X's turn");

    await cells.nth(2).click();
    await expect(cells.nth(2)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    await cells.nth(3).click();
    await expect(cells.nth(3)).toHaveText('O');
    await expect(status).toHaveText("X's turn");
  });
});
