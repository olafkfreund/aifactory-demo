// AC#4: `npx playwright test -c scoreboard` passes: the spec loads the page,
// submits a score through the form and sees it listed.
//
// Load the scoreboard page, fill Name "Ada" and Score "7", click
// "Submit score", and expect "Ada: 7" visible in the scores list.
//
// The project is CommonJS (package.json has no "type": "module") and the
// Playwright config defines no baseURL/webServer, so we require() the real
// stdlib HTTP server from scoreboard/server.js and listen on an ephemeral
// port for the duration of the test — mirroring scoreboard/scoreboard.spec.js.
"use strict";

const { test, expect } = require("@playwright/test");
const { createServer } = require("../../scoreboard/server.js");

test("submitting a score lists the entry in the scores list", async ({ page }) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    // Load the scoreboard page (scoreboard/public/index.html::scores).
    await page.goto(baseUrl);

    // Fill Name "Ada".
    await page.getByLabel("Name").fill("Ada");

    // Fill Score "7".
    await page.getByLabel("Score").fill("7");

    // Click "Submit score".
    await page.getByRole("button", { name: "Submit score" }).click();

    // Expect "Ada: 7" visible in the scores list.
    await expect(page.locator("#scores")).toContainText("Ada: 7");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
