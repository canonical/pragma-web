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
  // Unmeasured: stories, decorators, the hidden-button reader, the French
  // record, the import speller, the consumer-code and summary helpers, the
  // GraphQL query, and the mock API's untested readers and matchers.
  coverage: {
    include: [
      "src/**/*.{ts,tsx}",
      "testing/buildFleet.ts",
      "testing/buildMachine.ts",
      "testing/buildPage.ts",
      "testing/buildStoredView.ts",
      "testing/constants.ts",
      "testing/countExactly.ts",
      "testing/createFacetedFleet.ts",
      "testing/createFacetedManual.ts",
      "testing/createListing.ts",
      "testing/createMachineProvider.ts",
      "testing/createMemoryViewStore.ts",
      "testing/declareMachineOrdering.ts",
      "testing/deliverFacets.ts",
      "testing/deliverRows.ts",
      "testing/findEnglish.ts",
      "testing/fixtures.ts",
      "testing/listIds.ts",
      "testing/MachineComposition.tsx",
      "testing/machines.ts",
      "testing/readDisplayStatus.ts",
      "testing/readFailureReason.ts",
      "testing/renderRefusingTable.tsx",
    ],
    exclude: [
      "**/*.stories.{ts,tsx}",
      "src/storybook/decorators.tsx",
      "src/storybook/getHiddenButton.ts",
      "src/storybook/locales/fr.ts",
      "src/storybook/machines/api/answerBehind.ts",
      "src/storybook/machines/api/compareRecords.ts",
      "src/storybook/machines/api/constants.ts",
      "src/storybook/machines/api/foldStoredText.ts",
      "src/storybook/machines/api/isFacetField.ts",
      "src/storybook/machines/api/readApiFacets.ts",
      "src/storybook/machines/api/readGraphQLQuery.ts",
      "src/storybook/machines/api/readRestQuery.ts",
      "src/storybook/machines/api/selectRecords.ts",
      "src/storybook/machines/consumerCode.ts",
      "src/storybook/machines/readPaginationSummary.ts",
      "src/storybook/machines/sources/MachinesQuery.ts",
      "src/storybook/spellPublicImports.ts",
    ],
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
