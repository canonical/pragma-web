import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.ts", "testing/**/*.test.ts"],
    environment: "node",
    // Unmeasured: index files, tests, types and the untested testing/ helpers.
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts", "testing/**/*.ts"],
      exclude: [
        "**/index.ts",
        "**/*.test.ts",
        "**/*.d.ts",
        "**/types.ts",
        "testing/buildRowModel.ts",
        "testing/createCountedRows.ts",
        "testing/createCountingViewStore.ts",
        "testing/createDeferred.ts",
        "testing/flushPresentation.ts",
        "testing/observeUntilFinished.ts",
        "testing/openIndexedDBTab.ts",
        "testing/orderNodesByName.ts",
        "testing/settleCalls.ts",
      ],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
});
