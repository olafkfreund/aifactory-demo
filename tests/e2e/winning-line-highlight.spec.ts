// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// Target: games/tictactoe/index.html::render — after a completed win the
// render() routine toggles the `.win` class onto exactly the three cells of the
// winning line (via TicTacToe.winningLine) and sets #status to "<player> wins!"
// (via TicTacToe.winner). This browser test drives the page over file:// (no
// server, no build — AC#1), plays a deterministic win on EACH of the 8 lines,
// and asserts that exactly those three cells carry `.win` and the status
// announces the winner. The unit lane (winner-eight-lines.test.ts) covers the
// pure detection; here we prove the UI mark-up of the win.
//
// Run from the repo root with:
//   npx playwright test tests/e2e/winning-line-highlight.spec.ts
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Resolve games/tictactoe/index.html without a dev server. This spec lives
// under specs/<id>/tests/e2e, while the game ships under the project checkout
// (a sibling `.worktree` copy in verification runs). Probe the known relative
// locations and use the first that exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(process.cwd(), '.worktree/games/tictactoe/index.html'),
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

// The 8 winning lines: 3 rows, 3 columns, 2 diagonals. X will take these three
// cells; the winner is X.
const LINES: { name: string; cells: [number, number, number] }[] = [
  { name: 'top row', cells: [0, 1, 2] },
  { name: 'middle row', cells: [3, 4, 5] },
  { name: 'bottom row', cells: [6, 7, 8] },
  { name: 'left column', cells: [0, 3, 6] },
  { name: 'middle column', cells: [1, 4, 7] },
  { name: 'right column', cells: [2, 5, 8] },
  { name: 'main diagonal', cells: [0, 4, 8] },
  { name: 'anti-diagonal', cells: [2, 4, 6] },
];

// Build a deterministic click order that lets X win on `line`: X plays the three
// line cells, O plays two off-line cells that neither complete a line for O nor
// block X. Same line -> same clicks every run.
function clickOrder(line: [number, number, number]): number[] {
  const offLine = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => !line.includes(i));
  const [oA, oB] = offLine; // two distinct O cells, off the winning line
  const [x1, x2, x3] = line;
  return [x1, oA, x2, oB, x3]; // X, O, X, O, X -> X wins on the third mark
}

test.describe('tic-tac-toe winning line is highlighted and winner announced (AC#4)', () => {
  test.beforeEach(async ({ page }) => {
    // file:// — no server, no build step required to play.
    await page.goto(INDEX_URL);
    await expect(page.getByRole('gridcell')).toHaveCount(9);
  });

  for (const { name, cells: line } of LINES) {
    test(`X wins on the ${name}: exactly those three cells get .win and status shows "X wins!"`, async ({
      page,
    }) => {
      const cells = page.getByRole('gridcell');
      const status = page.getByRole('status');

      for (const index of clickOrder(line)) {
        await cells.nth(index).click();
      }

      // The status announces the winner.
      await expect(status).toHaveText('X wins!');

      // The winning line is visibly marked: exactly three cells carry `.win`,
      // and they are precisely the three cells of the completed line.
      const winningCells = page.locator('.cell.win');
      await expect(winningCells).toHaveCount(3);

      for (let i = 0; i < 9; i++) {
        if (line.includes(i)) {
          await expect(cells.nth(i)).toHaveClass(/\bwin\b/);
          await expect(cells.nth(i)).toHaveText('X');
        } else {
          await expect(cells.nth(i)).not.toHaveClass(/\bwin\b/);
        }
      }
    });
  }

  test('O can also win: the winning line and status reflect O', async ({ page }) => {
    const cells = page.getByRole('gridcell');
    const status = page.getByRole('status');

    // X: 0, 1, 8 (scattered, no line). O: 3, 4, 5 (middle row) wins.
    // Order: X0, O3, X1, O4, X8, O5 -> O completes the middle row.
    const order = [0, 3, 1, 4, 8, 5];
    for (const index of order) {
      await cells.nth(index).click();
    }

    await expect(status).toHaveText('O wins!');

    const winningCells = page.locator('.cell.win');
    await expect(winningCells).toHaveCount(3);
    for (const i of [3, 4, 5]) {
      await expect(cells.nth(i)).toHaveClass(/\bwin\b/);
      await expect(cells.nth(i)).toHaveText('O');
    }
  });
});
