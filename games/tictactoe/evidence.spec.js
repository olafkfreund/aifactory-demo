import { test, expect, chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

test('Capture tic-tac-toe playthrough with screenshots and video', async ({ }) => {
  // Ensure evidence directory exists
  const evidenceDir = path.join(process.cwd(), 'games/tictactoe/evidence');
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  // Launch a REAL browser using chromium.launch()
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-gpu',
      '--single-process',
    ],
  });

  // Create context with video recording
  const context = await browser.newContext({
    recordVideo: {
      dir: evidenceDir,
    },
  });

  const page = await context.newPage();

  // Open the local HTML file
  const htmlPath = path.join(process.cwd(), 'games/tictactoe/index.html');
  const fileUrl = `file://${htmlPath}`;
  await page.goto(fileUrl);

  // Wait for game to be initialized
  await page.waitForFunction(() => window.game !== undefined);

  // Screenshot 1: Initial empty board
  const screenshot1Path = path.join(evidenceDir, 'evidence-1-initial.png');
  await page.screenshot({ path: screenshot1Path, fullPage: true });

  // Play the game: X at position 0 (top-left)
  await page.click('[data-index="0"]');
  await page.waitForTimeout(300);

  // Screenshot 2: After first move
  const screenshot2Path = path.join(evidenceDir, 'evidence-2-x-first.png');
  await page.screenshot({ path: screenshot2Path, fullPage: true });

  // O at position 4 (center)
  await page.click('[data-index="4"]');
  await page.waitForTimeout(300);

  // X at position 1 (top-middle)
  await page.click('[data-index="1"]');
  await page.waitForTimeout(300);

  // Screenshot 3: Mid-game
  const screenshot3Path = path.join(evidenceDir, 'evidence-3-mid-game.png');
  await page.screenshot({ path: screenshot3Path, fullPage: true });

  // O at position 3 (middle-left)
  await page.click('[data-index="3"]');
  await page.waitForTimeout(300);

  // X at position 2 (top-right) - X wins with top row
  await page.click('[data-index="2"]');
  await page.waitForTimeout(300);

  // Screenshot 4: Game over with winner
  const screenshot4Path = path.join(evidenceDir, 'evidence-4-winner.png');
  await page.screenshot({ path: screenshot4Path, fullPage: true });

  // Assert the end state through the DOM
  const statusText = await page.textContent('#status');
  expect(statusText).toContain('Player X wins');

  // Verify the board state through the game object
  const boardState = await page.evaluate(() => window.game.board.join(','));
  expect(boardState).toBe('X,X,X,O,O,,,');

  // Verify winning line is set
  const winningLine = await page.evaluate(() => window.game.winningLine);
  expect(winningLine).toEqual([0, 1, 2]);

  // Close the context to finalize the video file
  await context.close();

  // Wait a moment for video file to be written
  await new Promise(resolve => setTimeout(resolve, 500));

  // Find the video file (Playwright generates it with a unique name)
  const videoFiles = fs.readdirSync(evidenceDir).filter(f => f.endsWith('.webm'));
  expect(videoFiles.length).toBe(1);
  const videoPath = path.join(evidenceDir, videoFiles[0]);
  const videoSize = fs.statSync(videoPath).size;

  // Verify video is larger than 50 KB
  expect(videoSize).toBeGreaterThan(50 * 1024);

  // Verify all PNG files exist and are larger than 5 KB
  const pngFiles = [screenshot1Path, screenshot2Path, screenshot3Path, screenshot4Path];
  const pngHashes = [];

  for (const pngPath of pngFiles) {
    expect(fs.existsSync(pngPath)).toBe(true);
    const size = fs.statSync(pngPath).size;
    expect(size).toBeGreaterThan(5 * 1024);

    // Calculate hash for comparison
    const content = fs.readFileSync(pngPath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    pngHashes.push(hash);
  }

  // Verify all PNGs are different from each other
  const uniqueHashes = new Set(pngHashes);
  expect(uniqueHashes.size).toBe(4);

  // Log evidence location for debugging
  console.log(`Evidence captured in: ${evidenceDir}`);
  console.log(`Video file: ${path.basename(videoPath)} (${videoSize} bytes)`);
  pngFiles.forEach((f, i) => {
    const size = fs.statSync(f).size;
    console.log(`Screenshot ${i + 1}: ${path.basename(f)} (${size} bytes)`);
  });

  await browser.close();
});
