// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked (UI highlight of the winning cells).
//
// This E2E test proves the BROWSER UI side of AC#4: after a completed win the
// render() function toggles the `win` class onto exactly the three cells that
// form the winning line, so the winning line is visibly marked. The game loads
// straight from games/tictactoe/index.html via a file:// URL — no server, no
// build (also exercises AC#1).

import { test, expect } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve the game HTML relative to this spec file (tests/e2e -> repo root).
const GAME_URL = pathToFileURL(
  path.resolve(__dirname, '..', '..', 'games', 'tictactoe', 'index.html'),
).href;

// Cells are <button class="cell" aria-label="Cell N"> where N is 1-based.
// The top row (board indices 0,1,2) maps to "Cell 1", "Cell 2", "Cell 3".
function cell(page: import('@playwright/test').Page, index0: number) {
  return page.getByRole('button', { name: `Cell ${index0 + 1}` });
}

test.describe('AC#4 — winning line is visibly marked in the UI', () => {
  test('top-row X win adds the "win" class to the three winning cells', async ({ page }) => {
    await page.goto(GAME_URL);

    // Play out an X win on the top row (line [0,1,2]):
    //   X:0  O:3  X:1  O:4  X:2 -> X wins.
    await cell(page, 0).click(); // X
    await cell(page, 3).click(); // O
    await cell(page, 1).click(); // X
    await cell(page, 4).click(); // O
    await cell(page, 2).click(); // X wins

    // The game reports the win (auto-waits).
    await expect(page.locator('#status')).toHaveText('X wins!');

    // Each of the three winning cells is highlighted with the `win` class.
    await expect(cell(page, 0)).toHaveClass(/\bwin\b/);
    await expect(cell(page, 1)).toHaveClass(/\bwin\b/);
    await expect(cell(page, 2)).toHaveClass(/\bwin\b/);

    // Exactly the three winning cells carry the highlight — no more, no less.
    // TODO(reviewer): `.cell.win` targets the win-highlight class directly,
    // which is the behaviour under test; there is no role/testid equivalent.
    await expect(page.locator('.cell.win')).toHaveCount(3);
  });

  test('cells outside the winning line are NOT marked with the "win" class', async ({ page }) => {
    await page.goto(GAME_URL);

    // Same top-row X win; cells 3 and 4 (O's moves) are off the winning line.
    await cell(page, 0).click(); // X
    await cell(page, 3).click(); // O
    await cell(page, 1).click(); // X
    await cell(page, 4).click(); // O
    await cell(page, 2).click(); // X wins

    await expect(page.locator('#status')).toHaveText('X wins!');

    // Off-line cells must not receive the highlight.
    await expect(cell(page, 3)).not.toHaveClass(/\bwin\b/);
    await expect(cell(page, 4)).not.toHaveClass(/\bwin\b/);
  });
});
