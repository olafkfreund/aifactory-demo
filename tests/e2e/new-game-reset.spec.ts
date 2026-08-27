// AC#7: A "New game" control resets to an empty board with X to move.
//
// Target: games/tictactoe/index.html::new-game — the "New game" button resets
// the game state (board = TicTacToe.emptyBoard(), currentPlayer = "X") and
// re-renders. This browser test drives the page over file:// (no server, no
// build — AC#1), plays a full X win so the board holds marks and the winning
// line carries the `.win` highlight, then clicks "New game" and asserts every
// cell is cleared, the `.win` highlight is gone, and #status announces "X's
// turn". A second test proves the reset also works mid-game (before any win).
// The unit lane (empty-board.test.ts) covers emptyBoard() in isolation; here we
// prove the UI wiring of the reset control.
//
// Run from the repo root with:
//   npx playwright test tests/e2e/new-game-reset.spec.ts
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This spec lives
// under specs/<id>/tests/e2e, while the game ships under the project checkout
// (a sibling `.worktree` copy in verification runs). Probe the known relative
// locations and use the first that exists on disk.
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

test.describe('tic-tac-toe "New game" resets to an empty board with X to move (AC#7)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('after a win, New game clears all cells, removes win highlighting, and sets X\'s turn', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');
    const newGame = page.getByRole('button', { name: 'New game' });

    // Play X to a win on the top row: X0, O3, X1, O4, X2 -> X wins.
    for (const index of [0, 3, 1, 4, 2]) {
      await cells.nth(index).click();
    }

    // Precondition: the game is decided, the board holds marks, and exactly the
    // three winning cells carry the `.win` highlight.
    await expect(status).toHaveText('X wins!');
    await expect(page.locator('.cell.win')).toHaveCount(3);

    // Reset.
    await newGame.click();

    // Every one of the 9 cells is cleared.
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
      await expect(cells.nth(i)).not.toHaveClass(/\bwin\b/);
    }

    // No win highlighting remains anywhere.
    await expect(page.locator('.cell.win')).toHaveCount(0);

    // Status is back to X's turn.
    await expect(status).toHaveText("X's turn");
  });

  test('mid-game, New game clears placed marks and returns the turn to X', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');
    const newGame = page.getByRole('button', { name: 'New game' });

    // Two moves in, it is X's turn again but two cells are occupied.
    await cells.nth(0).click(); // X
    await cells.nth(4).click(); // O
    await expect(cells.nth(0)).toHaveText('X');
    await expect(cells.nth(4)).toHaveText('O');
    await expect(status).toHaveText("X's turn");

    // Reset clears the board even though no game was decided.
    await newGame.click();

    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
    await expect(page.locator('.cell.win')).toHaveCount(0);
    await expect(status).toHaveText("X's turn");

    // The fresh board is playable and X moves first.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");
  });
});
