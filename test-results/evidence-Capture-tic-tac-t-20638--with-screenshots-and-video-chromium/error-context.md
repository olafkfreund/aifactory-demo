# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: evidence.spec.js >> Capture tic-tac-toe playthrough with screenshots and video
- Location: games/tictactoe/evidence.spec.js:6:5

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> /home/nonroot/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,BlockOriginHeaderModificationOnRedirect,Translate,AutoDeElevate,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --disable-updater-scheduler --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --disable-dev-shm-usage --no-sandbox --disable-gpu --single-process --user-data-dir=/tmp/playwright_chromiumdev_profile-VQWOMo --remote-debugging-pipe --no-startup-window
<launched> pid=390
[pid=390][err] /home/nonroot/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell: error while loading shared libraries: libglib-2.0.so.0: cannot open shared object file: No such file or directory
Call log:
  - <launching> /home/nonroot/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,BlockOriginHeaderModificationOnRedirect,Translate,AutoDeElevate,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --disable-updater-scheduler --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --disable-dev-shm-usage --no-sandbox --disable-gpu --single-process --user-data-dir=/tmp/playwright_chromiumdev_profile-VQWOMo --remote-debugging-pipe --no-startup-window
  - <launched> pid=390
  - [pid=390][err] /home/nonroot/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell: error while loading shared libraries: libglib-2.0.so.0: cannot open shared object file: No such file or directory
  - [pid=390] <gracefully close start>
  - [pid=390] <kill>
  - [pid=390] <will force kill>
  - [pid=390] exception while trying to kill process: Error: kill ESRCH
  - [pid=390] <process did exit: exitCode=127, signal=null>
  - [pid=390] starting temporary directories cleanup
  - [pid=390] finished temporary directories cleanup
  - [pid=390] <gracefully close end>

```

# Test source

```ts
  1   | import { test, expect, chromium } from '@playwright/test';
  2   | import fs from 'fs';
  3   | import path from 'path';
  4   | import crypto from 'crypto';
  5   | 
  6   | test('Capture tic-tac-toe playthrough with screenshots and video', async ({ }) => {
  7   |   // Ensure evidence directory exists
  8   |   const evidenceDir = path.join(process.cwd(), 'games/tictactoe/evidence');
  9   |   if (!fs.existsSync(evidenceDir)) {
  10  |     fs.mkdirSync(evidenceDir, { recursive: true });
  11  |   }
  12  | 
  13  |   // Launch a REAL browser using chromium.launch()
> 14  |   const browser = await chromium.launch({
      |                                  ^ Error: browserType.launch: Target page, context or browser has been closed
  15  |     headless: true,
  16  |     args: [
  17  |       '--disable-dev-shm-usage',
  18  |       '--no-sandbox',
  19  |       '--disable-gpu',
  20  |       '--single-process',
  21  |     ],
  22  |   });
  23  | 
  24  |   // Create context with video recording
  25  |   const context = await browser.newContext({
  26  |     recordVideo: {
  27  |       dir: evidenceDir,
  28  |     },
  29  |   });
  30  | 
  31  |   const page = await context.newPage();
  32  | 
  33  |   // Open the local HTML file
  34  |   const htmlPath = path.join(process.cwd(), 'games/tictactoe/index.html');
  35  |   const fileUrl = `file://${htmlPath}`;
  36  |   await page.goto(fileUrl);
  37  | 
  38  |   // Wait for game to be initialized
  39  |   await page.waitForFunction(() => window.game !== undefined);
  40  | 
  41  |   // Screenshot 1: Initial empty board
  42  |   const screenshot1Path = path.join(evidenceDir, 'evidence-1-initial.png');
  43  |   await page.screenshot({ path: screenshot1Path, fullPage: true });
  44  | 
  45  |   // Play the game: X at position 0 (top-left)
  46  |   await page.click('[data-index="0"]');
  47  |   await page.waitForTimeout(300);
  48  | 
  49  |   // Screenshot 2: After first move
  50  |   const screenshot2Path = path.join(evidenceDir, 'evidence-2-x-first.png');
  51  |   await page.screenshot({ path: screenshot2Path, fullPage: true });
  52  | 
  53  |   // O at position 4 (center)
  54  |   await page.click('[data-index="4"]');
  55  |   await page.waitForTimeout(300);
  56  | 
  57  |   // X at position 1 (top-middle)
  58  |   await page.click('[data-index="1"]');
  59  |   await page.waitForTimeout(300);
  60  | 
  61  |   // Screenshot 3: Mid-game
  62  |   const screenshot3Path = path.join(evidenceDir, 'evidence-3-mid-game.png');
  63  |   await page.screenshot({ path: screenshot3Path, fullPage: true });
  64  | 
  65  |   // O at position 3 (middle-left)
  66  |   await page.click('[data-index="3"]');
  67  |   await page.waitForTimeout(300);
  68  | 
  69  |   // X at position 2 (top-right) - X wins with top row
  70  |   await page.click('[data-index="2"]');
  71  |   await page.waitForTimeout(300);
  72  | 
  73  |   // Screenshot 4: Game over with winner
  74  |   const screenshot4Path = path.join(evidenceDir, 'evidence-4-winner.png');
  75  |   await page.screenshot({ path: screenshot4Path, fullPage: true });
  76  | 
  77  |   // Assert the end state through the DOM
  78  |   const statusText = await page.textContent('#status');
  79  |   expect(statusText).toContain('Player X wins');
  80  | 
  81  |   // Verify the board state through the game object
  82  |   const boardState = await page.evaluate(() => window.game.board.join(','));
  83  |   expect(boardState).toBe('X,X,X,O,O,,,');
  84  | 
  85  |   // Verify winning line is set
  86  |   const winningLine = await page.evaluate(() => window.game.winningLine);
  87  |   expect(winningLine).toEqual([0, 1, 2]);
  88  | 
  89  |   // Close the context to finalize the video file
  90  |   await context.close();
  91  | 
  92  |   // Wait a moment for video file to be written
  93  |   await new Promise(resolve => setTimeout(resolve, 500));
  94  | 
  95  |   // Find the video file (Playwright generates it with a unique name)
  96  |   const videoFiles = fs.readdirSync(evidenceDir).filter(f => f.endsWith('.webm'));
  97  |   expect(videoFiles.length).toBe(1);
  98  |   const videoPath = path.join(evidenceDir, videoFiles[0]);
  99  |   const videoSize = fs.statSync(videoPath).size;
  100 | 
  101 |   // Verify video is larger than 50 KB
  102 |   expect(videoSize).toBeGreaterThan(50 * 1024);
  103 | 
  104 |   // Verify all PNG files exist and are larger than 5 KB
  105 |   const pngFiles = [screenshot1Path, screenshot2Path, screenshot3Path, screenshot4Path];
  106 |   const pngHashes = [];
  107 | 
  108 |   for (const pngPath of pngFiles) {
  109 |     expect(fs.existsSync(pngPath)).toBe(true);
  110 |     const size = fs.statSync(pngPath).size;
  111 |     expect(size).toBeGreaterThan(5 * 1024);
  112 | 
  113 |     // Calculate hash for comparison
  114 |     const content = fs.readFileSync(pngPath);
```