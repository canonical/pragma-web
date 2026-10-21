/**
 * The Entity representations of a Prism documentation site: each renders
 * any graph node through the arm its site maps to the node's type.
 *
 * @module
 */

export type {
  EntityCardArm,
  EntityCardArmProps,
  EntityCardProps,
} from "./EntityCard/index.js";
export { EntityCard } from "./EntityCard/index.js";
export type {
  EntityChipArm,
  EntityChipArmProps,
  EntityChipProps,
} from "./EntityChip/index.js";
export { EntityChip } from "./EntityChip/index.js";
export type {
  EntityCommandArm,
  EntityCommandArmProps,
  EntityCommandProps,
} from "./EntityCommand/index.js";
export { EntityCommand } from "./EntityCommand/index.js";
export type {
  EntityRowArm,
  EntityRowArmProps,
  EntityRowProps,
} from "./EntityRow/index.js";
export { EntityRow } from "./EntityRow/index.js";
export type {
  EntityTitleArm,
  EntityTitleArmProps,
  EntityTitleProps,
} from "./EntityTitle/index.js";
export { EntityTitle } from "./EntityTitle/index.js";
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
