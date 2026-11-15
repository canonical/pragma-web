/**
 * The site lens: its model, and the resolver that answers each class, field
 * and property lens by the rules the Turtle lens follows.
 *
 * @module lens
 */

export { HIDDEN_VISIBILITY } from "./constants.js";
export { indexSiteLens } from "./indexSiteLens.js";
export { selectLiteral } from "./selectLiteral.js";
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
} from "./types.js";
