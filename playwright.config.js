// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './games',
  webServer: {
    command: 'python -m http.server 8000 --directory games/tictactoe',
    port: 8000,
    reuseExistingServer: false,
  },
  use: {
    baseURL: 'http://localhost:8000',
    screenshot: 'only-on-failure',
    video: 'retain-all',
  },
  projects: [
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        recordVideo: {
          dir: path.join(__dirname, 'games/tictactoe/evidence'),
        },
      },
    },
  ],
});
