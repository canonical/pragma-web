// Testing posture: Measured — Chromatic is primary visual gate; unit tests cover logic
import { reactTestConfig } from "@canonical/vitest-config-react";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const unitTest = reactTestConfig({
  // Both naming conventions run until the repo-wide unification lands: the
  // `_work_in_progress` scaffolds use `.test.` and were silently excluded
  // by the previous `tests`-only glob (20 files never ran).
  glob: ["test", "tests"],
  ssr: true,
  // 100% over the parts that gate it; the rest of the package is unmeasured.
  coverage: {
    include: [
      "src/lib/component/ContextualMenu/**/*.{ts,tsx}",
      "src/lib/hooks/useWindowFitment/constants.ts",
      "src/lib/hooks/useWindowFitment/useWindowFitment.tsx",
      "src/lib/hooks/useWindowFitment/utils/**/*.ts",
      "testing/**/*.ts",
    ],
    exclude: ["**/*.stories.tsx", "**/index.ts", "**/types.ts"],
  },
  setupFiles: ["./vitest.setup.ts"],
});

// https://vitejs.dev/config/
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
    ...unitTest,
    projects: [
      ...(unitTest.projects ?? []),
      // The helpers in `testing/` sit outside `src/`, which the factory's
      // projects cover.
      {
        test: {
          name: "testing",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./vitest.setup.ts"],
          include: ["testing/**/*.test.ts"],
        },
      },
    ],
  },
});
