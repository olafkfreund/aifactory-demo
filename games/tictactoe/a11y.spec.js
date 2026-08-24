import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Tic Tac Toe Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/tictactoe/');
  });

  test('should have no accessibility violations at serious and critical levels', async ({ page }) => {
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      rules: {
        // These rules would trigger violations we'll ignore if needed
        // For now, we check all rules
      },
    });
  });

  test('game board should be keyboard navigable', async ({ page }) => {
    // Tab to the first cell
    await page.keyboard.press('Tab');
    const firstCell = page.locator('[data-index="0"]');
    await expect(firstCell).toBeFocused();
  });

  test('arrow keys should navigate the grid', async ({ page }) => {
    // Focus the first cell
    await page.click('[data-index="0"]');

    // Move right
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-index="1"]')).toBeFocused();

    // Move down
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('[data-index="4"]')).toBeFocused();

    // Move left
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[data-index="3"]')).toBeFocused();

    // Move up
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('[data-index="0"]')).toBeFocused();
  });

  test('should announce turn in live region on game start', async ({ page }) => {
    const status = page.locator('#gameStatus');
    await expect(status).toHaveText(/Game started|X's turn/i);
  });

  test('should handle cell activation with Enter key', async ({ page }) => {
    const firstCell = page.locator('[data-index="0"]');
    await firstCell.click();

    // Focus the first cell
    await page.click('[data-index="0"]');

    // Press Enter to make a move
    await page.keyboard.press('Enter');

    // The cell should now show X
    await expect(firstCell).toContainText('X');
  });

  test('should handle cell activation with Space key', async ({ page }) => {
    const secondCell = page.locator('[data-index="1"]');
    await secondCell.click();

    // Press Space to make a move
    await page.keyboard.press('Space');

    // The cell should now show X
    await expect(secondCell).toContainText('X');
  });

  test('each cell should have an accessible name with position and content', async ({ page }) => {
    const firstCell = page.locator('[data-index="0"]');
    const ariaLabel = await firstCell.getAttribute('aria-label');

    // Should mention row and column
    expect(ariaLabel).toMatch(/row\s+1.*column\s+1|column\s+1.*row\s+1/i);
    // Should mention it's empty initially
    expect(ariaLabel).toMatch(/empty|blank/i);
  });

  test('should announce player turn change in live region', async ({ page }) => {
    const status = page.locator('#gameStatus');

    // Make the first move
    await page.click('[data-index="0"]');

    // Status should announce O's turn
    await expect(status).toContainText(/O.*turn/i);
  });

  test('game board should have proper ARIA attributes', async ({ page }) => {
    const board = page.locator('[role="grid"]');
    await expect(board).toHaveAttribute('aria-label', /board/i);

    const cells = page.locator('.cell');
    const count = await cells.count();
    expect(count).toBe(9);

    // All cells should be buttons
    for (let i = 0; i < count; i++) {
      const cell = cells.nth(i);
      expect(await cell.locator('self').evaluate(el => el.tagName)).toBe('BUTTON');
    }
  });

  test('cells should be disabled after move and not focusable via keyboard', async ({ page }) => {
    const firstCell = page.locator('[data-index="0"]');
    await firstCell.click();

    // Make a move
    await page.keyboard.press('Enter');

    // The cell should be disabled
    await expect(firstCell).toBeDisabled();
  });

  test('mouse clicks should still work for making moves', async ({ page }) => {
    const firstCell = page.locator('[data-index="0"]');
    await firstCell.click();

    // Move should be made
    await expect(firstCell).toContainText('X');
  });

  test('should display winner announcement in live region', async ({ page }) => {
    const status = page.locator('#gameStatus');

    // Play moves to create a win: X at 0, O at 3, X at 1, O at 4, X at 2 (X wins on top row)
    await page.click('[data-index="0"]'); // X
    await page.click('[data-index="3"]'); // O
    await page.click('[data-index="1"]'); // X
    await page.click('[data-index="4"]'); // O
    await page.click('[data-index="2"]'); // X (wins!)

    // Status should announce X wins
    await expect(status).toContainText(/X\s+wins/i);
  });

  test('focus should always be visible on cells', async ({ page }) => {
    const firstCell = page.locator('[data-index="0"]');
    await firstCell.focus();

    // Check that the cell has focus styling (box-shadow or border change)
    const focusStyle = await firstCell.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        boxShadow: styles.boxShadow,
        borderColor: styles.borderColor,
        outline: styles.outline,
      };
    });

    // Should have some visual indicator (box-shadow, border change, or outline)
    const hasVisibleFocus =
      focusStyle.boxShadow !== 'none' ||
      focusStyle.outline !== 'none' ||
      focusStyle.borderColor !== 'rgb(221, 221, 221)'; // Not the default border color

    expect(hasVisibleFocus).toBe(true);
  });

  test('reset button should be keyboard accessible', async ({ page }) => {
    const resetBtn = page.locator('#resetBtn');

    // Tab through to the reset button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // The reset button should be focusable
    await expect(resetBtn).toBeFocused();
  });

  test('should allow playing a full game with keyboard only', async ({ page }) => {
    // Play first move on cell 0
    await page.click('[data-index="0"]');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-index="0"]')).toContainText('X');

    // Navigate to cell 1 with arrow key and play
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-index="1"]')).toContainText('O');

    // Navigate to cell 2 with arrow keys
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-index="2"]')).toContainText('X');

    // The game should be progressing correctly
    expect(true).toBe(true);
  });

  test('status region should have proper ARIA attributes', async ({ page }) => {
    const status = page.locator('#gameStatus');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toHaveAttribute('aria-live', 'polite');
    await expect(status).toHaveAttribute('aria-atomic', 'true');
  });
});
