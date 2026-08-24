// AC#8: The grid uses a roving tabindex: exactly one cell has tabindex="0"
// and the other eight have tabindex="-1" at any time.
//
// This suite proves the invariant holds BOTH initially (right after the grid
// renders) AND after arrow-key focus movement, exercising
// games/tictactoe/index.html::TicTacToeUI.

import { test, expect, Locator } from '@playwright/test';
import * as path from 'path';
import { pathToFileURL } from 'url';

// The static game page. In the project layout `tests/` and `games/` are
// siblings (see test_plan files_to_create), so resolve relative to this file.
const GAME_URL = pathToFileURL(
  path.resolve(__dirname, '../../games/tictactoe/index.html'),
).href;

/**
 * Read the `tabindex` attribute of every grid cell in DOM order.
 */
async function readTabindexes(cells: Locator): Promise<Array<string | null>> {
  return cells.evaluateAll((els) =>
    els.map((el) => el.getAttribute('tabindex')),
  );
}

/**
 * Assert the roving-tabindex invariant: exactly one cell "0", eight cells "-1".
 */
function expectRovingInvariant(tabindexes: Array<string | null>): void {
  expect(tabindexes.length).toBe(9);
  expect(tabindexes.filter((t) => t === '0').length).toBe(1);
  expect(tabindexes.filter((t) => t === '-1').length).toBe(8);
}

test.beforeEach(async ({ page }) => {
  await page.goto(GAME_URL);
  // Auto-wait for the grid to be populated with all nine gridcell buttons.
  await expect(page.getByRole('gridcell')).toHaveCount(9);
});

test('exactly one cell has tabindex=0 and eight have tabindex=-1 initially', async ({
  page,
}) => {
  const cells = page.getByRole('gridcell');

  const tabindexes = await readTabindexes(cells);
  expectRovingInvariant(tabindexes);

  // The single tabbable cell is the first one on load.
  expect(tabindexes[0]).toBe('0');
});

test('roving-tabindex invariant is preserved after arrow-key focus movement', async ({
  page,
}) => {
  const cells = page.getByRole('gridcell');

  // Start from the tabbable cell, then navigate with the keyboard.
  await cells.nth(0).focus();
  await page.keyboard.press('ArrowRight');

  // Focus (and therefore the single tabindex=0) should have moved to cell 1.
  await expect(cells.nth(1)).toBeFocused();

  const afterRight = await readTabindexes(cells);
  expectRovingInvariant(afterRight);
  expect(afterRight[1]).toBe('0');
  expect(afterRight[0]).toBe('-1');

  // Move again (ArrowDown from 1 -> 4) and re-check the invariant still holds.
  await page.keyboard.press('ArrowDown');
  await expect(cells.nth(4)).toBeFocused();

  const afterDown = await readTabindexes(cells);
  expectRovingInvariant(afterDown);
  expect(afterDown[4]).toBe('0');
});
