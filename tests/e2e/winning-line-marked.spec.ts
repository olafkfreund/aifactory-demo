// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// Subtask (winning-line-visibly-marked-ui): Play a winning sequence in the UI
// and verify exactly the three winning cells receive the .win highlight
// (games/tictactoe/index.html::.cell.win) and the status announces the winner.
//
// This E2E test drives games/tictactoe/index.html in a real browser over the
// file:// protocol (no server, no build — AC#1). For every one of the 8 winning
// lines it plays a deterministic sequence in which X completes the line, then
// proves through the DOM that exactly 3 cells carry the CSS class "win"
// (.cell.win) — precisely the three winning indices — and that the status
// region announces "X wins!".

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

// The 3 winning cells that must be marked — the criterion states the winning
// line is exactly three cells.
const WINNING_CELL_COUNT = 3;

// All 8 winning lines — 3 rows, 3 columns, 2 diagonals — each paired with a
// deterministic move order (X,O,X,O,X) in which X completes the named line and
// O plays two harmless off-line cells.
const WINNING_LINES: { name: string; line: number[]; moves: number[] }[] = [
  { name: 'top row', line: [0, 1, 2], moves: [0, 3, 1, 4, 2] },
  { name: 'middle row', line: [3, 4, 5], moves: [3, 0, 4, 1, 5] },
  { name: 'bottom row', line: [6, 7, 8], moves: [6, 0, 7, 1, 8] },
  { name: 'left column', line: [0, 3, 6], moves: [0, 1, 3, 2, 6] },
  { name: 'middle column', line: [1, 4, 7], moves: [1, 0, 4, 2, 7] },
  { name: 'right column', line: [2, 5, 8], moves: [2, 0, 5, 1, 8] },
  { name: 'main diagonal', line: [0, 4, 8], moves: [0, 1, 4, 2, 8] },
  { name: 'anti-diagonal', line: [2, 4, 6], moves: [2, 0, 4, 1, 6] },
];

test.describe('tic-tac-toe: winning line is visibly marked in the UI (AC#4)', () => {
  // Guard: all 8 winning lines must be exercised — 3 rows, 3 columns, 2 diagonals.
  test('exercises all 8 winning lines', () => {
    expect(WINNING_LINES).toHaveLength(8);
  });

  for (const { name, line, moves } of WINNING_LINES) {
    test(`X wins on the ${name}: exactly 3 cells get .win and the status announces the winner`, async ({
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

      // Exactly 3 cells carry the .win highlight, and each shows X's mark.
      const winningCells = page.locator('.cell.win');
      await expect(winningCells).toHaveCount(WINNING_CELL_COUNT);
      await expect(winningCells).toHaveText(['X', 'X', 'X']);

      // The marked cells are precisely the three winning indices — every
      // on-line cell has .win, no off-line cell does.
      for (let i = 0; i < 9; i++) {
        const onLine = line.indexOf(i) !== -1;
        await expect(cells.nth(i)).toHaveClass(
          onLine ? /(^|\s)win(\s|$)/ : /^(?!.*(^|\s)win(\s|$)).*$/,
        );
      }
    });
  }

  test('no cell carries the .win highlight while the game is still in progress', async ({
    page,
  }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');
    // Two non-winning moves: X at 0, O at 4. Play continues, so nothing wins.
    await cells.nth(0).click();
    await cells.nth(4).click();

    await expect(page.locator('.cell.win')).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });
});
