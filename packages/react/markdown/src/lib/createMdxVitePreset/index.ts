/**
 * The MDX build entry, `@canonical/react-markdown/mdx/vite`, for a Vite
 * configuration. It loads the MDX compiler, which needs Node, so it is kept
 * apart from `@canonical/react-markdown/mdx`, which runs in the browser.
 *
 * @module
 */
export { default as createMdxVitePreset } from "./createMdxVitePreset.js";
