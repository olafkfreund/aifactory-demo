// AC#7: A "New game" control resets to an empty board with X to move.
//
// Target: games/tictactoe/index.html::board — the self-contained page wires a
// "New game" button that rebuilds an empty board and hands the turn back to X.
// This test dirties the board with a few moves (advancing the turn to O), then
// clicks "New game" and proves every cell is cleared and the status reads
// "X's turn" again. A second case checks the reset works even after the game
// has been decided (a win), since play is otherwise locked.
//
// The page is a single self-contained file opened directly over file:// — no
// server, no build (AC#1).
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under <spec_dir>/tests/e2e, and the game ships under the project checkout
// (a .worktree copy during verification runs), so probe the known relative
// locations and use the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../games/tictactoe/index.html'),
    path.resolve(process.cwd(), 'games/tictactoe/index.html'),
    path.resolve(process.cwd(), '.worktree/games/tictactoe/index.html'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `games/tictactoe/index.html not found. Looked in:\n${candidates.join('\n')}`,
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

test.describe('tic-tac-toe "New game" resets the board (AC#7)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(INDEX_URL);
  });

  test('New game clears a dirty board and returns the turn to X', async ({
    page,
  }) => {
    const status = page.getByRole('status');
    const cells = page.getByRole('gridcell');
    const newGame = page.getByRole('button', { name: 'New game' });

    // Fresh game: empty board, X to move.
    await expect(cells).toHaveCount(9);
    await expect(status).toHaveText("X's turn");

    // Play a few moves: X -> O -> X, leaving marks and the turn on O.
    await cells.nth(0).click(); // X
    await cells.nth(4).click(); // O
    await cells.nth(1).click(); // X
    await expect(cells.nth(0)).toHaveText('X');
    await expect(cells.nth(4)).toHaveText('O');
    await expect(cells.nth(1)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // Reset via the "New game" control.
    await newGame.click();

    // Every one of the 9 cells is cleared...
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
    // ...and it is X's turn again.
    await expect(status).toHaveText("X's turn");
  });

  test('New game after a decided game resets to an empty board with X to move', async ({
    page,
  }) => {
    const status = page.getByRole('status');
    const cells = page.getByRole('gridcell');
    const newGame = page.getByRole('button', { name: 'New game' });

    // Drive X to a win on the top row: X 0,1,2 / O 3,4. Once decided, play locks.
    await cells.nth(0).click(); // X
    await cells.nth(3).click(); // O
    await cells.nth(1).click(); // X
    await cells.nth(4).click(); // O
    await cells.nth(2).click(); // X completes the top row -> win
    await expect(status).toHaveText('X wins!');

    // New game clears the decided board and hands the turn back to X.
    await newGame.click();

    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
    await expect(status).toHaveText("X's turn");
  });
});
