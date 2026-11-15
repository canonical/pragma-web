/**
 * The Entity projections of a Prism documentation site: generic slotted
 * components for the five forms an entity takes, the projections that fill
 * them from a type's Relay fragment, and the switches that render any
 * graph node through the arm of its type.
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
  GraphNodeArmNative,
  GraphNodeProjectionProps,
  NodeCardProps,
  NodeChipProps,
  NodeCommandProps,
  NodeGraphNodeProps,
  NodeListProps,
  NodeRowProps,
  ProjectionPeekProps,
  RowArmNative,
  RowProjectionProps,
} from "./node/index.js";
export {
  CardProjection,
  ChipProjection,
  CommandProjection,
  GraphNodeProjection,
  NodeCard,
  NodeChip,
  NodeCommand,
  NodeGraphNode,
  NodeList,
  NodeRow,
  ProjectionPeek,
  RowProjection,
  useProjectionPeek,
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
  AmbientNamespaceProviderProps,
  ProjectionLinkProviderProps,
  SiteSwitches,
} from "./projections/index.js";
export {
  AmbientNamespaceProvider,
  ProjectionLinkProvider,
  useForeignPrefix,
  useProjectionLink,
} from "./projections/index.js";
export { useListRenderers } from "./renderers/index.js";
export type {
  EntityCardKeyValue,
  EntityCardProps,
  EntityChipProps,
  EntityCommandProps,
  EntityFact,
  EntityGraphNodeProps,
  EntityListProps,
  EntityListRenderer,
  EntityRowProps,
  SpecimenKind,
  SwatchMarkProps,
  TokenMarkProps,
  TokenSwatchProps,
} from "./ui/index.js";
export {
  DEFAULT_ENTITY_LIST_RENDERER,
  ENTITY_LIST_RENDERERS,
  EntityCard,
  EntityChip,
  EntityCommand,
  EntityGraphNode,
  EntityList,
  EntityRow,
  PEEK_CLOSE_DELAY_MS,
  PEEK_OPEN_DELAY_MS,
  SwatchMark,
  TokenMark,
  TokenSwatch,
} from "./ui/index.js";
export {
  acceptColour,
  findCuriePrefix,
  requireArmKey,
} from "./utils/index.js";
