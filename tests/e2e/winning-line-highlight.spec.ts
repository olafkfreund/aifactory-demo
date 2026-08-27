// AC#4: the winning line is visibly marked.
//
// Subtask: winning-line-highlighted-ui — Verify the UI visibly marks the three
// winning cells when a line completes.
//
// This Playwright test drives games/tictactoe/index.html (::board) in a real
// browser over the file:// protocol — no server, no build. When a line
// completes the page's render() applies the `.win` highlight class to exactly
// the cells of the winning line (index.html: classList.toggle("win", ...)).
// The test proves, for a winning line, that:
//   * EXACTLY three cells carry the visible `.cell.win` highlight,
//   * those three highlighted cells are precisely the winning line's indices
//     (no off-line cell decorated, no winning cell missed),
//   * the highlighted cells are visible and carry the winner's mark.
// As a boundary case it confirms an in-progress board with no completed line
// marks ZERO cells — the highlight only appears once a line actually wins.

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

// A representative winning line per orientation (row, column, diagonal). Each
// case's `moves` is the click order (X, O, X, O, X) that lets X complete `line`
// while O plays two harmless off-line cells.
const WIN_CASES: { name: string; line: [number, number, number]; moves: number[] }[] = [
  { name: 'top row (0,1,2)', line: [0, 1, 2], moves: [0, 3, 1, 4, 2] },
  { name: 'left column (0,3,6)', line: [0, 3, 6], moves: [0, 1, 3, 2, 6] },
  { name: 'main diagonal (0,4,8)', line: [0, 4, 8], moves: [0, 1, 4, 2, 8] },
  { name: 'anti-diagonal (2,4,6)', line: [2, 4, 6], moves: [2, 0, 4, 1, 6] },
];

test.describe('tic-tac-toe winning line is visibly marked in the UI (AC#4)', () => {
  for (const { name, line, moves } of WIN_CASES) {
    test(`completing the ${name} visibly marks exactly the three winning cells`, async ({
      page,
    }) => {
      await page.goto(INDEX_URL);

      const cells = page.getByRole('gridcell');
      await expect(cells).toHaveCount(9);

      for (const index of moves) {
        await cells.nth(index).click();
      }

      // Exactly the three cells of the completed line receive the highlight —
      // this is the visible mark AC#4 requires.
      const winningCells = page.locator('.cell.win');
      await expect(winningCells).toHaveCount(3);

      // Each highlighted cell is visible and carries the winner's mark.
      await expect(winningCells).toHaveText(['X', 'X', 'X']);
      for (let m = 0; m < 3; m++) {
        await expect(winningCells.nth(m)).toBeVisible();
      }

      // The highlighted cells are precisely the winning line's indices — no
      // off-line cell decorated, no winning cell missed.
      for (let i = 0; i < 9; i++) {
        if (line.includes(i)) {
          await expect(cells.nth(i)).toHaveClass(/\bwin\b/);
        } else {
          await expect(cells.nth(i)).not.toHaveClass(/\bwin\b/);
        }
      }
    });
  }

  test('an in-progress board with no completed line marks zero cells', async ({ page }) => {
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');
    await expect(cells).toHaveCount(9);

    // A few non-winning moves: X at 0, O at 1, X at 4 — no line yet.
    await cells.nth(0).click();
    await cells.nth(1).click();
    await cells.nth(4).click();

    // Nothing is highlighted until a line actually wins.
    await expect(page.locator('.cell.win')).toHaveCount(0);
  });
});
