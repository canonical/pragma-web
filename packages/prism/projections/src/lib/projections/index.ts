/**
 * Projection maps: which arm renders each type of node in each
 * representation, provided once per site and read by every representation
 * and arm.
 *
 * @module
 */

export { default as useProjectionLink } from "./hooks/useProjectionLink.js";
export { default as useProjectionMaps } from "./hooks/useProjectionMaps.js";
export { default as ProjectionsProvider } from "./Provider.js";
export type {
  ProjectionMap,
  ProjectionMaps,
  ProjectionsProviderProps,
} from "./types.js";
