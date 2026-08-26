// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// Target: games/tictactoe/index.html::TicTacToe — the cell click handler calls
// TicTacToe.move(board, i, currentPlayer) and, when move() returns the SAME
// board reference (an occupied cell is a no-op), returns early without flipping
// currentPlayer or re-rendering. This test loads the page directly over file://
// (no server, no build step), places a mark, then clicks the SAME cell with the
// other player active and asserts: the mark is unchanged, the current player is
// unchanged, and no page error is thrown.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under tests/e2e; the game ships under games/tictactoe (and, in verification
// runs, under a .worktree copy), so probe the known relative locations and use
// the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../index.html'),
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../../games/tictactoe/index.html'),
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

test.describe('tic-tac-toe clicking an occupied cell is a no-op (AC#3)', () => {
  // Capture any uncaught page error so we can assert clicking an occupied cell
  // throws nothing.
  let pageErrors: Error[];

  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('re-clicking an occupied cell leaves the mark and the current player unchanged', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Fresh game: X to move.
    await expect(status).toHaveText("X's turn");

    // X takes the center cell; the turn passes to O.
    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // O now clicks the SAME (occupied) center cell: the click must do nothing.
    await cells.nth(4).click();

    // The mark stays X (not overwritten by O)...
    await expect(cells.nth(4)).toHaveText('X');
    // ...and the turn stays with O (no turn passed).
    await expect(status).toHaveText("O's turn");

    // A following legal move by O still works, proving the game was not wedged
    // and it really is still O's turn.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('O');
    await expect(status).toHaveText("X's turn");

    // No error was thrown by the occupied-cell click.
    expect(pageErrors).toEqual([]);
  });

  test('repeatedly clicking an occupied cell never changes the board or turn', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X takes the top-left cell; turn passes to O.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // Hammer the occupied cell several times: still a no-op each time.
    for (let i = 0; i < 3; i++) {
      await cells.nth(0).click();
      await expect(cells.nth(0)).toHaveText('X');
      await expect(status).toHaveText("O's turn");
    }

    // Every other cell remains empty — the no-op clicks leaked nothing.
    for (let i = 1; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }

    // No error surfaced from any of the occupied-cell clicks.
    expect(pageErrors).toEqual([]);
  });
});
