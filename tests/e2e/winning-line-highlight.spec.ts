// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// Subtask: winning-line-highlight-ui — Verify the UI visibly highlights the
// three winning cells once a player completes a line.
//
// This Playwright test drives games/tictactoe/index.html (::TicTacToe) in a
// real browser over the file:// protocol — no server, no build. For a
// representative sample of the 8 winning lines (a row, a column, and both
// diagonals) it plays a deterministic winning sequence and proves that:
//   * EXACTLY three cells carry the `.cell.win` highlight class,
//   * those three highlighted cells are precisely the winning line's indices,
//   * the status region announces the winner.
// It also confirms no cell is highlighted while play is still in progress, so
// the count of three is a property of the completed line — not always-on
// decoration.

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

// A representative sample across the line "shapes" AC#4 enumerates. Each case's
// `moves` is the click order (X, O, X, O, X) that lets X complete `line` while
// O plays two harmless off-line cells.
const WIN_CASES: { name: string; line: [number, number, number]; moves: number[] }[] = [
  { name: 'top row (0,1,2)', line: [0, 1, 2], moves: [0, 3, 1, 4, 2] },
  { name: 'left column (0,3,6)', line: [0, 3, 6], moves: [0, 1, 3, 2, 6] },
  { name: 'main diagonal (0,4,8)', line: [0, 4, 8], moves: [0, 1, 4, 2, 8] },
  { name: 'anti-diagonal (2,4,6)', line: [2, 4, 6], moves: [2, 0, 4, 1, 6] },
];

test.describe('tic-tac-toe completed winning line is visibly highlighted (AC#4)', () => {
  for (const { name, line, moves } of WIN_CASES) {
    test(`completing the ${name} highlights exactly the three winning cells`, async ({
      page,
    }) => {
      await page.goto(INDEX_URL);

      const cells = page.getByRole('gridcell');
      await expect(cells).toHaveCount(9);

      for (const index of moves) {
        await cells.nth(index).click();
      }

      // The status region announces X as the winner.
      await expect(page.getByRole('status')).toHaveText('X wins!');

      // Exactly the three cells of the completed line are highlighted, and they
      // all carry the winning player's mark.
      const winningCells = page.locator('.cell.win');
      await expect(winningCells).toHaveCount(3);
      await expect(winningCells).toHaveText(['X', 'X', 'X']);

      // The highlighted cells are precisely the winning line's indices — no
      // off-line cell is decorated, and no winning cell is missed.
      for (let i = 0; i < 9; i++) {
        if (line.includes(i)) {
          await expect(cells.nth(i)).toHaveClass(/\bwin\b/);
        } else {
          await expect(cells.nth(i)).not.toHaveClass(/\bwin\b/);
        }
      }
    });
  }

  test('no cell is highlighted while the game is still in progress', async ({
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
