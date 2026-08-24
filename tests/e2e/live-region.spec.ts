// AC#12: The live region announces the turn change and the final result.
//
// Target: games/tictactoe/index.html -> #status
//   <div id="status" role="status" aria-live="polite"></div>
//
// The status region text is driven by render() in index.html:
//   - during play : `${currentPlayer}'s turn`  (e.g. "X's turn")
//   - on a win     : `${winner} wins!`          (e.g. "X wins!")
//   - on a draw    : "Draw!"
//
// These tests prove that the aria-live status region:
//   1. is a real live region (role="status", aria-live="polite"),
//   2. announces the turn change after a move (X's turn -> O's turn),
//   3. announces the final win result, and
//   4. announces the final draw result.

import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// The game is a static HTML file. Allow the runner to override the URL
// (e.g. when it serves the game over HTTP); otherwise load it from disk.
const GAME_FILE = path.resolve(
  __dirname,
  '../../.worktree/games/tictactoe/index.html',
);
const GAME_URL = process.env.GAME_URL ?? pathToFileURL(GAME_FILE).toString();

// Board index -> the accessible name of that cell while it is still empty.
//   0 1 2
//   3 4 5
//   6 7 8
function emptyCellName(index: number): string {
  const row = Math.floor(index / 3) + 1;
  const column = (index % 3) + 1;
  return `row ${row}, column ${column}, empty`;
}

// Place a mark on the (still-empty) cell at `index` by clicking it.
// Selecting by role + accessible name keeps the selector robust.
async function play(page: Page, index: number): Promise<void> {
  await page.getByRole('gridcell', { name: emptyCellName(index) }).click();
}

test.describe('AC#12: live region announces turn change and final result', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(GAME_URL);
  });

  test('status is a polite live region announcing the current turn', async ({
    page,
  }) => {
    const status = page.getByRole('status');
    await expect(status).toHaveAttribute('aria-live', 'polite');
    // X moves first, so the opening announcement is X's turn.
    await expect(status).toHaveText("X's turn");
  });

  test('live region announces the turn change after a move', async ({
    page,
  }) => {
    const status = page.getByRole('status');
    await expect(status).toHaveText("X's turn");

    // X plays: turn passes to O and the live region must announce it.
    await play(page, 0);
    await expect(status).toHaveText("O's turn");

    // O plays: turn passes back to X.
    await play(page, 3);
    await expect(status).toHaveText("X's turn");
  });

  test('live region announces the final win result', async ({ page }) => {
    const status = page.getByRole('status');

    // X takes the top row [0,1,2] while O plays elsewhere.
    await play(page, 0); // X
    await play(page, 3); // O
    await play(page, 1); // X
    await play(page, 4); // O
    await play(page, 2); // X wins across the top row

    await expect(status).toHaveText('X wins!');
  });

  test('live region announces the final draw result', async ({ page }) => {
    const status = page.getByRole('status');

    // A full board with no three-in-a-row:
    //   X O X
    //   X O O
    //   O X X
    await play(page, 0); // X
    await play(page, 1); // O
    await play(page, 2); // X
    await play(page, 4); // O
    await play(page, 3); // X
    await play(page, 5); // O
    await play(page, 7); // X
    await play(page, 6); // O
    await play(page, 8); // X -> board full, no winner

    await expect(status).toHaveText('Draw!');
  });
});
