import { defineConfig } from "vitest/config";

// The unit tests: the app's pure modules, in Node. Components and pages are
// tested in a browser, through the built server, SPA and Storybook (test/).
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
