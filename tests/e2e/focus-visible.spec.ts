// AC#13: Focus stays visible — `outline: none` is acceptable ONLY where a
// `box-shadow` or `border` focus indicator replaces it in the SAME rule.
//
// Target: games/tictactoe/index.html :: .cell (the nine gridcell buttons).
// This suite proves two things about the changed markup/CSS:
//   1. A cell focused via the keyboard renders a visible focus indicator
//      (a non-zero outline, or a box-shadow, or a focus-specific border change).
//   2. Static CSS invariant: any rule that sets `outline: none` (or `outline: 0`)
//      also declares a `box-shadow` or `border` replacement in the same rule.

import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs';

// Resolve the game entry point relative to this test file. The project source
// may live directly under the spec dir or inside the `.worktree` copy the
// executor mounts, so try both and fall back to the first candidate.
function resolveGamePath(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? candidates[0];
}

const GAME_PATH = resolveGamePath();
const GAME_URL = pathToFileURL(GAME_PATH).toString();

test.describe('AC#13 focus indicator stays visible', () => {
  test('AC#13: a keyboard-focused cell renders a visible focus indicator', async ({ page }) => {
    await page.goto(GAME_URL);

    const firstCell = page.getByRole('gridcell').first();
    await expect(firstCell).toBeVisible();

    // Drive focus with the keyboard so the `:focus-visible` heuristic engages
    // (a mouse click may suppress the visible focus ring in Chromium).
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    await expect(focused).toHaveClass(/cell/);

    const indicator = await focused.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        outlineStyle: s.outlineStyle,
        outlineWidth: parseFloat(s.outlineWidth) || 0,
        boxShadow: s.boxShadow,
      };
    });

    const hasOutline =
      indicator.outlineStyle !== 'none' && indicator.outlineWidth > 0;
    const hasBoxShadow =
      !!indicator.boxShadow && indicator.boxShadow !== 'none';

    // A visible focus indicator must exist via outline OR box-shadow.
    expect(hasOutline || hasBoxShadow).toBe(true);
  });

  test('AC#13: any `outline: none` rule pairs it with box-shadow or border', async () => {
    const html = fs.readFileSync(GAME_PATH, 'utf8');

    // Extract the contents of <style>...</style> blocks.
    const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
      .map((m) => m[1])
      .join('\n');

    // Split into individual `selector { declarations }` rule bodies.
    const ruleBodies = [...styleBlocks.matchAll(/\{([^{}]*)\}/g)].map((m) => m[1]);

    const nullsOutlineRules = ruleBodies.filter((body) =>
      /outline\s*:\s*(none|0)\b/i.test(body)
    );

    // Every rule that removes the outline must supply a replacement indicator
    // (box-shadow or a border declaration) in the SAME rule.
    for (const body of nullsOutlineRules) {
      const hasReplacement =
        /box-shadow\s*:/i.test(body) || /border(?:-[a-z]+)?\s*:/i.test(body);
      expect(hasReplacement).toBe(true);
    }

    // Sanity: the stylesheet must exist and define at least one rule so this
    // invariant is actually exercised against real CSS.
    expect(ruleBodies.length).toBeGreaterThan(0);
  });
});
