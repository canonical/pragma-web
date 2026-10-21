import { fileURLToPath } from "node:url";
import { reactTestConfig } from "@canonical/vitest-config-react";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { createMdxVitePreset } from "./src/lib/createMdxVitePreset/index.js";

// biome-ignore lint/suspicious/noExplicitAny: Vite 8 plugin types are incompatible with vitest's Vite 7 re-exports
const plugins: any[] = [createMdxVitePreset(), react()];

export default defineConfig({
  plugins,
  resolve: {
    alias: [
      // Compiled MDX imports this package's own `./mdx` entry. In the
      // package's tests that must be the source module `MdxProvider` renders
      // from, not the built copy, or the page and the provider would read two
      // different contexts.
      {
        find: /^@canonical\/react-markdown\/mdx$/,
        replacement: fileURLToPath(
          new URL("./src/lib/MdxProvider/index.ts", import.meta.url),
        ),
      },
    ],
  },
  test: reactTestConfig({ glob: "test", coverage: true }),
});
