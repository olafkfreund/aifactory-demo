import { test, expect } from '@playwright/test';

test.describe('Basic Test', () => {
  test('should load the game page', async ({ page }) => {
    await page.goto('/games/tictactoe/');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Tic Tac Toe');
  });
});
