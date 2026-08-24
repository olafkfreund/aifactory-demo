// AC#6: Two-player mode still works unchanged when the toggle is off.
//
// With the "Play vs Computer (O)" toggle OFF (its default, unchecked state),
// every mark on the board must come from a human click and the marks must
// alternate strictly X, O, X, O, ... The computer must NOT auto-respond:
// after a human plays X, it stays O's turn until a human clicks again, and
// exactly one new mark appears per click (no extra AI-placed mark).

import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';

// The app is a static HTML page in the worktree next to this spec's repo copy.
// tests/e2e/ -> spec_dir -> .worktree/games/tictactoe/index.html
const INDEX_HTML = path.resolve(
  __dirname,
  '..',
  '..',
  '.worktree',
  'games',
  'tictactoe',
  'index.html',
);
const APP_URL = pathToFileURL(INDEX_HTML).href;

// Cells expose accessible names "Cell 1" .. "Cell 9" (1-indexed).
const cell = (page, index1: number) =>
  page.getByRole('button', { name: `Cell ${index1}` });

test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
});

test('toggle off: moves alternate X/O purely from human clicks', async ({ page }) => {
  const toggle = page.getByRole('checkbox', { name: 'Play vs Computer (O)' });
  const status = page.getByRole('status');

  // The toggle is off by default: two-player mode.
  await expect(toggle).not.toBeChecked();
  await expect(status).toHaveText("X's turn");

  // Human plays X in cell 1. It must remain O's turn (no auto AI move).
  await cell(page, 1).click();
  await expect(cell(page, 1)).toHaveText('X');
  await expect(status).toHaveText("O's turn");

  // Human plays O in cell 2 -> back to X's turn.
  await cell(page, 2).click();
  await expect(cell(page, 2)).toHaveText('O');
  await expect(status).toHaveText("X's turn");

  // Human plays X in cell 3 -> O's turn.
  await cell(page, 3).click();
  await expect(cell(page, 3)).toHaveText('X');
  await expect(status).toHaveText("O's turn");

  // Exactly 3 marks were placed by 3 clicks: no computer auto-response added
  // a 4th mark. Assert the full board state cell-by-cell.
  await expect(cell(page, 1)).toHaveText('X');
  await expect(cell(page, 2)).toHaveText('O');
  await expect(cell(page, 3)).toHaveText('X');
  for (let i = 4; i <= 9; i++) {
    await expect(cell(page, i)).toHaveText('');
  }
});

test('toggle off: no AI move fires when it becomes O\'s turn', async ({ page }) => {
  const toggle = page.getByRole('checkbox', { name: 'Play vs Computer (O)' });
  const status = page.getByRole('status');

  await expect(toggle).not.toBeChecked();

  // Play X in the centre (cell 5) — the AI would take this on an empty board,
  // but with the toggle off it is a human move and O must not auto-respond.
  await cell(page, 5).click();
  await expect(cell(page, 5)).toHaveText('X');
  await expect(status).toHaveText("O's turn");

  // Give the page room to (incorrectly) auto-move, then confirm it did not:
  // all other cells stay empty and it is still O's turn.
  await expect(status).toHaveText("O's turn");
  for (let i = 1; i <= 9; i++) {
    if (i === 5) continue;
    await expect(cell(page, i)).toHaveText('');
  }
});
