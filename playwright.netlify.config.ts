import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./netlify-tests",
  timeout: 180_000,
  workers: 2,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:8888",
    browserName: "chromium",
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || undefined,
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: "node scripts/serve-netlify.mjs",
    url: "http://127.0.0.1:8888",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
