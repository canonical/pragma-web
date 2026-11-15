/**
 * What every projection reads from its site: the link a node's home renders
 * through, the chip's peek, the site's switches and the page's namespace.
 *
 * @module
 */

export { default as AmbientNamespaceProvider } from "./AmbientNamespaceProvider.js";
export { default as useForeignPrefix } from "./hooks/useForeignPrefix.js";
export { default as useProjectionLink } from "./hooks/useProjectionLink.js";
export { default as ProjectionLinkProvider } from "./ProjectionLinkProvider.js";
export type {
  AmbientNamespaceProviderProps,
  ProjectionLinkProviderProps,
  SiteSwitches,
} from "./types.js";
