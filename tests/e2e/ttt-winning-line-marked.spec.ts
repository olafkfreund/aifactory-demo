// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// This E2E test drives games/tictactoe/index.html in a real browser over the
// file:// protocol (no server, no build). For each of the 8 winning lines it
// plays a deterministic sequence where X completes the line, then proves that
// exactly the 3 winning cells are highlighted in the DOM via the CSS class
// "win" (.cell.win) and that the status region announces the winner ("X wins!").

import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs';

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under <spec_dir>/tests/e2e; the game ships under the project worktree, so
// probe the known relative locations and use the first that exists on disk.
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

// The 8 winning lines and, for each, a deterministic move order (X,O,X,O,X)
// in which X completes the line and O plays two harmless off-line cells.
const WINNING_LINES: { name: string; line: number[]; moves: number[] }[] = [
  { name: 'row 0', line: [0, 1, 2], moves: [0, 3, 1, 4, 2] },
  { name: 'row 1', line: [3, 4, 5], moves: [3, 0, 4, 1, 5] },
  { name: 'row 2', line: [6, 7, 8], moves: [6, 0, 7, 1, 8] },
  { name: 'column 0', line: [0, 3, 6], moves: [0, 1, 3, 2, 6] },
  { name: 'column 1', line: [1, 4, 7], moves: [1, 0, 4, 2, 7] },
  { name: 'column 2', line: [2, 5, 8], moves: [2, 0, 5, 1, 8] },
  { name: 'main diagonal', line: [0, 4, 8], moves: [0, 1, 4, 2, 8] },
  { name: 'anti-diagonal', line: [2, 4, 6], moves: [2, 0, 4, 1, 6] },
];

test.describe('tic-tac-toe winning line is visibly marked (AC#4)', () => {
  for (const { name, moves } of WINNING_LINES) {
    test(`X wins on ${name}: exactly the 3 line cells are marked and the winner is announced`, async ({
      page,
    }) => {
      await page.goto(INDEX_URL);

      const cells = page.getByRole('gridcell');
      await expect(cells).toHaveCount(9);

      for (const index of moves) {
        await cells.nth(index).click();
      }

      // The status region announces the winner.
      await expect(page.getByRole('status')).toHaveText('X wins!');

      // Exactly the 3 cells of the completed line are highlighted, and they
      // all carry the winning player's mark.
      const winningCells = page.locator('.cell.win');
      await expect(winningCells).toHaveCount(3);
      await expect(winningCells).toHaveText(['X', 'X', 'X']);
    });
  }

  test('no cell is marked as winning while the game is still in progress', async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');
    // Two non-winning moves: X at 0, O at 4. Play continues.
    await cells.nth(0).click();
    await cells.nth(4).click();

    await expect(page.locator('.cell.win')).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });
});
