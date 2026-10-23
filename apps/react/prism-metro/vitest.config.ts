import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

// `vite.config` is a config function (it branches on `--mode server` for the
// SSR build); resolve it for the default test run before merging.
export default mergeConfig(
  viteConfig({ command: "serve", mode: "test" }),
  defineConfig({
    test: {
      // Browser-like environment for component tests; the server suites opt
      // into `node` per file.
      environment: "jsdom",
      globals: true,
      setupFiles: ["./vitest.setup.ts"],
      // Repo convention for applications: test files are named *.tests.ts(x).
      include: ["src/**/*.tests.ts", "src/**/*.tests.tsx"],
      coverage: {
        provider: "v8",
        // The denominator is the source tree, not the import graph, so a
        // file no test imports still counts against the thresholds.
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          // Barrels and type-only modules carry no runtime code.
          "**/index.ts",
          "**/types.ts",
          "src/vite-env.d.ts",
          // The tests themselves, and the stories, which render in Storybook.
          "**/*.tests.ts",
          "**/*.tests.tsx",
          "**/*.stories.tsx",
          // relay-compiler output, ignored by git and read by nothing.
          "src/relay/__generated__/**",
          // Thin process entry points with no dispatch of their own: the
          // bundle entry hydrates the document, the graph hands every request
          // to the example package's handler, and the schema script rewrites
          // the committed SDL. The e2e suite runs each of them. The two Bun
          // web servers dispatch requests, so their suites count.
          "src/client/entry.tsx",
          "src/server/graph.ts",
          "src/server/schema.ts",
        ],
        thresholds: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  }),
);
