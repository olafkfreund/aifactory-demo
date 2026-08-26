// AC#6: Play stops once the game is decided; further clicks do nothing.
//
// Target: games/tictactoe/index.html::onCellClick — each cell's click handler
// calls TicTacToe.move(board, i, currentPlayer); when the game is already
// decided move() returns the SAME board reference, so the handler short-circuits
// (`if (next === board) return;`) without placing a mark, flipping the player, or
// re-rendering. This browser test drives a real, deterministic X win over
// file:// (no server, no build step — AC#1), then clicks the remaining empty
// cells and asserts the board and result are unchanged: no new mark appears,
// the winning highlight stays on exactly the three winning cells, and the status
// remains "X wins!".
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This spec runs from a
// verification tree that is a sibling of the game under test, so probe the known
// relative locations (and the .worktree copy) and use the first that exists.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(process.cwd(), 'games/tictactoe/index.html'),
    path.resolve(process.cwd(), '.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../../.worktree/games/tictactoe/index.html'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `games/tictactoe/index.html not found. Looked in:\n${candidates.join('\n')}`,
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

// Deterministic playthrough: X takes the top row (0,1,2) and wins on the third
// mark; O plays 3 and 4. Same clicks every run -> same decided game every run.
const WINNING_MOVES = [0, 3, 1, 4, 2];
const WINNING_CELLS = [0, 1, 2];
// Cells still empty after the win: X on 0,1,2 and O on 3,4 leaves 5..8 open.
const EMPTY_AFTER_WIN = [5, 6, 7, 8];

test.describe('tic-tac-toe ignores clicks after the game is decided (AC#6)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    await expect(page.getByRole('gridcell')).toHaveCount(9);

    // Play the deterministic win so the game is decided before we probe.
    const cells = page.getByRole('gridcell');
    for (const index of WINNING_MOVES) {
      await cells.nth(index).click();
    }
    await expect(page.getByRole('status')).toHaveText('X wins!');
  });

  test('clicking empty cells after a win leaves the board and status unchanged', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // The decided board: X on the winning line, O on 3 and 4, the rest empty.
    await expect(cells.nth(0)).toHaveText('X');
    await expect(cells.nth(1)).toHaveText('X');
    await expect(cells.nth(2)).toHaveText('X');
    await expect(cells.nth(3)).toHaveText('O');
    await expect(cells.nth(4)).toHaveText('O');
    for (const i of EMPTY_AFTER_WIN) {
      await expect(cells.nth(i)).toHaveText('');
    }

    // Click every still-empty cell: play has stopped, so each is a no-op.
    for (const i of EMPTY_AFTER_WIN) {
      await cells.nth(i).click();
      // No mark is placed — the cell stays empty.
      await expect(cells.nth(i)).toHaveText('');
    }

    // The result is unchanged: still X wins, and no turn ever passed.
    await expect(status).toHaveText('X wins!');
    // The full board is exactly as it was when the game was decided.
    await expect(cells.nth(0)).toHaveText('X');
    await expect(cells.nth(1)).toHaveText('X');
    await expect(cells.nth(2)).toHaveText('X');
    await expect(cells.nth(3)).toHaveText('O');
    await expect(cells.nth(4)).toHaveText('O');
    for (const i of EMPTY_AFTER_WIN) {
      await expect(cells.nth(i)).toHaveText('');
    }
  });

  test('the winning highlight stays on exactly the three winning cells after further clicks', async ({ page }) => {
    const cells = page.getByRole('gridcell');

    // Clicking an occupied winning cell and an empty cell must not disturb the
    // highlight: play is over, so render() is never re-run by these clicks.
    await cells.nth(0).click();
    await cells.nth(8).click();

    // Exactly the three winning cells remain highlighted.
    for (let i = 0; i < 9; i++) {
      if (WINNING_CELLS.includes(i)) {
        await expect(cells.nth(i)).toHaveClass(/\bwin\b/);
      } else {
        await expect(cells.nth(i)).not.toHaveClass(/\bwin\b/);
      }
    }
    await expect(page.getByRole('status')).toHaveText('X wins!');
  });
});
