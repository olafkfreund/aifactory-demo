// AC#14: The game still works exactly as before with a mouse.
//
// This exercises games/tictactoe/index.html purely through mouse clicks:
// clicking cells places marks, turns alternate between X and O, a completed
// line is detected as a win, and the New game button resets the board.
//
// The page is a static HTML file that loads game.js via a relative <script>
// tag, so we load it directly from disk over a file:// URL (no dev server).

import { test, expect, type Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';

// tests/e2e/mouse-play.spec.ts -> ../../.worktree/games/tictactoe/index.html
const GAME_HTML = pathToFileURL(
  path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
).href;

// Cells expose an accessible name of "row R, column C, <contents>".
// Empty cells read "row R, column C, empty"; a played cell reads the mark.
function cellName(row: number, col: number, contents: string) {
  return `row ${row}, column ${col}, ${contents}`;
}

// Click the still-empty cell at (row, col) via its role + accessible name.
async function clickEmptyCell(page: Page, row: number, col: number) {
  await page
    .getByRole('gridcell', { name: cellName(row, col, 'empty') })
    .click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(GAME_HTML);
  // Board renders on load; the status region shows whose turn it is.
  await expect(page.getByRole('status')).toHaveText("X's turn");
});

test('clicking a cell with the mouse places a mark and passes the turn', async ({
  page,
}) => {
  await clickEmptyCell(page, 1, 1);

  // The clicked cell now carries the X mark in its accessible name...
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 1, 'X') }),
  ).toBeVisible();
  // ...and its visible text is the mark itself.
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 1, 'X') }),
  ).toHaveText('X');

  // Turn passes from X to O.
  await expect(page.getByRole('status')).toHaveText("O's turn");
});

test('turns alternate X, O, X across successive mouse clicks', async ({
  page,
}) => {
  await clickEmptyCell(page, 1, 1); // X
  await expect(page.getByRole('status')).toHaveText("O's turn");

  await clickEmptyCell(page, 1, 2); // O
  await expect(page.getByRole('status')).toHaveText("X's turn");

  await clickEmptyCell(page, 1, 3); // X
  await expect(page.getByRole('status')).toHaveText("O's turn");

  await expect(
    page.getByRole('gridcell', { name: cellName(1, 1, 'X') }),
  ).toHaveText('X');
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 2, 'O') }),
  ).toHaveText('O');
  await expect(
    page.getByRole('gridcell', { name: cellName(1, 3, 'X') }),
  ).toHaveText('X');
});

test('completing a line with the mouse is detected as a win', async ({
  page,
}) => {
  // X takes the whole top row; O plays harmlessly in the middle row.
  await clickEmptyCell(page, 1, 1); // X (0)
  await clickEmptyCell(page, 2, 1); // O (3)
  await clickEmptyCell(page, 1, 2); // X (1)
  await clickEmptyCell(page, 2, 2); // O (4)
  await clickEmptyCell(page, 1, 3); // X (2) -> X completes row 1

  await expect(page.getByRole('status')).toHaveText('X wins!');
});

test('New game button resets the board after a mouse-played game', async ({
  page,
}) => {
  // Play a couple of moves, then reset.
  await clickEmptyCell(page, 1, 1); // X
  await clickEmptyCell(page, 1, 2); // O

  await page.getByRole('button', { name: 'New game' }).click();

  // Back to a fresh game: X to move again.
  await expect(page.getByRole('status')).toHaveText("X's turn");

  // Every cell is empty once more.
  const cells = page.getByRole('gridcell');
  await expect(cells).toHaveCount(9);
  for (let row = 1; row <= 3; row++) {
    for (let col = 1; col <= 3; col++) {
      await expect(
        page.getByRole('gridcell', { name: cellName(row, col, 'empty') }),
      ).toHaveText('');
    }
  }
});
