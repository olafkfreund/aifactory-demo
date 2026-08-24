// AC#14: The game still works exactly as before with a mouse.
//
// Target: games/tictactoe/index.html::TicTacToeUI
//
// These tests drive the game entirely through mouse clicks (no keyboard). Clicking
// an empty cell places the current player's mark, alternates the active player,
// ignores clicks on already-occupied cells, and detects a win — exactly the
// pre-accessibility behaviour.

import { test, expect, Page } from '@playwright/test';
import path from 'path';
import { pathToFileURL } from 'url';

const GAME_URL = pathToFileURL(
  path.join(__dirname, '..', '..', 'games', 'tictactoe', 'index.html'),
).href;

// Accessible-name helper: each cell's name is "row R, column C, <contents>".
function cellName(row: number, col: number, contents: string): string {
  return `row ${row}, column ${col}, ${contents}`;
}

test.beforeEach(async ({ page }: { page: Page }) => {
  await page.goto(GAME_URL);
  // The grid is rendered by JS on DOMContentLoaded; wait for the first cell.
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 1, 'empty') }),
  ).toBeVisible();
});

test('clicking an empty cell with the mouse places a mark', async ({ page }) => {
  await page.getByRole('gridcell', { name: cellName(1, 1, 'empty') }).click();

  // Cell 0 (row 1, column 1) now holds X — display and accessible name update.
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 1, 'X') }),
  ).toBeVisible();
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 1, 'X') }),
  ).toHaveText('X');

  // Turn advances to O, confirming a real move was made.
  await expect(page.getByText('Turn: O')).toBeVisible();
});

test('mouse clicks alternate players X then O', async ({ page }) => {
  // X clicks cell 0 (row 1, col 1)
  await page.getByRole('gridcell', { name: cellName(1, 1, 'empty') }).click();
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 1, 'X') }),
  ).toHaveText('X');
  await expect(page.getByText('Turn: O')).toBeVisible();

  // O clicks cell 4 (row 2, col 2)
  await page.getByRole('gridcell', { name: cellName(2, 2, 'empty') }).click();
  await expect(
    page.getByRole('gridcell', { name: cellName(2, 2, 'O') }),
  ).toHaveText('O');
  await expect(page.getByText('Turn: X')).toBeVisible();
});

test('clicking an occupied cell does not change it or the turn', async ({ page }) => {
  // X takes cell 0.
  await page.getByRole('gridcell', { name: cellName(1, 1, 'empty') }).click();
  await expect(page.getByText('Turn: O')).toBeVisible();

  // O clicks the same occupied cell — should be ignored.
  await page.getByRole('gridcell', { name: cellName(1, 1, 'X') }).click();

  // Cell still holds X, and it is still O's turn.
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 1, 'X') }),
  ).toHaveText('X');
  await expect(page.getByText('Turn: O')).toBeVisible();
});

test('a full game played with the mouse detects a win (X wins top row)', async ({
  page,
}) => {
  // Move sequence (all mouse clicks):
  //   X: cell 0 (row 1, col 1)
  //   O: cell 3 (row 2, col 1)
  //   X: cell 1 (row 1, col 2)
  //   O: cell 4 (row 2, col 2)
  //   X: cell 2 (row 1, col 3)  => X completes the top row and wins.

  await page.getByRole('gridcell', { name: cellName(1, 1, 'empty') }).click();
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 1, 'X') }),
  ).toHaveText('X');

  await page.getByRole('gridcell', { name: cellName(2, 1, 'empty') }).click();
  await expect(
    page.getByRole('gridcell', { name: cellName(2, 1, 'O') }),
  ).toHaveText('O');

  await page.getByRole('gridcell', { name: cellName(1, 2, 'empty') }).click();
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 2, 'X') }),
  ).toHaveText('X');

  await page.getByRole('gridcell', { name: cellName(2, 2, 'empty') }).click();
  await expect(
    page.getByRole('gridcell', { name: cellName(2, 2, 'O') }),
  ).toHaveText('O');

  await page.getByRole('gridcell', { name: cellName(1, 3, 'empty') }).click();
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 3, 'X') }),
  ).toHaveText('X');

  // The win is detected from mouse play alone.
  await expect(page.getByText('X wins!')).toBeVisible();
});
