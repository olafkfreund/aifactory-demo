// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// This browser test drives games/tictactoe/index.html to a real X win on the
// top row (cells 0,1,2) and proves two user-visible outcomes of render():
//   1. the three cells of the winning line receive the `.win` highlight class, and
//   2. the status region announces the winner ("X wins!").
//
// Target: games/tictactoe/index.html::render

import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

// The runner has no dev server for this static, build-free game, so the page is
// loaded straight from disk (AC#1: opens directly in a browser, no server).
// Resolve games/tictactoe/index.html across the layouts the executor may use.
function resolveGameUrl(): string {
  const candidates = [
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(process.cwd(), 'games/tictactoe/index.html'),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error(
      `Could not locate games/tictactoe/index.html. Tried:\n${candidates.join('\n')}`,
    );
  }
  return pathToFileURL(found).href;
}

// Cells are <button aria-label="Cell N"> where N = index + 1.
function cell(page: Page, index: number) {
  return page.getByRole('button', { name: `Cell ${index + 1}` });
}

// Play X into cells 0,1,2 (top row) while O answers in the middle row.
// Click order by index: X0, O3, X1, O4, X2 -> X wins on line [0,1,2].
const WINNING_LINE = [0, 1, 2];

test.beforeEach(async ({ page }) => {
  await page.goto(resolveGameUrl());
  await expect(cell(page, 0)).toBeVisible();
});

test('top-row X win marks the winning line and announces the winner', async ({ page }) => {
  for (const index of [0, 3, 1, 4, 2]) {
    await cell(page, index).click();
  }

  // Status region announces the winner (role="status", aria-live="polite").
  await expect(page.getByRole('status')).toHaveText('X wins!');

  // Each of the three winning cells carries the `.win` highlight class.
  for (const index of WINNING_LINE) {
    await expect(cell(page, index)).toHaveClass(/\bwin\b/);
  }
});

test('cells outside the winning line are not marked', async ({ page }) => {
  for (const index of [0, 3, 1, 4, 2]) {
    await cell(page, index).click();
  }

  await expect(page.getByRole('status')).toHaveText('X wins!');

  // Boundary: a cell that is not part of line [0,1,2] must NOT get `.win`.
  for (const index of [3, 4, 5, 6, 7, 8]) {
    await expect(cell(page, index)).not.toHaveClass(/\bwin\b/);
  }
});
