// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked. This test drives real clicks against
// games/tictactoe/index.html loaded over file:// (no server, no build) and
// asserts that after a win the three cells of the winning line each receive the
// 'winner' CSS class in the rendered board (renderBoard adds .winner to the
// cells whose index is in gameState.winningLine).
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

/**
 * Resolve games/tictactoe/index.html by walking up from this test file until
 * the file is found. Keeps the test independent of where the runner is rooted.
 */
function resolveIndexHtml(): string {
  let dir = __dirname;
  for (let i = 0; i < 12; i++) {
    const candidate = path.join(dir, 'games', 'tictactoe', 'index.html');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  throw new Error('Could not locate games/tictactoe/index.html');
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

// All 8 winning lines: 3 rows, 3 columns, 2 diagonals.
const WINNING_LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2], // row 1
  [3, 4, 5], // row 2
  [6, 7, 8], // row 3
  [0, 3, 6], // column 1
  [1, 4, 7], // column 2
  [2, 5, 8], // column 3
  [0, 4, 8], // diagonal TL-BR
  [2, 4, 6], // diagonal TR-BL
];

/**
 * Build a click order (cell indices) so that X wins on the given line.
 * X takes the three line cells; O takes filler cells not on the line.
 * Moves alternate X, O, X, O, X, so X completes the line on move 5.
 */
function movesForXWin(line: readonly [number, number, number]): number[] {
  const filler = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => !line.includes(i));
  const [x1, x2, x3] = line;
  const [o1, o2] = filler; // two distinct cells off the winning line
  return [x1, o1, x2, o2, x3];
}

test.describe('AC#4: winning line is visibly marked on all 8 lines', () => {
  for (const line of WINNING_LINES) {
    test(`winning line [${line.join(',')}] gets the 'winner' class on its three cells`, async ({
      page,
    }) => {
      await page.goto(INDEX_URL);

      const cells = page.locator('#board button.cell'); // TODO(reviewer): no role/testid on generated cells; scoped CSS selector
      await expect(cells).toHaveCount(9);

      // Play out a game where X completes this winning line.
      for (const index of movesForXWin(line)) {
        // renderBoard() rebuilds the board after each move, so re-query per click.
        await page.locator('#board button.cell').nth(index).click();
      }

      // The game reports X as the winner.
      await expect(page.locator('#status')).toHaveText('X wins!');

      // Exactly the three cells of the winning line carry the 'winner' class.
      const winnerCells = page.locator('#board button.cell.winner');
      await expect(winnerCells).toHaveCount(3);

      for (const index of line) {
        await expect(page.locator('#board button.cell').nth(index)).toHaveClass(
          /\bwinner\b/,
        );
      }

      // Cells off the winning line must NOT be marked.
      const offLine = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => !line.includes(i));
      for (const index of offLine) {
        await expect(
          page.locator('#board button.cell').nth(index),
        ).not.toHaveClass(/\bwinner\b/);
      }
    });
  }
});
