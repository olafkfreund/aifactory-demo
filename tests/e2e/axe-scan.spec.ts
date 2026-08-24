// Spec: Make the game keyboard-playable and screen-reader friendly, verified with axe.
// Subtask axe-no-violations: an axe-core accessibility scan of the loaded
// game page (games/tictactoe/index.html::main) must report no violations.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as path from 'path';
import { pathToFileURL } from 'url';

const GAME_URL = pathToFileURL(
  path.resolve(__dirname, '../../games/tictactoe/index.html'),
).href;

test.describe('Tic-Tac-Toe accessibility (axe)', () => {
  test('axe-core reports no accessibility violations on the game page', async ({
    page,
  }) => {
    await page.goto(GAME_URL);

    // Wait for the board to render so axe scans the fully-built page.
    await expect(page.getByRole('grid', { name: 'Tic-Tac-Toe board' })).toBeVisible();
    await expect(page.getByRole('gridcell')).toHaveCount(9);

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
});
