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
  // Unmeasured: stories, and the story and testing/ helpers without a test.
  coverage: {
    include: ["src/**/*.{ts,tsx}", "testing/**/*.{ts,tsx}"],
    exclude: [
      "**/*.stories.{ts,tsx}",
      "src/storybook/getHiddenButton.ts",
      "src/storybook/machines/api/answerBehind.ts",
      "src/storybook/machines/api/compareRecords.ts",
      "src/storybook/machines/api/constants.ts",
      "src/storybook/machines/api/foldStoredText.ts",
      "src/storybook/machines/api/isFacetField.ts",
      "src/storybook/machines/api/readApiFacets.ts",
      "src/storybook/machines/api/readGraphQLQuery.ts",
      "src/storybook/machines/api/readRestQuery.ts",
      "src/storybook/machines/api/selectRecords.ts",
      "src/storybook/machines/readPaginationSummary.ts",
      "src/storybook/spellPublicImports.ts",
      "testing/**/*.d.ts",
      "testing/**/*.test.{ts,tsx}",
      "testing/keyboard/**",
      "testing/playwright.config.ts",
      "testing/types.ts",
      "testing/answerOverHttp2.ts",
      "testing/createFakeChannel.ts",
      "testing/createTokenMessages.ts",
      "testing/elementAt.ts",
      "testing/expectNoAxeViolations.ts",
      "testing/fakeAnnouncerClock.ts",
      "testing/readAnnouncements.ts",
      "testing/serveMockApi.ts",
      "testing/silenceRenderErrors.ts",
      "testing/toggleDisclosure.ts",
      "testing/watchMockRequest.ts",
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
