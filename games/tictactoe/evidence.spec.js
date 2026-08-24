// Captures screenshot + screencast evidence of a real tic-tac-toe playthrough.
//
// Run from the repo root with:
//   npx playwright test games/tictactoe/evidence.spec.js
//
// This drives an actual Chromium browser (chromium.launch()) against the
// game's index.html over a file:// URL, clicks real cells, and records the
// session with Playwright's built-in video + screenshot capture. Nothing
// here hand-builds image or video bytes.
"use strict";

const path = require("node:path");
const crypto = require("node:crypto");
const fs = require("node:fs");
const { test, expect, chromium } = require("@playwright/test");

const GAME_DIR = __dirname;
const EVIDENCE_DIR = path.join(GAME_DIR, "evidence");
const INDEX_URL = "file://" + path.join(GAME_DIR, "index.html");

// Fixed, deterministic playthrough: X wins the top row (0, 1, 2).
// O never blocks, so the same five moves always produce the same board.
const MOVES = [
  { player: "X", cell: 0 },
  { player: "O", cell: 3 },
  { player: "X", cell: 1 },
  { player: "O", cell: 4 },
  { player: "X", cell: 2 }, // completes the top row, X wins
];

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

test("real playthrough produces distinct screenshots and a valid screencast", async () => {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 800, height: 600 },
    recordVideo: { dir: EVIDENCE_DIR, size: { width: 800, height: 600 } },
  });
  const page = await context.newPage();

  try {
    await page.goto(INDEX_URL);
    await page.waitForTimeout(500);

    const cell = (index) => page.locator(".cell").nth(index);

    const shots = [];

    // 1. Empty board, before any move.
    shots.push(await page.screenshot({ path: path.join(EVIDENCE_DIR, "01-start.png") }));
    await page.waitForTimeout(500);

    // Moves 1-2 (X:0, O:3), then capture.
    await cell(MOVES[0].cell).click();
    await page.waitForTimeout(500);
    await cell(MOVES[1].cell).click();
    await page.waitForTimeout(500);
    shots.push(await page.screenshot({ path: path.join(EVIDENCE_DIR, "02-two-moves.png") }));
    await page.waitForTimeout(500);

    // Moves 3-4 (X:1, O:4), then capture.
    await cell(MOVES[2].cell).click();
    await page.waitForTimeout(500);
    await cell(MOVES[3].cell).click();
    await page.waitForTimeout(500);
    shots.push(await page.screenshot({ path: path.join(EVIDENCE_DIR, "03-four-moves.png") }));
    await page.waitForTimeout(500);

    // Move 5 (X:2) completes the top row and wins the game.
    await cell(MOVES[4].cell).click();
    await page.waitForTimeout(500);

    // Assert the end state through the DOM, not through in-memory state:
    // a broken game (no win detected, wrong line) fails the run.
    await expect(page.locator("#status")).toHaveText("X wins!");
    for (const index of [0, 1, 2]) {
      await expect(cell(index)).toHaveClass(/\bwin\b/);
    }
    for (const index of [3, 4, 5, 6, 7, 8]) {
      await expect(cell(index)).not.toHaveClass(/\bwin\b/);
    }

    shots.push(await page.screenshot({ path: path.join(EVIDENCE_DIR, "04-final-win.png") }));
    await page.waitForTimeout(800);

    // Every PNG must be a real, sizeable screenshot and distinct from the others.
    const hashes = new Set();
    for (const shot of shots) {
      expect(shot.length).toBeGreaterThan(5 * 1024);
      hashes.add(sha256(shot));
    }
    expect(hashes.size).toBe(shots.length);
  } finally {
    // Playwright only finalises the video file once the context closes.
    await context.close();
  }

  const video = await page.video().path();
  await browser.close();

  const capturePath = path.join(EVIDENCE_DIR, "capture.webm");
  fs.renameSync(video, capturePath);

  const stats = fs.statSync(capturePath);
  expect(stats.size).toBeGreaterThan(50 * 1024);
});
