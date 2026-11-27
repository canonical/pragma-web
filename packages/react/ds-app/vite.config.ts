// Testing posture: Measured — Chromatic is primary visual gate
import { reactTestConfig } from "@canonical/vitest-config-react";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

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
  test: reactTestConfig({
    glob: ["test", "tests"],
    ssr: true,
    // 100% over the context switcher; the rest of the package is unmeasured.
    coverage: {
      include: ["src/lib/SideNavigation/common/ContextSwitcher/**/*.{ts,tsx}"],
      exclude: ["**/*.stories.tsx", "**/index.ts", "**/types.ts"],
    },
    setupFiles: ["./vitest.setup.ts"],
  }),
});
