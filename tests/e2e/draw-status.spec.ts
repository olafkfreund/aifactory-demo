// AC#5: A full board with no winner reports a draw.
//
// Subtask: draw-status-ui — verify the UI (games/tictactoe/index.html::render)
// shows a draw status once the board fills with no winner. The page loads
// game.js and, in render(), sets the #status region to "Draw!" when
// TicTacToe.winner(board) === "draw". This E2E test drives the real page over
// file:// (no server, no build — per AC#1), plays a deterministic nine-move
// sequence that fills every cell without completing any of the 8 winning lines,
// then asserts the status announces a draw and no winning line is highlighted.
//
// Final board (row-major) reached by the click order below:
//   X O X
//   X O O
//   O X X
// Marks alternate X, O, X, O, ... so X takes 0, 2, 3, 7, 8 and O takes 1, 4, 5,
// 6. No row, column, or diagonal is three-of-a-kind at any step, so the ninth
// move fills the board as a draw rather than a win.

import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This spec lives at
// <spec_dir>/tests/e2e, while the game ships under games/tictactoe (and, in
// verification runs, under a .worktree copy), so probe the known relative
// locations and use the first that exists on disk. The page loads over file://.
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

// Click order (cell index) that alternates X, O, X, O, ... and reaches a full
// board with no winner — and no premature win at any intermediate step.
const DRAW_CLICK_ORDER = [0, 1, 2, 4, 3, 5, 7, 6, 8];

test.describe('tic-tac-toe UI reports a draw on a full board (AC#5)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('filling the board with no winner shows a Draw! status', async ({
    page,
  }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Fresh game: X to move, no result announced yet.
    await expect(status).toHaveText("X's turn");

    // Play the full draw sequence: nine alternating moves that fill the board.
    for (const index of DRAW_CLICK_ORDER) {
      // TODO: index-based grid click; the 3x3 cells share the "gridcell" role
      // and have no unique accessible name until they carry a mark.
      await cells.nth(index).click();
    }

    // The board is full — every cell carries the expected mark.
    await expect(cells.nth(0)).toHaveText('X');
    await expect(cells.nth(1)).toHaveText('O');
    await expect(cells.nth(2)).toHaveText('X');
    await expect(cells.nth(3)).toHaveText('X');
    await expect(cells.nth(4)).toHaveText('O');
    await expect(cells.nth(5)).toHaveText('O');
    await expect(cells.nth(6)).toHaveText('O');
    await expect(cells.nth(7)).toHaveText('X');
    await expect(cells.nth(8)).toHaveText('X');

    // AC#5: a full board with no winner reports a draw.
    await expect(status).toHaveText('Draw!');

    // A draw completes no line, so no cell is highlighted as a winner.
    await expect(page.locator('.cell.win')).toHaveCount(0); // TODO: .win is the app's winning-line marker class
  });
});
