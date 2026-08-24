// AC#11: Each cell's accessible name states its position and contents,
// e.g. "row 2, column 3, empty".
//
// This spec exercises games/tictactoe/index.html (TicTacToeUI). Each of the
// nine gridcell <button>s must expose an accessible name of the form
// "row R, column C, <contents>", and that name must update after a mark is
// placed on the cell.

import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';

// Resolve the static game page relative to this test file so it can be opened
// directly over file:// without a running server.
const GAME_URL = pathToFileURL(
  path.resolve(__dirname, '../../games/tictactoe/index.html'),
).href;

test.beforeEach(async ({ page }) => {
  await page.goto(GAME_URL);
  // Wait for the grid to be populated by TicTacToeUI before asserting.
  await expect(page.getByRole('gridcell').first()).toBeVisible();
});

test('empty cell at row 2, column 3 announces "row 2, column 3, empty"', async ({
  page,
}) => {
  // The criterion's worked example: index 5 == row 2, column 3.
  await expect(
    page.getByRole('gridcell', { name: 'row 2, column 3, empty' }),
  ).toBeVisible();
});

test('every empty cell states its own row, column and "empty" contents', async ({
  page,
}) => {
  const expectedNames = [
    'row 1, column 1, empty',
    'row 1, column 2, empty',
    'row 1, column 3, empty',
    'row 2, column 1, empty',
    'row 2, column 2, empty',
    'row 2, column 3, empty',
    'row 3, column 1, empty',
    'row 3, column 2, empty',
    'row 3, column 3, empty',
  ];

  const cells = page.getByRole('gridcell');
  await expect(cells).toHaveCount(9);

  for (let i = 0; i < expectedNames.length; i++) {
    await expect(cells.nth(i)).toHaveAccessibleName(expectedNames[i]);
  }
});

test('accessible name updates after a mark is placed on the cell', async ({
  page,
}) => {
  // Before the move, row 2, column 3 reports "empty".
  const cell = page.getByRole('gridcell', { name: 'row 2, column 3, empty' });
  await expect(cell).toBeVisible();

  // Place a mark (X moves first) on that cell.
  await cell.click();

  // The empty name must be gone and replaced with one stating the contents.
  await expect(
    page.getByRole('gridcell', { name: 'row 2, column 3, empty' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('gridcell', { name: 'row 2, column 3, X' }),
  ).toBeVisible();
});
