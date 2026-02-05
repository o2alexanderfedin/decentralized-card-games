import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E deployment verification tests
 *
 * Projects:
 * - local: Tests built site served locally (pre-deployment verification)
 * - production: Tests live GitHub Pages deployment (post-deployment smoke tests)
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Maximum time one test can run
  timeout: 30000,

  // Fail fast on CI
  fullyParallel: true,

  // Retry on CI, don't retry locally
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: process.env.CI ? 'github' : 'list',

  // Shared settings for all projects
  use: {
    // Base URL is set per project below
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Configure projects for local and production testing
  projects: [
    {
      name: 'local',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
      },
      testMatch: /.*local\.spec\.ts/,
    },
    {
      name: 'production',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://o2alexanderfedin.github.io/decentralized-card-games',
      },
      testMatch: /.*production\.spec\.ts/,
    },
  ],

  // Web server for local tests (serve built site-dist)
  webServer: {
    command: 'npx serve site-dist -l 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
