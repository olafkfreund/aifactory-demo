// AC#1: Opening games/tictactoe/index.html directly in a browser gives a
// playable game — no server, no build. This suite loads the page over the
// file:// protocol (proving no HTTP server is required), asserts a 9-cell
// board renders, and confirms X can place a mark with no build step.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// Resolve games/tictactoe/index.html relative to the repo root.
// This spec lives at <repo>/tests/e2e/, so the repo root is two levels up.
const indexHtmlPath = path.resolve(__dirname, '..', '..', 'games', 'tictactoe', 'index.html');
const fileUrl = pathToFileURL(indexHtmlPath).href;

test.describe('tic-tac-toe playable over file:// (no server, no build)', () => {
  test('renders a 9-cell board when loaded directly via file://', async ({ page }) => {
    // No web server, no build step — navigate straight to the file on disk.
    expect(fileUrl.startsWith('file://')).toBe(true);
    await page.goto(fileUrl);

    // The board is composed of 9 clickable cells.
    const cells = page.locator('#board .cell');
    await expect(cells).toHaveCount(9);

    // A freshly loaded game is X's turn.
    await expect(page.getByRole('status')).toHaveText("X's turn");
  });

  test('clicking an empty cell lets X place a mark with no server or build', async ({ page }) => {
    await page.goto(fileUrl);

    const firstCell = page.getByRole('button', { name: 'Cell 1' });
    await expect(firstCell).toHaveText('');

    await firstCell.click();

    // X's mark now occupies the clicked cell and the turn passes to O.
    await expect(firstCell).toHaveText('X');
    await expect(page.getByRole('status')).toHaveText("O's turn");
  });
});
