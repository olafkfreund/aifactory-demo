// AC#5: A full board with no winner reports a draw.
//
// This e2e test drives games/tictactoe/index.html (opened directly via a
// file:// URL — no server, no build, per AC#1) through a complete 9-move
// playthrough that fills every cell without producing a winning line. It then
// asserts the status region reads "Draw!" and that no cell carries the .win
// class (no winning line is highlighted on a draw).
//
// Final board (row-major):
//   X O X
//   X O O
//   O X X
// No row, column, or diagonal is all-X or all-O, so winner(board) === "draw".

import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

// Absolute file:// URL to the self-contained game page (../../index.html).
const GAME_URL = pathToFileURL(resolve(__dirname, '../../index.html')).href;

// Click order (cell index) that alternates X, O, X, O, … and reaches a full
// board with no winner and no premature win at any intermediate step.
// X takes cells 0, 2, 3, 7, 8; O takes cells 1, 4, 5, 6.
const DRAW_CLICK_ORDER = [0, 1, 2, 4, 3, 5, 7, 6, 8];

test('full-board no-winner playthrough shows Draw! and highlights no cell', async ({ page }) => {
  await page.goto(GAME_URL);

  const cells = page.getByRole('gridcell');
  await expect(cells).toHaveCount(9);

  for (const index of DRAW_CLICK_ORDER) {
    await cells.nth(index).click(); // TODO: index-based grid click; cells are a 3x3 board with no unique accessible names until marked
  }

  // AC#5: the board is full with no winner → status reports a draw.
  await expect(page.getByRole('status')).toHaveText('Draw!');

  // A draw has no winning line, so no cell carries the .win class.
  await expect(page.locator('.cell.win')).toHaveCount(0); // TODO: .win is the app's winning-line marker class
});
