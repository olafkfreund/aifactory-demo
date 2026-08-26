// AC#7: A "New game" control resets to an empty board with X to move.
//
// Target: games/tictactoe/index.html::new-game — the "New game" button's click
// handler resets `board` to TicTacToe.emptyBoard(), sets currentPlayer back to
// "X", and re-renders. This test dirties the board (plays a few moves so the
// turn has advanced and marks are present), then clicks "New game" and asserts
// every cell is cleared and the status returns to "X's turn". A second case
// resets from a *decided* game to prove the reset works after game-over too.
//
// The page is a single self-contained file opened directly over file:// — no
// server, no build step required to play (AC#1).
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. Probe the known
// relative locations (this spec lives under specs/.../tests/e2e, the game ships
// under games/tictactoe, and verification runs use a .worktree copy) and use
// the first path that exists on disk.
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

test.describe('tic-tac-toe "New game" resets the board and turn (AC#7)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('New game resets to an empty board with X to move', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');
    const newGame = page.getByRole('button', { name: 'New game' });

    // Fresh game starts with X to move.
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

    // Every cell is cleared...
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
    // ...and it is X's turn again.
    await expect(status).toHaveText("X's turn");
  });

  test('New game after a decided game returns control to X on an empty board', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');
    const newGame = page.getByRole('button', { name: 'New game' });

    // Drive X to a win on the top row: X 0,1,2 / O 3,4.
    await cells.nth(0).click(); // X
    await cells.nth(3).click(); // O
    await cells.nth(1).click(); // X
    await cells.nth(4).click(); // O
    await cells.nth(2).click(); // X completes the top row -> win
    await expect(status).toHaveText('X wins!');

    // New game clears the decided board and hands the turn back to X.
    await newGame.click();

    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
    await expect(status).toHaveText("X's turn");
  });

  test('New game re-enables play: the cleared board accepts a fresh X move', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');
    const newGame = page.getByRole('button', { name: 'New game' });

    // Make a move, then reset.
    await cells.nth(8).click(); // X
    await expect(cells.nth(8)).toHaveText('X');
    await newGame.click();

    // After reset the board is fully playable again from X's turn.
    await expect(cells.nth(8)).toHaveText('');
    await expect(status).toHaveText("X's turn");
    await cells.nth(0).click(); // X moves on the fresh board
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");
  });
});
