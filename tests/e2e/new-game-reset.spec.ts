// AC#7: A "New game" control resets to an empty board with X to move.
//
// Target: games/tictactoe/index.html::body — the "New game" control
// (#new-game). Its click handler calls TicTacToe.emptyBoard(), sets
// currentPlayer back to "X", and re-renders. This test opens
// games/tictactoe/index.html directly over file:// (no server, no build step —
// AC#1), plays a few moves so the board carries marks and the turn has
// advanced past X, then clicks "New game" and verifies the board is cleared
// and the status reports X to move.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. In verification
// runs the game ships under a .worktree copy alongside the spec; in a normal
// checkout it sits at games/tictactoe/index.html from the repo root. Probe the
// known relative locations and use the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
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

test.describe('tic-tac-toe "New game" resets the board with X to move (AC#7)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('New game clears a dirty board and returns the turn to X', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const newGame = page.getByRole('button', { name: 'New game' });
    const status = page.getByRole('status');

    // Fresh board: X starts.
    await expect(status).toHaveText("X's turn");

    // Play some moves (X -> O -> X) so the board is dirty and the turn
    // indicator has provably advanced past X before the reset.
    await cells.nth(0).click(); // X
    await cells.nth(4).click(); // O
    await cells.nth(1).click(); // X
    await expect(cells.nth(0)).toHaveText('X');
    await expect(cells.nth(4)).toHaveText('O');
    await expect(cells.nth(1)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // Click the "New game" control.
    await newGame.click();

    // All 9 cells are empty again.
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }

    // No winning-line highlight remains.
    await expect(page.locator('.cell.win')).toHaveCount(0);

    // The status reports X to move.
    await expect(status).toHaveText("X's turn");
  });

  test('New game after a win clears the highlight and hands the turn to X', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const newGame = page.getByRole('button', { name: 'New game' });
    const status = page.getByRole('status');

    // Drive X to a win on the top row: X at 0,1,2 / O at 3,4.
    await cells.nth(0).click(); // X
    await cells.nth(3).click(); // O
    await cells.nth(1).click(); // X
    await cells.nth(4).click(); // O
    await cells.nth(2).click(); // X completes the top row -> win
    await expect(status).toHaveText('X wins!');
    // The winning line is highlighted before the reset.
    await expect(page.locator('.cell.win')).toHaveCount(3);

    // New game clears the decided board and resets to X's turn.
    await newGame.click();

    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
    // No winning-line highlight remains.
    await expect(page.locator('.cell.win')).toHaveCount(0);
    // The status reports X to move.
    await expect(status).toHaveText("X's turn");
  });
});
