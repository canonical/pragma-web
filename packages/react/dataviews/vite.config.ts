import { reactTestConfig } from "@canonical/vitest-config-react";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// biome-ignore lint/suspicious/noExplicitAny: Vite 8 plugin types are incompatible with vitest's Vite 7 re-exports
const plugins: any[] = [react()];

/**
 * The package's test block, with the shared test helpers' own colocated
 * tests run beside the library's in the client project.
 */
const testConfig = reactTestConfig({
  glob: "test",
  ssr: true,
  // Unmeasured: stories, tests, types and the keyboard suites.
  coverage: {
    include: ["src/**/*.{ts,tsx}", "testing/**/*.{ts,tsx}"],
    exclude: [
      "**/*.stories.{ts,tsx}",
      "testing/**/*.d.ts",
      "testing/**/*.test.{ts,tsx}",
      "testing/keyboard/**",
      "testing/playwright.config.ts",
      "testing/types.ts",
    ],
  },
  plugins,
  setupFiles: ["./vitest.setup.ts"],
});

/**
 * The axe sweeps this package runs append whole SSR-rendered markup to the
 * document and check it against every WCAG A/AA rule, which a contended CI
 * runner can take past Vitest's 5000ms default. A timeout there leaves the
 * axe-core singleton run in flight, so the next test in the file fails
 * "Axe is already running" — one slow runner reads as two broken tests
 * across two files. 20s holds the whole suite at CI-parallelism and keeps
 * the ceiling a real regression catch, not a coin flip.
 */
const TEST_TIMEOUT_MS = 20_000;

const [client, ...others] = testConfig.projects ?? [];

export default defineConfig({
  plugins,
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    sourcemap: true,
  },
  test: {
    ...testConfig,
    testTimeout: TEST_TIMEOUT_MS,
    projects: [
      typeof client === "object" && "test" in client
        ? {
            ...client,
            test: {
              ...client.test,
              include: [
                ...(client.test?.include ?? []),
                "testing/**/*.test.{ts,tsx}",
              ],
              testTimeout: TEST_TIMEOUT_MS,
            },
          }
        : client,
      ...others.map((project) =>
        project && typeof project === "object" && "test" in project
          ? {
              ...project,
              test: { ...project.test, testTimeout: TEST_TIMEOUT_MS },
            }
          : project,
      ),
    ].filter((project) => project !== undefined),
  },
});
