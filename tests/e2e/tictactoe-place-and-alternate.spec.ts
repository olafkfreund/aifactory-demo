// AC#2: Clicking an empty cell places the current player's mark and passes the turn.
//
// Drives the real games/tictactoe/index.html page in a browser (no server,
// file:// load) and proves that:
//   1. clicking an empty cell renders the current player's mark (X), and
//   2. the turn passes so the next click on an empty cell places the
//      opponent's mark (O).
//
// The page exposes the board as buttons with role="gridcell" whose text
// content is the placed mark, and a live-region #status (role="status")
// that reads "X's turn" / "O's turn". We assert through the DOM the player
// actually sees, not through internal JS game state.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Resolve games/tictactoe/index.html regardless of the cwd Playwright is
// invoked from (repo root or the tests dir). First existing candidate wins.
function indexHtmlUrl(): string {
  const candidates = [
    path.resolve(__dirname, '..', '..', 'games', 'tictactoe', 'index.html'),
    path.resolve(process.cwd(), 'games', 'tictactoe', 'index.html'),
    path.resolve(__dirname, '..', '..', '.worktree', 'games', 'tictactoe', 'index.html'),
  ];
  const found = candidates.find((p) => fs.existsSync(p)) ?? candidates[0];
  return pathToFileURL(found).toString();
}

test('clicking an empty cell places the mark and passes the turn to the opponent', async ({ page }) => {
  await page.goto(indexHtmlUrl());

  const cells = page.getByRole('gridcell');
  const status = page.getByRole('status');

  // Fresh game: X to move, all nine cells empty.
  await expect(status).toHaveText("X's turn");
  await expect(cells).toHaveCount(9);

  // AC#2 (part 1): clicking an empty cell places the current player's mark (X)
  // and passes the turn — the status flips to O.
  await cells.nth(0).click();
  await expect(cells.nth(0)).toHaveText('X');
  await expect(status).toHaveText("O's turn");

  // AC#2 (part 2): the next click on an empty cell places the opponent's mark (O)
  // and passes the turn back to X.
  await cells.nth(1).click();
  await expect(cells.nth(1)).toHaveText('O');
  await expect(status).toHaveText("X's turn");
});
