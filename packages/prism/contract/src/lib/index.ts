/**
 * The contract check's public surface: the shipped SDL, the predicate, the
 * assertion built on it, and the provider extensions a schema serves; and the
 * site lens model and its resolver.
 *
 * @module lib
 */

export { PROVIDER_EXTENSIONS } from "./constants.js";
export { readContractSdl } from "./contractSdl.js";
export type {
  LangLiterals,
  LensClass,
  LensField,
  LensGroup,
  LensProperty,
  PropertyRole,
  ResolvedClassLens,
  ResolvedFieldLens,
  ResolvedPropertyLens,
  SiteLens,
  SiteLensIndex,
  TBoxOutline,
  TermVisibility,
} from "./lens/index.js";
export { indexSiteLens, selectLiteral } from "./lens/index.js";
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
