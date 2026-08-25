// AC#3: Clicking an occupied cell does nothing (no turn passes, no error).
//
// This test loads games/tictactoe/index.html directly via file:// (no server,
// no build step), plays one move so a cell is occupied, then clicks that same
// occupied cell again and asserts the mark is unchanged and the turn does NOT
// advance — i.e. the second click on an occupied cell is a pure no-op.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. The test file lives
// under <spec_dir>/tests/e2e, and the game ships under the project worktree, so
// probe the known relative locations and use the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../games/tictactoe/index.html'),
    path.resolve(process.cwd(), 'games/tictactoe/index.html'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `games/tictactoe/index.html not found. Looked in:\n${candidates.join('\n')}`,
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

test.describe('tic-tac-toe occupied-cell click is a no-op (AC#3)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — proves the game plays with no server and no build step.
    await page.goto(INDEX_URL);
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  test('re-clicking an occupied cell keeps its mark and does not pass the turn', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X plays the top-left cell; the turn passes to O.
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(status).toHaveText("O's turn");

    // Click the SAME occupied cell again — this must be a no-op: O cannot
    // overwrite X's mark, and the turn must not advance.
    await cells.nth(0).click();

    // The mark is unchanged (still X, never overwritten by O).
    await expect(cells.nth(0)).toHaveText('X');
    // The turn did not pass: it is still O to move — no error, no advance.
    await expect(status).toHaveText("O's turn");
    // Every other cell remains empty; the stray click affected nothing.
    for (let i = 1; i < 9; i++) {
      await expect(cells.nth(i)).toHaveText('');
    }
  });

  test('an occupied cell stays put even after the opponent has moved elsewhere', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X plays cell 0, then O plays cell 4 — a normal two-move opening.
    await cells.nth(0).click();
    await cells.nth(4).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(cells.nth(4)).toHaveText('O');
    await expect(status).toHaveText("X's turn");

    // X now (mis)clicks O's occupied centre cell — the move must be rejected.
    await cells.nth(4).click();

    // The occupied cell still holds O; it was not overwritten by X.
    await expect(cells.nth(4)).toHaveText('O');
    // And it is still X's turn — the rejected click did not pass the turn.
    await expect(status).toHaveText("X's turn");
  });
});
