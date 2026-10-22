/**
 * The Definitions lens of a Prism documentation site: an ontology explorer
 * over the graph's classes and properties. A site mounts its two routes
 * under a wrapper of its layout, and the routes warm the store through the
 * lens's one operation.
 *
 * @module
 */

export type { DefinitionsLayoutProps } from "./DefinitionsLayout/index.js";
export { DefinitionsLayout } from "./DefinitionsLayout/index.js";
export { definitionsRoutes } from "./routes.js";
export { default as warmDefinitions } from "./warmDefinitions.js";
