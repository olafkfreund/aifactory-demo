// Drives a REAL Chromium browser through a deterministic tic-tac-toe
// playthrough and captures evidence: 4 PNG screenshots (via page.screenshot)
// and one WebM screencast (via Playwright's recordVideo context option).
//
// Run from the repo root with:
//   npx playwright test games/tictactoe/evidence.spec.js
"use strict";

const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const { test, expect } = require("@playwright/test");
const { chromium } = require("playwright");

const GAME_DIR = __dirname;
const EVIDENCE_DIR = path.join(GAME_DIR, "evidence");
const INDEX_URL = "file://" + path.join(GAME_DIR, "index.html");
const VIDEO_PATH = path.join(EVIDENCE_DIR, "capture.webm");

// Fixed, deterministic move order: X plays the top row (0,1,2) and wins;
// O plays 3 and 4. Same moves every run -> same final board every run.
const MOVES = [0, 3, 1, 4, 2];

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

test("real playthrough produces screenshot + screencast evidence", async () => {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  // Clear any stale artifacts from a previous run so assertions below only
  // ever see fresh output from this run.
  for (const f of fs.readdirSync(EVIDENCE_DIR)) {
    fs.rmSync(path.join(EVIDENCE_DIR, f), { force: true, recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 800, height: 600 },
    recordVideo: { dir: EVIDENCE_DIR, size: { width: 800, height: 600 } },
  });
  const page = await context.newPage();

  await page.goto(INDEX_URL);
  // Give the recorder a moment on the opening frame so the screencast
  // captures real, sustained motion rather than a handful of instant clicks.
  await page.waitForTimeout(600);

  const shots = [];
  async function shoot(name) {
    const dest = path.join(EVIDENCE_DIR, name);
    await page.screenshot({ path: dest });
    shots.push(dest);
  }

  const cells = page.locator(".cell");

  await shoot("01-start.png");

  await cells.nth(MOVES[0]).click(); // X
  await page.waitForTimeout(400);
  await cells.nth(MOVES[1]).click(); // O
  await page.waitForTimeout(400);
  await shoot("02-after-2-moves.png");

  await cells.nth(MOVES[2]).click(); // X
  await page.waitForTimeout(400);
  await shoot("03-after-3-moves.png");

  await cells.nth(MOVES[3]).click(); // O
  await page.waitForTimeout(400);
  await cells.nth(MOVES[4]).click(); // X completes top row -> win
  await page.waitForTimeout(600);
  await shoot("04-final.png");

  // Assert the end state through the DOM, not through JS game-state
  // variables, so a broken renderer/game fails this run instead of
  // silently producing screenshots of a broken playthrough.
  await expect(page.locator("#status")).toHaveText("X wins!");
  const winningCells = page.locator(".cell.win");
  await expect(winningCells).toHaveCount(3);
  await expect(winningCells).toHaveText(["X", "X", "X"]);

  const video = page.video();
  await context.close(); // Playwright only finalises the video on context close
  await browser.close();

  const recordedPath = await video.path();
  fs.renameSync(recordedPath, VIDEO_PATH);

  // --- Verify artifacts on disk ---

  // Screenshots: each over 5 KB, and all four distinct by content hash.
  expect(shots).toHaveLength(4);
  const hashes = new Set();
  for (const shot of shots) {
    const size = fs.statSync(shot).size;
    expect(size).toBeGreaterThan(5 * 1024);
    hashes.add(sha256(shot));
  }
  expect(hashes.size).toBe(shots.length);

  // Video: real recorded frames, not an empty WebM container (~44 bytes).
  const videoSize = fs.statSync(VIDEO_PATH).size;
  expect(videoSize).toBeGreaterThan(50 * 1024);
});
