import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: process.env.BASE_URL ?? 'https://al3na-lets-go.github.io/supportanfrage-triage/',
    trace: 'retain-on-failure',
    screenshot: { mode: 'only-on-failure', fullPage: true },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
