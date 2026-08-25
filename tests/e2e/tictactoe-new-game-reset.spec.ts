// AC#7: A "New game" control resets to an empty board with X to move.
//
// This test drives games/tictactoe/index.html in a real browser: it plays a
// deterministic game to a decided state (top-row X win, which paints the
// winning line) so there is real state to clear, then clicks the "New game"
// control and asserts the board is empty, the win highlights are gone, and the
// status reads "X's turn".
import { test, expect, type Page } from '@playwright/test';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// Resolve the file:// URL of the game under test. No server/build is involved
// (AC#1), so we open index.html directly. Allow an env override, then fall
// back to the known repo locations relative to this spec.
function resolveIndexUrl(): string {
  if (process.env.TICTACTOE_URL) {
    return process.env.TICTACTOE_URL;
  }
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../.worktree/games/tictactoe/index.html'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return pathToFileURL(candidate).href;
    }
  }
  throw new Error(
    'Could not locate games/tictactoe/index.html; set TICTACTOE_URL to override.',
  );
}

const INDEX_URL = resolveIndexUrl();

// Deterministic playthrough: X takes the top row (0,1,2) and wins; O plays 3,4.
const WINNING_MOVES = [0, 3, 1, 4, 2];

async function playToXWin(page: Page): Promise<void> {
  const cells = page.getByRole('gridcell');
  for (const index of WINNING_MOVES) {
    await cells.nth(index).click();
  }
}

test('New game resets to an empty board with X to move', async ({ page }) => {
  await page.goto(INDEX_URL);

  const status = page.getByRole('status');
  const cells = page.getByRole('gridcell');
  // TODO(reviewer): the winning-line highlight has no role/testid, so the
  // ".cell.win" CSS locator is the only handle for it.
  const winningCells = page.locator('.cell.win');

  // Precondition: reach a decided game so there is real state to reset.
  await playToXWin(page);
  await expect(status).toHaveText('X wins!');
  await expect(winningCells).toHaveCount(3);

  // Act: reset via the New game control.
  await page.getByRole('button', { name: 'New game' }).click();

  // AC#7: every cell is cleared...
  await expect(cells).toHaveText(['', '', '', '', '', '', '', '', '']);
  // ...the winning-line highlight is removed...
  await expect(winningCells).toHaveCount(0);
  // ...and it is X's turn again.
  await expect(status).toHaveText("X's turn");
});
