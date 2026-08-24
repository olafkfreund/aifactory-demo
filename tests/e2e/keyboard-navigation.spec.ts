// AC#9: index.html registers a `keydown` handler on the grid that calls
// nextFocusIndex and moves DOM focus to the returned cell.
//
// This spec drives the real TicTacToeUI in games/tictactoe/index.html through a
// browser and asserts that arrow keys + Home/End move keyboard focus to exactly
// the cell nextFocusIndex would return. The values exercised are taken verbatim
// from the acceptance criteria:
//   AC#2 (move within row/column, from 4): ArrowRight->5, ArrowLeft->3, ArrowUp->1, ArrowDown->7
//   AC#3 (wrap at edges): from 2 ArrowRight->0; from 0 ArrowLeft->2; from 0 ArrowUp->6; from 6 ArrowDown->0
//   AC#4 (Home->0, End->8 from any cell)

import { test, expect, type Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs';

/** Resolve a file:// URL for the game under test, tolerating a few layouts. */
function gameUrl(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(process.cwd(), 'games/tictactoe/index.html'),
    path.resolve(process.cwd(), '.worktree/games/tictactoe/index.html'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return pathToFileURL(c).toString();
  }
  // Fall back to the on-disk layout; the test will surface a load failure.
  return pathToFileURL(candidates[0]).toString();
}

/** Accessible name of an empty cell at grid index i, matching updateCellAccessibleName. */
function cellName(i: number): string {
  const row = Math.floor(i / 3) + 1;
  const col = (i % 3) + 1;
  return `row ${row}, column ${col}, empty`;
}

/** Locator for the gridcell button at index i (board is empty throughout this spec). */
function cell(page: Page, i: number) {
  return page.getByRole('gridcell', { name: cellName(i) });
}

/** Press a key on the currently focused cell (bubbles to the grid keydown handler). */
async function press(page: Page, key: string) {
  await page.keyboard.press(key);
}

test.beforeEach(async ({ page }) => {
  await page.goto(gameUrl());
  // Grid is populated on DOMContentLoaded; wait for the first real gridcell.
  await expect(page.getByRole('grid')).toBeVisible();
  await expect(cell(page, 0)).toBeVisible();
  // Focus the roving-tabindex cell and sync the UI's internal index to 0 via Home.
  await cell(page, 0).focus();
  await press(page, 'Home');
  await expect(cell(page, 0)).toBeFocused();
});

test('Home focuses cell 0 and End focuses cell 8 from any starting cell', async ({ page }) => {
  // AC#4: nextFocusIndex returns 0 for Home and 8 for End, from any cell.
  await press(page, 'End');
  await expect(cell(page, 8)).toBeFocused();

  await press(page, 'Home');
  await expect(cell(page, 0)).toBeFocused();

  // End again from cell 0 -> still 8.
  await press(page, 'End');
  await expect(cell(page, 8)).toBeFocused();
});

test('arrow keys move focus within a row and column from cell 4', async ({ page }) => {
  // AC#2: from 4, ArrowRight is 5, ArrowLeft is 3, ArrowUp is 1, ArrowDown is 7.
  // Navigate deterministically to cell 4 (Home->0, ArrowRight->1, ArrowDown->4).
  const goTo4 = async () => {
    await press(page, 'Home');
    await press(page, 'ArrowRight');
    await press(page, 'ArrowDown');
    await expect(cell(page, 4)).toBeFocused();
  };

  await goTo4();
  await press(page, 'ArrowRight');
  await expect(cell(page, 5)).toBeFocused();

  await goTo4();
  await press(page, 'ArrowLeft');
  await expect(cell(page, 3)).toBeFocused();

  await goTo4();
  await press(page, 'ArrowUp');
  await expect(cell(page, 1)).toBeFocused();

  await goTo4();
  await press(page, 'ArrowDown');
  await expect(cell(page, 7)).toBeFocused();
});

test('arrow keys wrap at the grid edges', async ({ page }) => {
  // AC#3: from 2 ArrowRight->0; from 0 ArrowLeft->2; from 0 ArrowUp->6; from 6 ArrowDown->0.

  // from 2, ArrowRight -> 0 (reach 2 via Home->0, ArrowRight->1, ArrowRight->2).
  await press(page, 'Home');
  await press(page, 'ArrowRight');
  await press(page, 'ArrowRight');
  await expect(cell(page, 2)).toBeFocused();
  await press(page, 'ArrowRight');
  await expect(cell(page, 0)).toBeFocused();

  // from 0, ArrowLeft -> 2.
  await press(page, 'Home');
  await press(page, 'ArrowLeft');
  await expect(cell(page, 2)).toBeFocused();

  // from 0, ArrowUp -> 6.
  await press(page, 'Home');
  await press(page, 'ArrowUp');
  await expect(cell(page, 6)).toBeFocused();

  // from 6, ArrowDown -> 0 (already at 6 from previous step).
  await expect(cell(page, 6)).toBeFocused();
  await press(page, 'ArrowDown');
  await expect(cell(page, 0)).toBeFocused();
});
