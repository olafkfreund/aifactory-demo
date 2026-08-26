// AC#5: A full board with no winner reports a draw.
//
// Target: games/tictactoe/index.html::render — after every move the click
// handler re-renders. render() calls TicTacToe.winner(board); when the board is
// full with no three-in-a-row it returns "draw", and render sets the status
// region's text to "Draw!". This test loads the page directly over file://
// (no server, no build step), plays out a complete 9-move game that fills the
// board without either player completing a line, and asserts the UI shows the
// draw status.
//
// The chosen final board — X at {0,2,3,7,8}, O at {1,4,5,6}:
//   X O X
//   X O O
//   O X X
// has no winning line for either mark, so no intermediate click can end the
// game early; all nine cells fill and render reports the draw.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under games/tictactoe/tests/e2e, and the game ships as a sibling of that
// tests tree (and, in verification runs, under a .worktree copy), so probe the
// known relative locations and use the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../index.html'),
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

// Alternating X/O click order (indices) that fills the board to a draw:
//   X:0, O:1, X:2, O:4, X:3, O:5, X:7, O:6, X:8
const DRAW_MOVE_ORDER = [0, 1, 2, 4, 3, 5, 7, 6, 8];

test.describe('tic-tac-toe full board with no winner shows draw status (AC#5)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    // The board renders its 9 gridcells on load.
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('playing to a full board with no winner reports a draw in the UI', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Fresh game: X to move.
    await expect(status).toHaveText("X's turn");

    // Play out the full nine moves. No line completes for either mark, so play
    // never stops early and every cell ends up filled.
    for (const index of DRAW_MOVE_ORDER) {
      await cells.nth(index).click();
    }

    // Every cell is now occupied (no empty cells remain).
    for (let i = 0; i < 9; i++) {
      await expect(cells.nth(i)).not.toHaveText('');
    }

    // The board is full with no winner: the status region reports the draw and
    // does NOT announce a winner.
    await expect(status).toHaveText('Draw!');
    await expect(status).not.toHaveText('X wins!');
    await expect(status).not.toHaveText('O wins!');

    // A draw highlights no winning line.
    await expect(page.locator('.cell.win')).toHaveCount(0);
  });
});
