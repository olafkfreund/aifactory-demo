const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './games',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx http-server games/tictactoe -p 8000 -c-1',
    url: 'http://localhost:8000',
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chromium'] },
    },
  ],
});
