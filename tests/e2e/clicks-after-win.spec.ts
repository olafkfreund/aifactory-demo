// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// Subtask: clicks-after-win-ui — Verify clicking any cell after a win leaves
// the board and status unchanged in the UI.
//
// Target: games/tictactoe/index.html::TicTacToe — the page loads game.js
// (TicTacToe.emptyBoard/move/winner/winningLine). In its click handler the UI
// calls TicTacToe.move(board, i, currentPlayer); once the game is decided move()
// returns the SAME board reference, so the handler short-circuits ("no-op") and
// never re-renders. This Playwright test loads the page directly over file://
// (no server, no build step), plays a deterministic sequence to a win, then
// clicks the remaining empty cells and proves the board contents, the winning
// highlight, and the status text are all left unchanged.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This spec lives
// under specs/.../tests/e2e, while the game ships under games/tictactoe (and,
// in verification runs, under a .worktree copy), so probe the known relative
// locations and use the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../games/tictactoe/index.html'),
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
// third mark; O plays 3 and 4. Same clicks every run -> same decided game.
//   X X X
//   O O .
//   . . .
const WINNING_MOVES = [0, 3, 1, 4, 2];

// After the win, cells 0..4 are filled (X:0,1,2  O:3,4). Cells 5..8 are empty.
const EMPTY_CELLS_AFTER_WIN = [5, 6, 7, 8];

test.describe('tic-tac-toe clicks after a win do nothing in the UI (AC#6)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('clicking empty cells after a win leaves the board and status unchanged', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Drive the game to a decided state: X wins the top row.
    for (const index of WINNING_MOVES) {
      await cells.nth(index).click();
    }

    // Sanity: the game is decided, the winning line is marked, X won.
    await expect(status).toHaveText('X wins!');
    const winningCells = page.locator('.cell.win');
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(['X', 'X', 'X']);

    // Snapshot the full board + status while play has stopped.
    const boardBefore = await cells.allTextContents();

    // Act: click EVERY remaining empty cell now that the game is over.
    for (const index of EMPTY_CELLS_AFTER_WIN) {
      await expect(cells.nth(index)).toHaveText('');
      await cells.nth(index).click();
    }

    // No mark was placed: every previously-empty cell is still empty.
    for (const index of EMPTY_CELLS_AFTER_WIN) {
      await expect(cells.nth(index)).toHaveText('');
    }

    // The status still declares the same winner — the turn never advanced.
    await expect(status).toHaveText('X wins!');

    // The winning line is untouched: still exactly three highlighted X cells.
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(['X', 'X', 'X']);

    // The whole board is identical to its decided-state snapshot.
    const boardAfter = await cells.allTextContents();
    expect(boardAfter).toEqual(boardBefore);
  });
});
