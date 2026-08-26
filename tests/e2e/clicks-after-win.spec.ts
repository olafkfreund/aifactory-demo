// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// This test loads games/tictactoe/index.html directly via file:// (no server,
// no build step). It plays a deterministic sequence so X wins the top row, then
// clicks an empty cell after the game is decided and asserts that the click is
// ignored: no mark is placed, the "X wins!" status is unchanged, the winning
// line stays highlighted, the whole board is identical to before the click, and
// no page or console error is raised.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under <spec_dir>/tests/e2e, and the game ships under the project worktree, so
// probe the known relative locations and use the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../games/tictactoe/index.html'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `games/tictactoe/index.html not found. Looked in:\n${candidates.join('\n')}`,
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

// Deterministic winning sequence: X plays the top row (0,1,2) and wins;
// O plays 3 and 4. After the win, cells 0..4 are filled and 5..8 are empty.
const WINNING_MOVES = [0, 3, 1, 4, 2];
const EMPTY_CELL_AFTER_WIN = 5;

test.describe('tic-tac-toe clicks after a win are ignored (AC#6)', () => {
  test('clicking an empty cell after the game is decided changes nothing and raises no error', async ({
    page,
  }) => {
    // Capture any runtime error so a "click after game over threw" regression is caught.
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(String(err)));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // file:// — proves no server and no build step is required to play.
    await page.goto(INDEX_URL);

    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');
    await expect(cells).toHaveCount(9);

    // Play the deterministic sequence to reach a decided game (X wins top row).
    for (const index of WINNING_MOVES) {
      await cells.nth(index).click();
    }

    // The game is decided: X wins and the winning line is visibly marked.
    await expect(status).toHaveText('X wins!');
    // TODO(review): .cell.win is a CSS-class selector; no role/testid exists for
    // the highlighted winning line, so this is the least-brittle option here.
    const winningCells = page.locator('.cell.win');
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(['X', 'X', 'X']);

    // Snapshot the full board while the game is decided; cell 5 is still empty.
    const boardBefore = await cells.allTextContents();
    expect(boardBefore[EMPTY_CELL_AFTER_WIN]).toBe('');

    // Act: click an empty cell now that play has stopped.
    await cells.nth(EMPTY_CELL_AFTER_WIN).click();

    // The empty cell stays empty — no mark was placed.
    await expect(cells.nth(EMPTY_CELL_AFTER_WIN)).toHaveText('');

    // The status still declares the same winner (turn did not advance).
    await expect(status).toHaveText('X wins!');

    // The winning line is untouched: still exactly three highlighted X cells.
    await expect(winningCells).toHaveCount(3);
    await expect(winningCells).toHaveText(['X', 'X', 'X']);

    // The whole board is identical to before the click.
    const boardAfter = await cells.allTextContents();
    expect(boardAfter).toEqual(boardBefore);

    // The ignored click raised no page or console error.
    expect(errors).toEqual([]);
  });
});
