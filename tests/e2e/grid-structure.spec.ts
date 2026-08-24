// AC#7: Each of the nine cells is a real <button> carrying role="gridcell",
// inside the role="grid" container.
//
// Target: games/tictactoe/index.html::TicTacToeUI
// The grid cells are generated at runtime by TicTacToeUI.initializeGrid(),
// which creates nine <button> elements with role="gridcell" appended to the
// #gameGrid element (role="grid"). This test loads the static page over the
// file:// protocol and verifies the rendered structure.

import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';

const INDEX_HTML = pathToFileURL(
  path.resolve(__dirname, '../../games/tictactoe/index.html'),
).href;

test.beforeEach(async ({ page }) => {
  await page.goto(INDEX_HTML);
  // Grid is populated by TicTacToeUI after DOMContentLoaded; wait for cells.
  await expect(page.getByRole('grid')).toBeVisible();
});

test('grid contains nine gridcell buttons inside the grid container', async ({ page }) => {
  const grid = page.getByRole('grid');
  await expect(grid).toBeVisible();

  // role="gridcell" cells scoped to the grid container.
  const gridcells = grid.getByRole('gridcell');
  await expect(gridcells).toHaveCount(9);

  // Every cell must be a real <button> element.
  const tagNames = await gridcells.evaluateAll((els) =>
    els.map((el) => el.tagName.toLowerCase()),
  );
  expect(tagNames).toEqual(['button', 'button', 'button', 'button', 'button', 'button', 'button', 'button', 'button']);
});

test('each gridcell button carries role="gridcell" and lives inside role="grid"', async ({ page }) => {
  // There must be exactly one grid container.
  const grids = page.locator('[role="grid"]');
  await expect(grids).toHaveCount(1);

  // All nine gridcells are buttons nested within that grid container.
  const buttonsInGrid = page.locator('[role="grid"] button[role="gridcell"]');
  await expect(buttonsInGrid).toHaveCount(9);

  // No gridcell exists outside the grid container.
  const allGridcells = page.locator('[role="gridcell"]');
  await expect(allGridcells).toHaveCount(9);
});
