// AC#5: A full board with no winner reports a draw.
//
// Target: games/tictactoe/index.html::TicTacToe — the page loads game.js
// (TicTacToe.emptyBoard/move/winner/winningLine) and, in render(), sets the
// status text to "Draw!" when TicTacToe.winner(board) === "draw". This test
// loads the page directly over file:// (no server, no build step), plays a
// full sequence of nine alternating X/O moves that fills every cell without
// completing any of the 8 winning lines, and asserts the status reports a draw.
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

// A full board that ends in a draw — every cell filled, no line of three:
//   X O X
//   X O O
//   O X X
// Click order alternates X, O, X, O, ... (five X's, four O's) and never
// completes a winning line before the ninth move fills the board.
const DRAW_CLICK_ORDER = [0, 1, 2, 4, 3, 5, 7, 6, 8];

test.describe('tic-tac-toe full board reports a draw (AC#5)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('filling the board with no winner reports a draw', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Fresh game: X to move, no result yet.
    await expect(status).toHaveText("X's turn");

    // Play the full draw sequence: nine alternating moves that fill the board.
    for (const index of DRAW_CLICK_ORDER) {
      await cells.nth(index).click();
    }

    // Every cell is now occupied and no line of three was ever completed.
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).not.toHaveText('');
    }

    // A full board with no winner reports a draw.
    await expect(status).toHaveText('Draw!');
  });
});
