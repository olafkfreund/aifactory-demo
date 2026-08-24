// AC#10: Enter and Space place a mark on the focused cell, so a full game is
// playable with the keyboard alone.
//
// The board renders nine native <button role="gridcell"> elements. Enter and
// Space are not navigation keys, so they fall through the grid keydown handler
// to native button activation, which places a mark on the focused cell. These
// tests drive the game with the keyboard only (Tab to focus, arrows to move,
// Enter/Space to place) and confirm a complete game can be won that way.

import { test, expect, Page, Locator } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const GAME_URL = pathToFileURL(
  path.resolve(__dirname, '../../games/tictactoe/index.html'),
).href;

// Cell index -> its nine gridcell buttons, in DOM (row-major) order.
function cells(page: Page): Locator {
  return page.getByRole('gridcell');
}

// Move keyboard focus onto the grid. The first Tab lands on the single cell
// carrying tabindex="0" (the roving-tabindex entry point, index 0).
async function focusBoard(page: Page): Promise<void> {
  await page.keyboard.press('Tab');
  await expect(cells(page).nth(0)).toBeFocused();
}

test.beforeEach(async ({ page }) => {
  await page.goto(GAME_URL);
  await expect(cells(page)).toHaveCount(9);
});

test('Enter places a mark on the focused cell', async ({ page }) => {
  await focusBoard(page);

  await page.keyboard.press('Enter');

  // X moves first, so the focused cell (index 0) becomes X and the turn passes.
  await expect(cells(page).nth(0)).toHaveText('X');
  await expect(page.getByRole('status')).toHaveText("O's turn");
});

test('Space places a mark on the focused cell', async ({ page }) => {
  await focusBoard(page);

  // X plays index 0 with Enter, then navigate to index 4 and place O with Space.
  await page.keyboard.press('Enter'); // X @ 0
  await page.keyboard.press('ArrowRight'); // focus 0 -> 1
  await page.keyboard.press('ArrowDown'); // focus 1 -> 4
  await expect(cells(page).nth(4)).toBeFocused();

  await page.keyboard.press('Space'); // O @ 4

  await expect(cells(page).nth(4)).toHaveText('O');
  await expect(page.getByRole('status')).toHaveText("X's turn");
});

test('a full game is winnable using the keyboard alone', async ({ page }) => {
  await focusBoard(page);
  const c = cells(page);

  // X wins the top row (0,1,2); O plays 3 and 4. Navigation uses arrow keys
  // only; marks are placed with Enter (X) and Space (O).
  await page.keyboard.press('Enter'); // X @ 0, focus 0

  await page.keyboard.press('ArrowDown'); // focus 0 -> 3
  await page.keyboard.press('Space'); // O @ 3, focus 3

  await page.keyboard.press('ArrowUp'); // focus 3 -> 0
  await page.keyboard.press('ArrowRight'); // focus 0 -> 1
  await page.keyboard.press('Enter'); // X @ 1, focus 1

  await page.keyboard.press('ArrowDown'); // focus 1 -> 4
  await page.keyboard.press('Space'); // O @ 4, focus 4

  await page.keyboard.press('ArrowUp'); // focus 4 -> 1
  await page.keyboard.press('ArrowRight'); // focus 1 -> 2
  await page.keyboard.press('Enter'); // X @ 2 -> X wins the top row

  await expect(c.nth(0)).toHaveText('X');
  await expect(c.nth(1)).toHaveText('X');
  await expect(c.nth(2)).toHaveText('X');
  await expect(c.nth(3)).toHaveText('O');
  await expect(c.nth(4)).toHaveText('O');
  await expect(page.getByRole('status')).toHaveText('X wins!');
});
