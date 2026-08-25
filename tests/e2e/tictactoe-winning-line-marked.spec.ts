// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// Subtask (winning-line-marked-ui): Verify a completed line in the UI adds the
// .win class to exactly the three winning cells and shows the winner in the
// status.
//
// This E2E test drives games/tictactoe/index.html in a real browser over the
// file:// protocol (no server, no build — AC#1). For each winning line it plays
// a deterministic sequence where X completes the line, then proves via the DOM
// (index.html's render()) that exactly 3 cells carry the CSS class "win"
// (.cell.win) and that the status region announces "X wins!".

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

// All 8 winning lines — 3 rows, 3 columns, 2 diagonals — each with a
// deterministic move order (X,O,X,O,X) in which X completes the line and O
// plays two harmless off-line cells.
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

test.describe('tic-tac-toe winning line is visibly marked in the UI (AC#4)', () => {
  // Sanity: there are exactly 8 winning lines under test.
  test('covers all 8 winning lines', () => {
    expect(WINNING_LINES).toHaveLength(8);
  });

  for (const { name, line, moves } of WINNING_LINES) {
    test(`X wins on ${name}: exactly the 3 line cells get .win and the status shows the winner`, async ({
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

      // Exactly the 3 cells of the completed line carry the .win class, and
      // they all show the winning player's mark.
      const winningCells = page.locator('.cell.win');
      await expect(winningCells).toHaveCount(3);
      await expect(winningCells).toHaveText(['X', 'X', 'X']);

      // The marked cells are precisely the three winning indices — no more,
      // no fewer. Every winning index has .win; no off-line cell does.
      for (let i = 0; i < 9; i++) {
        const shouldWin = line.indexOf(i) !== -1;
        await expect(cells.nth(i)).toHaveClass(
          shouldWin ? /(^|\s)win(\s|$)/ : /^(?!.*(^|\s)win(\s|$)).*$/,
        );
      }
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
