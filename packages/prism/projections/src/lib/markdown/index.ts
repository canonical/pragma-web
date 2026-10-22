/**
 * Prose: the Markdown element overrides that render a link to a graph node
 * as the node's chip, and the provider that supplies the nodes a page's
 * prose links to.
 *
 * @module
 */

export { markdownComponents } from "./constants.js";
export type { ProseLinkProps } from "./ProseLink/index.js";
export type { ProseReferencesProviderProps } from "./ProseReferences/index.js";
export { ProseReferencesProvider } from "./ProseReferences/index.js";
