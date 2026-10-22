import type { Cardinality } from "./types.js";

/**
 * Name a field's cardinality from the two facts the graph states about it on
 * its class: whether a value is required, and whether there is at most one.
 *
 * @param field - The field's `required` and `singular` flags.
 * @returns `one` (required, singular), `optional` (singular), `many`
 *   (required, plural) or `any` (plural).
 */
export default function classifyCardinality(field: {
  readonly required: boolean;
  readonly singular: boolean;
}): Cardinality {
  if (field.singular) return field.required ? "one" : "optional";
  return field.required ? "many" : "any";
}
