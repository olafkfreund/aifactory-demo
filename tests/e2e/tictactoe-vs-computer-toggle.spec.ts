// AC#5: The toggle works in the browser and the computer responds within a second.
//
// This browser test enables the "Play vs Computer (O)" toggle, makes a human
// (X) move, and proves the AI plays an automatic O move in response within one
// second (1000 ms). The one-second bound is enforced as an assertion timeout so
// a slow (or missing) AI response fails the test rather than hanging.
//
// Target: games/tictactoe/index.html::vs-computer

import { test, expect, type Page, type Locator } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// The game is a static page that loads game.js via a relative <script src>.
// Resolve it to a file:// URL so the test is self-contained (no dev server).
const GAME_PAGE_URL = pathToFileURL(
  path.resolve(__dirname, '../../games/tictactoe/index.html'),
).href;

// The AI must respond within one second.
const AI_RESPONSE_BUDGET_MS = 1000;

function vsComputerToggle(page: Page): Locator {
  return page.getByRole('checkbox', { name: 'Play vs Computer (O)' });
}

// A board cell by its 1-based label ("Cell 1".."Cell 9").
function cell(page: Page, oneBasedIndex: number): Locator {
  return page.getByRole('button', { name: `Cell ${oneBasedIndex}` });
}

// All board cells currently showing the given mark. The accessible name stays
// "Cell N" (from aria-label) even after a mark is placed, so we filter by the
// visible text content instead.
function cellsWithMark(page: Page, mark: 'X' | 'O'): Locator {
  return page
    .getByRole('button', { name: /^Cell \d$/ })
    .filter({ hasText: mark });
}

test.beforeEach(async ({ page }) => {
  await page.goto(GAME_PAGE_URL);
  await expect(page.getByRole('heading', { name: 'Tic-Tac-Toe' })).toBeVisible();
});

test('enabling the toggle makes the computer (O) respond within one second', async ({
  page,
}) => {
  const toggle = vsComputerToggle(page);

  // The toggle works in the browser: it can be enabled.
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await expect(toggle).toBeChecked();

  // Human plays X into a corner.
  await cell(page, 1).click();
  await expect(cellsWithMark(page, 'X')).toHaveCount(1);

  // The computer must place an O automatically within one second.
  await expect(cellsWithMark(page, 'O')).toHaveCount(1, {
    timeout: AI_RESPONSE_BUDGET_MS,
  });
});

test('the computer does not move until the human moves first', async ({
  page,
}) => {
  const toggle = vsComputerToggle(page);

  // Enabling the toggle on an empty board (X to move) must not make O move,
  // since it is the human's turn.
  await toggle.check();
  await expect(toggle).toBeChecked();
  await expect(cellsWithMark(page, 'O')).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText("X's turn");

  // After the human's X move, the AI's O appears within one second.
  await cell(page, 5).click();
  await expect(cellsWithMark(page, 'O')).toHaveCount(1, {
    timeout: AI_RESPONSE_BUDGET_MS,
  });
});
