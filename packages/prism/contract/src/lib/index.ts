/**
 * The contract check's public surface: the shipped SDL, the predicate, the
 * assertion built on it, and the provider extensions a schema serves; the
 * site lens model, its resolver and the list fields it derives; and the
 * class-edge weights.
 *
 * @module lib
 */

export { PROVIDER_EXTENSIONS } from "./constants.js";
export { readContractSdl } from "./contractSdl.js";
export type {
  ClassEdge,
  ClassEdgeDeclaration,
  ClassEdgeObservation,
} from "./edges/index.js";
export { weighClassEdges } from "./edges/index.js";
export type {
  DisplayField,
  FacetCount,
  FacetedSelection,
  FacetFilter,
  FacetRow,
  FacetSort,
  FacetValueCount,
  LangLiterals,
  LensClass,
  LensField,
  LensGroup,
  LensProperty,
  ListField,
  ListFields,
  ListFieldType,
  NodeValue,
  PropertyRole,
  ReadValue,
  ResolvedClassLens,
  ResolvedFieldLens,
  ResolvedPropertyLens,
  ServedClassField,
  ServedPropertyKind,
  SiteLens,
  SiteLensIndex,
  TBoxOutline,
  TermVisibility,
} from "./lens/index.js";
export {
  deriveListFields,
  HIDDEN_VISIBILITY,
  indexSiteLens,
  KIND_FACET_FIELD,
  readNodeValues,
  selectFacetedInstances,
  selectLiteral,
} from "./lens/index.js";
export { listServedExtensions } from "./listServedExtensions.js";
export {
  assertSatisfiesContract,
  satisfiesContract,
} from "./satisfiesContract.js";
export { servesExtension } from "./servesExtension.js";
export type {
  AssertSatisfiesContractOptions,
  ContractResult,
  ContractViolation,
  ContractViolationCode,
  ProviderExtension,
  SatisfiesContractOptions,
} from "./types.js";
export type { FacetedInstancesArgs, RunQuery } from "./values/index.js";
export {
  LIST_EXTENSION_TYPES_SDL,
  serveFacetedInstances,
  serveNodeValues,
} from "./values/index.js";
