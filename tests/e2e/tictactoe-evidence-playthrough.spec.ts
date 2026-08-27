// AC#9: The test suite runs and passes from the repo root, and the command
// used is recorded in the run's evidence.
//
// Target: games/tictactoe/index.html::#board — this is the evidence-producing
// browser playthrough for AC#9. It drives a deterministic, real-Chromium
// tic-tac-toe game to a fixed X-wins end state and asserts that end state
// THROUGH THE DOM (#board / #status). A run that emits screenshots + screencast
// but renders a broken board fails here, so the evidence proves the suite
// actually executed against a working game rather than rubber-stamping one.
//
// Evidence capture (Decision 12): screenshots are attached mid-playthrough via
// test.info().attach(); the screencast (video) and trace are captured
// automatically by the runner config — this test does NOT hand-manage
// video/trace.
//
// The page is opened straight off the filesystem (file:// URL) — no server, no
// build (AC#1) — resolved relative to the repo root so the recorded command
// runs verbatim from the repo root.
//
// Run from the repo root with (this command is recorded in the run's evidence):
//   npx playwright test tests/e2e/tictactoe-evidence-playthrough.spec.ts
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// AC#9 requires the suite to run "from the repo root", so resolve the game page
// relative to the repo root (process.cwd()) first. Verification runs sometimes
// stage the game under a .worktree copy, so probe the known locations and use
// the first that exists on disk — the repo-root path is tried before any copy.
function resolveIndexHtml(): string {
  const candidates = [
    path.resolve(process.cwd(), 'games/tictactoe/index.html'),
    path.resolve(process.cwd(), '.worktree/games/tictactoe/index.html'),
    path.resolve(__dirname, '../../games/tictactoe/index.html'),
    path.resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
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

// Fixed, deterministic move order: X takes the top row (0,1,2) and wins on the
// third mark; O plays 3 and 4. Same clicks every run -> same winning end state.
const MOVES = [0, 3, 1, 4, 2];
const WINNING_CELLS = [0, 1, 2];

test('deterministic playthrough runs from repo root and captures evidence (AC#9)', async ({
  page,
}) => {
  // No server, no build — open the file directly off disk.
  await page.goto(INDEX_URL);
  expect(INDEX_URL.startsWith('file://')).toBe(true);

  // The #board target renders a full 9-cell grid on load.
  const board = page.locator('#board');
  await expect(board).toBeVisible();
  const cells = page.getByRole('gridcell');
  await expect(cells).toHaveCount(9);

  // Fresh game: X moves first.
  const status = page.getByRole('status');
  await expect(status).toHaveText("X's turn");

  // Evidence: starting board.
  await test.info().attach('01-start.png', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });

  // Drive the deterministic playthrough. Each click is followed by an
  // auto-waiting assertion so the page has settled before the next action —
  // no hard-coded timeouts.
  for (let m = 0; m < MOVES.length; m++) {
    const index = MOVES[m];
    await cells.nth(index).click();
    const expectedMark = m % 2 === 0 ? 'X' : 'O';
    await expect(cells.nth(index)).toHaveText(expectedMark);
  }

  // Evidence: final board.
  await test.info().attach('02-final.png', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });

  // --- Assert the X-wins end state THROUGH THE DOM (the AC#9 target: #board) ---
  await expect(status).toHaveText('X wins!');

  // The winning line is visibly marked: exactly the three top-row cells carry
  // `.win`, and every other cell does not.
  const winningCells = board.locator('.cell.win');
  await expect(winningCells).toHaveCount(3);
  await expect(winningCells).toHaveText(['X', 'X', 'X']);
  for (let i = 0; i < 9; i++) {
    if (WINNING_CELLS.includes(i)) {
      await expect(cells.nth(i)).toHaveClass(/\bwin\b/);
    } else {
      await expect(cells.nth(i)).not.toHaveClass(/\bwin\b/);
    }
  }
});
