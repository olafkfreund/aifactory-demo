// AC#8: `npx playwright test games/tictactoe/evidence.spec.js` passes from the
// repo root, and the evidence directory is committed (its artifacts exist on
// disk after the run).
//
// This spec is path-independent: it resolves index.html and the evidence
// directory relative to __dirname, so it runs identically whether Playwright
// is invoked from the repo root or from games/tictactoe/. A single real
// Chromium playthrough drives the game, captures the evidence, and then the
// test asserts every committed artifact is present on disk.
//
// It also proves the supporting criteria the evidence rests on:
//   AC#1 real Chromium via chromium.launch(), index.html over file://, real clicks
//   AC#2 every PNG produced by page.screenshot()
//   AC#3 video via the recordVideo context option, finalised on context.close()
//   AC#4 capture.webm larger than 50 KB (real frames, not an empty container)
//   AC#5 four PNGs, each larger than 5 KB, all distinct by sha256 content hash
//   AC#6 end state asserted through the DOM (#status text and .cell.win markers)
//   AC#7 fixed move order -> same final board on every run (deterministic)
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

// The four screenshot names and the video make up the committed evidence set.
const SCREENSHOT_NAMES = [
  "01-start.png",
  "02-after-2-moves.png",
  "03-after-3-moves.png",
  "04-final.png",
];

// Fixed, deterministic move order: X plays the top row (0,1,2) and wins;
// O plays 3 and 4. Same moves every run -> same final board every run (AC#7).
const MOVES = [0, 3, 1, 4, 2];

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

test("real playthrough produces screenshot + screencast evidence", async () => {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  // Clear any stale artifacts from a previous run so the assertions below only
  // ever see fresh output produced by this run.
  for (const f of fs.readdirSync(EVIDENCE_DIR)) {
    fs.rmSync(path.join(EVIDENCE_DIR, f), { force: true, recursive: true });
  }

  // AC#1: a REAL browser, not synthesised image bytes.
  const browser = await chromium.launch();
  // AC#3: the screencast comes from Playwright's recordVideo context option.
  const context = await browser.newContext({
    viewport: { width: 800, height: 600 },
    recordVideo: { dir: EVIDENCE_DIR, size: { width: 800, height: 600 } },
  });
  const page = await context.newPage();

  // AC#1: open the local index.html over a file:// URL.
  await page.goto(INDEX_URL);
  const cells = page.locator(".cell");
  await expect(cells).toHaveCount(9);
  await expect(page.locator("#status")).toHaveText("X's turn");
  // Let the recorder dwell on the opening frame so the screencast captures
  // real, sustained motion rather than a burst of instant clicks (feeds AC#4).
  await page.waitForTimeout(600);

  const shots = [];
  async function shoot(name) {
    const dest = path.join(EVIDENCE_DIR, name);
    // AC#2: every PNG is produced by page.screenshot(), never a hand-built buffer.
    await page.screenshot({ path: dest });
    shots.push(dest);
  }

  await shoot("01-start.png");

  // AC#1: click actual cells; assert DOM transitions so a broken game fails here.
  await cells.nth(MOVES[0]).click(); // X -> 0
  await expect(cells.nth(MOVES[0])).toHaveText("X");
  await page.waitForTimeout(400);
  await cells.nth(MOVES[1]).click(); // O -> 3
  await expect(cells.nth(MOVES[1])).toHaveText("O");
  await page.waitForTimeout(400);
  await shoot("02-after-2-moves.png");

  await cells.nth(MOVES[2]).click(); // X -> 1
  await expect(cells.nth(MOVES[2])).toHaveText("X");
  await page.waitForTimeout(400);
  await shoot("03-after-3-moves.png");

  await cells.nth(MOVES[3]).click(); // O -> 4
  await expect(cells.nth(MOVES[3])).toHaveText("O");
  await page.waitForTimeout(400);
  await cells.nth(MOVES[4]).click(); // X -> 2 completes top row -> win
  await page.waitForTimeout(600);
  await shoot("04-final.png");

  // AC#6: assert the end state through the DOM (not internal JS game state) so a
  // broken renderer/game fails this run instead of recording a broken playthrough.
  await expect(page.locator("#status")).toHaveText("X wins!");
  const winningCells = page.locator(".cell.win");
  await expect(winningCells).toHaveCount(3);
  await expect(winningCells).toHaveText(["X", "X", "X"]);

  // AC#7: the fixed move order yields this exact final board every run.
  await expect(cells).toHaveText(["X", "X", "X", "O", "O", "", "", "", ""]);

  const video = page.video();
  // AC#3: Playwright only finalises the video on context close.
  await context.close();
  await browser.close();

  const recordedPath = await video.path();
  fs.renameSync(recordedPath, VIDEO_PATH);

  // --- AC#8: verify every committed evidence artifact exists on disk ---

  // The evidence directory itself must exist and be a directory.
  expect(fs.existsSync(EVIDENCE_DIR)).toBe(true);
  expect(fs.statSync(EVIDENCE_DIR).isDirectory()).toBe(true);

  // AC#5: exactly four PNGs, each over 5 KB, all distinct by content hash.
  expect(shots).toHaveLength(4);
  const hashes = new Set();
  for (const name of SCREENSHOT_NAMES) {
    const shot = path.join(EVIDENCE_DIR, name);
    expect(fs.existsSync(shot)).toBe(true);
    const size = fs.statSync(shot).size;
    expect(size).toBeGreaterThan(5 * 1024);
    hashes.add(sha256(shot));
  }
  expect(hashes.size).toBe(SCREENSHOT_NAMES.length);

  // AC#4: capture.webm exists and holds real recorded frames, not an empty
  // WebM container (~44 bytes), so it must exceed 50 KB.
  expect(fs.existsSync(VIDEO_PATH)).toBe(true);
  const videoSize = fs.statSync(VIDEO_PATH).size;
  expect(videoSize).toBeGreaterThan(50 * 1024);
});
