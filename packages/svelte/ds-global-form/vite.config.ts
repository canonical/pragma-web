import { svelte } from "@sveltejs/vite-plugin-svelte";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    svelte(),
    {
      // Serves the server rendering of a test fixture, so a browser test can
      // hydrate real server markup: GET /__ssr/<Fixture> renders
      // src/testing/<Fixture>.fixtures.svelte.
      name: "ssr-fixtures",
      configureServer(server) {
        server.middlewares.use("/__ssr/", async (req, res, next) => {
          try {
            const fixture = (req.url ?? "").replace(/^\//, "");
            const { default: Fixture } = await server.ssrLoadModule(
              `/src/testing/${fixture}.fixtures.svelte`,
            );
            const { render } = await server.ssrLoadModule("svelte/server");
            res.setHeader("content-type", "text/html");
            res.end(render(Fixture).body);
          } catch (error) {
            next(error);
          }
        });
      },
    },
  ],
  test: {
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.{ts,svelte}"],
      exclude: [
        "**/*.stories.svelte",
        "**/*.test.ts",
        "**/index.ts",
        "**/types.ts",
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: "client",
          // Test files share one page, so a file that moves focus would blur
          // a control another file is driving (Firefox shows it): run the
          // browser files one at a time.
          fileParallelism: false,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              { browser: "chromium" },
              ...(process.env.COVERAGE
                ? []
                : [
                    { browser: "firefox" as const },
                    { browser: "webkit" as const },
                  ]),
            ],
          },
          include: ["src/**/*.svelte.test.ts"],
          setupFiles: ["./vitest-setup-client.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "ssr",
          environment: "node",
          testTimeout: 30000,
          include: ["src/**/*.ssr.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "server",
          environment: "node",
          include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
          exclude: ["src/**/*.svelte.test.ts", "src/**/*.ssr.test.ts"],
        },
      },
    ],
  },
});
