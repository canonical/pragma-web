import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// biome-ignore lint/suspicious/noExplicitAny: Vite 8 plugin types are incompatible with vitest's Vite 7 re-exports
const plugins: any[] = [react()];

// The browser suites: the archetypes server-rendered into a page that
// Chromium lays out at several widths. Separate from the unit suite
// (vitest.config.ts): node environment, one file at a time, and a timeout
// long enough to launch the browser.
export default defineConfig({
  plugins,
  test: {
    environment: "node",
    include: ["test/**/*.e2e.tsx"],
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
