// Spec: "Make the game keyboard-playable and screen-reader friendly, verified with axe".
// Rationale (from spec source, beyond the explicit AC list, still in scope):
//   An axe accessibility scan of the loaded game page must report NO violations,
//   confirming the page is screen-reader friendly.
//
// This test loads games/tictactoe/index.html, waits for the grid (built on
// DOMContentLoaded by TicTacToeUI) to render, then runs an axe-core scan and
// asserts that zero accessibility violations are found.

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as path from 'path';
import { pathToFileURL } from 'url';

// The game page under test. Resolve relative to this spec so the test is
// robust to the runner's working directory.
const GAME_URL = pathToFileURL(
  path.join(__dirname, '..', '..', 'games', 'tictactoe', 'index.html'),
).toString();

test.describe('TicTacToeUI accessibility (axe)', () => {
  test('the loaded game page reports no axe violations', async ({ page }) => {
    await page.goto(GAME_URL);

    // TicTacToeUI builds the nine gridcell buttons on DOMContentLoaded.
    // Wait for the grid to be populated before scanning so axe sees the
    // real, interactive markup a screen-reader user would encounter.
    await expect(page.getByRole('grid')).toBeVisible();
    await expect(page.getByRole('gridcell')).toHaveCount(9);

    const results = await new AxeBuilder({ page }).analyze();

    // Attach the axe report for debugging when the assertion fails.
    await test.info().attach('axe-results.json', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });

    expect(results.violations).toEqual([]);
  });
});
