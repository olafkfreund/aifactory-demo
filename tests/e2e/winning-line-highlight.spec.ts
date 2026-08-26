// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// Subtask: winning-line-highlight-ui — "Verify the UI visibly marks the three
// winning cells once a win occurs." Target: games/tictactoe/index.html::board.
//
// This Playwright test drives games/tictactoe/index.html in a real browser over
// the file:// protocol (no server, no build). For each of the 8 winning lines
// (3 rows, 3 columns, 2 diagonals) it plays a deterministic X,O,X,O,X sequence
// in which X completes the line, then proves the UI visibly marks EXACTLY the
// 3 winning cells (the `.cell.win` class the page toggles onto them) and that
// those 3 highlighted cells all carry the winner's mark. A control assertion
// confirms that no cell is highlighted while play is still in progress, so the
// "3" is a property of the win — not always-on decoration.

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

// The 8 winning lines by cell index (board laid out 0..8 row-major):
//   0 1 2
//   3 4 5
//   6 7 8
// 3 rows, 3 columns, 2 diagonals = 8 lines total.
const WINNING_LINES: Array<{ name: string; line: [number, number, number] }> = [
  { name: 'row 1 (0,1,2)', line: [0, 1, 2] },
  { name: 'row 2 (3,4,5)', line: [3, 4, 5] },
  { name: 'row 3 (6,7,8)', line: [6, 7, 8] },
  { name: 'column 1 (0,3,6)', line: [0, 3, 6] },
  { name: 'column 2 (1,4,7)', line: [1, 4, 7] },
  { name: 'column 3 (2,5,8)', line: [2, 5, 8] },
  { name: 'diagonal (0,4,8)', line: [0, 4, 8] },
  { name: 'anti-diagonal (2,4,6)', line: [2, 4, 6] },
];

// Build a deterministic X,O,X,O,X click order in which X completes `line`.
// X takes the three line cells; O takes two off-line cells that cannot win.
function clickOrder(line: [number, number, number]): number[] {
  const offLine = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => !line.includes(i));
  const [o1, o2] = offLine;
  // Interleave: X(line0), O(o1), X(line1), O(o2), X(line2) — X wins on move 5.
  return [line[0], o1, line[1], o2, line[2]];
}

test.describe('tic-tac-toe winning line is visibly marked on all 8 lines (AC#4)', () => {
  for (const { name, line } of WINNING_LINES) {
    test(`win on ${name} highlights exactly the 3 winning cells`, async ({
      page,
    }) => {
      await page.goto(INDEX_URL);

      const cells = page.getByRole('gridcell');
      await expect(cells).toHaveCount(9);

      for (const index of clickOrder(line)) {
        await cells.nth(index).click();
      }

      // The winner is announced.
      await expect(page.getByRole('status')).toHaveText('X wins!');

      // Exactly the 3 cells of the completed line are visibly marked, and each
      // marked cell carries the winning player's mark.
      // TODO(reviewer): `.cell.win` is the class the page toggles onto winning
      // cells; there is no role/testid for the highlight state, so a CSS
      // selector is the only stable hook here.
      const winningCells = page.locator('.cell.win');
      await expect(winningCells).toHaveCount(3);
      await expect(winningCells).toHaveText(['X', 'X', 'X']);
    });
  }

  test('no winning cell is marked while the game is still in progress', async ({
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
