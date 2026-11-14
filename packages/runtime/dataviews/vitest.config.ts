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
        "testing/answerWith.ts",
        "testing/buildFailedResult.ts",
        "testing/buildPage.ts",
        "testing/buildRefusedResult.ts",
        "testing/buildSettledPage.ts",
        "testing/buildStoredView.ts",
        "testing/countAtLeast.ts",
        "testing/countExactly.ts",
        "testing/declare.ts",
        "testing/declareSort.ts",
        "testing/filterStatusBy.ts",
        "testing/fixtures.ts",
        "testing/readDisplayStatus.ts",
        "testing/readId.ts",
        "testing/readIssuedRequest.ts",
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
