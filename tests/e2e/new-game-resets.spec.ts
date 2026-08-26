// AC#7: A "New game" control resets to an empty board with X to move.
//
// Two things are proven here, both against games/tictactoe/index.html opened
// directly over file:// (no server, no build step — AC#1):
//   1. Clicking "New game" clears all 9 cells and sets the status to X's turn.
//   2. TicTacToe.emptyBoard() (exposed on window by game.js) returns nine null
//      cells — the primitive the reset handler relies on.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. In verification runs
// the game ships under a .worktree copy alongside the spec; in a normal
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

  test('New game clears all cells and sets the status to X to move', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const newGame = page.getByRole('button', { name: 'New game' });
    const status = page.getByRole('status');

    // Play an odd number of moves (X -> O -> X) so the board is dirty and the
    // turn has provably advanced past X before the reset.
    await cells.nth(2).click(); // X
    await cells.nth(3).click(); // O
    await cells.nth(6).click(); // X
    await expect(cells.nth(2)).toHaveText('X');
    await expect(cells.nth(3)).toHaveText('O');
    await expect(cells.nth(6)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // Click the "New game" control.
    await newGame.click();

    // Every one of the 9 cells is cleared back to empty.
    await expect(cells).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
    // No winning-line highlight remains after the reset.
    await expect(page.locator('.cell.win')).toHaveCount(0);

    // The status resets to X to move.
    await expect(status).toHaveText("X's turn");
  });

  test('emptyBoard() returns nine null cells', async ({ page }) => {
    // game.js is loaded by index.html and exposes the pure rules on
    // window.TicTacToe. Evaluate emptyBoard() in the page and assert the shape.
    const board = await page.evaluate(() => {
      // @ts-expect-error TicTacToe is a global installed by games/tictactoe/game.js
      return window.TicTacToe.emptyBoard();
    });

    expect(Array.isArray(board)).toBe(true);
    expect(board).toHaveLength(9);
    expect(board).toEqual([null, null, null, null, null, null, null, null, null]);
  });
});
