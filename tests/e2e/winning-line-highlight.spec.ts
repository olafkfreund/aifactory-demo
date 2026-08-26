// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// Subtask: ui-winning-line-highlighted — Verify index.html visibly marks the
// three winning cells when a player completes a line.
// Target: games/tictactoe/index.html::board
//
// This Playwright test drives games/tictactoe/index.html in a real browser over
// the file:// protocol (no server, no build). For each of the 8 winning lines it
// plays a deterministic winning sequence and proves the win is VISIBLY marked:
//   * exactly the three winning cells carry the `win` highlight class,
//   * those cells render with a background colour that is actually DIFFERENT
//     from an untouched (non-winning) cell — i.e. a human can see the mark,
//     not merely an invisible class toggle,
//   * no off-line cell is decorated.

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

// All 8 winning lines. Each `moves` is the click order (X, O, X, O, X) that lets
// X complete `line` while O plays two harmless off-line cells.
const WIN_CASES: { name: string; line: [number, number, number]; moves: number[] }[] = [
  { name: 'top row (0,1,2)', line: [0, 1, 2], moves: [0, 3, 1, 4, 2] },
  { name: 'middle row (3,4,5)', line: [3, 4, 5], moves: [3, 0, 4, 1, 5] },
  { name: 'bottom row (6,7,8)', line: [6, 7, 8], moves: [6, 0, 7, 1, 8] },
  { name: 'left column (0,3,6)', line: [0, 3, 6], moves: [0, 1, 3, 2, 6] },
  { name: 'middle column (1,4,7)', line: [1, 4, 7], moves: [1, 0, 4, 2, 7] },
  { name: 'right column (2,5,8)', line: [2, 5, 8], moves: [2, 0, 5, 1, 8] },
  { name: 'main diagonal (0,4,8)', line: [0, 4, 8], moves: [0, 1, 4, 2, 8] },
  { name: 'anti-diagonal (2,4,6)', line: [2, 4, 6], moves: [2, 0, 4, 1, 6] },
];

test.describe('tic-tac-toe winning line is VISIBLY marked (AC#4)', () => {
  for (const { name, line, moves } of WIN_CASES) {
    test(`completing the ${name} visibly marks exactly the three winning cells`, async ({
      page,
    }) => {
      await page.goto(INDEX_URL);

      const cells = page.getByRole('gridcell');
      await expect(cells).toHaveCount(9);

      // An untouched cell (index 8 is off every line we complete except a few;
      // pick a guaranteed off-line index for the baseline colour reference).
      const offLineIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8].find((i) => !line.includes(i))!;
      const baselineBg = await cells
        .nth(offLineIndex)
        .evaluate((el) => getComputedStyle(el).backgroundColor);

      for (const index of moves) {
        await cells.nth(index).click();
      }

      // Exactly the three cells of the completed line receive the highlight.
      const winningCells = page.locator('.cell.win');
      await expect(winningCells).toHaveCount(3);

      // The highlighted cells are precisely the winning line's indices, and each
      // one renders a background colour DIFFERENT from a non-winning cell — the
      // "visibly marked" guarantee, not just an invisible class toggle.
      for (let i = 0; i < 9; i++) {
        if (line.includes(i)) {
          await expect(cells.nth(i)).toHaveClass(/\bwin\b/);
          const winBg = await cells
            .nth(i)
            .evaluate((el) => getComputedStyle(el).backgroundColor);
          expect(winBg).not.toBe(baselineBg);
        } else {
          await expect(cells.nth(i)).not.toHaveClass(/\bwin\b/);
        }
      }
    });
  }
});
