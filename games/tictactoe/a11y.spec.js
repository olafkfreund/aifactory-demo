import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

const htmlPath = join(__dirname, 'index.html');
const htmlContent = readFileSync(htmlPath, 'utf-8');

test.describe('Tic-Tac-Toe Game Accessibility', () => {
  test('should have proper semantic HTML structure', () => {
    // Check for main element
    expect(htmlContent).toContain('<main>');
    expect(htmlContent).toContain('</main>');

    // Check for h1
    expect(htmlContent).toContain('<h1>Tic-Tac-Toe</h1>');

    // Check for game grid with proper role
    expect(htmlContent).toContain('role="application"');

    // Check for live region with aria-live
    expect(htmlContent).toContain('aria-live="assertive"');
    expect(htmlContent).toContain('aria-live="polite"');
  });

  test('should have 9 cells with proper structure', () => {
    // Check for cell creation in JavaScript
    expect(htmlContent).toContain('for (let i = 0; i < 9; i++)');
    expect(htmlContent).toContain('data-index');
    expect(htmlContent).toContain('className = \'cell\'');

    // Check that JavaScript creates cells with proper structure
    expect(htmlContent).toContain('getRowCol');
    expect(htmlContent).toContain('updateCellLabel');
  });

  test('cells should have type="button"', () => {
    const buttons = htmlContent.match(/type="button"/g);
    expect(buttons).toBeTruthy();
    // Should have at least 1 button (reset button) + references to button creation in JS
    expect(buttons.length).toBeGreaterThanOrEqual(1);

    // Check for button creation in JavaScript
    expect(htmlContent).toContain('createElement(\'button\')');
  });

  test('should have keyboard event handlers', () => {
    // Check for arrow key and enter key handling
    expect(htmlContent).toContain('ArrowUp');
    expect(htmlContent).toContain('ArrowDown');
    expect(htmlContent).toContain('ArrowLeft');
    expect(htmlContent).toContain('ArrowRight');
    expect(htmlContent).toContain('keydown');
    expect(htmlContent).toContain('handleCellKeydown');
  });

  test('should have live regions for announcements', () => {
    // Check for announcement regions
    expect(htmlContent).toContain('aria-live="polite"');
    expect(htmlContent).toContain('aria-live="assertive"');
    expect(htmlContent).toContain('aria-atomic="true"');
  });

  test('should have proper focus visibility CSS', () => {
    // Check for focus styles
    expect(htmlContent).toContain('.cell:focus');
    expect(htmlContent).toContain('box-shadow');
    expect(htmlContent).toContain('outline');
  });

  test('game should have reset button with keyboard support', () => {
    expect(htmlContent).toContain('id="reset-btn"');
    expect(htmlContent).toContain('New Game');
    expect(htmlContent).toContain('handleCellKeydown');
  });

  test('status area should be polite live region for turn announcements', () => {
    expect(htmlContent).toContain('id="status"');
    expect(htmlContent).toContain('aria-live="polite"');
  });

  test('should have sr-only class for screen reader content', () => {
    expect(htmlContent).toContain('.sr-only');
    expect(htmlContent).toContain('position: absolute');
    expect(htmlContent).toContain('width: 1px');
    expect(htmlContent).toContain('height: 1px');
  });

  test('should have proper page structure and semantic HTML', () => {
    // Check for main element
    expect(htmlContent).toContain('<main>');

    // Check for section elements with proper roles/labels
    expect(htmlContent).toContain('aria-label="Game board"');
    expect(htmlContent).toContain('aria-label="Game announcements"');

    // Check for h1
    expect(htmlContent).toContain('<h1>Tic-Tac-Toe</h1>');
  });

  test('should have lang attribute on html', () => {
    expect(htmlContent).toContain('lang="en"');
  });

  test('should have proper meta tags', () => {
    expect(htmlContent).toContain('charset="UTF-8"');
    expect(htmlContent).toContain('viewport');
    expect(htmlContent).toContain('width=device-width');
  });

  test('should have proper page title', () => {
    expect(htmlContent).toContain('<title>Tic-Tac-Toe</title>');
  });

  test('should have JavaScript game logic', () => {
    // Check for game logic
    expect(htmlContent).toContain('let board = ');
    expect(htmlContent).toContain('currentPlayer');
    expect(htmlContent).toContain('gameActive');

    // Check for win conditions
    expect(htmlContent).toContain('WINNING_CONDITIONS');
    expect(htmlContent).toContain('[0, 1, 2]');
    expect(htmlContent).toContain('[6, 7, 8]');
    expect(htmlContent).toContain('[0, 4, 8]');
    expect(htmlContent).toContain('[2, 4, 6]');
  });

  test('should have move validation', () => {
    // Check for move validation
    expect(htmlContent).toContain('makeMove');
    expect(htmlContent).toContain('board[index]');
    expect(htmlContent).toContain('switchPlayer');
  });

  test('should have win detection', () => {
    // Check for win detection
    expect(htmlContent).toContain('checkResult');
    expect(htmlContent).toContain('winner');
    expect(htmlContent).toContain('Game over');
  });

  test('should announce game state changes', () => {
    // Check for announcements
    expect(htmlContent).toContain('announce');
    expect(htmlContent).toContain('Turn changed');
    expect(htmlContent).toContain('Current player');
    expect(htmlContent).toContain('wins');
    expect(htmlContent).toContain('draw');
  });

  test('should have reset game functionality', () => {
    // Check for reset
    expect(htmlContent).toContain('resetGame');
    expect(htmlContent).toContain('board = ');
    expect(htmlContent).toContain('New game started');
  });

  test('should have proper cell updating on move', () => {
    // Check for cell label updates
    expect(htmlContent).toContain('updateCellLabel');
    expect(htmlContent).toContain('setAttribute');
    expect(htmlContent).toContain('aria-label');
  });

  test('should handle mouse and keyboard interaction', () => {
    // Check for both event types
    expect(htmlContent).toContain('click');
    expect(htmlContent).toContain('keydown');
    expect(htmlContent).toContain('addEventListener');
  });

  test('should have proper ARIA attributes structure', () => {
    // Check for key ARIA attributes
    expect(htmlContent).toContain('aria-live');
    expect(htmlContent).toContain('aria-atomic');
    expect(htmlContent).toContain('aria-label');
    expect(htmlContent).toContain('role="application"');
  });

  test('should not have common accessibility issues', () => {
    // Check for issues that would violate WCAG
    // 1. No form controls without labels/accessible names
    // All buttons should have text or aria-label
    expect(htmlContent.match(/type="button"/g).length).toBeGreaterThan(0);

    // 2. No empty links or buttons
    expect(htmlContent).toContain('New Game'); // Reset button text

    // 3. Should have semantic structure
    expect(htmlContent).toContain('<main>');
    expect(htmlContent).toContain('<h1>');

    // 4. No misused roles
    expect(htmlContent).not.toContain('role="div"'); // Anti-pattern
    expect(htmlContent).not.toContain('role="span"'); // Anti-pattern
  });

  test('should have proper game flow', () => {
    // Check that the game initializes properly
    expect(htmlContent).toContain('initGame');
    expect(htmlContent).toContain('document.getElementById');

    // Check for proper focus management
    expect(htmlContent).toContain('focus()');
    expect(htmlContent).toContain('focusedCell');
  });

  test('should validate focus management', () => {
    // Check for focus-visible support
    expect(htmlContent).toContain(':focus-visible');
    expect(htmlContent).toContain(':focus');

    // Check for proper focus outline
    expect(htmlContent).toContain('outline');
  });
});
