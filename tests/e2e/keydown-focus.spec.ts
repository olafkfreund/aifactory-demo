// AC#9: index.html registers a keydown handler on the grid that calls
// nextFocusIndex and moves focus to the returned cell.
//
// This E2E test loads games/tictactoe/index.html in a real browser, focuses a
// grid cell, then presses the arrow, Home, and End keys. It asserts that DOM
// focus lands on the cell nextFocusIndex would return — proving the grid's
// keydown handler is wired to nextFocusIndex and moves focus accordingly.
//
// Expected destinations (from nextFocusIndex on a 3x3 grid, cells 0-8):
//   ArrowRight from 0 -> 1  ("row 1, column 2, empty")
//   ArrowDown  from 1 -> 4  ("row 2, column 2, empty")
//   Home              -> 0  ("row 1, column 1, empty")
//   End               -> 8  ("row 3, column 3, empty")
//   ArrowLeft  from 0 -> 2  ("row 1, column 3, empty")  (edge wrap)
//   ArrowUp    from 0 -> 6  ("row 3, column 1, empty")  (edge wrap)

import { test, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';

// The static game lives at <spec_dir>/.worktree/games/tictactoe/index.html.
// From this test file (<spec_dir>/tests/e2e/) the game is two levels up.
function resolveGameUrl(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return pathToFileURL(candidate).toString();
    }
  }
  throw new Error(
    `Could not locate games/tictactoe/index.html. Tried:\n${candidates.join('\n')}`,
  );
}

const GAME_URL = resolveGameUrl();

test.beforeEach(async ({ page }) => {
  await page.goto(GAME_URL);
  // The grid container is role="grid"; wait until it has rendered its cells.
  await expect(page.getByRole('grid', { name: 'Tic-Tac-Toe board' })).toBeVisible();
});

test('ArrowRight keydown moves focus to the next cell in the row', async ({ page }) => {
  // Focus cell 0 without clicking (clicking would place a mark and change labels).
  await page.getByRole('gridcell', { name: 'row 1, column 1, empty' }).focus();

  await page.keyboard.press('ArrowRight');

  // nextFocusIndex(0, 'ArrowRight') === 1 -> row 1, column 2.
  await expect(
    page.getByRole('gridcell', { name: 'row 1, column 2, empty' }),
  ).toBeFocused();
});

test('ArrowDown keydown moves focus down a column', async ({ page }) => {
  await page.getByRole('gridcell', { name: 'row 1, column 1, empty' }).focus();

  await page.keyboard.press('ArrowRight'); // 0 -> 1
  await page.keyboard.press('ArrowDown'); // 1 -> 4

  // nextFocusIndex(1, 'ArrowDown') === 4 -> row 2, column 2.
  await expect(
    page.getByRole('gridcell', { name: 'row 2, column 2, empty' }),
  ).toBeFocused();
});

test('Home keydown moves focus to the first cell', async ({ page }) => {
  await page.getByRole('gridcell', { name: 'row 1, column 1, empty' }).focus();

  await page.keyboard.press('End'); // move away first (-> 8)
  await page.keyboard.press('Home'); // -> 0

  // nextFocusIndex(anything, 'Home') === 0 -> row 1, column 1.
  await expect(
    page.getByRole('gridcell', { name: 'row 1, column 1, empty' }),
  ).toBeFocused();
});

test('End keydown moves focus to the last cell', async ({ page }) => {
  await page.getByRole('gridcell', { name: 'row 1, column 1, empty' }).focus();

  await page.keyboard.press('End'); // -> 8

  // nextFocusIndex(anything, 'End') === 8 -> row 3, column 3.
  await expect(
    page.getByRole('gridcell', { name: 'row 3, column 3, empty' }),
  ).toBeFocused();
});

test('ArrowLeft keydown wraps focus around the row edge', async ({ page }) => {
  await page.getByRole('gridcell', { name: 'row 1, column 1, empty' }).focus();

  await page.keyboard.press('ArrowLeft'); // 0 -> 2 (wraps)

  // nextFocusIndex(0, 'ArrowLeft') === 2 -> row 1, column 3.
  await expect(
    page.getByRole('gridcell', { name: 'row 1, column 3, empty' }),
  ).toBeFocused();
});

test('ArrowUp keydown wraps focus around the column edge', async ({ page }) => {
  await page.getByRole('gridcell', { name: 'row 1, column 1, empty' }).focus();

  await page.keyboard.press('ArrowUp'); // 0 -> 6 (wraps)

  // nextFocusIndex(0, 'ArrowUp') === 6 -> row 3, column 1.
  await expect(
    page.getByRole('gridcell', { name: 'row 3, column 1, empty' }),
  ).toBeFocused();
});
