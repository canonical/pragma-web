/**
 * The MDX runtime entry, `@canonical/react-markdown/mdx`: the provider that
 * sets the components map compiled `.mdx` pages render through, and the hook
 * those pages call to read it. It is safe to load in the browser; the build
 * tooling lives in `@canonical/react-markdown/mdx/vite`.
 *
 * @module
 */
export { useMDXComponents } from "./hooks/index.js";
export { default as MdxProvider } from "./Provider.js";
export type * from "./types.js";
