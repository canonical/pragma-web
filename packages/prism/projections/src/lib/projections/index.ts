/**
 * Projection maps: which arm renders each type of node in each form,
 * provided once per site and read by every dispatcher and projection.
 *
 * @module
 */

export { default as useProjectionLink } from "./hooks/useProjectionLink.js";
export { default as useProjectionMaps } from "./hooks/useProjectionMaps.js";
export { default as ProjectionsProvider } from "./Provider.js";
export { default as renderArm } from "./renderArm.js";
export type {
  ArmProps,
  ProjectionArm,
  ProjectionMap,
  ProjectionMaps,
  ProjectionsProviderProps,
  SiteArmProps,
} from "./types.js";
