// AC#4: A win is detected on all 8 lines — 3 rows, 3 columns, 2 diagonals —
// and the winning line is visibly marked.
//
// Target: games/tictactoe/index.html::render — after every move render() calls
// TicTacToe.winner(board) / TicTacToe.winningLine(board) and toggles the `.win`
// class on exactly the three cells of the winning line, while #status announces
// "<player> wins!". This browser test drives the no-build page over file://,
// plays a deterministic X-winning sequence for each of the 8 winning lines, and
// proves the UI marks EXACTLY those three cells (and no other) and announces the
// winner. The pure detection of all 8 lines is covered by the unit lane
// (winner-all-8-lines.test.ts); here we verify the rendered UI mark-up.
//
// Run from the repo root with:
//   npx playwright test tests/e2e/tictactoe-winning-line-marked.spec.ts
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Resolve games/tictactoe/index.html without a dev server. This spec lives at
// <spec_dir>/tests/e2e, while the game under verification ships under
// <spec_dir>/.worktree/games/tictactoe (and, in other layouts, as a sibling
// games/ tree). Probe the known relative locations and use the first that
// exists on disk.
function resolveIndexHtml(): string {
  const candidates = [
    process.env.INDEX_HTML,
    path.resolve(__dirname, "../../.worktree/games/tictactoe/index.html"),
    path.resolve(__dirname, "../../games/tictactoe/index.html"),
    path.resolve(process.cwd(), ".worktree/games/tictactoe/index.html"),
    path.resolve(process.cwd(), "games/tictactoe/index.html"),
  ].filter((p): p is string => Boolean(p));
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `games/tictactoe/index.html not found. Looked in:\n${candidates.join("\n")}`,
  );
}

const INDEX_URL = pathToFileURL(resolveIndexHtml()).href;

// All 8 winning lines — 3 rows, 3 columns, 2 diagonals. For each we give a
// deterministic click order in which X completes the line: X takes the three
// winning cells, O plays two harmless cells that never form a line. Same clicks
// every run -> same winning line marked every run.
interface WinCase {
  name: string;
  cells: [number, number, number]; // the three winning indices
  moves: number[]; // click order (X, O, X, O, X) ending on X's winning move
}

const LINES: WinCase[] = [
  { name: "top row", cells: [0, 1, 2], moves: [0, 3, 1, 4, 2] },
  { name: "middle row", cells: [3, 4, 5], moves: [3, 0, 4, 1, 5] },
  { name: "bottom row", cells: [6, 7, 8], moves: [6, 0, 7, 1, 8] },
  { name: "left column", cells: [0, 3, 6], moves: [0, 1, 3, 2, 6] },
  { name: "middle column", cells: [1, 4, 7], moves: [1, 0, 4, 2, 7] },
  { name: "right column", cells: [2, 5, 8], moves: [2, 0, 5, 1, 8] },
  { name: "main diagonal", cells: [0, 4, 8], moves: [0, 1, 4, 2, 8] },
  { name: "anti diagonal", cells: [2, 4, 6], moves: [2, 0, 4, 1, 6] },
];

test.describe("AC#4: a completed win is visibly marked and the winner announced", () => {
  // Exactly the 8 winning lines are exercised.
  test("exercises all 8 winning lines", () => {
    expect(LINES).toHaveLength(8);
  });

  for (const line of LINES) {
    test(`X winning on the ${line.name} marks exactly its 3 cells and shows "X wins!"`, async ({
      page,
    }) => {
      // file:// — no server, no build step required to play (AC#1).
      await page.goto(INDEX_URL);

      const cells = page.getByRole("gridcell");
      await expect(cells).toHaveCount(9);

      // Play the deterministic sequence that ends with X completing the line.
      for (const index of line.moves) {
        await cells.nth(index).click();
      }

      // The winning line is visibly marked: EXACTLY three cells carry `.win`,
      // and every one of them shows the winning player's mark.
      const winningCells = page.locator(".cell.win");
      await expect(winningCells).toHaveCount(3);
      await expect(winningCells).toHaveText(["X", "X", "X"]);

      // Precisely the three cells of the completed line are highlighted; no
      // other cell gains the win style.
      for (let i = 0; i < 9; i++) {
        if (line.cells.includes(i)) {
          await expect(cells.nth(i)).toHaveClass(/\bwin\b/);
        } else {
          await expect(cells.nth(i)).not.toHaveClass(/\bwin\b/);
        }
      }

      // The winner is announced in the live status region.
      await expect(page.getByRole("status")).toHaveText("X wins!");
    });
  }
});
