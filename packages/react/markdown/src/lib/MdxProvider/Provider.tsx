import type { ReactElement } from "react";
import MdxContext from "./Context.js";
import type { MdxProviderProps } from "./types.js";

/**
 * Provide the components map compiled MDX pages render through.
 *
 * Mount it above the routes that render `.mdx` pages, with the same map given
 * to `Markdown`, so a page renders the same elements whether its content
 * comes from Markdown at runtime or from MDX at build time. A page with no
 * provider above it renders `defaultComponents`.
 *
 * Renders no DOM of its own.
 *
 * `import { MdxProvider } from "@canonical/react-markdown/mdx";`
 */
export default function MdxProvider({
  children,
  components,
}: MdxProviderProps): ReactElement {
  return (
    <MdxContext.Provider value={components}>{children}</MdxContext.Provider>
  );
}
