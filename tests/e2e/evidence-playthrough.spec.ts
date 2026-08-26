// AC#9: The test suite runs and passes from the repo root, and the command
// used is recorded in the run's evidence.
//
// This browser test is the evidence-producing playthrough for AC#9. It runs a
// deterministic, real-Chromium tic-tac-toe game and asserts the X-wins end
// state THROUGH THE DOM (games/tictactoe/index.html::#status) — so a broken
// renderer fails this run rather than silently emitting evidence of a broken
// game. Screenshots are attached to the run via test.info().attach(); the
// screencast (video) and trace are captured automatically by the runner
// (Decision 12) — the test does not hand-manage video/trace.
//
// The page is opened straight off the filesystem (file:// URL) — no server,
// no build (AC#1) — resolved relative to the repo root so the command below
// works verbatim from the repo root.
//
// Run from the repo root with (this command is recorded in the run's evidence):
//   npx playwright test tests/e2e/evidence-playthrough.spec.ts
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect } from "@playwright/test";

// AC#9 requires this to run "from the repo root", so the game page is resolved
// relative to the repo root (process.cwd()) at the canonical target path.
const INDEX_HTML = path.resolve(process.cwd(), "games", "tictactoe", "index.html");
const INDEX_URL = pathToFileURL(INDEX_HTML).href;

// Fixed, deterministic move order: X takes the top row (0,1,2) and wins on the
// third mark; O plays 3 and 4. Same clicks every run -> same winning end state.
const MOVES = [0, 3, 1, 4, 2];
const WINNING_CELLS = [0, 1, 2];

test("deterministic playthrough reaches X-wins end state and captures evidence", async ({
  page,
}) => {
  // No server, no build — open the file directly.
  await page.goto(INDEX_URL);

  // TODO(review): cells are <button class="cell" role="gridcell"> with no
  // accessible name at load, so a CSS locator addresses them by index.
  const cells = page.locator(".cell");
  await expect(cells).toHaveCount(9);

  // Fresh game: X moves first.
  const status = page.locator("#status");
  await expect(status).toHaveText("X's turn");

  // Attach a screenshot of the starting board as evidence.
  await test.info().attach("01-start.png", {
    body: await page.screenshot(),
    contentType: "image/png",
  });

  // Drive the deterministic playthrough, attaching mid-game evidence. Each
  // click is followed by an auto-waiting assertion so the page has settled
  // before the next action — no hard-coded timeouts.
  for (let m = 0; m < MOVES.length; m++) {
    const index = MOVES[m];
    await cells.nth(index).click();
    // The clicked cell now shows the mark that was placed (X on even moves,
    // O on odd moves) — auto-waits for the render to complete.
    const expectedMark = m % 2 === 0 ? "X" : "O";
    await expect(cells.nth(index)).toHaveText(expectedMark);
  }

  await test.info().attach("02-final.png", {
    body: await page.screenshot(),
    contentType: "image/png",
  });

  // --- Assert the X-wins end state THROUGH THE DOM (the AC#9 target: #status) ---
  await expect(status).toHaveText("X wins!");

  // The winning line is visibly marked: exactly the three top-row cells carry
  // `.win`, and every other cell does not.
  const winningCells = page.locator(".cell.win");
  await expect(winningCells).toHaveCount(3);
  await expect(winningCells).toHaveText(["X", "X", "X"]);
  for (let i = 0; i < 9; i++) {
    if (WINNING_CELLS.includes(i)) {
      await expect(cells.nth(i)).toHaveClass(/\bwin\b/);
    } else {
      await expect(cells.nth(i)).not.toHaveClass(/\bwin\b/);
    }
  }
});
