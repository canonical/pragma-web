import mdx from "@mdx-js/rollup";
import type { Plugin } from "vite";
import { rehypePreset, remarkPreset } from "../presets/index.js";

/**
 * Create the Vite plugin that compiles `.mdx` files with the same unified
 * presets `Markdown` runs, so an MDX page parses GitHub-flavoured Markdown and
 * admonitions, and gets the same heading ids, as a Markdown document does.
 *
 * Compiled pages read their components map from
 * `@canonical/react-markdown/mdx`, so `MdxProvider` decides how they render.
 * The plugin runs before the others (`enforce: "pre"`), so the React plugin
 * sees compiled JavaScript. Only `.mdx` files are compiled: `.md` imports,
 * including `?raw` ones, are left to the rest of the build.
 *
 * MDX content is authored with the application and compiled at build time,
 * so it is not sanitised.
 *
 * `import { createMdxVitePreset } from "@canonical/react-markdown/mdx/vite";`
 */
export default function createMdxVitePreset(): Plugin {
  return {
    ...mdx({
      remarkPlugins: [...remarkPreset],
      rehypePlugins: [...rehypePreset],
      providerImportSource: "@canonical/react-markdown/mdx",
      mdExtensions: [],
    }),
    enforce: "pre",
  };
}
