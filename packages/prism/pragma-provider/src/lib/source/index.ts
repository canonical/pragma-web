/**
 * The source extension: one entity's statements as Turtle.
 *
 * @module source
 */

export { buildDescribeQuery } from "./buildDescribeQuery.js";
export { collectPrefixes } from "./collectPrefixes.js";
export {
  MAX_BLANK_DEPTH,
  RDF_LANG_STRING,
  RDF_TYPE,
  STANDARD_PREFIXES,
  XSD_STRING,
} from "./constants.js";
export { createSourceExtensions } from "./createSourceExtensions.js";
export type { SourceArgs } from "./types.js";
export { writeTurtle } from "./writeTurtle.js";
