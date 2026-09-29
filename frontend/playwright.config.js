// @ts-check
const { defineConfig, devices } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:4173", trace: "retain-on-failure", launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {} },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1360, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 5"] }, testMatch: /smoke\.spec\.js/ }
  ],
  webServer: { command: "node tools/serve.js 4173", url: "http://localhost:4173", reuseExistingServer: !process.env.CI }
});
