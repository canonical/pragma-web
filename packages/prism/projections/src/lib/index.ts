/**
 * The Entity representations of a Prism documentation site: each renders
 * any graph node through the arm its site maps to the node's type.
 *
 * @module
 */

export type {
  EntityChipArm,
  EntityChipArmProps,
  EntityChipProps,
} from "./EntityChip/index.js";
export { EntityChip } from "./EntityChip/index.js";
export type {
  ProjectionMap,
  ProjectionMaps,
  ProjectionsProviderProps,
} from "./projections/index.js";
export {
  defaultProjectionMaps,
  ProjectionsProvider,
  useProjectionMaps,
} from "./projections/index.js";
