/**
 * The Entity projections of a Prism documentation site: generic slotted
 * components for the five forms an entity takes, the projections that fill
 * them from a type's Relay fragment, and the dispatchers that render any
 * graph node through the arm its site maps to the node's type.
 *
 * @module
 */

export type {
  ProseLinkProps,
  ProseReferencesProviderProps,
} from "./markdown/index.js";
export {
  markdownComponents,
  ProseReferencesProvider,
} from "./markdown/index.js";
export type {
  CardArmNative,
  CardProjectionProps,
  ChipArmNative,
  ChipProjectionProps,
  CommandArmNative,
  CommandProjectionProps,
  NodeCardProps,
  NodeChipProps,
  NodeCommandProps,
  NodeGraphNodeProps,
  NodeRowProps,
  RowArmNative,
  RowProjectionProps,
} from "./node/index.js";
export {
  CardProjection,
  ChipProjection,
  CommandProjection,
  defaultProjectionMaps,
  NodeCard,
  NodeChip,
  NodeCommand,
  NodeGraphNode,
  NodeRow,
  RowProjection,
} from "./node/index.js";
export type {
  OntologyClassCardProps,
  OntologyClassChipProps,
  OntologyClassCommandProps,
  OntologyClassGraphNodeProps,
  OntologyClassRowProps,
  OntologyPropertyCardProps,
  OntologyPropertyChipProps,
  OntologyPropertyCommandProps,
  OntologyPropertyGraphNodeProps,
  OntologyPropertyRowProps,
} from "./ontology/index.js";
export {
  OntologyClassCard,
  OntologyClassChip,
  OntologyClassCommand,
  OntologyClassGraphNode,
  OntologyClassRow,
  OntologyPropertyCard,
  OntologyPropertyChip,
  OntologyPropertyCommand,
  OntologyPropertyGraphNode,
  OntologyPropertyRow,
} from "./ontology/index.js";
export type {
  ArmProps,
  ProjectionArm,
  ProjectionMap,
  ProjectionMaps,
  ProjectionsProviderProps,
  SiteArmProps,
} from "./projections/index.js";
export {
  ProjectionsProvider,
  useProjectionMaps,
} from "./projections/index.js";
export type {
  EntityCardKeyValue,
  EntityCardProps,
  EntityChipProps,
  EntityCommandProps,
  EntityGraphNodeProps,
  EntityListProps,
  EntityListView,
  EntityRowProps,
} from "./ui/index.js";
export {
  EntityCard,
  EntityChip,
  EntityCommand,
  EntityGraphNode,
  EntityList,
  EntityRow,
} from "./ui/index.js";
