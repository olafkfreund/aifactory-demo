// AC#5: The toggle works in the browser and the computer responds within a second.
//
// This browser test drives the real DOM wired up by `src/main.ts::onCellClick`.
// It enables the "Play vs Computer" mode toggle, makes a single human move (X),
// and asserts the computer answers with an O on the board within one second
// (a 1000 ms assertion timeout). It also confirms the toggle really engages
// vs-ai mode by checking the turn returns to the human (X) after the AI replies.

import { test, expect, Locator, Page } from '@playwright/test';

/** The accessible name of the mode toggle checkbox (from its wrapping label). */
const TOGGLE_NAME = 'Play vs Computer';

/** Deadline for the computer's reply, in milliseconds ("within a second"). */
const AI_REPLY_DEADLINE_MS = 1000;

/** Every board cell rendered as an ARIA gridcell button. */
function boardCells(page: Page): Locator {
  return page.getByRole('gridcell');
}

/** The cells currently showing an 'O' mark (the computer's plays). */
function oCells(page: Page): Locator {
  return boardCells(page).filter({ hasText: /^O$/ });
}

/** The cells currently showing an 'X' mark (the human's plays). */
function xCells(page: Page): Locator {
  return boardCells(page).filter({ hasText: /^X$/ });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // The board should be present and empty before we begin.
  await expect(boardCells(page)).toHaveCount(9);
});

test('enabling the toggle makes the computer play O within one second of the human move', async ({
  page,
}) => {
  const toggle = page.getByRole('checkbox', { name: TOGGLE_NAME });

  // Turn on vs-computer mode.
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await expect(toggle).toBeChecked();

  // Human plays X in the first cell.
  await page.getByRole('gridcell', { name: 'Cell 1' }).click();
  await expect(xCells(page)).toHaveCount(1);

  // The computer must answer with exactly one O within one second.
  await expect(oCells(page)).toHaveCount(1, { timeout: AI_REPLY_DEADLINE_MS });

  // After X then the computer's O, it is the human's (X's) turn again.
  await expect(page.getByRole('status')).toHaveText('X to move', {
    timeout: AI_REPLY_DEADLINE_MS,
  });
});

test('with the toggle off no computer O appears after the human move (two-player)', async ({
  page,
}) => {
  const toggle = page.getByRole('checkbox', { name: TOGGLE_NAME });
  await expect(toggle).not.toBeChecked();

  // Human plays X; in two-player mode the turn simply passes to O, with no
  // automatic computer move placing an O on the board.
  await page.getByRole('gridcell', { name: 'Cell 1' }).click();
  await expect(xCells(page)).toHaveCount(1);
  await expect(page.getByRole('status')).toHaveText('O to move');
  await expect(oCells(page)).toHaveCount(0);
});
