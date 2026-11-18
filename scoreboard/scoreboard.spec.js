// Run from the repo root with: npx playwright test -c scoreboard
"use strict";

// Guard: Jest's default testMatch (no jest config exists in this repo, and
// none may be added) also matches **/*.spec.js, so this file could get
// collected by `npx jest scoreboard` by accident. If that happens, the
// Playwright test()/expect() below would be the wrong ones (or undefined),
// and Jest additionally refuses a test file that registers zero tests — so
// a plain early-return is not enough. Instead, when loaded under Jest
// (JEST_WORKER_ID is set by the Jest worker process), register one trivial
// always-passing test using Jest's own globals so the file stays harmless
// and `npx jest scoreboard` keeps passing, instead of running the real
// Playwright spec body.
if (process.env.JEST_WORKER_ID) {
  test("scoreboard.spec.js is a Playwright spec; run it with: npx playwright test -c scoreboard", () => {
    expect(true).toBe(true);
  });
} else {
  const { test, expect } = require("@playwright/test");
  const { createServer } = require("./server.js");

  test("submitting a score through the real form shows it in the scores list", async ({ page }) => {
    const server = createServer();
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      await page.goto(baseUrl);
      await page.getByLabel("Name").fill("Ada");
      await page.getByLabel("Score").fill("7");
      await page.getByRole("button", { name: "Submit score" }).click();
      await expect(page.locator("#scores")).toContainText("Ada: 7");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
}
