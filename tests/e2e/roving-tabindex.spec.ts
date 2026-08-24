// AC#8: The grid uses a roving tabindex: exactly one cell has tabindex="0"
// and the other eight have tabindex="-1" at any time — including after
// arrow-key navigation moves focus between cells.
//
// Target: games/tictactoe/index.html::updateTabIndexes

import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';

// The game is a static HTML file; load it directly from disk so no server
// is required. index.html references game.js relatively from the same dir.
const GAME_URL = pathToFileURL(
  path.resolve(__dirname, '../../games/tictactoe/index.html'),
).href;

/**
 * Assert the roving-tabindex invariant across all nine grid cells:
 * exactly one carries tabindex="0" and the other eight carry tabindex="-1".
 */
async function expectRovingTabindex(cells: import('@playwright/test').Locator) {
  await expect(cells).toHaveCount(9);

  const tabindexes = await cells.evaluateAll((nodes) =>
    nodes.map((n) => (n as HTMLElement).getAttribute('tabindex')),
  );

  const zeros = tabindexes.filter((t) => t === '0').length;
  const negatives = tabindexes.filter((t) => t === '-1').length;

  expect(zeros).toBe(1);
  expect(negatives).toBe(8);
}

test.describe('roving tabindex invariant (AC#8)', () => {
  test('exactly one cell has tabindex=0 and eight have tabindex=-1 on load', async ({
    page,
  }) => {
    await page.goto(GAME_URL);

    const cells = page.getByRole('gridcell');
    await expect(cells.first()).toBeVisible();

    await expectRovingTabindex(cells);
  });

  test('the invariant still holds after arrow-key navigation', async ({
    page,
  }) => {
    await page.goto(GAME_URL);

    const cells = page.getByRole('gridcell');
    await expect(cells.first()).toBeVisible();

    // Move focus onto the grid, then navigate with the keyboard.
    await cells.first().focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');

    // Focus moved off cell 0, but the invariant must still be exactly 1 / 8.
    await expectRovingTabindex(cells);
  });

  test('Home and End keep exactly one cell focusable', async ({ page }) => {
    await page.goto(GAME_URL);

    const cells = page.getByRole('gridcell');
    await expect(cells.first()).toBeVisible();

    await cells.first().focus();

    await page.keyboard.press('End');
    await expectRovingTabindex(cells);

    await page.keyboard.press('Home');
    await expectRovingTabindex(cells);
  });
});
