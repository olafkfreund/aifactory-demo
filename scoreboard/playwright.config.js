// Run from the repo root with: npx playwright test -c scoreboard
"use strict";

module.exports = {
  testDir: ".",
  // Scope to *.spec.js only, so Playwright never collects api.test.js
  // (which uses Jest's test()/expect(), not Playwright's).
  testMatch: "**/*.spec.js",
  fullyParallel: true,
  reporter: "list",
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium", headless: true },
    },
  ],
};
