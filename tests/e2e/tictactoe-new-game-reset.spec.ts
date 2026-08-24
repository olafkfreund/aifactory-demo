// AC#7: A "New game" control resets to an empty board with X to move.
//
// This browser test drives games/tictactoe/index.html directly over file://
// (no server, no build — see AC#1). It plays a few moves, clicks the
// "New game" button, and proves the board is cleared, every cell is
// re-enabled, and the status returns to "X's turn".

import { test, expect } from '@playwright/test';
import * as path from 'path';
import { pathToFileURL } from 'url';

// Resolve the game relative to this test file so it works from the repo root
// without a dev server. tests/e2e/ -> repo root -> games/tictactoe/index.html
const GAME_URL = pathToFileURL(
  path.join(__dirname, '..', '..', 'games', 'tictactoe', 'index.html'),
).href;

const CELL_LABELS = [
  'Cell 1',
  'Cell 2',
  'Cell 3',
  'Cell 4',
  'Cell 5',
  'Cell 6',
  'Cell 7',
  'Cell 8',
  'Cell 9',
];

test.describe('AC#7: New game button resets the board', () => {
  test('clears all cells, re-enables them, and returns status to X\'s turn', async ({ page }) => {
    await page.goto(GAME_URL);

    const status = page.getByRole('status');
    const newGame = page.getByRole('button', { name: 'New game' });

    // Sanity: a fresh game starts on X's turn.
    await expect(status).toHaveText("X's turn");

    // Play a few non-winning moves so the board is dirty before the reset.
    await page.getByRole('button', { name: 'Cell 1' }).click(); // X
    await page.getByRole('button', { name: 'Cell 2' }).click(); // O
    await page.getByRole('button', { name: 'Cell 3' }).click(); // X

    // The board now holds marks and it is O's turn — confirm we changed state.
    await expect(page.getByRole('button', { name: 'Cell 1' })).toHaveText('X');
    await expect(page.getByRole('button', { name: 'Cell 2' })).toHaveText('O');
    await expect(status).toHaveText("O's turn");

    // Reset.
    await newGame.click();

    // Every one of the 9 cells is empty and re-enabled.
    for (const label of CELL_LABELS) {
      const cell = page.getByRole('button', { name: label });
      await expect(cell).toHaveText('');
      await expect(cell).toBeEnabled();
    }

    // Status is back to X to move.
    await expect(status).toHaveText("X's turn");
  });
});
