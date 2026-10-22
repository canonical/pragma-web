import { createContext } from "react";
import { defaultComponents } from "../elements/index.js";
import type { MarkdownComponents } from "../types.js";

/**
 * React context carrying the components map compiled MDX pages render
 * through.
 *
 * `MdxProvider` writes to it and `useMDXComponents` reads it. It defaults to
 * `defaultComponents`, so a compiled page renders design-system elements even
 * with no provider above it.
 */
const MdxContext = createContext<MarkdownComponents>(defaultComponents);

export default MdxContext;
