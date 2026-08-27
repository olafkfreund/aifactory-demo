// AC#5: A full board with no winner reports a draw.
//
// This E2E test drives games/tictactoe/index.html (games/tictactoe/index.html
// ::render) in a real browser over file:// — no server, no build (per AC#1).
// It plays a deterministic nine-move sequence that fills every cell without
// ever forming a winning line, then proves the UI render() output:
//   (a) the status region announces "Draw!", and
//   (b) no cell is highlighted as a winner (zero .cell.win elements).
//
// Final board (row-major) reached by the click order below:
//   X O X
//   X O O
//   O X X
// X takes cells 0, 2, 3, 7, 8; O takes cells 1, 4, 5, 6. No row, column, or
// diagonal is three-of-a-kind, so winner(board) === "draw" and no line wins.

import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs';

// Resolve games/tictactoe/index.html regardless of where the runner mounts the
// repo. This test file lives at <spec_dir>/tests/e2e/, and the game ships under
// the project worktree, so probe the known relative locations and use the first
// that exists on disk. No dev server: the page loads over file://.
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

// Click order (cell index) that alternates X, O, X, O, ... and reaches a full
// board with no winner and no premature win at any intermediate step.
const DRAW_CLICK_ORDER = [0, 1, 2, 4, 3, 5, 7, 6, 8];

test.describe('tic-tac-toe full board reports a draw (AC#5)', () => {
  test('drawing playthrough fills the board, shows Draw!, highlights no winner', async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);

    for (const index of DRAW_CLICK_ORDER) {
      // TODO: index-based grid click; cells are a 3x3 board with no unique
      // accessible names until marked.
      await cells.nth(index).click();
    }

    // The board is full — every cell carries a mark.
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
    await expect(page.getByRole('status')).toHaveText('Draw!');

    // A draw has no winning line, so no cell is highlighted as a winner.
    await expect(page.locator('.cell.win')).toHaveCount(0); // TODO: .win is the app's winning-line marker class
  });
});
