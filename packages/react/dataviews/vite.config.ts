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
  // Story fixtures and stories are exercised by Storybook, not by the
  // unit suite; coverage measures the library the package ships and the
  // shared helpers named here.
  coverage: {
    include: [
      "src/**/*.{ts,tsx}",
      "testing/fixtures.ts",
      "testing/buildFleet.ts",
      "testing/buildStoredView.ts",
      "testing/constants.ts",
      "testing/createFacetedFleet.ts",
      "testing/createFacetedManual.ts",
      "testing/createMachineProvider.ts",
      "testing/createMemoryViewStore.ts",
      "testing/declareMachineOrdering.ts",
      "testing/machine.ts",
      "testing/machines.ts",
      "testing/countExactly.ts",
      "testing/deliverFacets.ts",
      "testing/deliverRows.ts",
      "testing/displayStatusOf.ts",
      "testing/pageOf.ts",
      "testing/MachineComposition.tsx",
      "testing/readFailureReason.ts",
      "testing/renderRefusingTable.tsx",
    ],
    exclude: ["src/storybook/**", "**/*.stories.{ts,tsx}"],
  },
  plugins,
  setupFiles: ["./vitest.setup.ts"],
});

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
            },
          }
        : client,
      ...others,
    ].filter((project) => project !== undefined),
  },
});
