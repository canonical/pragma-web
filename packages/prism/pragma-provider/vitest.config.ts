import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resolve packages for the tests the way Node resolves them at run time,
  // without Vite's `development` condition. ke-graphql is loaded by Node, so
  // its `graphql` import takes Node's conditions; this package's own source
  // is loaded through Vite. Under `development`, `graphql` resolves to its
  // `__dev__` build here and to its ordinary build there: two copies, and
  // the `Prose` type this package builds is refused by the schema
  // ke-graphql composes ("from another module or realm"). `module-sync` is
  // the condition Node picks `graphql`'s ESM entry by.
  ssr: { resolve: { conditions: ["module-sync", "node"] } },
  test: {
    globals: true,
    // ⚠ `*.test.ts`, NOT `*.tests.ts`. The docsite app uses the plural form;
    // this package (like every other package in the repo) uses the singular.
    // A file ported from the app keeping its `.tests.ts` name is collected by
    // NOTHING and the suite goes green with fewer tests, silently.
    include: ["src/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "**/index.ts",
        "**/*.test.ts",
        "**/*.d.ts",
        "**/types.ts",
        "src/testing/**",
      ],
      // The repo standard for a shipped package: 100%, matching the sibling
      // contract package. Do not lower these — the
      // provider that backs the docsite cannot hold a lower bar than the
      // reference implementation it is measured against.
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
