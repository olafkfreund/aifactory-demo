// AC#5: A full board with no winner reports a draw.
//
// Subtask: draw-status-shown-ui — verify the UI reports a draw when the board
// fills with no winner. games/tictactoe/index.html loads game.js and, in its
// render() step, sets the #status region to "Draw!" when
// TicTacToe.winner(board) === "draw". This E2E test drives the real page over
// file:// (no server, no build), plays a deterministic nine-move sequence that
// fills every cell without completing any of the 8 winning lines, and asserts
// the status announces a draw and no winning line is highlighted.
import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
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
// Marks alternate X, O, X, ... over this click order (five X's, four O's) and
// no line ever becomes three-of-a-kind, so the ninth move fills the board as a
// draw rather than a win.
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

    // A draw completes no line, so no winning cell is highlighted.
    await expect(page.locator('.cell.win')).toHaveCount(0);
  });
});
