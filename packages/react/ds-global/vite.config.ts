// Testing posture: Measured — Chromatic is primary visual gate; unit tests cover logic
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Browser-mode pilot: component tests run in Chromium, SSR tests in node.
// Spelled out by hand because the shared factory has no browser option yet.
// Both naming conventions run until the repo-wide unification lands: the
// `_work_in_progress` scaffolds use `.test.`.
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    // include sourcemaps for easier debugging
    sourcemap: true,
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "client",
          globals: true,
          include: ["src/**/*.{test,tests}.{ts,tsx}"],
          exclude: ["src/**/*.ssr.{test,tests}.{ts,tsx}"],
          setupFiles: ["./vitest.setup.browser.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
            // Vitest's default iframe is 414×896, a phone. The jsdom suite
            // had no viewport at all, so it assumes a desktop one.
            viewport: { width: 1280, height: 800 },
          },
        },
      },
      {
        extends: true,
        test: {
          name: "ssr",
          globals: true,
          environment: "node",
          include: ["src/**/*.ssr.{test,tests}.{ts,tsx}"],
        },
      },
    ],
  },
});
