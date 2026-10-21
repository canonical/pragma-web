/**
 * Prose references: the nodes a page's prose links to, indexed by every
 * address an author may write for one.
 *
 * @module
 */

export { default as useProseReference } from "./hooks/useProseReference.js";
export { default as ProseReferencesProvider } from "./Provider.js";
export type { ProseReferencesProviderProps } from "./types.js";
