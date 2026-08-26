// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// Target: games/tictactoe/index.html::#status — once TicTacToe.winner(board)
// reports a winner, the per-cell click handler's call to TicTacToe.move()
// returns the SAME board reference (a decided game rejects every move), so the
// handler's `if (next === board) return;` short-circuits: no mark is placed on
// the clicked empty cell, the winning line stays highlighted, and #status keeps
// announcing the same winner.
//
// This test loads the page straight off the filesystem (file:// URL, no dev
// server, no bundler), plays a deterministic sequence to an X win, then clicks a
// remaining empty cell and asserts the board and winner status are unchanged.
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

// Deterministic winning sequence: X takes the top row (0,1,2) and wins on the
// third mark; O plays 3 and 4. Same clicks every run -> same decided state.
const WINNING_MOVES = [0, 3, 1, 4, 2];
// After the win, cells 0..4 are filled (X:0,1,2  O:3,4); cells 5..8 are empty.
const EMPTY_CELL_AFTER_WIN = 5;

test.describe('tic-tac-toe: clicks after a win do nothing (AC#6)', () => {
  const pageErrors: Error[] = [];

  test.beforeEach(async ({ page }) => {
    // A no-op click must never raise an uncaught error.
    pageErrors.length = 0;
    page.on('pageerror', (err) => pageErrors.push(err));

    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('clicking an empty cell after a win leaves the board and winner status unchanged', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Play the deterministic sequence to reach a decided game (X wins).
    for (const index of WINNING_MOVES) {
      await cells.nth(index).click();
    }

    // The game is decided: X wins and exactly the three winning cells are marked.
    await expect(status).toHaveText('X wins!');
    const winningCells = page.locator('.cell.win');
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(['X', 'X', 'X']);

    // Snapshot the full board while the game is decided; a spare cell is empty.
    const boardBefore = await cells.allTextContents();
    expect(boardBefore[EMPTY_CELL_AFTER_WIN]).toBe('');

    // Act: click a remaining empty cell now that play has stopped.
    await cells.nth(EMPTY_CELL_AFTER_WIN).click();

    // The clicked empty cell stays empty — no mark was placed.
    await expect(cells.nth(EMPTY_CELL_AFTER_WIN)).toHaveText('');

    // The status still declares the same winner (the turn did not advance).
    await expect(status).toHaveText('X wins!');

    // The winning line is untouched: still exactly three highlighted X cells.
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(['X', 'X', 'X']);

    // The whole board is identical to before the post-win click.
    const boardAfter = await cells.allTextContents();
    expect(boardAfter).toEqual(boardBefore);

    // The ignored click raised no uncaught page error.
    expect(pageErrors).toEqual([]);
  });
});
