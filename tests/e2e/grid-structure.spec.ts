// AC#7: Each of the nine cells is a real <button> carrying role="gridcell",
// inside the role="grid" container.
//
// This test loads games/tictactoe/index.html and asserts the board container
// exposes role="grid" and holds exactly nine BUTTON elements, each carrying
// role="gridcell".

import { test, expect } from '@playwright/test';
import * as path from 'path';
import { pathToFileURL } from 'url';

// The game is a static HTML page with no dev server; load it directly from disk.
// grid-structure.spec.ts lives at tests/e2e/, the page at games/tictactoe/.
const PAGE_URL = pathToFileURL(
  path.resolve(__dirname, '../../games/tictactoe/index.html'),
).href;

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE_URL);
  // Wait for the board container to be present before asserting on its children.
  await expect(page.getByRole('grid', { name: 'Tic-Tac-Toe board' })).toBeVisible();
});

test('board container carries role="grid"', async ({ page }) => {
  const grid = page.getByRole('grid');
  await expect(grid).toHaveCount(1);
  await expect(grid).toHaveAttribute('role', 'grid');
});

test('board renders exactly nine gridcells', async ({ page }) => {
  const grid = page.getByRole('grid');
  const cells = grid.getByRole('gridcell');
  await expect(cells).toHaveCount(9);
});

test('every gridcell is a real <button> with role="gridcell"', async ({ page }) => {
  const grid = page.getByRole('grid');
  const cells = grid.getByRole('gridcell');
  await expect(cells).toHaveCount(9);

  for (let i = 0; i < 9; i++) {
    const cell = cells.nth(i);
    // Real <button> element, not a div dressed up with a role.
    await expect(cell).toHaveJSProperty('tagName', 'BUTTON');
    await expect(cell).toHaveAttribute('role', 'gridcell');
  }
});
