// Captures screenshot + screencast evidence of a real tic-tac-toe playthrough.
//
// AC#8: `npx playwright test games/tictactoe/evidence.spec.js` passes from the
//        repo root, and the evidence directory is committed.
//
// This file is the evidence spec itself, so it must also satisfy the sibling
// criteria it produces artifacts for:
//   AC#1 real Chromium via chromium.launch(), index.html over file://, real clicks
//   AC#2 every PNG comes from page.screenshot()
//   AC#3 video via recordVideo, finalised by await context.close()
//   AC#4 capture.webm is larger than 50 KB (not an empty ~44-byte container)
//   AC#5 the four PNGs differ by content hash and each exceeds 5 KB
//   AC#6 end state asserted through the DOM (winning line read from the page)
//   AC#7 a fixed move sequence yields the same final board across runs
//
// Run from the repo root with:
//   npx playwright test games/tictactoe/evidence.spec.js
"use strict";

const path = require("node:path");
const crypto = require("node:crypto");
const fs = require("node:fs");
const { test, expect, chromium } = require("@playwright/test");

const GAME_DIR = __dirname;
const EVIDENCE_DIR = path.join(GAME_DIR, "evidence");
const INDEX_URL = "file://" + path.join(GAME_DIR, "index.html");

// The four PNG frames + the screencast that live under evidence/ and are
// committed alongside this spec (AC#8).
const COMMITTED_ARTIFACTS = [
  "01-start.png",
  "02-two-moves.png",
  "03-four-moves.png",
  "04-final-win.png",
  "capture.webm",
];

// Fixed, deterministic playthrough: X wins the top row (0, 1, 2). O never
// blocks, so the same five moves always produce the same final board (AC#7).
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

// Real-time pacing hold for the screencast only. This does NOT stand in for a
// state wait (every DOM check below is an auto-waiting expect); it simply keeps
// the recorded context open long enough for the WebM to accumulate real frames
// so capture.webm clears the 50 KB floor (AC#4).
async function holdForRecording(page) {
  await page.waitForTimeout(600);
}

test("real playthrough produces distinct screenshots and a valid screencast", async () => {
  // AC#8: the test runs relative to its own location, so it works when invoked
  // from the repo root, and it writes into the committed evidence directory.
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

  // AC#1: drive a REAL browser — not hand-built image bytes.
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 800, height: 600 },
    // AC#3: capture the session through Playwright's recordVideo option.
    recordVideo: { dir: EVIDENCE_DIR, size: { width: 800, height: 600 } },
  });
  const page = await context.newPage();

  try {
    // AC#1: open the local index.html over a file:// URL.
    await page.goto(INDEX_URL);
    await expect(page.locator("#board .cell")).toHaveCount(9);

    const cell = (index) => page.locator(".cell").nth(index);

    // AC#2: every PNG is produced by page.screenshot(), never a raw buffer.
    const shots = [];

    // 1. Empty board, before any move.
    shots.push(await page.screenshot({ path: path.join(EVIDENCE_DIR, "01-start.png") }));
    await holdForRecording(page);

    // Moves 1-2 (X:0, O:3), then capture.
    await cell(MOVES[0].cell).click();
    await expect(cell(MOVES[0].cell)).toHaveText("X");
    await cell(MOVES[1].cell).click();
    await expect(cell(MOVES[1].cell)).toHaveText("O");
    shots.push(await page.screenshot({ path: path.join(EVIDENCE_DIR, "02-two-moves.png") }));
    await holdForRecording(page);

    // Moves 3-4 (X:1, O:4), then capture.
    await cell(MOVES[2].cell).click();
    await expect(cell(MOVES[2].cell)).toHaveText("X");
    await cell(MOVES[3].cell).click();
    await expect(cell(MOVES[3].cell)).toHaveText("O");
    shots.push(await page.screenshot({ path: path.join(EVIDENCE_DIR, "03-four-moves.png") }));
    await holdForRecording(page);

    // Move 5 (X:2) completes the top row and wins the game.
    await cell(MOVES[4].cell).click();

    // AC#6: assert the end state through the DOM — the #status text and the
    // .win classes on the winning line — so a broken game fails the run.
    await expect(page.locator("#status")).toHaveText("X wins!");
    for (const index of [0, 1, 2]) {
      await expect(cell(index)).toHaveClass(/\bwin\b/);
    }
    for (const index of [3, 4, 5, 6, 7, 8]) {
      await expect(cell(index)).not.toHaveClass(/\bwin\b/);
    }

    shots.push(await page.screenshot({ path: path.join(EVIDENCE_DIR, "04-final-win.png") }));

    // AC#5: each PNG is a real, sizeable screenshot (> 5 KB) and all four are
    // distinct from one another by content hash.
    const hashes = new Set();
    for (const shot of shots) {
      expect(shot.length).toBeGreaterThan(5 * 1024);
      hashes.add(sha256(shot));
    }
    expect(hashes.size).toBe(shots.length);
    expect(shots.length).toBe(4);
  } finally {
    // AC#3: Playwright only finalises the video file once the context closes.
    await context.close();
  }

  const video = await page.video().path();
  await browser.close();

  const capturePath = path.join(EVIDENCE_DIR, "capture.webm");
  fs.renameSync(video, capturePath);

  // AC#4: capture.webm must exceed 50 KB — an empty WebM header is ~44 bytes,
  // so a `size > 0` assertion would pass on a frameless container.
  const stats = fs.statSync(capturePath);
  expect(stats.size).toBeGreaterThan(50 * 1024);

  // AC#8: the evidence directory is present/committed and now holds every
  // expected artifact after a repo-root run.
  expect(fs.existsSync(EVIDENCE_DIR)).toBe(true);
  for (const artifact of COMMITTED_ARTIFACTS) {
    expect(fs.existsSync(path.join(EVIDENCE_DIR, artifact))).toBe(true);
  }
});
