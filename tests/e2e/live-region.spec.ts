// AC#12: The live region announces the turn change and the final result.
//
// Target: games/tictactoe/index.html :: TicTacToeUI
// The aria-live="polite" region (#announcer) is updated by announceTurnChange()
// on every player switch ("O's turn" / "X's turn") and by announceGameResult()
// with the final outcome ("X wins!" / "O wins!" / "It's a draw!").
//
// This test drives the game through the DOM and asserts the live region's text
// reflects each turn change and the final win/draw result.

import { test, expect, Locator, Page } from '@playwright/test';
import { existsSync } from 'fs';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

// Resolve the game page regardless of whether the runner executes with the
// spec root or the worktree copy as cwd.
function gamePageUrl(): string {
  const candidates = [
    resolve(__dirname, '../../games/tictactoe/index.html'),
    resolve(__dirname, '../../.worktree/games/tictactoe/index.html'),
    resolve(process.cwd(), 'games/tictactoe/index.html'),
    resolve(process.cwd(), '.worktree/games/tictactoe/index.html'),
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      `Could not locate games/tictactoe/index.html. Tried:\n${candidates.join('\n')}`
    );
  }
  return pathToFileURL(found).href;
}

// TODO(reviewer): the live region has no ARIA role, so it is selected by its
// stable id attribute rather than a role-based locator.
function liveRegion(page: Page): Locator {
  return page.locator('#announcer[aria-live="polite"]');
}

// Place a mark on the given 0-8 cell index by clicking the matching gridcell.
async function placeMark(page: Page, index: number): Promise<void> {
  await page.getByRole('gridcell').nth(index).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(gamePageUrl());
  // Wait for the grid to be populated so the game controller has initialised.
  await expect(page.getByRole('gridcell')).toHaveCount(9);
});

test('live region announces the turn change after each move', async ({ page }) => {
  const announcer = liveRegion(page);

  // X moves first -> the announcer should report it is now O's turn.
  await placeMark(page, 0);
  await expect(announcer).toHaveText("O's turn");

  // O moves -> the announcer should report it is X's turn again.
  await placeMark(page, 3);
  await expect(announcer).toHaveText("X's turn");

  // X moves -> back to O's turn.
  await placeMark(page, 1);
  await expect(announcer).toHaveText("O's turn");
});

test('live region announces the final result when X wins', async ({ page }) => {
  const announcer = liveRegion(page);

  // X takes the top row (0,1,2); O plays elsewhere (3,4) in between.
  await placeMark(page, 0); // X
  await placeMark(page, 3); // O
  await placeMark(page, 1); // X
  await placeMark(page, 4); // O
  await placeMark(page, 2); // X completes the top row and wins

  await expect(announcer).toHaveText('X wins!');
});

test('live region announces a draw when the board fills with no winner', async ({ page }) => {
  const announcer = liveRegion(page);

  // Fill order producing a full board with no three-in-a-row:
  //   X O X
  //   X O O
  //   O X X
  const drawOrder = [0, 1, 2, 4, 3, 5, 7, 6, 8];
  for (const index of drawOrder) {
    await placeMark(page, index);
  }

  await expect(announcer).toHaveText("It's a draw!");
});
