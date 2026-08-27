// AC#5: A full board with no winner reports a draw.
//
// This E2E test drives games/tictactoe/index.html (target
// games/tictactoe/index.html::render) in a real browser over file:// — no
// server, no build. It plays a deterministic nine-move sequence that fills
// every cell without ever forming a winning line, then proves render()'s
// output: the status region announces "Draw!" and no cell carries the
// winning-line highlight.
//
// Click order (cell index) alternates X, O, X, O, ... and reaches a full board
// with no winner and no premature win at any intermediate step:
//   X O X
//   X O O
//   O X X
// X takes cells 0, 2, 3, 7, 8; O takes cells 1, 4, 5, 6. No row, column, or
// diagonal is three-of-a-kind, so winner(board) === "draw".

import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs';

// Resolve games/tictactoe/index.html without a dev server. This spec lives at
// <spec_dir>/tests/e2e/, and the game ships under the project worktree, so
// probe the known relative and cwd-based locations and use the first that
// exists on disk. The page loads over file:// — no server, no build.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../.worktree/games/tictactoe/index.html'),
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

// Alternating click order that fills the board with no winner and no premature
// win at any intermediate move.
const DRAW_CLICK_ORDER = [0, 1, 2, 4, 3, 5, 7, 6, 8];

test.describe('tic-tac-toe full board reports a draw (AC#5)', () => {
  test('a full board with no winner updates the status to announce a draw', async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // Fresh game: 9 empty cells, X to move.
    await expect(cells).toHaveCount(9);
    await expect(status).toHaveText("X's turn");

    // Play the deterministic drawing sequence.
    for (const index of DRAW_CLICK_ORDER) {
      // TODO: index-based grid click; cells are a 3x3 board with no unique
      // accessible names until marked.
      await cells.nth(index).click();
    }

    // Every cell is now filled — the board is full.
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

    // A draw has no winning line, so no cell is highlighted as a winner.
    // TODO: .cell.win is the app's winning-line marker class.
    await expect(page.locator('.cell.win')).toHaveCount(0);
  });
});
