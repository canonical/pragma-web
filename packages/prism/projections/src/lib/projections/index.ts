/**
 * Projection maps: which arm renders each type of node in each form,
 * provided once per site and read by every dispatcher and projection.
 *
 * @module
 */

export { default as AmbientNamespaceProvider } from "./AmbientNamespaceProvider.js";
export { default as useForeignPrefix } from "./hooks/useForeignPrefix.js";
export { default as useProjectionLink } from "./hooks/useProjectionLink.js";
export { default as useProjectionMaps } from "./hooks/useProjectionMaps.js";
export { default as ProjectionsProvider } from "./Provider.js";
export { default as renderArm } from "./renderArm.js";
export type {
  AmbientNamespaceProviderProps,
  ArmProps,
  ProjectionArm,
  ProjectionMap,
  ProjectionMaps,
  ProjectionsProviderProps,
  SiteArmProps,
} from "./types.js";
