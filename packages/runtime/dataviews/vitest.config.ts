import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.ts", "testing/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: [
        "src/**/*.ts",
        "testing/fixtures.ts",
        "testing/answering.ts",
        "testing/atLeast.ts",
        "testing/buildSettledPage.ts",
        "testing/buildStoredView.ts",
        "testing/byId.ts",
        "testing/declare.ts",
        "testing/declareSort.ts",
        "testing/displayStatusOf.ts",
        "testing/exactly.ts",
        "testing/failedWith.ts",
        "testing/filterStatusBy.ts",
        "testing/pageOf.ts",
        "testing/readIssuedRequest.ts",
        "testing/refusedWith.ts",
      ],
      exclude: ["**/index.ts", "**/*.test.ts", "**/*.d.ts", "**/types.ts"],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
});
