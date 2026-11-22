/**
 * The contract check's public surface: the shipped SDL, the predicate, the
 * assertion built on it, and the provider extensions a schema serves; the
 * site lens model, its resolver and the list fields it derives; the
 * class-edge weights; and the pattern a provider's search matches a
 * text with.
 *
 * @module lib
 */

export { buildSearchPattern } from "./buildSearchPattern.js";
export { default as compactIri } from "./compactIri.js";
export { default as compareCodePoints } from "./compareCodePoints.js";
export {
  PROVIDER_EXTENSIONS,
  STATEMENTS_MAX_DEPTH,
  STATEMENTS_PER_PREDICATE,
  STATEMENTS_PER_PREDICATE_MAX,
} from "./constants.js";
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
export { readStatementsSdl } from "./statementsSdl.js";
export type {
  AssertSatisfiesContractOptions,
  ContractResult,
  ContractViolation,
  ContractViolationCode,
  PrefixBinding,
  ProviderExtension,
  SatisfiesContractOptions,
} from "./types.js";
export type { FacetedInstancesArgs, RunQuery } from "./values/index.js";
export {
  LIST_EXTENSION_TYPES_SDL,
  serveFacetedInstances,
  serveNodeValues,
} from "./values/index.js";
