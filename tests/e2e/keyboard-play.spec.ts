// AC#10: Enter and Space place a mark on the focused cell, so a full game is
// playable with the keyboard alone.
//
// Target: games/tictactoe/index.html::TicTacToeUI
//
// These tests drive the game entirely through the keyboard. Focus starts on the
// first cell; arrow keys move the roving focus (handled by nextFocusIndex) and
// Enter / Space place the current player's mark on the focused cell. A complete
// game is played to an X win without a single mouse interaction.

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
  // Move keyboard focus onto the roving-tabindex cell (index 0).
  await page.getByRole('gridcell', { name: cellName(1, 1, 'empty') }).focus();
});

test('Enter places a mark on the focused cell', async ({ page }) => {
  await page.keyboard.press('Enter');

  // Cell 0 (row 1, column 1) now holds X — its accessible name updates.
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 1, 'X') }),
  ).toBeVisible();
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 1, 'X') }),
  ).toHaveText('X');

  // Turn advances to O, confirming a real move was made.
  await expect(page.getByText('Turn: O')).toBeVisible();
});

test('Space places a mark on the focused cell', async ({ page }) => {
  await page.keyboard.press('Space');

  await expect(
    page.getByRole('gridcell', { name: cellName(1, 1, 'X') }),
  ).toBeVisible();
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 1, 'X') }),
  ).toHaveText('X');

  await expect(page.getByText('Turn: O')).toBeVisible();
});

test('a full game is playable with the keyboard alone (X wins top row)', async ({
  page,
}) => {
  // Move sequence, focus starts on cell 0 (row 1, col 1):
  //   X: cell 0  (Enter)
  //   O: cell 3  (ArrowDown -> Space)
  //   X: cell 1  (ArrowUp, ArrowRight -> Enter)
  //   O: cell 4  (ArrowDown -> Space)
  //   X: cell 2  (ArrowUp, ArrowRight -> Enter)  => X wins the top row.

  // Turn 1 — X on cell 0
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 1, 'X') }),
  ).toHaveText('X');

  // Turn 2 — O on cell 3
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('gridcell', { name: cellName(2, 1, 'O') }),
  ).toHaveText('O');

  // Turn 3 — X on cell 1
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 2, 'X') }),
  ).toHaveText('X');

  // Turn 4 — O on cell 4
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('gridcell', { name: cellName(2, 2, 'O') }),
  ).toHaveText('O');

  // Turn 5 — X on cell 2, completing the top row
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 3, 'X') }),
  ).toHaveText('X');

  // The game is decided entirely via the keyboard: X wins.
  await expect(page.getByText('X wins!')).toBeVisible();
});
