// AC#13: Focus stays visible: `outline: none` is acceptable ONLY where a
// `box-shadow` or `border` focus indicator replaces it in the same rule.
//
// This spec drives the real TicTacToeUI in games/tictactoe/index.html through a
// browser. It proves two things:
//   1. A focused gridcell has a computed focus indicator (a non-"none"
//      box-shadow, or a border) — so a keyboard user can SEE which cell is
//      focused even though the focus rule sets outline: none.
//   2. Statically, every author CSS rule that sets `outline: none` on a
//      :focus/:focus-visible selector also declares a `box-shadow` or `border`
//      in the SAME rule (i.e. outline suppression never removes visible focus).

import { test, expect, type Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs';

/** Resolve a file:// URL for the game under test, tolerating a few layouts. */
function gameUrl(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(process.cwd(), 'games/tictactoe/index.html'),
    path.resolve(process.cwd(), '.worktree/games/tictactoe/index.html'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return pathToFileURL(c).toString();
  }
  // Fall back to the on-disk layout; the test will surface a load failure.
  return pathToFileURL(candidates[0]).toString();
}

/** Accessible name of an empty cell at grid index i, matching updateCellAccessibleName. */
function cellName(i: number): string {
  const row = Math.floor(i / 3) + 1;
  const col = (i % 3) + 1;
  return `row ${row}, column ${col}, empty`;
}

/** Locator for the gridcell button at index i (board is empty throughout this spec). */
function cell(page: Page, i: number) {
  return page.getByRole('gridcell', { name: cellName(i) });
}

test.beforeEach(async ({ page }) => {
  await page.goto(gameUrl());
  await expect(page.getByRole('grid')).toBeVisible();
  await expect(page.getByRole('gridcell')).toHaveCount(9);
});

test('a focused cell shows a visible box-shadow or border focus indicator', async ({
  page,
}) => {
  // Focus the roving-tabindex cell (cell 0) the way a keyboard user would.
  await cell(page, 0).focus();
  await expect(cell(page, 0)).toBeFocused();

  // Read the computed focus indicator on the focused cell.
  const indicator = await cell(page, 0).evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      outline: cs.outlineStyle,
      boxShadow: cs.boxShadow,
      borderStyle: cs.borderTopStyle,
      borderWidth: cs.borderTopWidth,
    };
  });

  // A visible focus indicator must be present. Either the box-shadow is set
  // (not "none"), or a real border replaces the suppressed outline.
  const hasBoxShadow =
    indicator.boxShadow !== 'none' && indicator.boxShadow.trim() !== '';
  const hasBorder =
    indicator.borderStyle !== 'none' &&
    parseFloat(indicator.borderWidth) > 0;

  expect(hasBoxShadow || hasBorder).toBe(true);
});

test('the focused indicator differs from the unfocused state (focus is perceivable)', async ({
  page,
}) => {
  const readBoxShadow = () =>
    cell(page, 0).evaluate((el) => getComputedStyle(el).boxShadow);

  // Blur everything by focusing the document body, capture the resting shadow.
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  const unfocused = await readBoxShadow();

  // Now focus cell 0 and capture the focused shadow.
  await cell(page, 0).focus();
  await expect(cell(page, 0)).toBeFocused();
  const focused = await readBoxShadow();

  // Focusing must produce a non-empty box-shadow that a user can perceive,
  // and it must change from the unfocused state.
  expect(focused).not.toBe('none');
  expect(focused.trim()).not.toBe('');
  expect(focused).not.toBe(unfocused);
});

test('every :focus rule that sets outline:none also declares box-shadow or border', async ({
  page,
}) => {
  // Walk the author stylesheets and verify AC#13's contract: outline: none is
  // only ever used in the SAME rule as a box-shadow or border focus indicator.
  const violations = await page.evaluate(() => {
    const bad: string[] = [];
    let inspectedFocusRules = 0;

    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue; // cross-origin / inaccessible sheet
      }
      for (const rule of Array.from(rules)) {
        const styleRule = rule as CSSStyleRule;
        const selector = styleRule.selectorText;
        if (!selector || !/:focus(-visible|-within)?/.test(selector)) continue;

        const style = styleRule.style;
        const outline = (style.getPropertyValue('outline') || '').trim();
        const outlineStyle = (
          style.getPropertyValue('outline-style') || ''
        ).trim();
        const suppressesOutline =
          outline === 'none' ||
          outline === '0' ||
          outline.startsWith('0 ') ||
          outlineStyle === 'none';

        if (!suppressesOutline) continue;
        inspectedFocusRules++;

        const boxShadow = (style.getPropertyValue('box-shadow') || '').trim();
        const border = (style.getPropertyValue('border') || '').trim();
        const borderStyle = (
          style.getPropertyValue('border-style') || ''
        ).trim();
        const borderWidth = (
          style.getPropertyValue('border-width') || ''
        ).trim();

        const hasBoxShadow = boxShadow !== '' && boxShadow !== 'none';
        const hasBorder =
          (border !== '' && border !== 'none') ||
          (borderStyle !== '' && borderStyle !== 'none') ||
          (borderWidth !== '' && borderWidth !== '0');

        if (!hasBoxShadow && !hasBorder) {
          bad.push(selector);
        }
      }
    }

    return { bad, inspectedFocusRules };
  });

  // There must be at least one focus rule that suppresses the outline (that is
  // the pattern AC#13 constrains); otherwise this test proves nothing.
  expect(violations.inspectedFocusRules).toBeGreaterThan(0);
  // And none of those rules may drop visible focus.
  expect(violations.bad).toEqual([]);
});
