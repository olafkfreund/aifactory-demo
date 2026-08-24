// AC#11: Each cell's accessible name states its position and contents,
// e.g. "row 2, column 3, empty".
//
// The board renders nine native <button role="gridcell"> elements whose
// accessible name (via aria-label) encodes "row R, column C, <contents>".
// These tests load games/tictactoe/index.html directly from disk and assert
// that every empty cell announces its 1-based row/column and "empty", that
// the AC's example cell (index 5 = row 2, column 3) matches verbatim, and
// that the accessible name updates to the placed mark after a move.

import { test, expect, Page, Locator } from '@playwright/test';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

// The game is a static HTML page with no dev server; load it directly from disk.
// This spec lives at tests/e2e/, the page at games/tictactoe/.
const GAME_URL = pathToFileURL(
  path.resolve(__dirname, '../../games/tictactoe/index.html'),
).href;

function cells(page: Page): Locator {
  return page.getByRole('gridcell');
}

// Expected accessible name for a 0-8 cell index with the given contents.
function expectedName(index: number, contents: string): string {
  const row = Math.floor(index / 3) + 1;
  const column = (index % 3) + 1;
  return `row ${row}, column ${column}, ${contents}`;
}

test.beforeEach(async ({ page }) => {
  await page.goto(GAME_URL);
  await expect(cells(page)).toHaveCount(9);
});

test('each empty cell accessible name states its row, column, and "empty"', async ({
  page,
}) => {
  for (let i = 0; i < 9; i++) {
    // getByRole matches on the accessible name (the button's aria-label).
    await expect(
      page.getByRole('gridcell', { name: expectedName(i, 'empty') }),
    ).toHaveCount(1);
  }
});

test('the AC example cell (row 2, column 3) announces "row 2, column 3, empty"', async ({
  page,
}) => {
  // Index 5 -> row 2, column 3.
  await expect(cells(page).nth(5)).toHaveAttribute(
    'aria-label',
    'row 2, column 3, empty',
  );
  await expect(
    page.getByRole('gridcell', { name: 'row 2, column 3, empty' }),
  ).toHaveCount(1);
});

test('accessible name updates to the placed mark after a move', async ({
  page,
}) => {
  // X moves first. Click the row 2, column 3 cell (index 5) to place an X.
  const cell = cells(page).nth(5);
  await expect(cell).toHaveAttribute('aria-label', 'row 2, column 3, empty');

  await cell.click();

  await expect(cell).toHaveText('X');
  // The accessible name reflects the placed mark, not "empty".
  await expect(cell).toHaveAttribute('aria-label', 'row 2, column 3, X');
  await expect(
    page.getByRole('gridcell', { name: 'row 2, column 3, X' }),
  ).toHaveCount(1);
  await expect(
    page.getByRole('gridcell', { name: 'row 2, column 3, empty' }),
  ).toHaveCount(0);
});
