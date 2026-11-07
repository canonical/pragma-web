import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "client",
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/index.ts",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.d.ts",
        "**/types.ts",
        // The demo components and stories of the addon's own Storybook,
        // which the package does not ship.
        "src/stories/**",
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
