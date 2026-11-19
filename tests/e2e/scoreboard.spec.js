// AC#4: the spec loads the scoreboard page, submits a score through the form,
// and sees it listed. Specifically: load the page, fill Name "Ada" and
// Score "7", click "Submit score", and expect "Ada: 7" visible in the list.
"use strict";

const { test, expect } = require("@playwright/test");

// The scoreboard server is stdlib-only and exports createServer() without
// binding a port, so each test can spin up its own isolated instance on an
// ephemeral port rather than relying on an externally-running server.
const { createServer } = require("../../scoreboard/server.js");

test("submits a score through the form and lists the entry", async ({ page }) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    await page.goto(`${baseUrl}/`);

    // Fill the form inputs by their accessible labels.
    await page.getByLabel("Name").fill("Ada");
    await page.getByLabel("Score").fill("7");

    // Submit the score via the labelled button.
    await page.getByRole("button", { name: "Submit score" }).click();

    // The new entry is rendered as "name: score" inside the scores list.
    const list = page.locator("#scores"); // TODO(review): no role/testid on <ul>; using id selector
    await expect(list.getByText("Ada: 7")).toBeVisible();
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
